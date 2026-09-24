import type {
  Account,
  ContributionEvent,
  PlanFacts,
  Insight,
  MatchObservation,
  MatchHypothesis,
  MatchQuestion,
  MatchPairing,
  UnclaimedMatch,
} from "@/lib/types";
import type { CatalogEntry } from "@/lib/plans";
import { maxMatchContributionBps } from "@/lib/plans";
import { unclaimedMatchMinor } from "./match";

/**
 * F3, the match differential engine (spec 0008, foundation.md section 5).
 *
 * PURE and SYNCHRONOUS, like the rest of lib/insights/. It reads the raw
 * contribution deposits (persisted with `source: "unknown"`, spec 0006) and works
 * out whether the employer match is being captured. It NEVER asserts "you are not
 * being matched": a single unpaired deposit has at least five distinct causes with
 * opposite right answers (foundation.md section 5), so the engine emits a ranked
 * differential plus a question, never a verdict (foundation.md section 7 #16).
 *
 * It computes no dollar figure of its own: the unclaimed amount comes only from
 * lib/insights/match.ts (foundation.md section 4 #1, section 7 #1). And it never
 * writes a classification back onto an event; the `source` it reads is left as it
 * was (spec 0006, foundation.md section 7 #7).
 *
 * Every threshold and hint below is PROVISIONAL. The real Northwind 401k data has
 * not been observed (spec 0001 task 9 is deferred), so the pairing and true-up
 * rules are assumptions, revisited against real data later (foundation.md section 11).
 * They are safe to ship now precisely because a wrong assumption degrades to a
 * worse question, not a false finding (section 7 #16).
 */

/** The account type that carries an employer match (foundation.md section 6, F3). */
const EMPLOYER_ACCOUNT_TYPE = "401k";

/** At least 13 months of history before an annual lump-sum match can be excluded
 * (foundation.md section 5). PROVISIONAL. */
const SUFFICIENT_WINDOW_MONTHS = 13;

/** A true-up deposit is markedly larger than the routine deposit. PROVISIONAL
 * heuristic (foundation.md section 5, the true-up wrinkle). */
const TRUE_UP_MAGNITUDE_MULTIPLE = 3;

/** Substrings that hint at the deferral vs match side of a deposit. PROVISIONAL:
 * real provider description strings have not been observed (foundation.md section 11).
 * Matching is case insensitive. */
const DEFERRAL_HINTS = ["employee", "deferral", "elective", "pre-tax", "pretax"];
const MATCH_HINTS = ["employer", "match", "matching"];
const BLENDED_HINTS = ["total", "combined"];

function hasHint(rawName: string, hints: string[]): boolean {
  const name = rawName.toLowerCase();
  return hints.some((h) => name.includes(h));
}

/**
 * COMPLETED whole months between two ISO dates, in UTC. Never optimistic: a span
 * that has not reached the same day of a later month does not count that month, so
 * the 13 month floor for excluding an annual lump sum is a real floor, never rounded
 * up (foundation.md section 5). Example: 2025-01-31 to 2026-02-01 is 12 months, not 13.
 */
function monthsBetween(earliestIso: string, latestIso: string): number {
  const a = new Date(earliestIso);
  const b = new Date(latestIso);
  let months =
    (b.getUTCFullYear() - a.getUTCFullYear()) * 12 +
    (b.getUTCMonth() - a.getUTCMonth());
  if (b.getUTCDate() < a.getUTCDate()) months -= 1;
  return Math.max(0, months);
}

/** The most frequent value, ties broken by the smallest value for determinism. */
function modeOf(values: number[]): number | null {
  if (values.length === 0) return null;
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = values[0];
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount || (count === bestCount && value < best)) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Which side of the match a single deposit line is, read from its description
 * string. A line we cannot attribute cleanly (it matches both hint sets, matches
 * neither, or carries a blended hint like "total") is "ambiguous" and never counts
 * toward a ratio. PROVISIONAL: real provider strings are unobserved (foundation.md
 * section 11).
 */
type ContributionSide = "deferral" | "match" | "ambiguous";

function sideOf(rawName: string): ContributionSide {
  // A combined or total line cannot be split, whatever else it mentions.
  if (hasHint(rawName, BLENDED_HINTS)) return "ambiguous";
  const deferral = hasHint(rawName, DEFERRAL_HINTS);
  const match = hasHint(rawName, MATCH_HINTS);
  if (deferral && !match) return "deferral";
  if (match && !deferral) return "match";
  // Both hints on one line ("EMPLOYEE MATCH") or neither: not attributable.
  return "ambiguous";
}

/** One calendar date's deposits, grouped from the raw events. */
interface DayGroup {
  date: string;
  totalMinor: number;
  /** Sum of the day's deferral side lines and match side lines, kept apart so a
   * ratio is read from DISTINCT events, never one line counted on both sides. */
  deferralMinor: number;
  matchMinor: number;
  /** A genuine itemized pair: at least one distinct deferral line AND at least one
   * distinct match line on the day. A single line matching both hints does NOT
   * qualify (it is one event, not a pair). This is what stops a fabricated ratio. */
  itemized: boolean;
  /** Every line on the day is a clean deferral line (an employee only deposit). */
  cleanSingle: boolean;
}

function groupByDate(events: ContributionEvent[]): DayGroup[] {
  const byDate = new Map<string, ContributionEvent[]>();
  for (const e of events) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }
  const groups: DayGroup[] = [...byDate.entries()].map(([date, dayEvents]) => {
    let deferralMinor = 0;
    let matchMinor = 0;
    let hasDeferral = false;
    let hasMatch = false;
    let allDeferral = true;
    for (const e of dayEvents) {
      const side = sideOf(e.rawName);
      if (side === "deferral") {
        deferralMinor += e.amountMinor;
        hasDeferral = true;
      } else if (side === "match") {
        matchMinor += e.amountMinor;
        hasMatch = true;
        allDeferral = false;
      } else {
        allDeferral = false;
      }
    }
    return {
      date,
      totalMinor: dayEvents.reduce((s, e) => s + e.amountMinor, 0),
      deferralMinor,
      matchMinor,
      itemized: hasDeferral && hasMatch,
      cleanSingle: allDeferral && hasDeferral,
    };
  });
  // Chronological order for cadence and true-up reasoning.
  groups.sort((a, b) => a.date.localeCompare(b.date));
  return groups;
}

/** Flag the days that look like a true-up: an outsized deposit sitting off the
 * regular cadence (foundation.md section 5). PROVISIONAL heuristic. */
function trueUpDates(groups: DayGroup[]): Set<string> {
  const flagged = new Set<string>();
  if (groups.length < 3) return flagged; // Too little history to call a cadence.
  const medianTotal = median(groups.map((g) => g.totalMinor));
  if (medianTotal <= 0) return flagged;

  // The typical gap between deposits, in days.
  const gaps: number[] = [];
  for (let i = 1; i < groups.length; i++) {
    const days =
      (new Date(groups[i].date).getTime() -
        new Date(groups[i - 1].date).getTime()) /
      86_400_000;
    gaps.push(days);
  }
  const modalGap = modeOf(gaps.map((d) => Math.round(d))) ?? 0;

  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const outsized = g.totalMinor >= TRUE_UP_MAGNITUDE_MULTIPLE * medianTotal;
    if (!outsized) continue;
    // Off cadence: the last deposit, or one preceded by a gap well over the norm.
    const gapBefore = i > 0 ? Math.round(gaps[i - 1]) : Infinity;
    const offCadence = i === groups.length - 1 || gapBefore >= 2 * modalGap;
    if (offCadence) flagged.add(g.date);
  }
  return flagged;
}

function buildObservation(
  events: ContributionEvent[],
  groups: DayGroup[],
  trueUps: Set<string>,
): MatchObservation {
  const dates = groups.map((g) => g.date);
  const windowMonths = monthsBetween(dates[0], dates[dates.length - 1]);
  const observedPeriodCount = groups.length;

  // Sufficient means a long enough span AND a dense enough history to have actually
  // caught an annual cycle. A sparse or gapped span crossing 13 months is NOT
  // sufficient (foundation.md section 5). PROVISIONAL density rule: about one
  // deposit per month of span.
  const windowSufficient =
    windowMonths >= SUFFICIENT_WINDOW_MONTHS &&
    observedPeriodCount >= windowMonths;

  // Pairing: an itemized pair anywhere means we can try to read a ratio; else if
  // every day is a clean deferral line it is an unpaired single stream; else there
  // is a line we cannot attribute (ambiguous or match only), so it is blended.
  let pairing: MatchPairing;
  const itemizedGroups = groups.filter((g) => g.itemized);
  if (itemizedGroups.length > 0) pairing = "paired";
  else if (groups.every((g) => g.cleanSingle)) pairing = "single";
  else pairing = "blended";

  // Ratio: the modal employer-to-employee ratio across itemized days, excluding
  // true-up days so a correction cannot skew the detected rate, and reading each
  // side from its own summed events (never one line counted twice). It can be null
  // even when pairing is "paired": if every itemized day is a true-up or has no
  // deferral, no ratio is readable. buildHypotheses handles that (treats it as
  // unsplittable), so the field's contract is "null when no ratio was readable".
  let observedRatioBps: number | null = null;
  if (pairing === "paired") {
    const ratios: number[] = [];
    for (const g of itemizedGroups) {
      if (trueUps.has(g.date)) continue;
      if (g.deferralMinor > 0) {
        ratios.push(Math.round((g.matchMinor * 10000) / g.deferralMinor));
      }
    }
    observedRatioBps = modeOf(ratios);
  }

  return {
    windowMonths,
    observedPeriodCount,
    windowSufficient,
    depositCount: events.length,
    pairing,
    observedRatioBps,
  };
}

/**
 * Build the ranked hypotheses. The order is deterministic and driven by observed
 * signals only (AC-11). `no_match_offered` is always present but never ranked 1
 * while another cause is live, and it is never asserted as fact (foundation.md
 * section 7 #16).
 */
function buildHypotheses(
  observation: MatchObservation,
  belowCap: boolean,
  hasTrueUp: boolean,
): MatchHypothesis[] {
  // An ordered list of (cause, signal); rank is the index once assembled.
  const ordered: Array<Pick<MatchHypothesis, "cause" | "signal">> = [];

  // A ratio is readable only when the pairing is genuine AND a ratio survived (a
  // paired stream whose only itemized days were all true-ups leaves no ratio).
  const canReadRatio =
    observation.pairing === "paired" && observation.observedRatioBps !== null;

  if (canReadRatio) {
    // A match is visible. If the contribution is below the cap, some match is still
    // unclaimed; otherwise the ratio has dropped below the headline (fully captured).
    ordered.push({
      cause: "match_detected",
      signal: belowCap ? "paired_deposits_present" : "ratio_below_headline",
    });
    if (belowCap) {
      ordered.push({ cause: "below_match_threshold", signal: "contribution_below_cap" });
    }
  } else if (observation.pairing === "blended" || observation.pairing === "paired") {
    // Blended, OR paired with no readable ratio: cannot split deferral from match,
    // so fall back to recognition rather than guess a rate (foundation.md section 7 #12).
    ordered.push({ cause: "blended_unitemized", signal: "blended_single_line" });
  } else {
    // A single employee-only stream: the whole differential is live (foundation.md
    // section 5). The real finding, if the contribution is known below the cap,
    // leads; then the benign explanations.
    if (belowCap) {
      ordered.push({ cause: "below_match_threshold", signal: "contribution_below_cap" });
    }
    ordered.push({ cause: "not_yet_eligible", signal: "single_deposit_only" });
    if (!observation.windowSufficient) {
      // Not enough history to exclude an annual lump sum, so it stays high.
      ordered.push({ cause: "annual_lump_sum_timing", signal: "window_below_13_months" });
    }
  }

  // A true-up correction, when a late outsized deposit was seen, in any branch.
  if (hasTrueUp) {
    ordered.push({ cause: "true_up_correction", signal: "late_anomalous_deposit" });
  }

  // Never absent, never top while another cause is live (foundation.md section 7 #16).
  // Its signal reflects what was actually observed in this branch, not a fixed value.
  const noMatchSignal: MatchHypothesis["signal"] =
    observation.pairing === "paired"
      ? "paired_deposits_present"
      : observation.pairing === "blended"
        ? "blended_single_line"
        : "single_deposit_only";
  ordered.push({ cause: "no_match_offered", signal: noMatchSignal });

  // A sufficient, clean single-line window has ruled out the annual lump sum, so it
  // is demoted to the very bottom (below no_match_offered) rather than kept high.
  if (
    observation.pairing === "single" &&
    observation.windowSufficient
  ) {
    ordered.push({ cause: "annual_lump_sum_timing", signal: "single_deposit_only" });
  }

  return ordered.map((h, i) => ({ cause: h.cause, rank: i + 1, signal: h.signal }));
}

/**
 * Build the priority ordered questions. Quantify blockers first (recognise the
 * formula, then supply gross pay), then the confidence questions, then the honest
 * catch all. Always non empty (foundation.md section 7 #13).
 */
function buildQuestions(
  observation: MatchObservation,
  hypotheses: MatchHypothesis[],
  formulaEntry: CatalogEntry | null,
  planFacts: PlanFacts | null,
): MatchQuestion[] {
  const questions: MatchQuestion[] = [];
  const causes = new Set(hypotheses.map((h) => h.cause));
  const canReadRatio =
    observation.pairing === "paired" && observation.observedRatioBps !== null;
  // We cannot split deferral from match: blended, or paired with no readable ratio.
  const cannotSplit =
    observation.pairing === "blended" ||
    (observation.pairing === "paired" && observation.observedRatioBps === null);

  // Quantify blockers first, so a surface can lead with what is actually missing.
  // Recognise the formula when none is resolved, or when the deposits cannot be split.
  if (formulaEntry === null || cannotSplit) {
    questions.push("recognize_formula");
  }
  // A visible match but no known contribution rate: name the rate as the missing
  // input, so the absent dollar figure is explained, not silent (foundation.md
  // section 4 #7). Only when a match is the leading read (a rate would then quantify it).
  if (planFacts?.contributionRateBps == null && hypotheses[0].cause === "match_detected") {
    questions.push("provide_contribution_rate");
  }
  // Supply gross pay when it is missing (the tier 3 remembered number).
  if (planFacts?.grossPayMinor == null) {
    questions.push("provide_gross_pay");
  }
  // Confirm a detected ratio rather than assert it (foundation.md section 7 #13).
  if (canReadRatio) {
    questions.push("confirm_ratio_looks_like_match");
  }
  // Eligibility is live in the single-stream differential.
  if (causes.has("not_yet_eligible")) {
    questions.push("confirm_eligibility_status");
  }
  // Not enough history to conclude.
  if (!observation.windowSufficient) {
    questions.push("widen_window");
  }
  // The honest catch-all whenever there is no confirmed, readable match.
  if (!canReadRatio) {
    questions.push("confirm_whether_plan_matches");
  }

  // Always at least one question (foundation.md section 7 #13, #16).
  if (questions.length === 0) questions.push("confirm_whether_plan_matches");
  return questions;
}

/**
 * The match differential for one employer account, or null when there is nothing
 * honest to say (a non employer account, or no contribution events). Absence is a
 * first class outcome, never a fabricated insight (foundation.md section 4 #7).
 */
export function deriveMatch(
  account: Account,
  events: ContributionEvent[],
  planFacts: PlanFacts | null,
  formulaEntry: CatalogEntry | null,
): Insight | null {
  if (account.type !== EMPLOYER_ACCOUNT_TYPE) return null;

  // Defensive: only this account's events, and only when there are any.
  const own = events.filter((e) => e.accountId === account.id);
  if (own.length === 0) return null;

  const groups = groupByDate(own);
  const trueUps = trueUpDates(groups);
  const observation = buildObservation(own, groups, trueUps);

  // "Below cap" is only asserted when we actually know it: a resolved formula and a
  // known contribution rate below the fully-captured point. Unknown stays false, so
  // the engine never asserts a shortfall it cannot see (foundation.md section 7 #16).
  const atCapContributionBps =
    formulaEntry !== null ? maxMatchContributionBps(formulaEntry.formula) : null;
  const belowCap =
    formulaEntry !== null &&
    atCapContributionBps !== null &&
    planFacts?.contributionRateBps != null &&
    planFacts.contributionRateBps < atCapContributionBps;

  const hypotheses = buildHypotheses(observation, belowCap, trueUps.size > 0);
  const questions = buildQuestions(observation, hypotheses, formulaEntry, planFacts);

  // The unclaimed gating rule (the false positive mirror of section 7 #16): a dollar
  // figure only when a formula and gross pay are both known AND the rank 1 hypothesis
  // supports a match existing. When the top hypothesis is no_match_offered or
  // blended_unitemized, the engine is not sure a match exists, so it states no figure.
  const topCause = hypotheses[0].cause;
  const matchSupported =
    topCause === "match_detected" || topCause === "below_match_threshold";
  // For an UNPAIRED stream the match was not observed directly, so an annual lump-sum
  // could still mean the person is fully matched. Do not state a shortfall in dollars
  // until the window is long enough to have excluded that (foundation.md section 5,
  // section 7 #16). A paired stream shows the match directly, so the window does not gate it.
  const matchObservedOrWindowSufficient =
    observation.pairing === "paired" || observation.windowSufficient;

  let unclaimed: UnclaimedMatch | null = null;
  if (
    matchSupported &&
    matchObservedOrWindowSufficient &&
    formulaEntry !== null &&
    atCapContributionBps !== null &&
    planFacts != null &&
    planFacts.contributionRateBps != null &&
    planFacts.grossPayMinor != null
  ) {
    unclaimed = {
      formulaId: formulaEntry.id,
      // The figure is computed by lib/insights/match.ts, never here.
      amountMinor: unclaimedMatchMinor(
        formulaEntry.formula,
        planFacts.contributionRateBps,
        planFacts.grossPayMinor,
      ),
      currentContributionBps: planFacts.contributionRateBps,
      atCapContributionBps,
      formulaVerified: formulaEntry.verified,
      formulaNote: formulaEntry.verified ? null : formulaEntry.note,
    };
  }

  return {
    kind: "match_differential",
    accountId: account.id,
    observation,
    hypotheses,
    questions,
    unclaimed,
  };
}
