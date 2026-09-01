import type { EngineInput, Insight } from "@/lib/types";
import { deriveComposition } from "./composition";
import { deriveCashDrag } from "./cash-drag";

/**
 * The deterministic insight engine. The keystone (foundation.md section 9,
 * architecture.md section 6).
 *
 * PURE and SYNCHRONOUS. It imports only domain types and its own insight
 * functions. It never touches the database, the aggregator, a network, or a
 * language model, and nothing async. That purity is the whole point: it makes
 * the product's most correctness sensitive code unit testable with plain
 * fixtures, no infrastructure (spec 0002 AC-4).
 *
 * It computes every number it returns. No figure here originated anywhere but
 * its own arithmetic over the inputs (foundation.md section 4 #1, section 7 #7).
 *
 * `contributionEvents` and `planFacts` are part of the input contract for the
 * deferred employer match differential (foundation.md section 7 #16, gated on
 * spec 0001 task 9). This slice does not consume them.
 */
export function deriveInsights(input: EngineInput): Insight[] {
  const holdingsByAccount = new Map<string, typeof input.holdings>();
  for (const holding of input.holdings) {
    const list = holdingsByAccount.get(holding.accountId) ?? [];
    list.push(holding);
    holdingsByAccount.set(holding.accountId, list);
  }

  const insights: Insight[] = [];
  for (const account of input.accounts) {
    const accountHoldings = holdingsByAccount.get(account.id) ?? [];
    // Insight production is driven by HOLDINGS, not by account.type. This is
    // deliberate and slightly stronger than spec 0002 AC-8's wording ("a non
    // investment account produces no insight"): an account with no holdings
    // yields nothing regardless of type, and a real holdings-bearing account is
    // never suppressed just because its type mapped to "other".
    // Each derive function returns null when it has nothing honest to say
    // (no holdings, no cash, an undefined total). Absence is a first class
    // outcome, never a fabricated insight (foundation.md section 4 #7).
    const composition = deriveComposition(account, accountHoldings);
    if (composition) insights.push(composition);
    const cashDrag = deriveCashDrag(account, accountHoldings);
    if (cashDrag) insights.push(cashDrag);
  }
  return insights;
}

export { deriveComposition } from "./composition";
export { deriveCashDrag } from "./cash-drag";
