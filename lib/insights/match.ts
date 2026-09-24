import type { MatchFormula } from "@/lib/plans";
import { maxMatchContributionBps } from "@/lib/plans";
import type { ContributionEvent } from "@/lib/types";

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

/**
 * The F8 walkthrough figures (spec 0009). Pure, like the rest of this module. The
 * employer match figures above answer "what am I leaving behind"; these answer
 * "what would it cost me to capture it", in the user's own paycheck.
 */

/** A rough default marginal tax rate for the take-home illustration, in basis
 * points (2200 = 22%). A LABELLED illustration only, never tax advice
 * (foundation.md section 7 #14, section 8). Not per user; the figure states this
 * assumption plainly (spec 0009). */
export const DEFAULT_MARGINAL_RATE_BPS = 2200;

/**
 * Contribution periods per year, inferred from the modal gap between deposit
 * dates. Null when there are fewer than two distinct dates to measure a gap.
 *
 * PROVISIONAL: contribution cadence is an unreliable signal (an annual lump sum or
 * a true-up can distort it, foundation.md section 5), so the caller confirms this
 * with the user before any per-paycheck figure uses it (spec 0009, foundation
 * section 7 #13). It is a suggestion to confirm, not a fact.
 */
export function observedPeriodsPerYear(events: ContributionEvent[]): number | null {
  const dates = [...new Set(events.map((e) => e.date))].sort();
  if (dates.length < 2) return null;
  const gaps: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const days = Math.round(
      (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86_400_000,
    );
    if (days > 0) gaps.push(days);
  }
  if (gaps.length === 0) return null;
  // Modal gap, ties broken by the smallest gap for determinism.
  const counts = new Map<number, number>();
  for (const g of gaps) counts.set(g, (counts.get(g) ?? 0) + 1);
  let modalGap = gaps[0];
  let best = 0;
  for (const [gap, count] of counts) {
    if (count > best || (count === best && gap < modalGap)) {
      modalGap = gap;
      best = count;
    }
  }
  if (modalGap <= 0) return null;
  return Math.round(365 / modalGap);
}

/**
 * The before-tax cost of raising the contribution from `currentBps` to `targetBps`,
 * per pay period, in minor units: the extra contribution each paycheck. Clamped to
 * zero (a target below the current rate is not a "cost"). Returns 0 when the period
 * count is not positive, so the caller must have a confirmed pay frequency first.
 */
export function contributionCostPerPeriodMinor(
  currentBps: number,
  targetBps: number,
  grossPayMinor: number,
  periodsPerYear: number,
): number {
  if (periodsPerYear <= 0) return 0;
  const deltaBps = Math.max(0, targetBps - currentBps);
  // gross (annual) * rate share (bps/10000) / periods.
  return Math.round((grossPayMinor * deltaBps) / (10000 * periodsPerYear));
}

/**
 * The take-home cost per pay period of the same increase: the before-tax cost
 * reduced by the marginal tax saved, because a pre-tax 401k contribution lowers
 * taxable income. A LABELLED illustration on an assumed rate, never tax advice
 * (foundation.md section 7 #14). One rounding step over the before-tax figure.
 */
export function takeHomeCostPerPeriodMinor(
  currentBps: number,
  targetBps: number,
  grossPayMinor: number,
  periodsPerYear: number,
  marginalRateBps: number = DEFAULT_MARGINAL_RATE_BPS,
): number {
  const before = contributionCostPerPeriodMinor(currentBps, targetBps, grossPayMinor, periodsPerYear);
  return Math.round((before * (10000 - marginalRateBps)) / 10000);
}
