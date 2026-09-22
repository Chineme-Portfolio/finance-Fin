import "server-only";
import { getAggregator, mapHoldingsResponseToDomain, toContributionEvents } from "@/lib/aggregator";
import type { AccountDataResult } from "@/lib/aggregator";
import {
  saveLinkedItem,
  deleteItem,
  getItemByPlaidItemId,
  readAccessToken,
} from "@/lib/db";
import type { Account } from "@/lib/types";
import { selectHoldingsShape } from "./payload";

/**
 * The write path (spec 0005): the one layer that composes the aggregator seam
 * and lib/db. Linking exchanges a public token, fetches the account data, maps
 * it to the domain, and persists accounts, holdings, and the token (to Vault).
 * Refreshing reads the durable token back from Vault and re persists.
 *
 * Neither the aggregator nor lib/db imports the other; only this layer knows
 * both (foundation.md section 7 #8). The access token is held in a local here
 * across exchange, fetch, and save; it is never logged and never returned to a
 * client. Every error below carries the item id only, never the token
 * (security.md section 3, section 6).
 */

/**
 * Map a fetch result to domain and persist it, replacing any existing item with
 * the same Plaid item id first (delete then save, spec 0005). The token is
 * persisted to Vault by saveLinkedItem.
 *
 * `existing` may be passed pre resolved (the refresh path already looked it up);
 * when omitted, persist resolves it itself (the link path).
 */
async function persist(
  plaidItemId: string,
  institutionName: string | null,
  accessToken: string,
  result: AccountDataResult,
  existing?: { id: string } | null,
): Promise<{ itemId: string }> {
  const raw = selectHoldingsShape(result);
  const { accounts, holdings } = mapHoldingsResponseToDomain(
    raw as Parameters<typeof mapHoldingsResponseToDomain>[0],
    result.capabilities,
  );
  // The domain account id is the Plaid account id (lib/aggregator/plaid/map.ts),
  // which is exactly what saveLinkedItem keys holdings by.
  const accountsToSave = accounts.map((a: Account) => ({ ...a, plaidAccountId: a.id }));

  // Contribution deposits (spec 0006). The adapter filters the observed
  // transactions down to cash contributions and returns raw domain events
  // (source "unknown"); events only exist for accounts that returned transactions.
  const contributionEvents = toContributionEvents(result.transactions);

  const toReplace = existing === undefined ? await getItemByPlaidItemId(plaidItemId) : existing;
  if (toReplace) await deleteItem(toReplace.id);

  return saveLinkedItem({
    plaidItemId,
    institutionName,
    accessToken,
    accounts: accountsToSave,
    holdings,
    contributionEvents,
  });
}

/** Exchange a public token, fetch the account data, and persist it. */
export async function linkAndPersist(publicToken: string): Promise<{ itemId: string }> {
  const exchanged = await getAggregator().exchangePublicToken(publicToken);
  const result = await getAggregator().fetchAccountData(exchanged.accessToken);
  return persist(exchanged.itemId, exchanged.institutionName, exchanged.accessToken, result);
}

/**
 * Re fetch an already linked item using the token read back from Vault, then re
 * persist it. This is the flow that proves the durable token round trip in a
 * real request, after process memory no longer holds the token (spec 0005 AC-5).
 */
export async function refreshItem(plaidItemId: string): Promise<{ itemId: string }> {
  const existing = await getItemByPlaidItemId(plaidItemId);
  if (!existing) throw new Error(`sync.refreshItem: no linked item ${plaidItemId}`);
  const token = await readAccessToken(existing.tokenSecretId);
  const result = await getAggregator().fetchAccountData(token);
  // institutionName is not re fetched here; it stays "unknown" until the real
  // name is pulled from Plaid (spec 0005 Follow-up). Pass the already resolved
  // item so persist does not look it up a second time.
  return persist(plaidItemId, "unknown", token, result, existing);
}

/** Unlink an item: delete its rows and its Vault secret (spec 0005 AC-9). */
export async function unlinkItem(plaidItemId: string): Promise<void> {
  const existing = await getItemByPlaidItemId(plaidItemId);
  if (!existing) return; // already gone
  await deleteItem(existing.id);
}
