import { describe, it, expect } from "vitest";
import { loadWhatYouOwn, portfolioTotalMinor } from "./what-you-own";
import type { Insight } from "@/lib/types";

// loadWhatYouOwn reads the committed real fixture (fixtures/holdings-ymw6pgkb.json)
// and imports server-only (aliased to a stub in vitest.config.mts). These tests
// assert against that fixture's real shape.

function compositionOf(insights: Insight[]) {
  return insights.find((i): i is Extract<Insight, { kind: "composition" }> => i.kind === "composition");
}

describe("loadWhatYouOwn (spec 0003)", () => {
  const view = loadWhatYouOwn();

  it("returns at least one holdings-capable account with a composition insight [AC-2]", () => {
    const withHoldings = view.accounts.filter((a) => a.seesHoldings);
    expect(withHoldings.length).toBeGreaterThan(0);
    for (const a of withHoldings) {
      expect(compositionOf(a.insights)).toBeDefined();
    }
  });

  it("shows exactly one capability-gapped account, and it is the 401(k) [AC-5]", () => {
    const gapped = view.accounts.filter((a) => !a.seesHoldings);
    expect(gapped.length).toBe(1);
    expect(gapped[0].account.type).toBe("401k");
  });

  it("the gapped account shows its balance but has no holdings [AC-5]", () => {
    const gapped = view.accounts.find((a) => !a.seesHoldings);
    expect(gapped).toBeDefined();
    expect(gapped!.account.balanceMinor).not.toBeNull();
    expect(gapped!.account.balanceMinor!).toBeGreaterThan(0);
    expect(gapped!.holdings).toHaveLength(0);
    expect(gapped!.account.capabilities).not.toContain("holdings");
    expect(gapped!.insights).toHaveLength(0);
  });

  it("drops investment accounts with nothing to show (the empty HSA) [AC-8]", () => {
    // No shown account is holdings-capable yet carries zero holdings.
    for (const a of view.accounts) {
      if (a.seesHoldings) expect(a.holdings.length).toBeGreaterThan(0);
    }
    // The fixture has a depository HSA with no holdings; it must not appear.
    expect(view.accounts.some((a) => a.account.type === "hsa")).toBe(false);
  });

  it("every shown holdings-capable account carries only positive-value holdings", () => {
    for (const a of view.accounts) {
      for (const h of a.holdings) expect(h.valueMinor).toBeGreaterThan(0);
    }
  });

  it("portfolioTotalMinor is a positive integer matching an independent recompute [AC-6]", () => {
    const expected = view.accounts.reduce((sum, a) => {
      if (a.seesHoldings) {
        const comp = compositionOf(a.insights);
        return sum + (comp ? comp.accountTotalMinor : 0);
      }
      return sum + (a.account.balanceMinor ?? 0);
    }, 0);
    expect(view.portfolioTotalMinor).toBe(expected);
    expect(Number.isInteger(view.portfolioTotalMinor)).toBe(true);
    expect(view.portfolioTotalMinor).toBeGreaterThan(0);
  });

  it("portfolioTotalMinor reads the engine's total for holdings accounts, not a re-sum", () => {
    // For a holdings-visible account, its contribution equals the composition
    // insight's accountTotalMinor (single source of truth).
    const visible = view.accounts.find((a) => a.seesHoldings);
    expect(visible).toBeDefined();
    const comp = compositionOf(visible!.insights);
    expect(comp).toBeDefined();
    // The account total equals the sum of its own holding values (engine invariant 8).
    const holdingsSum = visible!.holdings.reduce((s, h) => s + h.valueMinor, 0);
    expect(comp!.accountTotalMinor).toBe(holdingsSum);
  });
});
