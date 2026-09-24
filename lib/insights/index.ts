import type { EngineInput, Insight } from "@/lib/types";
import { deriveComposition } from "./composition";
import { deriveCashDrag } from "./cash-drag";
import { deriveMatch } from "./match-differential";

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
 * `contributionEvents`, `planFacts`, and `matchFormulas` feed the employer match
 * differential (spec 0008, foundation.md section 7 #16).
 */
export function deriveInsights(input: EngineInput): Insight[] {
  const holdingsByAccount = new Map<string, typeof input.holdings>();
  for (const holding of input.holdings) {
    const list = holdingsByAccount.get(holding.accountId) ?? [];
    list.push(holding);
    holdingsByAccount.set(holding.accountId, list);
  }

  // Group the match differential's inputs by account, so each account is reasoned
  // over with only its own deposits and plan facts.
  const eventsByAccount = new Map<string, typeof input.contributionEvents>();
  for (const event of input.contributionEvents) {
    const list = eventsByAccount.get(event.accountId) ?? [];
    list.push(event);
    eventsByAccount.set(event.accountId, list);
  }
  const planFactsByAccount = new Map<string, (typeof input.planFacts)[number]>();
  for (const facts of input.planFacts) planFactsByAccount.set(facts.accountId, facts);

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

    // The match differential runs on the employer account's transactions (spec
    // 0008). deriveMatch returns null for a non employer account or one with no
    // contribution events, so calling it for every account is safe.
    const match = deriveMatch(
      account,
      eventsByAccount.get(account.id) ?? [],
      planFactsByAccount.get(account.id) ?? null,
      input.matchFormulas?.[account.id] ?? null,
    );
    if (match) insights.push(match);
  }
  return insights;
}

export { deriveComposition } from "./composition";
export { deriveCashDrag } from "./cash-drag";
export { deriveMatch } from "./match-differential";
export {
  computeEmployerMatchMinor,
  maxEmployerMatchMinor,
  unclaimedMatchMinor,
  observedPeriodsPerYear,
  contributionCostPerPeriodMinor,
  takeHomeCostPerPeriodMinor,
  DEFAULT_MARGINAL_RATE_BPS,
} from "./match";
