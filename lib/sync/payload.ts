/**
 * Pure payload selection for the write path (spec 0005). Kept free of I/O and of
 * "server-only" so it is unit testable: it decides which raw Plaid response the
 * domain mapping reads, and it never discards an account just because one product
 * call failed (foundation.md §7 #15 is LOCKED: assuming uniform data depth
 * produces false zeros and silently dropped accounts).
 */

/** The parts of a Plaid response the domain mapping reads. */
export interface RawHoldingsResponse {
  accounts: unknown[];
  holdings: unknown[];
  securities: unknown[];
}

function isHoldingsShape(v: unknown): v is RawHoldingsResponse {
  const r = v as Partial<RawHoldingsResponse> | null;
  return !!r && Array.isArray(r.accounts) && Array.isArray(r.holdings) && Array.isArray(r.securities);
}

/**
 * Choose the raw response the domain mapping reads, degrading gracefully:
 *
 * 1. Prefer the holdings response (it carries accounts, holdings, and securities).
 *    An account that returns no holdings still arrives here as a valid response
 *    with an empty holdings array, so the balance only account persists normally.
 * 2. If the holdings CALL failed (an error or not_ready outcome, so rawHoldings is
 *    not a real response), fall back to the transactions response, which also
 *    carries the account list and securities. Treat it as zero holdings for those
 *    accounts; their real per account capabilities (result.capabilities) drive the
 *    missing capability state once persisted. Do not throw the accounts away with
 *    the failed call (foundation.md §7 #15, §4 #7).
 * 3. Only when neither call returned an account list is there genuinely nothing to
 *    persist; then throw.
 */
export function selectHoldingsShape(result: {
  rawHoldings: unknown;
  rawTransactions: unknown;
}): RawHoldingsResponse {
  if (isHoldingsShape(result.rawHoldings)) return result.rawHoldings;

  const t = result.rawTransactions as { accounts?: unknown; securities?: unknown } | null;
  if (t && Array.isArray(t.accounts)) {
    return {
      accounts: t.accounts,
      holdings: [],
      securities: Array.isArray(t.securities) ? t.securities : [],
    };
  }

  throw new Error(
    "sync: neither the holdings nor the transactions call returned an account list; cannot persist this item. Try again shortly.",
  );
}
