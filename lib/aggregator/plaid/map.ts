import "server-only";
import type {
  Account,
  AccountType,
  Capability,
  ContributionEvent,
  Holding,
  SecurityInfo,
  SecurityType,
} from "@/lib/types";

/**
 * Maps raw Plaid investment payloads into the domain model.
 *
 * This is the holding to security join, and the one place Plaid's shapes turn
 * into domain shapes. It lives inside lib/aggregator/plaid/ because that is the
 * only place allowed to know Plaid (foundation.md section 7 #8). Everything the
 * engine sees comes out of here as domain types; a raw Plaid field never
 * reaches lib/insights/.
 *
 * Validated against the real committed responses in fixtures/ (spec 0001).
 */

/** Plaid sends money as a JSON number. Convert to integer minor units on the way in.
 * Assumes a two decimal currency (cents); true for USD, the only currency in scope
 * (spec 0002 Consequences). */
function toMinorUnits(amount: number | null | undefined): number | null {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return null;
  return Math.round(amount * 100);
}

/** Map Plaid's account type/subtype to the domain AccountType.
 * Source: Plaid investment account types, observed in fixtures/ and Plaid docs. */
function toAccountType(rawType: string, rawSubtype: string | null): AccountType {
  const sub = (rawSubtype ?? "").toLowerCase();
  if (sub === "401k") return "401k";
  if (sub === "roth" || sub === "roth ira") return "roth_ira";
  if (sub === "ira") return "traditional_ira";
  if (sub === "hsa") return "hsa";
  // Only the plain taxable brokerage maps to taxable_brokerage. Other investment
  // subtypes we do not model yet (sep ira, simple ira, 529, trust, ...) fall to
  // "other" rather than being mislabelled as a taxable brokerage. Source: the
  // domain AccountType set (foundation.md section 5, section 7 #15).
  if (sub === "brokerage") return "taxable_brokerage";
  return "other";
}

/** Normalise Plaid's raw security type string to the closed SecurityType union.
 * Anything unrecognised or missing becomes "other" (spec 0002 AC-3).
 * Source: distinct security.type values observed in fixtures/. */
const SECURITY_TYPES: readonly SecurityType[] = [
  "mutual fund",
  "etf",
  "equity",
  "fixed income",
  "cash",
  "cryptocurrency",
  "derivative",
];
function toSecurityType(rawType: string | null | undefined): SecurityType {
  const t = (rawType ?? "").toLowerCase();
  return (SECURITY_TYPES as readonly string[]).includes(t)
    ? (t as SecurityType)
    : "other";
}

/** The narrow slices of Plaid's payloads this mapping reads. Kept local so the
 * domain layer never imports a Plaid type, and the aggregator never leaks one. */
interface RawAccount {
  account_id: string;
  name: string;
  type: string;
  subtype: string | null;
  balances?: { current?: number | null; iso_currency_code?: string | null } | null;
}
interface RawSecurity {
  security_id: string;
  name?: string | null;
  ticker_symbol?: string | null;
  type?: string | null;
  is_cash_equivalent?: boolean | null;
}
interface RawHolding {
  account_id: string;
  security_id: string;
  quantity?: number | null;
  institution_value?: number | null;
  cost_basis?: number | null;
  iso_currency_code?: string | null;
}

export function toDomainAccounts(
  rawAccounts: RawAccount[],
  capabilitiesByAccount: Map<string, Capability[]>,
): Account[] {
  return rawAccounts.map((a) => ({
    id: a.account_id,
    name: a.name,
    type: toAccountType(a.type, a.subtype),
    subtype: a.subtype ?? null,
    linked: true,
    capabilities: capabilitiesByAccount.get(a.account_id) ?? [],
    balanceMinor: toMinorUnits(a.balances?.current),
    currency: a.balances?.iso_currency_code ?? null,
  }));
}

export function toDomainHoldings(
  rawHoldings: RawHolding[],
  rawSecurities: RawSecurity[],
): Holding[] {
  const securityById = new Map<string, RawSecurity>(
    rawSecurities.map((s) => [s.security_id, s]),
  );
  return rawHoldings.map((h) => {
    const raw = securityById.get(h.security_id);
    const security: SecurityInfo = {
      securityId: h.security_id,
      name: raw?.name ?? "Unknown security",
      ticker: raw?.ticker_symbol ?? null,
      securityType: toSecurityType(raw?.type),
      isCashEquivalent: raw?.is_cash_equivalent === true,
    };
    return {
      accountId: h.account_id,
      security,
      quantity: typeof h.quantity === "number" ? h.quantity : 0,
      valueMinor: toMinorUnits(h.institution_value) ?? 0,
      costBasisMinor: toMinorUnits(h.cost_basis),
      currency: h.iso_currency_code ?? null,
    };
  });
}

import type { AccountCapability, ObservedTransaction } from "../types";

/**
 * Provider transaction subtypes that mean cash paid INTO the account. Only these
 * unambiguous inflows become contribution events (spec 0006 AC-2). A bare
 * "transfer" is deliberately NOT here: its direction lives in the amount sign, not
 * the subtype, so including it would risk persisting a transfer out as a
 * contribution. This set is provisional until the real 401k shape is observed
 * (spec 0001 task 9).
 */
const CONTRIBUTION_SUBTYPES: ReadonlySet<string> = new Set(["contribution", "deposit"]);

/**
 * Select the cash contributions and deposits from observed investment
 * transactions and map them to domain ContributionEvents (spec 0006). This is the
 * one place that knows which Plaid transaction subtypes mean "money paid in"
 * (foundation section 7 #8), so lib/sync and lib/db never learn a Plaid shape.
 *
 * Stored raw: source is always "unknown". Classifying a deposit as employee vs
 * employer match is the deferred match engine's job, never done or stored here
 * (foundation section 7 #7, #16). amountMinor is the POSITIVE magnitude paid in:
 * the provider credits a deposit as a signed amount that can be negative, so we
 * normalise rather than pass the sign through, so a later sum is never polarity
 * confused (spec 0006 AC-1).
 */
export function toContributionEvents(
  transactions: ObservedTransaction[],
): ContributionEvent[] {
  return transactions
    .filter((t) => t.subtype !== null && CONTRIBUTION_SUBTYPES.has(t.subtype.toLowerCase()))
    .map((t) => ({
      accountId: t.accountId,
      date: t.date,
      amountMinor: Math.abs(t.amountMinor),
      currency: t.currency,
      source: "unknown",
      rawName: t.name,
    }));
}

/** A raw Plaid holdings response, the parts the mapping reads. */
interface RawHoldingsResponse {
  accounts: RawAccount[];
  holdings: RawHolding[];
  securities: RawSecurity[];
}

/**
 * Convenience: turn a whole raw Plaid holdings response plus the capability
 * records the adapter already classified into domain accounts and holdings.
 * This is the seam the rest of the app (and the engine) consumes; nothing
 * outside this directory touches the raw shapes above.
 */
export function mapHoldingsResponseToDomain(
  raw: RawHoldingsResponse,
  capabilities: AccountCapability[],
): { accounts: Account[]; holdings: Holding[] } {
  const capsByAccount = new Map<string, Capability[]>();
  for (const cap of capabilities) {
    const list: Capability[] = [];
    if (cap.holdings.status === "data") list.push("holdings");
    if (cap.investmentTransactions.status === "data") list.push("transactions");
    // Balance capability is implied by the account existing in the response.
    list.push("balance");
    capsByAccount.set(cap.accountId, list);
  }
  return {
    accounts: toDomainAccounts(raw.accounts, capsByAccount),
    holdings: toDomainHoldings(raw.holdings, raw.securities),
  };
}
