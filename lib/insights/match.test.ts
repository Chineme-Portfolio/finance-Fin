import { describe, it, expect } from "vitest";
import {
  computeEmployerMatchMinor,
  maxEmployerMatchMinor,
  unclaimedMatchMinor,
  observedPeriodsPerYear,
  contributionCostPerPeriodMinor,
  takeHomeCostPerPeriodMinor,
} from "./match";
import type { MatchFormula } from "@/lib/plans";
import type { ContributionEvent } from "@/lib/types";

const GROSS = 10_000_000; // $100,000

const tiered: MatchFormula = {
  tiers: [
    { matchRateBps: 10000, uptoContributionBps: 300 }, // 100% up to 3%
    { matchRateBps: 5000, uptoContributionBps: 500 }, // then 50% up to 5%
  ],
};
const simple: MatchFormula = { tiers: [{ matchRateBps: 10000, uptoContributionBps: 400 }] }; // 100% up to 4%
const flat: MatchFormula = { tiers: [{ matchRateBps: 5000, uptoContributionBps: 600 }] }; // 50% up to 6%

describe("computeEmployerMatchMinor (spec 0007, tiered worked example)", () => {
  it("matches each tier's band; caps past the last tier", () => {
    expect(computeEmployerMatchMinor(tiered, 300, GROSS)).toBe(300_000); // $3,000 at 3%
    expect(computeEmployerMatchMinor(tiered, 500, GROSS)).toBe(400_000); // $4,000 at 5%
    expect(computeEmployerMatchMinor(tiered, 1000, GROSS)).toBe(400_000); // still $4,000 at 10% (capped)
  });

  it("computes the simple and flat cap shapes correctly", () => {
    expect(computeEmployerMatchMinor(simple, 400, GROSS)).toBe(400_000); // 100% of 4%
    expect(computeEmployerMatchMinor(simple, 200, GROSS)).toBe(200_000); // 100% of 2%
    expect(computeEmployerMatchMinor(simple, 1000, GROSS)).toBe(400_000); // capped at 4%
    expect(computeEmployerMatchMinor(flat, 600, GROSS)).toBe(300_000); // 50% of 6%
    expect(computeEmployerMatchMinor(flat, 300, GROSS)).toBe(150_000); // 50% of 3%
  });

  it("returns an exact integer minor unit for a fractional-cent result", () => {
    // gross 10,001 minor at 3% and 100% match = 300.03 cents, rounds to 300.
    const m = computeEmployerMatchMinor(simple, 300, 10_001);
    expect(m).toBe(300);
    expect(Number.isInteger(m)).toBe(true);
  });

  it("handles degenerate inputs without crashing or floating", () => {
    expect(computeEmployerMatchMinor(simple, 0, GROSS)).toBe(0); // zero contribution
    expect(computeEmployerMatchMinor(simple, 400, 0)).toBe(0); // zero pay
    const single: MatchFormula = { tiers: [{ matchRateBps: 10000, uptoContributionBps: 300 }] };
    expect(computeEmployerMatchMinor(single, 300, GROSS)).toBe(300_000);
  });
});

describe("maxEmployerMatchMinor + unclaimedMatchMinor (spec 0007)", () => {
  it("max match is the match at the cap", () => {
    expect(maxEmployerMatchMinor(tiered, GROSS)).toBe(400_000);
    expect(maxEmployerMatchMinor(simple, GROSS)).toBe(400_000);
  });

  it("unclaimed is max minus current, clamped to zero", () => {
    expect(unclaimedMatchMinor(tiered, 300, GROSS)).toBe(100_000); // $1,000 left on the table at 3%
    expect(unclaimedMatchMinor(tiered, 500, GROSS)).toBe(0); // fully captured at 5%
    expect(unclaimedMatchMinor(tiered, 1000, GROSS)).toBe(0); // above cap, never negative
  });
});

describe("the F8 walk figures (spec 0009)", () => {
  const ev = (date: string): ContributionEvent => ({
    accountId: "a1",
    date,
    amountMinor: 60000,
    currency: "USD",
    source: "unknown",
    rawName: "EMPLOYEE 401K DEFERRAL",
  });
  const dates = (count: number, stepDays: number, start = "2025-01-03"): ContributionEvent[] =>
    Array.from({ length: count }, (_, i) =>
      ev(new Date(new Date(start + "T00:00:00Z").getTime() + i * stepDays * 86_400_000).toISOString().slice(0, 10)),
    );

  it("infers pay frequency from the modal gap between deposit dates", () => {
    expect(observedPeriodsPerYear(dates(10, 7))).toBe(52); // weekly -> ~52
    expect(observedPeriodsPerYear(dates(10, 14))).toBe(26); // biweekly -> ~26
    expect(observedPeriodsPerYear(dates(6, 30))).toBe(12); // ~monthly -> ~12
  });

  it("returns null when there is not enough history to measure a cadence", () => {
    expect(observedPeriodsPerYear([])).toBeNull();
    expect(observedPeriodsPerYear([ev("2025-01-03")])).toBeNull();
    expect(observedPeriodsPerYear([ev("2025-01-03"), ev("2025-01-03")])).toBeNull(); // same date
  });

  it("computes the before-tax per-paycheck cost of a rate increase", () => {
    // 3% -> 5% on $100,000, weekly: 2% of 100k = $2,000/yr / 52 = ~$38.46.
    expect(contributionCostPerPeriodMinor(300, 500, GROSS, 52)).toBe(3846);
    // A target at or below the current rate is not a cost.
    expect(contributionCostPerPeriodMinor(500, 300, GROSS, 52)).toBe(0);
    expect(contributionCostPerPeriodMinor(300, 300, GROSS, 52)).toBe(0);
    // No confirmed frequency -> 0 (the caller gates display on a real frequency).
    expect(contributionCostPerPeriodMinor(300, 500, GROSS, 0)).toBe(0);
  });

  it("reduces the take-home cost by the assumed marginal rate (a labelled illustration)", () => {
    // before-tax 3846, default 22% -> 3846 * 0.78 = ~3000.
    expect(takeHomeCostPerPeriodMinor(300, 500, GROSS, 52)).toBe(3000);
    // An explicit marginal rate is honoured; 0% means take-home equals before-tax.
    expect(takeHomeCostPerPeriodMinor(300, 500, GROSS, 52, 0)).toBe(3846);
  });
});
