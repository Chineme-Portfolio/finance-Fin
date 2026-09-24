import type { CatalogEntry } from "@/lib/plans";

/**
 * FINBUDDY domain model. The canonical shapes the whole app codes against.
 *
 * These are PROVIDER NEUTRAL. They are distinct from the raw provider boundary
 * types in `lib/aggregator/types.ts` (which mirror Plaid's response shapes).
 * The aggregator maps raw output into these, so nothing downstream knows a
 * provider exists (foundation.md section 7 #8, architecture.md section 4).
 *
 * Money is always integer minor units (cents). A share quantity is a count of
 * units, not money, so it is a plain number and may be fractional. Percentages
 * are integer basis points (hundredths of a percent), never floats
 * (code-standards.md section 2).
 */

/** The account types the product reasons about (foundation.md section 5, section 7 #15). */
export type AccountType =
  | "401k"
  | "roth_ira"
  | "traditional_ira"
  | "taxable_brokerage"
  | "hsa"
  | "other";

/** Which data products a specific connection actually returned (foundation.md section 7 #15). */
export type Capability = "balance" | "holdings" | "transactions";

/**
 * A CLOSED set of security kinds. The aggregator normalises the provider's raw
 * type string to one of these at the mapping boundary; an unknown or missing
 * raw type becomes "other". A raw provider string never reaches the engine.
 */
export type SecurityType =
  | "mutual fund"
  | "etf"
  | "equity"
  | "fixed income"
  | "cash"
  | "cryptocurrency"
  | "derivative"
  | "other";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  /** The provider's finer label, kept verbatim for display (e.g. "ira", "401k"). */
  subtype: string | null;
  /** Provenance. Always linked in v1 (foundation.md section 7 #4). Present so a future
   * provenance is a type change, not a schema change. */
  linked: true;
  /** Which of balance / holdings / transactions this account actually returned. */
  capabilities: Capability[];
  /** Integer minor units; null when the provider gave no balance. */
  balanceMinor: number | null;
  currency: string | null;
}

export interface SecurityInfo {
  /** The provider's stable id, kept so a later feature can dedupe or link back. */
  securityId: string;
  name: string;
  ticker: string | null;
  securityType: SecurityType;
  /** The provider flag that drives the cash drag insight. */
  isCashEquivalent: boolean;
}

export interface Holding {
  accountId: string;
  /** Resolved at mapping time (the holding to security join). */
  security: SecurityInfo;
  /** A count of units, NOT money, so not minor units. May be fractional. */
  quantity: number;
  /** Integer minor units: the position's current value. */
  valueMinor: number;
  /** Integer minor units; null when the provider gave none. */
  costBasisMinor: number | null;
  currency: string | null;
}

/**
 * A dated deposit into an employer account.
 *
 * Consumed by the match differential engine (spec 0008, foundation.md section 5,
 * section 7 #16). Persisted raw with `source: "unknown"` (spec 0006); the engine
 * infers deferral vs match at read time and never writes a classification back.
 */
export interface ContributionEvent {
  accountId: string;
  /** ISO date. */
  date: string;
  amountMinor: number;
  currency: string | null;
  /** How the provider labelled it. "unknown" is the honest default until real
   * data (spec 0001 task 9) shows what deferral vs match actually looks like. */
  source: "deferral" | "match" | "unknown";
  /** The provider's own description string, kept for the differential to reason over. */
  rawName: string;
}

/**
 * Employer plan facts.
 *
 * Consumed by the match differential engine (spec 0008): it reads
 * `contributionRateBps` and `grossPayMinor` to quantify the unclaimed match. The
 * free text `matchFormula` is not read by the engine; a typed formula is resolved
 * upstream and passed via EngineInput.matchFormulas (foundation.md section 5, #12).
 */
export interface PlanFacts {
  accountId: string;
  employer: string | null;
  /** Free text until the formula library (a later slice) types it. */
  matchFormula: string | null;
  /** Integer basis points. */
  contributionRateBps: number | null;
  /** Integer minor units. */
  grossPayMinor: number | null;
}

/** One security-type slice of an account's holdings. */
export interface CompositionGroup {
  securityType: SecurityType;
  valueMinor: number;
  /** Integer basis points. Groups sum to 10000 (rounding handled explicitly). */
  shareBps: number;
}

/**
 * The distinct explanations for what a contribution history shows about the
 * employer match: the five causes of a single unpaired deposit (foundation.md
 * section 5), plus a positive detection and the true-up wrinkle. These are NEVER
 * collapsed to a single verdict. Several are live at once and the engine ranks
 * them, because asserting the absence of a match is the product's most damaging
 * error (foundation.md section 7 #16).
 */
export type MatchCause =
  | "match_detected"
  | "not_yet_eligible"
  | "annual_lump_sum_timing"
  | "blended_unitemized"
  | "below_match_threshold"
  | "no_match_offered"
  | "true_up_correction";

/**
 * The observable reason a hypothesis is ranked where it is. Each maps to a fact
 * in MatchObservation, so a ranking is always traceable to what was actually seen
 * (code-standards.md section 9: a heuristic carries its source).
 */
export type MatchSignal =
  | "paired_deposits_present"
  | "single_deposit_only"
  | "blended_single_line"
  | "window_below_13_months"
  | "contribution_below_cap"
  | "ratio_below_headline"
  | "late_anomalous_deposit";

/**
 * A typed question code. The engine emits a code, never prose: rendering it into
 * words is the surface's job, so the pure engine stays language free (foundation.md
 * section 4 #1). Inference is always surfaced as a question, never asserted as a
 * fact (foundation.md section 7 #13, section 7 #16), so a match_differential always
 * carries at least one.
 */
export type MatchQuestion =
  | "confirm_ratio_looks_like_match"
  | "provide_gross_pay"
  | "provide_contribution_rate"
  | "confirm_eligibility_status"
  | "widen_window"
  | "recognize_formula"
  | "confirm_whether_plan_matches";

/**
 * How the deposits sit on the dates observed. There is no "none" variant: an
 * account with no contribution events yields no insight at all (deriveMatch returns
 * null), so a pairing is always observed when a match_differential exists.
 */
export type MatchPairing = "paired" | "single" | "blended";

/**
 * The computed, deterministic facts about a contribution history. Every field is
 * derived here from the events; nothing is asserted (foundation.md section 7 #7).
 */
export interface MatchObservation {
  /** Whole calendar months from the earliest to the latest contribution event. */
  windowMonths: number;
  /** Distinct contribution periods (dates) actually observed. A sparse or gapped
   * history has few of these even across a long span. */
  observedPeriodCount: number;
  /** True only when the span is at least 13 months AND enough periods were seen to
   * have caught an annual cycle. Below this an annual lump-sum match cannot be
   * ruled out (foundation.md section 5). */
  windowSufficient: boolean;
  /** Total contribution deposits observed. */
  depositCount: number;
  pairing: MatchPairing;
  /** Employer to employee, in basis points: the modal ratio across itemized paired
   * dates, excluding any true-up date. Null when no ratio was readable, which can
   * happen even when `pairing` is "paired" (for example every itemized date was a
   * true-up); the engine then treats the pairing as unsplittable. */
  observedRatioBps: number | null;
}

/** One ranked explanation in the differential. */
export interface MatchHypothesis {
  cause: MatchCause;
  /** 1 is best supported; ranks ascend. */
  rank: number;
  /** The observed signal that placed this hypothesis at this rank. */
  signal: MatchSignal;
}

/**
 * The employer money left unclaimed, in minor units. Present ONLY when a formula
 * and gross pay are known AND the differential itself supports a match existing
 * (the unclaimed gating rule; see the engine). The figure is produced by
 * lib/insights/match.ts, never anywhere else (foundation.md section 4 #1, #7 #1).
 */
export interface UnclaimedMatch {
  formulaId: string;
  amountMinor: number;
  currentContributionBps: number;
  atCapContributionBps: number;
  /** Whether the formula is confirmed against the real plan. When false the figure
   * rests on an unconfirmed formula and must be framed as a question, never a fact
   * (foundation.md section 7 #13). */
  formulaVerified: boolean;
  /** The catalog entry's disclosure note when the formula is unverified; null when
   * verified. */
  formulaNote: string | null;
}

/**
 * A derived, typed observation. ALWAYS computed, never stored as truth
 * (foundation.md section 5).
 *
 * A discriminated union on `kind`, so an impossible state (fields from one kind
 * mixed with another) cannot be represented. Adding a future variant (the match
 * differential) requires no change to the existing variants.
 */
export type Insight =
  | {
      kind: "composition";
      accountId: string;
      /** Defined as sum(holdings.valueMinor), never the provider balance (see the engine). */
      accountTotalMinor: number;
      groups: CompositionGroup[];
      /** Holdings excluded because their value was zero or less (shorts, written down). */
      excludedCount: number;
    }
  | {
      kind: "cash_drag";
      accountId: string;
      accountTotalMinor: number;
      cashMinor: number;
      cashShareBps: number;
    }
  | {
      kind: "match_differential";
      accountId: string;
      observation: MatchObservation;
      /** Ranked and non empty. hypotheses[0] is the best supported cause and always
       * travels with the Insight, so a surface can never show a dollar figure without
       * the cause that qualifies it (foundation.md section 7 #16). */
      hypotheses: MatchHypothesis[];
      /** Non empty and priority ordered; carries every live uncertainty at once.
       * Inference is always a question (foundation.md section 7 #13, #16). */
      questions: MatchQuestion[];
      /** Null unless the unclaimed gating rule is met (see UnclaimedMatch). */
      unclaimed: UnclaimedMatch | null;
    };

/** The whole input the engine reasons over. Pure data, no methods. */
export interface EngineInput {
  accounts: Account[];
  holdings: Holding[];
  /** Consumed by the match differential (spec 0008): the raw dated deposits. */
  contributionEvents: ContributionEvent[];
  /** Consumed by the match differential (spec 0008): employer plan facts per account. */
  planFacts: PlanFacts[];
  /** Per account resolved match formula (a catalog entry), populated by the caller
   * from recognition (tier 2) or a user answer. In memory only, never persisted:
   * Insights are always computed (foundation.md section 5). Absent for an account
   * means its match differential is emitted without a dollar figure (spec 0008). */
  matchFormulas?: Record<string, CatalogEntry>;
}
