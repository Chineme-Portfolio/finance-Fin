import { describe, it, expect } from "vitest";
import { deriveCashDrag } from "./cash-drag";
import { makeAccount, makeHolding } from "./_test-helpers";

describe("deriveCashDrag (spec 0002)", () => {
  it("reports cash amount and share for cash-equivalent holdings [AC-6, AC-7]", () => {
    const insight = deriveCashDrag(makeAccount(), [
      makeHolding(2500_00, "cash", { isCashEquivalent: true }),
      makeHolding(7500_00, "equity"),
    ]);
    expect(insight?.kind).toBe("cash_drag");
    if (insight?.kind !== "cash_drag") throw new Error("unreachable");
    expect(insight.cashMinor).toBe(2500_00);
    expect(insight.cashShareBps).toBe(2500); // 25.00%
    expect(insight.accountTotalMinor).toBe(10000_00);
  });

  it("uses sum(holdings), never Account.balanceMinor [invariant 8]", () => {
    const insight = deriveCashDrag(makeAccount(), [
      makeHolding(50_00, "cash", { isCashEquivalent: true }),
      makeHolding(50_00, "equity"),
    ]);
    if (insight?.kind !== "cash_drag") throw new Error("expected cash_drag");
    expect(insight.accountTotalMinor).toBe(100_00);
    expect(insight.accountTotalMinor).not.toBe(999_999_99);
  });

  it("share is an integer basis point value [AC-1]", () => {
    const insight = deriveCashDrag(makeAccount(), [
      makeHolding(1, "cash", { isCashEquivalent: true }),
      makeHolding(3, "equity"),
    ]);
    if (insight?.kind !== "cash_drag") throw new Error("expected cash_drag");
    expect(Number.isInteger(insight.cashShareBps)).toBe(true);
  });

  it("returns null (not a zero insight) when there is no cash [AC-6, AC-8]", () => {
    expect(
      deriveCashDrag(makeAccount(), [makeHolding(1000_00, "equity")]),
    ).toBeNull();
  });

  it("returns null for an empty account, no divide-by-zero [AC-8]", () => {
    expect(deriveCashDrag(makeAccount(), [])).toBeNull();
    expect(
      deriveCashDrag(makeAccount(), [makeHolding(0, "cash", { isCashEquivalent: true })]),
    ).toBeNull();
  });
});
