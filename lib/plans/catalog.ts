import type { CatalogEntry } from "./types";

/**
 * The seeded plan formula catalog (spec 0007, foundation.md section 7 #12).
 *
 * Static data only. It powers the recognition step (tier 2): show the user a few
 * common shapes and their own employer's plan, and let them recognise theirs.
 *
 * HONESTY: the Northwind entry's formula is PROVISIONAL. It has not been confirmed
 * against the plan document, and the real 401k data has not been observed
 * (spec 0001 task 9 is deferred). It is `verified: false` with a note. A caller
 * must surface an unverified formula as a question, never assert it as fact
 * (foundation.md section 7 #13, section 7 #16); this catalog's duty is to carry
 * the flag and note, never to hide them. The generic shapes are not claims about
 * any real plan; they are exactly the shapes they are labelled (`verified: true`).
 */
export const MATCH_FORMULA_CATALOG: readonly CatalogEntry[] = [
  {
    id: "northwind-retirement-savings-plan",
    label: "Northwind Retirement Savings Plan",
    employer: "Northwind Traders",
    // PROVISIONAL, not confirmed. A plausible common shape stands in until the
    // real formula is recognised by the user or read from paired deposits.
    formula: { tiers: [{ matchRateBps: 10000, uptoContributionBps: 500 }] },
    verified: false,
    note: "Provisional shape, not confirmed against the Northwind plan document. Must be surfaced to the user as a question to recognise or correct, never presented as fact (foundation section 7 #12, #13, #16). Update to verified once the real formula is known.",
  },
  {
    id: "generic-full-match-to-cap",
    label: "100% up to 4% of pay",
    employer: null,
    // Dollar for dollar up to a cap: one tier.
    formula: { tiers: [{ matchRateBps: 10000, uptoContributionBps: 400 }] },
    verified: true,
  },
  {
    id: "generic-tiered-safe-harbor",
    label: "100% up to 3%, then 50% up to 5%",
    employer: null,
    // The classic enhanced safe harbor: 4% max match on a 5% contribution.
    formula: {
      tiers: [
        { matchRateBps: 10000, uptoContributionBps: 300 },
        { matchRateBps: 5000, uptoContributionBps: 500 },
      ],
    },
    verified: true,
  },
];

/** Look up a catalog entry by id, or undefined if none. A pure lookup. */
export function getCatalogEntry(id: string): CatalogEntry | undefined {
  return MATCH_FORMULA_CATALOG.find((e) => e.id === id);
}
