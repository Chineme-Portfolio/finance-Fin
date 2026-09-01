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
 * DEFINED here, but NOT consumed by this slice's insights. It is intentional
 * groundwork for the deferred employer match differential (foundation.md
 * section 5, section 7 #16), which is gated on observing real contribution data
 * (spec 0001 task 9). Do not delete as unused.
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
 * DEFINED here, but NOT consumed by this slice. Groundwork for the match
 * feature (foundation.md section 5, section 7 #12). Do not delete as unused.
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
    };

/** The whole input the engine reasons over. Pure data, no methods. */
export interface EngineInput {
  accounts: Account[];
  holdings: Holding[];
  /** Present in the contract for the deferred match differential; unused this slice. */
  contributionEvents: ContributionEvent[];
  /** Present in the contract for the deferred match differential; unused this slice. */
  planFacts: PlanFacts[];
}
