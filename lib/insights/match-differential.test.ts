import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { deriveMatch } from "./match-differential";
import { deriveInsights } from "./index";
import { makeAccount, makeHolding } from "./_test-helpers";
import { getCatalogEntry } from "@/lib/plans";
import type { ContributionEvent, PlanFacts, Insight } from "@/lib/types";

/**
 * F3 match differential engine (spec 0008). The product's highest consequence
 * logic, so this suite covers every case in foundation.md section 5 plus the
 * false positive mirror of section 7 #16 (a dollar figure while unsure a match
 * exists). Every classification rule under test is PROVISIONAL pending real
 * Northwind data (spec 0001 task 9, foundation.md section 11).
 */

const ACC_ID = "401k-1";
const GROSS = 10_000_000; // $100,000

const acct = makeAccount({
  id: ACC_ID,
  name: "Northwind 401k",
  type: "401k",
  capabilities: ["balance", "transactions"],
  balanceMinor: 5_000_000,
});

// The verified generic safe harbor: 100% up to 3%, then 50% up to 5% (cap 500 bps).
const tiered = getCatalogEntry("generic-tiered-safe-harbor")!;
// The Northwind entry: PROVISIONAL, verified:false, carries a disclosure note.
const northwind = getCatalogEntry("northwind-retirement-savings-plan")!;

function ev(
  date: string,
  amountMinor: number,
  rawName: string,
  accountId = ACC_ID,
): ContributionEvent {
  return { accountId, date, amountMinor, currency: "USD", source: "unknown", rawName };
}

function facts(over: Partial<PlanFacts> = {}): PlanFacts {
  return {
    accountId: ACC_ID,
    employer: "Northwind Traders",
    matchFormula: null,
    contributionRateBps: null,
    grossPayMinor: null,
    ...over,
  };
}

function addDays(iso: string, days: number): string {
  return new Date(new Date(iso + "T00:00:00Z").getTime() + days * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

/** `count` weekly dates from a fixed Friday. */
function weekly(count: number, start = "2025-01-03"): string[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i * 7));
}

function pairedEvents(dates: string[], deferralMinor: number, matchMinor: number): ContributionEvent[] {
  return dates.flatMap((d) => [
    ev(d, deferralMinor, "EMPLOYEE 401K DEFERRAL"),
    ev(d, matchMinor, "EMPLOYER MATCH"),
  ]);
}

function singleEvents(dates: string[], amountMinor: number): ContributionEvent[] {
  return dates.map((d) => ev(d, amountMinor, "EMPLOYEE 401K DEFERRAL"));
}

function blendedEvents(dates: string[], amountMinor: number): ContributionEvent[] {
  return dates.map((d) => ev(d, amountMinor, "TOTAL 401K CONTRIBUTION"));
}

/** Narrow a result to the match differential variant (or fail loudly). */
function asMatch(i: Insight | null): Extract<Insight, { kind: "match_differential" }> {
  expect(i).not.toBeNull();
  expect(i?.kind).toBe("match_differential");
  return i as Extract<Insight, { kind: "match_differential" }>;
}

describe("deriveMatch: honest absence (AC-1)", () => {
  it("returns null for a non employer account, even with events", () => {
    const brokerage = makeAccount({ id: "b1", type: "taxable_brokerage" });
    expect(deriveMatch(brokerage, [ev("2025-01-03", 50000, "X", "b1")], null, null)).toBeNull();
  });

  it("returns null for a 401k with no contribution events", () => {
    expect(deriveMatch(acct, [], facts(), tiered)).toBeNull();
  });
});

describe("deriveMatch: positive detection (AC-3)", () => {
  it("reads the modal ratio from itemized pairs and leads with match_detected", () => {
    // employer 30000 : employee 60000 = 5000 bps (50%).
    const m = asMatch(deriveMatch(acct, pairedEvents(weekly(14), 60000, 30000), facts(), tiered));
    expect(m.observation.pairing).toBe("paired");
    expect(m.observation.observedRatioBps).toBe(5000);
    expect(m.hypotheses[0].cause).toBe("match_detected");
    expect(m.questions).toContain("confirm_ratio_looks_like_match");
  });
});

describe("deriveMatch: unclaimed figure and its gating (AC-5, AC-12)", () => {
  it("emits a positive unclaimed figure from lib/insights/match.ts when below the cap", () => {
    const m = asMatch(
      deriveMatch(
        acct,
        pairedEvents(weekly(14), 60000, 30000),
        facts({ contributionRateBps: 300, grossPayMinor: GROSS }),
        tiered,
      ),
    );
    expect(m.unclaimed).not.toBeNull();
    // cap match at 5% = $4,000; current match at 3% = $3,000; unclaimed = $1,000.
    expect(m.unclaimed?.amountMinor).toBe(100_000);
    expect(m.unclaimed?.currentContributionBps).toBe(300);
    expect(m.unclaimed?.atCapContributionBps).toBe(500);
    expect(m.unclaimed?.formulaVerified).toBe(true);
    expect(m.unclaimed?.formulaNote).toBeNull();
  });

  it("withholds the figure when the top hypothesis does not support a match (AC-12)", () => {
    // Same formula and gross pay, but a blended stream: the engine is not sure a
    // match exists, so it must state no dollar figure (the mirror of section 7 #16).
    const m = asMatch(
      deriveMatch(
        acct,
        blendedEvents(weekly(14), 90000),
        facts({ contributionRateBps: 300, grossPayMinor: GROSS }),
        tiered,
      ),
    );
    expect(m.observation.pairing).toBe("blended");
    expect(m.hypotheses[0].cause).toBe("blended_unitemized");
    expect(m.unclaimed).toBeNull();
  });
});

describe("deriveMatch: unverified formula honesty (AC-6)", () => {
  it("computes the figure but carries the unverified flag and note", () => {
    if (northwind.verified) throw new Error("fixture: northwind should be verified:false");
    const m = asMatch(
      deriveMatch(
        acct,
        pairedEvents(weekly(14), 60000, 30000),
        facts({ contributionRateBps: 300, grossPayMinor: GROSS }),
        northwind,
      ),
    );
    expect(m.unclaimed).not.toBeNull();
    // Northwind PROVISIONAL formula 100% up to 5%: cap $5,000 - current $3,000 = $2,000.
    expect(m.unclaimed?.amountMinor).toBe(200_000);
    expect(m.unclaimed?.formulaVerified).toBe(false);
    expect(m.unclaimed?.formulaNote).toBe(northwind.note);
  });
});

describe("deriveMatch: never assert absence (AC-2)", () => {
  it("emits a ranked differential with a question, never a bare no match", () => {
    const m = asMatch(deriveMatch(acct, singleEvents(weekly(6), 50000), facts(), null));
    const causes = m.hypotheses.map((h) => h.cause);
    expect(causes).toContain("no_match_offered");
    expect(m.hypotheses[0].cause).not.toBe("no_match_offered");
    expect(m.hypotheses.length).toBeGreaterThan(1);
    expect(m.questions).toContain("confirm_whether_plan_matches");
  });
});

describe("deriveMatch: short and sparse window (AC-4)", () => {
  it("keeps annual_lump_sum in play and withholds dollars below 13 months", () => {
    const m = asMatch(deriveMatch(acct, singleEvents(weekly(8), 50000), facts(), null));
    expect(m.observation.windowSufficient).toBe(false);
    expect(m.hypotheses.map((h) => h.cause)).toContain("annual_lump_sum_timing");
    expect(m.questions).toContain("widen_window");
    expect(m.unclaimed).toBeNull();
  });

  it("treats a long but sparse history as insufficient too", () => {
    // Three deposits spanning 14 months: long span, too few periods to catch a cycle.
    const sparse = ["2025-01-06", "2025-07-07", "2026-03-09"];
    const m = asMatch(deriveMatch(acct, singleEvents(sparse, 50000), facts(), null));
    expect(m.observation.windowMonths).toBeGreaterThanOrEqual(13);
    expect(m.observation.windowSufficient).toBe(false);
    expect(m.hypotheses.map((h) => h.cause)).toContain("annual_lump_sum_timing");
    expect(m.questions).toContain("widen_window");
  });
});

describe("deriveMatch: ranking and demotion (AC-11)", () => {
  it("demotes annual_lump_sum below no_match once a clean sufficient window has passed", () => {
    const m = asMatch(deriveMatch(acct, singleEvents(weekly(60), 50000), facts(), null));
    expect(m.observation.windowSufficient).toBe(true);
    const annualRank = m.hypotheses.find((h) => h.cause === "annual_lump_sum_timing")!.rank;
    const noMatchRank = m.hypotheses.find((h) => h.cause === "no_match_offered")!.rank;
    expect(annualRank).toBeGreaterThan(noMatchRank);
    expect(m.hypotheses[0].cause).not.toBe("no_match_offered");
  });

  it("is deterministic: same input, same Insight", () => {
    const build = () =>
      deriveMatch(
        acct,
        pairedEvents(weekly(14), 60000, 30000),
        facts({ contributionRateBps: 300, grossPayMinor: GROSS }),
        tiered,
      );
    expect(build()).toEqual(build());
  });

  it("ranks are ascending from 1 and every hypothesis carries a signal", () => {
    const m = asMatch(deriveMatch(acct, singleEvents(weekly(6), 50000), facts(), null));
    m.hypotheses.forEach((h, i) => {
      expect(h.rank).toBe(i + 1);
      expect(typeof h.signal).toBe("string");
    });
  });
});

describe("deriveMatch: true-up correction (AC-7)", () => {
  it("flags a late outsized deposit and excludes it from the ratio", () => {
    const weeks = weekly(12);
    const events = pairedEvents(weeks, 60000, 30000);
    // A year-end true-up: 60 days after the last weekly, an outsized itemized match.
    const trueUpDate = addDays(weeks[weeks.length - 1], 60);
    events.push(
      ev(trueUpDate, 60000, "EMPLOYEE 401K DEFERRAL"),
      ev(trueUpDate, 300000, "EMPLOYER MATCH TRUE-UP"),
    );
    const m = asMatch(deriveMatch(acct, events, facts(), tiered));
    expect(m.hypotheses.map((h) => h.cause)).toContain("true_up_correction");
    // The weekly ratio (5000 bps) stands; the outsized true-up date is excluded.
    expect(m.observation.observedRatioBps).toBe(5000);
  });
});

describe("deriveMatch: blended unitemized (AC-8)", () => {
  it("cannot split the line, so no ratio and a recognize_formula question", () => {
    const m = asMatch(deriveMatch(acct, blendedEvents(weekly(10), 90000), facts(), null));
    expect(m.observation.pairing).toBe("blended");
    expect(m.observation.observedRatioBps).toBeNull();
    expect(m.questions).toContain("recognize_formula");
  });
});

describe("deriveMatch: combined uncertainty (AC-13)", () => {
  it("carries every live question at once", () => {
    // Blended pairing (needs recognition) AND no gross pay (needs the number).
    const m = asMatch(deriveMatch(acct, blendedEvents(weekly(6), 90000), facts(), null));
    expect(m.questions).toContain("recognize_formula");
    expect(m.questions).toContain("provide_gross_pay");
    expect(m.questions.length).toBeGreaterThan(1);
  });
});

describe("deriveInsights: wiring (AC-10)", () => {
  it("adds a match_differential for a 401k with events, leaving other insights unchanged", () => {
    const brokerage = makeAccount({ id: "b1", type: "taxable_brokerage", capabilities: ["holdings"] });
    const holding = makeHolding(100_000, "equity", { accountId: "b1" });
    const out = deriveInsights({
      accounts: [acct, brokerage],
      holdings: [holding],
      contributionEvents: pairedEvents(weekly(14), 60000, 30000),
      planFacts: [facts({ contributionRateBps: 300, grossPayMinor: GROSS })],
      matchFormulas: { [ACC_ID]: tiered },
    });
    const kinds = out.map((i) => i.kind);
    expect(kinds).toContain("match_differential");
    expect(kinds).toContain("composition");
    const match = out.find((i) => i.kind === "match_differential");
    expect(match?.accountId).toBe(ACC_ID);
  });

  it("produces no match insight when no contribution events are passed (existing behavior)", () => {
    const brokerage = makeAccount({ id: "b1", type: "taxable_brokerage", capabilities: ["holdings"] });
    const holding = makeHolding(100_000, "equity", { accountId: "b1" });
    const out = deriveInsights({
      accounts: [acct, brokerage],
      holdings: [holding],
      contributionEvents: [],
      planFacts: [],
    });
    expect(out.some((i) => i.kind === "match_differential")).toBe(false);
    expect(out.some((i) => i.kind === "composition")).toBe(true);
  });

  it("emits the differential without dollars when no formula is resolved", () => {
    const out = deriveInsights({
      accounts: [acct],
      holdings: [],
      contributionEvents: pairedEvents(weekly(14), 60000, 30000),
      planFacts: [facts({ contributionRateBps: 300, grossPayMinor: GROSS })],
      // no matchFormulas
    });
    const match = out.find((i) => i.kind === "match_differential");
    expect(match).toBeDefined();
    const m = asMatch(match ?? null);
    expect(m.unclaimed).toBeNull();
    expect(m.questions).toContain("recognize_formula");
  });
});

describe("deriveMatch: an ambiguous single line is never a fabricated pair (AC-3, AC-12, foundation section 7 #16 mirror)", () => {
  it("classifies a lone line matching both hints as blended, not a 100% paired match", () => {
    // "EMPLOYEE MATCH" contains both a deferral hint and a match hint, but it is ONE
    // line, not a pair. It must not read as paired with a fabricated ratio, and must
    // not produce a dollar figure even with a formula and gross pay present.
    const m = asMatch(
      deriveMatch(
        acct,
        weekly(6).map((d) => ev(d, 100000, "EMPLOYEE MATCH")),
        facts({ contributionRateBps: 300, grossPayMinor: GROSS }),
        tiered,
      ),
    );
    expect(m.observation.pairing).toBe("blended");
    expect(m.observation.observedRatioBps).toBeNull();
    expect(m.hypotheses[0].cause).toBe("blended_unitemized");
    expect(m.unclaimed).toBeNull();
  });
});

describe("deriveMatch: below_match_threshold, the real finding (AC-5, AC-11, AC-12)", () => {
  it("appears as a secondary cause when a paired match is below the cap", () => {
    const m = asMatch(
      deriveMatch(
        acct,
        pairedEvents(weekly(14), 60000, 30000),
        facts({ contributionRateBps: 300, grossPayMinor: GROSS }),
        tiered,
      ),
    );
    const below = m.hypotheses.find((h) => h.cause === "below_match_threshold");
    expect(below).toBeDefined();
    expect(below?.signal).toBe("contribution_below_cap");
    expect(m.hypotheses[0].cause).toBe("match_detected"); // detection still leads
  });

  it("leads and quantifies for an unpaired stream once a clean window is sufficient", () => {
    // The F8 path: the user recognised their formula (tiered) and stated a 3% rate,
    // below the 5% cap, over a long clean history. The shortfall is real and stated.
    const m = asMatch(
      deriveMatch(
        acct,
        singleEvents(weekly(60), 50000),
        facts({ contributionRateBps: 300, grossPayMinor: GROSS }),
        tiered,
      ),
    );
    expect(m.observation.windowSufficient).toBe(true);
    expect(m.hypotheses[0].cause).toBe("below_match_threshold");
    expect(m.unclaimed).not.toBeNull();
    expect(m.unclaimed?.amountMinor).toBe(100_000);
  });

  it("leads but withholds dollars for an unpaired stream while the window is short", () => {
    // Same recognised formula and rate, but too little history to exclude an annual
    // lump sum, so no dollar figure is asserted (the window clause of the gating rule).
    const m = asMatch(
      deriveMatch(
        acct,
        singleEvents(weekly(8), 50000),
        facts({ contributionRateBps: 300, grossPayMinor: GROSS }),
        tiered,
      ),
    );
    expect(m.observation.windowSufficient).toBe(false);
    expect(m.hypotheses[0].cause).toBe("below_match_threshold");
    expect(m.unclaimed).toBeNull();
    expect(m.questions).toContain("widen_window");
  });
});

describe("deriveMatch: purity boundary (AC-9)", () => {
  it("imports nothing outside the pure engine, and is synchronous", () => {
    const src = readFileSync(
      path.join(process.cwd(), "lib/insights/match-differential.ts"),
      "utf8",
    );
    const sources = [...src.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
    const allowed = new Set(["@/lib/types", "@/lib/plans", "./match"]);
    for (const s of sources) expect(allowed.has(s)).toBe(true);
    // No database, aggregator, or LLM import; nothing async; no classification written back.
    expect(src).not.toMatch(/@\/lib\/(db|aggregator|llm)/);
    expect(src).not.toMatch(/\basync\b/);
    expect(src).not.toMatch(/\bawait\b/);
    expect(src).not.toMatch(/\bfetch\(/);
    expect(src).not.toMatch(/\.source\s*=/);
  });
});
