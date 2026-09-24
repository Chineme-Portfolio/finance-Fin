import "server-only";
import {
  getAccountsForUser,
  getContributionEventsForAccount,
  getPlanFactsForAccount,
} from "@/lib/db";
import {
  deriveInsights,
  unclaimedMatchMinor,
  computeEmployerMatchMinor,
  observedPeriodsPerYear,
  contributionCostPerPeriodMinor,
  takeHomeCostPerPeriodMinor,
  DEFAULT_MARGINAL_RATE_BPS,
} from "@/lib/insights";
import { getCatalogEntry, maxMatchContributionBps, MATCH_FORMULA_CATALOG } from "@/lib/plans";
import type { CatalogEntry } from "@/lib/plans";
import type { Insight } from "@/lib/types";

/**
 * The view model for F8, the match walk (spec 0009). It reads the user's persisted
 * plan facts and contribution deposits, resolves the recognized formula, runs the
 * engine, and assembles the three step walk.
 *
 * It computes NO money figure of its own (foundation.md section 4 #1, section 7 #1).
 * Every dollar figure below is the return value of a lib/insights function; this
 * builder only chooses which rates to ask about (a rate is a basis point selection,
 * not a shown money figure) and places the results. The templated copy in the UI
 * formats these figures; it never derives new ones.
 */

type MatchInsight = Extract<Insight, { kind: "match_differential" }>;

/** One target rate the user could move to, with its consequences (all from lib/insights). */
export interface RateOption {
  targetBps: number;
  atCap: boolean;
  /** The annual employer match captured at this rate. */
  capturedAnnualMinor: number;
  /** The annual match still unclaimed at this rate (0 at or above the cap). */
  unclaimedAnnualMinor: number;
  /** Before-tax extra contribution per paycheck; null until pay frequency is confirmed. */
  costPerPeriodMinor: number | null;
  /** Take-home cost per paycheck (labelled illustration); null until frequency confirmed. */
  takeHomePerPeriodMinor: number | null;
}

/** What, if anything, is blocking a confident dollar figure, and why (drives AC-9 copy). */
export type MatchBlocker = "none" | "recognize" | "gross_pay" | "window";

export interface MatchWalkView {
  present: true;
  accountId: string;
  employer: string | null;
  insight: MatchInsight;
  /** The resolved formula, or null when none is recognized yet. */
  formulaEntry: CatalogEntry | null;
  /** True when the resolved formula is unverified (shown as a question, never asserted). */
  formulaProvisional: boolean;
  formulaNote: string | null;
  currentContributionBps: number | null;
  grossPayMinor: number | null;
  /** Suggested pay frequency, to CONFIRM with the user before per-paycheck figures show. */
  periodsPerYear: number | null;
  /** The labelled tax assumption behind the take-home figures. */
  marginalRateBps: number;
  blocker: MatchBlocker;
  alreadyFullyMatched: boolean;
  atCapContributionBps: number | null;
  /** Unclaimed annual match at the CURRENT rate; null until quantifiable. */
  unclaimedAnnualMinor: number | null;
  rateOptions: RateOption[];
  /** The catalog shapes the user can recognize theirs among, plus the escape hatch. */
  catalogChoices: Array<{ id: string; label: string }>;
}

export interface NoMatchView {
  present: false;
}

export type MatchView = MatchWalkView | NoMatchView;

const RATE_STEP_BPS = 100; // one percentage point
const MAX_INTERMEDIATE_OPTIONS = 5;

/** Whole-percent target rates strictly above the current rate up to and including
 * the cap. Choosing which rates to offer, not computing a money figure. */
function buildRateOptions(
  entry: CatalogEntry,
  currentBps: number,
  atCapBps: number,
  grossPayMinor: number,
  periodsPerYear: number | null,
): RateOption[] {
  const targets = new Set<number>();
  let t = Math.ceil((currentBps + 1) / RATE_STEP_BPS) * RATE_STEP_BPS;
  for (; t < atCapBps && targets.size < MAX_INTERMEDIATE_OPTIONS; t += RATE_STEP_BPS) {
    targets.add(t);
  }
  targets.add(atCapBps); // the cap always appears; it is where the full match is captured
  return [...targets]
    .sort((a, b) => a - b)
    .map((targetBps) => ({
      targetBps,
      atCap: targetBps >= atCapBps,
      capturedAnnualMinor: computeEmployerMatchMinor(entry.formula, targetBps, grossPayMinor),
      unclaimedAnnualMinor: unclaimedMatchMinor(entry.formula, targetBps, grossPayMinor),
      costPerPeriodMinor:
        periodsPerYear != null
          ? contributionCostPerPeriodMinor(currentBps, targetBps, grossPayMinor, periodsPerYear)
          : null,
      takeHomePerPeriodMinor:
        periodsPerYear != null
          ? takeHomeCostPerPeriodMinor(currentBps, targetBps, grossPayMinor, periodsPerYear)
          : null,
    }));
}

export async function loadMatch(): Promise<MatchView> {
  const accounts = await getAccountsForUser();
  // The match layer runs on the employer 401k (foundation.md section 6, F3/F8).
  const account = accounts.find((a) => a.type === "401k");
  if (!account) return { present: false };

  const events = await getContributionEventsForAccount(account.id);
  const planFacts = await getPlanFactsForAccount(account.id);

  // Resolve the recognized formula id to a catalog entry. A stale id (a later
  // catalog change) resolves to null, which drops us into the recognize state,
  // never a throw (spec 0009 AC-10).
  const entry = planFacts?.matchFormula ? getCatalogEntry(planFacts.matchFormula) ?? null : null;

  const insights = deriveInsights({
    accounts: [account],
    holdings: [],
    contributionEvents: events,
    planFacts: planFacts ? [planFacts] : [],
    matchFormulas: entry ? { [account.id]: entry } : {},
  });
  const insight = insights.find((i): i is MatchInsight => i.kind === "match_differential") ?? null;
  if (!insight) return { present: false };

  const currentContributionBps = planFacts?.contributionRateBps ?? null;
  const grossPayMinor = planFacts?.grossPayMinor ?? null;
  const periodsPerYear = observedPeriodsPerYear(events);
  const atCapContributionBps = entry ? maxMatchContributionBps(entry.formula) : null;

  // The blocker in priority order: recognize the formula, then the numbers we need,
  // then "not enough history". This decides the honest AC-9 copy in the UI.
  let blocker: MatchBlocker = "none";
  if (!entry) blocker = "recognize";
  else if (grossPayMinor == null || currentContributionBps == null) blocker = "gross_pay";
  else if (!insight.observation.windowSufficient && insight.unclaimed == null) blocker = "window";

  let rateOptions: RateOption[] = [];
  let unclaimedAnnualMinor: number | null = null;
  let alreadyFullyMatched = false;
  if (
    entry &&
    grossPayMinor != null &&
    currentContributionBps != null &&
    atCapContributionBps != null
  ) {
    unclaimedAnnualMinor = unclaimedMatchMinor(entry.formula, currentContributionBps, grossPayMinor);
    alreadyFullyMatched = currentContributionBps >= atCapContributionBps || unclaimedAnnualMinor === 0;
    if (!alreadyFullyMatched) {
      rateOptions = buildRateOptions(
        entry,
        currentContributionBps,
        atCapContributionBps,
        grossPayMinor,
        periodsPerYear,
      );
    }
  }

  return {
    present: true,
    accountId: account.id,
    employer: planFacts?.employer ?? account.name,
    insight,
    formulaEntry: entry,
    formulaProvisional: entry ? entry.verified === false : false,
    formulaNote: entry && entry.verified === false ? entry.note : null,
    currentContributionBps,
    grossPayMinor,
    periodsPerYear,
    marginalRateBps: DEFAULT_MARGINAL_RATE_BPS,
    blocker,
    alreadyFullyMatched,
    atCapContributionBps,
    unclaimedAnnualMinor,
    rateOptions,
    catalogChoices: MATCH_FORMULA_CATALOG.map((e) => ({ id: e.id, label: e.label })),
  };
}
