/**
 * Plan formula library types (spec 0007). The employer side of the match math.
 *
 * Static data and pure lookups only. Any CALCULATION over these (multiplying
 * money, rounding) lives in lib/insights/, never here (architecture.md section 4,
 * section 7; code-standards.md section 3). This file holds the typed formula
 * shape, the catalog entry shape, and the one field lookup below.
 *
 * Units: rates and percentages are integer basis points (bps): 10000 = 100%,
 * 5000 = 50%, 300 = 3%. Money is integer minor units elsewhere; no money value
 * appears in a formula (a formula is rate-and-percentage only).
 */

/**
 * One tier of an employer match. The employer matches `matchRateBps` of the
 * employee's contribution that falls in this tier's band of pay. The band runs
 * from the previous tier's ceiling up to `uptoContributionBps` (a cumulative
 * employee contribution, in bps of pay).
 */
export interface MatchTier {
  /** Employer match rate for this band. 10000 = 100%, 5000 = 50%. */
  matchRateBps: number;
  /** Cumulative employee contribution (bps of pay) up to which this tier applies. */
  uptoContributionBps: number;
}

/**
 * An employer match formula: a non empty list of tiers, ascending by
 * `uptoContributionBps`. The last tier's ceiling is the max matchable
 * contribution (the point past which more employee contribution earns no more
 * match); a flat cap is one tier, a tiered match is several. No separate cap
 * field: the terminal tier expresses it.
 */
export interface MatchFormula {
  tiers: [MatchTier, ...MatchTier[]];
}

/**
 * A catalog entry: a named plan or a generic shape the user might recognise
 * (foundation.md section 7 #12 tier 2). A discriminated union on `verified`, so
 * an unverified entry CANNOT exist without a disclosure note: honesty is
 * unrepresentable to break. `verified` means the formula is confirmed to match
 * the named real world plan. A generic shape (employer null) is verified as the
 * shape it is labelled. A named plan whose numbers are not confirmed is
 * `verified: false` and MUST carry a `note`.
 */
export type CatalogEntry = {
  id: string;
  label: string;
  employer: string | null;
  formula: MatchFormula;
} & ({ verified: true } | { verified: false; note: string });

/**
 * The contribution rate (bps of pay) at or above which the match is fully
 * captured: the last tier's ceiling. A pure lookup (a field read), not a
 * calculation, so it lives here rather than in lib/insights/.
 */
export function maxMatchContributionBps(formula: MatchFormula): number {
  return formula.tiers[formula.tiers.length - 1].uptoContributionBps;
}
