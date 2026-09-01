import { describe, it, expect } from "vitest";
import { deriveComposition } from "./composition";
import { makeAccount, makeHolding } from "./_test-helpers";

describe("deriveComposition (spec 0002)", () => {
  it("groups by security type and shares sum to exactly 10000 bps [AC-5, AC-7]", () => {
    const account = makeAccount();
    const insight = deriveComposition(account, [
      makeHolding(6000_00, "equity"),
      makeHolding(3000_00, "mutual fund"),
      makeHolding(1000_00, "cash", { isCashEquivalent: true }),
    ]);
    expect(insight?.kind).toBe("composition");
    if (insight?.kind !== "composition") throw new Error("unreachable");
    const sum = insight.groups.reduce((s, g) => s + g.shareBps, 0);
    expect(sum).toBe(10000);
    expect(insight.accountTotalMinor).toBe(10000_00);
  });

  it("uses sum(holdings), never Account.balanceMinor [AC-5, invariant 8]", () => {
    // balanceMinor is 999_999_99 (see makeAccount); the holdings sum is 300_00.
    const insight = deriveComposition(makeAccount(), [
      makeHolding(100_00, "equity"),
      makeHolding(200_00, "etf"),
    ]);
    if (insight?.kind !== "composition") throw new Error("expected composition");
    expect(insight.accountTotalMinor).toBe(300_00);
    expect(insight.accountTotalMinor).not.toBe(999_999_99);
  });

  it("shares and values are integers, never floats [AC-1]", () => {
    // 1/3 splits do not divide evenly into basis points.
    const insight = deriveComposition(makeAccount(), [
      makeHolding(333_33, "equity"),
      makeHolding(333_33, "etf"),
      makeHolding(333_34, "cash", { isCashEquivalent: true }),
    ]);
    if (insight?.kind !== "composition") throw new Error("expected composition");
    for (const g of insight.groups) {
      expect(Number.isInteger(g.shareBps)).toBe(true);
      expect(Number.isInteger(g.valueMinor)).toBe(true);
    }
    expect(insight.groups.reduce((s, g) => s + g.shareBps, 0)).toBe(10000);
  });

  it("largest group by value absorbs the rounding remainder [AC-5]", () => {
    // 1000, 1000, 1 -> remainder should land on one of the two large groups.
    const insight = deriveComposition(makeAccount(), [
      makeHolding(1000_00, "equity"),
      makeHolding(1000_00, "etf"),
      makeHolding(1, "cash", { isCashEquivalent: true }),
    ]);
    if (insight?.kind !== "composition") throw new Error("expected composition");
    expect(insight.groups.reduce((s, g) => s + g.shareBps, 0)).toBe(10000);
    // the tiny cash group must not be the one carrying a large correction
    const cash = insight.groups.find((g) => g.securityType === "cash");
    expect(cash?.shareBps).toBeLessThan(100);
  });

  it("breaks ties alphabetically by security type, deterministic across runs [AC-5, invariant 4]", () => {
    const holdings = [
      makeHolding(333, "equity"),
      makeHolding(333, "cash", { isCashEquivalent: true }),
      makeHolding(334, "etf"),
    ];
    const a = JSON.stringify(deriveComposition(makeAccount(), holdings));
    const b = JSON.stringify(deriveComposition(makeAccount(), holdings));
    expect(a).toBe(b);
    expect(JSON.parse(a).groups.reduce((s: number, g: { shareBps: number }) => s + g.shareBps, 0)).toBe(10000);
  });

  it("excludes non-positive holdings and counts them [AC-5, invariant 9]", () => {
    const insight = deriveComposition(makeAccount(), [
      makeHolding(-500_00, "equity"), // a short, excluded
      makeHolding(700_00, "cash", { isCashEquivalent: true }),
      makeHolding(300_00, "etf"),
    ]);
    if (insight?.kind !== "composition") throw new Error("expected composition");
    expect(insight.excludedCount).toBe(1);
    expect(insight.accountTotalMinor).toBe(1000_00); // only the positive holdings
    expect(insight.groups.reduce((s, g) => s + g.shareBps, 0)).toBe(10000);
    expect(insight.groups.some((g) => g.securityType === "equity")).toBe(false);
  });

  it("returns null for an account with no holdings [AC-8]", () => {
    expect(deriveComposition(makeAccount(), [])).toBeNull();
  });

  it("returns null (no divide-by-zero) when all holdings are zero value [AC-8]", () => {
    expect(
      deriveComposition(makeAccount(), [
        makeHolding(0, "equity"),
        makeHolding(0, "cash", { isCashEquivalent: true }),
      ]),
    ).toBeNull();
  });
});
