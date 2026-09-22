import type { MatchFormula } from "@/lib/plans";
import { maxMatchContributionBps } from "@/lib/plans";

/**
 * The employer match arithmetic (spec 0007). It lives in lib/insights/ because
 * it is a CALCULATION (it multiplies money and rounds): a number computed
 * anywhere but lib/insights/ is the bug (architecture.md section 7,
 * code-standards.md section 3). The formula TYPES and the catalog are static data
 * in lib/plans/; this module imports the types and does the math.
 *
 * Pure and synchronous, like the rest of lib/insights/. Money is integer minor
 * units, rates and percentages integer basis points, and every figure is
 * computed here from the inputs, never sourced elsewhere (foundation.md
 * section 4 #1). It returns numbers only: no advice, no recommendation, no rate
 * to pick. Stating the dollar consequence is allowed (foundation section 7 #2a);
 * choosing what the user should do is not, and is not this module's job.
 */

/**
 * The employer match, in minor units, for an employee contributing
 * `contributionBps` of pay under `formula`, on `grossPayMinor` of pay.
 *
 * Each tier matches its own band of the contribution: the band runs from the
 * previous tier's ceiling to this tier's. A contribution above the last tier's
 * ceiling earns no more match. This is the formula's THEORETICAL match for the
 * given inputs, not a forecast of the actual deposits a plan will make.
 *
 * Computed as a single expression with one rounding step, so a per tier round
 * never compounds: `round(grossPay * Σ(rateBps * bandBps) / 1e8)`, where the two
 * basis point scales (rate and pay share) divide out as 10000 * 10000.
 */
export function computeEmployerMatchMinor(
  formula: MatchFormula,
  contributionBps: number,
  grossPayMinor: number,
): number {
  let weighted = 0; // Σ over tiers of matchRateBps * bandWidthBps (bps * bps).
  let prevCeiling = 0;
  for (const tier of formula.tiers) {
    const bandWidthBps = Math.max(0, Math.min(contributionBps, tier.uptoContributionBps) - prevCeiling);
    weighted += tier.matchRateBps * bandWidthBps;
    prevCeiling = tier.uptoContributionBps;
  }
  // 100_000_000 = 10000 (rate bps) * 10000 (pay-share bps). One division, one round.
  return Math.round((grossPayMinor * weighted) / 100_000_000);
}

/** The maximum employer match, in minor units: the match at or above the cap. */
export function maxEmployerMatchMinor(formula: MatchFormula, grossPayMinor: number): number {
  return computeEmployerMatchMinor(formula, maxMatchContributionBps(formula), grossPayMinor);
}

/**
 * The employer money left on the table, in minor units: the maximum match minus
 * what the current contribution earns. Clamped to zero, so contributing at or
 * above the cap yields 0 unclaimed, never a negative "over contributed" figure.
 * This is the foundation section 7 #2a figure ("contributing N% more would
 * capture ~$X of employer money you are not currently receiving").
 */
export function unclaimedMatchMinor(
  formula: MatchFormula,
  currentContributionBps: number,
  grossPayMinor: number,
): number {
  const max = maxEmployerMatchMinor(formula, grossPayMinor);
  const current = computeEmployerMatchMinor(formula, currentContributionBps, grossPayMinor);
  return Math.max(0, max - current);
}
