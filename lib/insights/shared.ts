import type { Holding } from "@/lib/types";

/**
 * Shared, pure helpers for the insight functions. Kept in one place so the
 * account-total definition (spec 0002 invariant 8) has a single source of
 * truth, rather than being recomputed in each insight and drifting.
 *
 * Pure: no I/O, no async. Same purity contract as the rest of lib/insights/.
 */

/** Holdings that count toward composition and totals: value strictly positive.
 * A short or written down position (value <= 0) is excluded (spec 0002 invariant 9). */
export function positiveHoldings(holdings: Holding[]): Holding[] {
  return holdings.filter((h) => h.valueMinor > 0);
}

/**
 * The account total every share is measured against: the SUM OF POSITIVE
 * HOLDING VALUES, never Account.balanceMinor (spec 0002 invariant 8 — the real
 * fixture shows the provider balance and the holdings sum diverge).
 */
export function holdingsTotalMinor(positive: Holding[]): number {
  return positive.reduce((sum, h) => sum + h.valueMinor, 0);
}
