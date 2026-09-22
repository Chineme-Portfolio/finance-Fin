import { describe, it, expect } from "vitest";
import { MATCH_FORMULA_CATALOG, getCatalogEntry, maxMatchContributionBps } from "./index";
import type { CatalogEntry, MatchFormula } from "./index";

describe("plan formula catalog (spec 0007)", () => {
  it("seeds the FedEx plan as an unverified entry with a disclosure note", () => {
    const fedex = getCatalogEntry("fedex-retirement-savings-plan-ii");
    expect(fedex).toBeDefined();
    expect(fedex!.employer).toBe("FedEx Corporation");
    expect(fedex!.verified).toBe(false);
    // A verified:false entry carries a note (the union guarantees it at compile
    // time; this asserts the seeded note is actually present and non empty).
    if (fedex!.verified === false) {
      expect(fedex!.note.length).toBeGreaterThan(0);
    }
  });

  it("seeds the two generic shapes, verified, with no employer", () => {
    const generic = MATCH_FORMULA_CATALOG.filter((e) => e.employer === null);
    expect(generic).toHaveLength(2);
    expect(generic.every((e) => e.verified === true)).toBe(true);
  });

  it("the type makes an unverified entry without a note unrepresentable", () => {
    // @ts-expect-error verified:false requires a note; omitting it must not compile.
    const bad: CatalogEntry = {
      id: "x",
      label: "x",
      employer: null,
      formula: { tiers: [{ matchRateBps: 10000, uptoContributionBps: 300 }] },
      verified: false,
    };
    expect(bad).toBeDefined();
  });
});

describe("maxMatchContributionBps (lookup, spec 0007)", () => {
  it("returns the last tier's ceiling", () => {
    const tiered: MatchFormula = {
      tiers: [
        { matchRateBps: 10000, uptoContributionBps: 300 },
        { matchRateBps: 5000, uptoContributionBps: 500 },
      ],
    };
    expect(maxMatchContributionBps(tiered)).toBe(500);
    const flat: MatchFormula = { tiers: [{ matchRateBps: 5000, uptoContributionBps: 600 }] };
    expect(maxMatchContributionBps(flat)).toBe(600);
  });
});
