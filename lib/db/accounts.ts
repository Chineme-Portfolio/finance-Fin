import "server-only";
import { getAdminClient, currentUserId } from "./client";
import { storeAccessToken } from "./tokens";
import type { Account, Holding, Capability, AccountType, SecurityType } from "@/lib/types";

/**
 * Typed, user-scoped persistence for the domain model. Every query is stamped
 * and filtered by the current user id (the fixed dev id for now, auth.uid() once
 * auth lands). Rows map to and from lib/types/ domain objects; nothing above
 * lib/db/ sees a raw row shape.
 *
 * Money is stored as bigint minor units. PostgREST returns bigint as a JSON
 * STRING, so every money field is parsed back to a number at this boundary
 * (spec 0004 AC-7, library-docs Supabase gotcha).
 */

/** Parse a PostgREST bigint (string) into an integer number. Throws on anything
 * that is not a number or a non-empty numeric string: a money field should never
 * be missing here (NOT NULL columns, always selected), and a silent 0 would show
 * a false $0 rather than fail (code-standards §1 #5, foundation §4 #1). Use
 * toIntOrNull for genuinely nullable money columns. */
function toInt(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.length > 0 && !Number.isNaN(Number(v))) return Number(v);
  throw new Error(`db: expected a numeric money value, got ${typeof v}: ${String(v)}`);
}
function toIntOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  return toInt(v);
}

interface AccountRow {
  id: string;
  plaid_account_id: string;
  name: string;
  type: AccountType;
  subtype: string | null;
  balance_minor: string | number | null;
  currency: string | null;
  capabilities: Capability[];
}

interface HoldingRow {
  account_id: string;
  security_id: string;
  security_name: string;
  ticker: string | null;
  security_type: SecurityType;
  is_cash_equivalent: boolean;
  quantity: string | number;
  value_minor: string | number;
  cost_basis_minor: string | number | null;
  currency: string | null;
}

function rowToAccount(r: AccountRow): Account {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    subtype: r.subtype,
    linked: true,
    capabilities: r.capabilities,
    balanceMinor: toIntOrNull(r.balance_minor),
    currency: r.currency,
  };
}

function rowToHolding(r: HoldingRow): Holding {
  return {
    accountId: r.account_id,
    security: {
      securityId: r.security_id,
      name: r.security_name,
      ticker: r.ticker,
      securityType: r.security_type,
      isCashEquivalent: r.is_cash_equivalent,
    },
    quantity: typeof r.quantity === "string" ? Number(r.quantity) : r.quantity,
    valueMinor: toInt(r.value_minor),
    costBasisMinor: toIntOrNull(r.cost_basis_minor),
    currency: r.currency,
  };
}

/**
 * Persist a linked Plaid item: store its token in Vault, write the item row, its
 * accounts, and their holdings, all scoped to the current user.
 *
 * These are separate PostgREST calls, not one transaction. If a later step fails,
 * a best-effort cleanup removes the item (cascading its accounts/holdings) and the
 * Vault token, so a partial save leaves no orphan. A single transactional RPC is
 * the follow-up when the aggregator write path is wired (spec 0004 Follow-up).
 */
export async function saveLinkedItem(input: {
  plaidItemId: string;
  institutionName: string | null;
  accessToken: string;
  accounts: Array<{ plaidAccountId: string } & Account>;
  holdings: Holding[];
}): Promise<{ itemId: string }> {
  const db = getAdminClient();
  const userId = currentUserId();

  // The token must exist before the item row (token_secret_id is NOT NULL).
  const tokenSecretId = await storeAccessToken(input.accessToken, `plaid:${input.plaidItemId}`);

  let itemId: string | null = null;
  try {
    const { data: item, error: itemErr } = await db
      .from("plaid_items")
      .insert({
        user_id: userId,
        plaid_item_id: input.plaidItemId,
        institution_name: input.institutionName,
        token_secret_id: tokenSecretId,
      })
      .select("id")
      .single();
    if (itemErr) throw new Error(`db.saveLinkedItem: item insert failed: ${itemErr.message}`);
    itemId = (item as { id: string }).id;

    const accountRows = input.accounts.map((a) => ({
      user_id: userId,
      item_id: itemId,
      plaid_account_id: a.plaidAccountId,
      name: a.name,
      type: a.type,
      subtype: a.subtype,
      balance_minor: a.balanceMinor,
      currency: a.currency,
      capabilities: a.capabilities,
    }));
    const { data: savedAccounts, error: accErr } = await db
      .from("accounts")
      .insert(accountRows)
      .select("id, plaid_account_id");
    if (accErr) throw new Error(`db.saveLinkedItem: accounts insert failed: ${accErr.message}`);

    // Match holdings to accounts by plaid_account_id, NOT array position: PostgREST
    // does not guarantee inserted-and-selected rows return in input order, so an
    // index-based map would mis-attribute holdings once >1 account is linked.
    const dbIdByPlaidAccountId = new Map(
      (savedAccounts as Array<{ id: string; plaid_account_id: string }>).map((r) => [
        r.plaid_account_id,
        r.id,
      ]),
    );
    const dbIdByDomainId = new Map(
      input.accounts.map((a) => [a.id, dbIdByPlaidAccountId.get(a.plaidAccountId)]),
    );

    const holdingRows = input.holdings.map((h) => {
      const accountDbId = dbIdByDomainId.get(h.accountId);
      if (!accountDbId) {
        throw new Error(`db.saveLinkedItem: holding references unknown account ${h.accountId}`);
      }
      return {
        user_id: userId,
        account_id: accountDbId,
        security_id: h.security.securityId,
        security_name: h.security.name,
        ticker: h.security.ticker,
        security_type: h.security.securityType,
        is_cash_equivalent: h.security.isCashEquivalent,
        quantity: h.quantity,
        value_minor: h.valueMinor,
        cost_basis_minor: h.costBasisMinor,
        currency: h.currency,
      };
    });
    if (holdingRows.length > 0) {
      const { error: holdErr } = await db.from("holdings").insert(holdingRows);
      if (holdErr) throw new Error(`db.saveLinkedItem: holdings insert failed: ${holdErr.message}`);
    }

    return { itemId };
  } catch (e) {
    // Best-effort cleanup so a partial save leaves no orphaned item or Vault token.
    try {
      if (itemId) {
        await db.rpc("delete_item", { p_item_id: itemId, p_user_id: userId });
      } else {
        await db.rpc("delete_token", { p_secret_id: tokenSecretId });
      }
    } catch {
      /* swallow cleanup failure; surface the original error below */
    }
    throw e;
  }
}

export async function getAccountsForUser(): Promise<Account[]> {
  const { data, error } = await getAdminClient()
    .from("accounts")
    .select("id, plaid_account_id, name, type, subtype, balance_minor, currency, capabilities")
    .eq("user_id", currentUserId());
  if (error) throw new Error(`db.getAccountsForUser: ${error.message}`);
  return (data as AccountRow[]).map(rowToAccount);
}

export async function getHoldingsForAccount(accountId: string): Promise<Holding[]> {
  const { data, error } = await getAdminClient()
    .from("holdings")
    .select("account_id, security_id, security_name, ticker, security_type, is_cash_equivalent, quantity, value_minor, cost_basis_minor, currency")
    .eq("user_id", currentUserId())
    .eq("account_id", accountId);
  if (error) throw new Error(`db.getHoldingsForAccount: ${error.message}`);
  return (data as HoldingRow[]).map(rowToHolding);
}

/** Delete an item, its accounts/holdings (cascade), and its Vault token, atomically. */
export async function deleteItem(itemId: string): Promise<void> {
  const { error } = await getAdminClient().rpc("delete_item", {
    p_item_id: itemId,
    p_user_id: currentUserId(),
  });
  if (error) throw new Error(`db.deleteItem: ${error.message}`);
}
