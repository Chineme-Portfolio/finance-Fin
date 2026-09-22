import { describe, it, expect } from "vitest";
import {
  computeEmployerMatchMinor,
  maxEmployerMatchMinor,
  unclaimedMatchMinor,
} from "./match";
import type { MatchFormula } from "@/lib/plans";

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
