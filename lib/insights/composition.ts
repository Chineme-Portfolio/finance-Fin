import type { Account, Holding, Insight, CompositionGroup } from "@/lib/types";
import { positiveHoldings, holdingsTotalMinor } from "./shared";

/**
 * "What do I own": group an investment account's holdings by security type.
 *
 * Pure. Every number here is computed from the holdings passed in; nothing
 * comes from anywhere else (foundation.md section 4 #1, section 7 #7).
 *
 * The account total is the SUM OF HOLDING VALUES, never the provider balance.
 * Real data shows the two diverge (a provider balance can include sweep cash or
 * unpriced items no holding accounts for), so summing the parts is the only way
 * the shares can add to 10000 basis points by construction (spec 0002 invariant 8).
 */
export function deriveComposition(
  account: Account,
  holdings: Holding[],
): Insight | null {
  // Only positive-value holdings count toward composition. A short or written
  // down position (value <= 0) is excluded and counted, never folded in, so it
  // cannot make a share negative or distort another group (spec 0002 invariant 9).
  const positive = positiveHoldings(holdings);
  const excludedCount = holdings.length - positive.length;

  // No holdings to compose (all excluded, or none to begin with) -> no insight,
  // never a fabricated one (spec 0002 AC-8).
  if (positive.length === 0) return null;

  const accountTotalMinor = holdingsTotalMinor(positive);
  // A zero-or-less total would make a basis point share undefined. No insight,
  // no divide by zero (spec 0002 AC-8, invariant 8).
  if (accountTotalMinor <= 0) return null;

  // Sum values per security type.
  const valueByType = new Map<string, number>();
  for (const h of positive) {
    const key = h.security.securityType;
    valueByType.set(key, (valueByType.get(key) ?? 0) + h.valueMinor);
  }

  // Compute integer basis point shares. Integer division loses a few basis
  // points; the remainder is handed to the largest group so the shares sum to
  // exactly 10000, ties broken alphabetically for determinism (spec 0002 invariant 4).
  const groups: CompositionGroup[] = [...valueByType.entries()].map(
    ([securityType, valueMinor]) => ({
      securityType: securityType as CompositionGroup["securityType"],
      valueMinor,
      shareBps: Math.floor((valueMinor * 10000) / accountTotalMinor),
    }),
  );

  const assigned = groups.reduce((sum, g) => sum + g.shareBps, 0);
  const remainder = 10000 - assigned;
  if (remainder !== 0 && groups.length > 0) {
    // Largest group by value absorbs the remainder; ties by security type name.
    let target = groups[0];
    for (const g of groups) {
      if (
        g.valueMinor > target.valueMinor ||
        (g.valueMinor === target.valueMinor &&
          g.securityType < target.securityType)
      ) {
        target = g;
      }
    }
    target.shareBps += remainder;
  }

  // Stable order for a deterministic result: largest share first, then by name.
  groups.sort(
    (a, b) => b.shareBps - a.shareBps || a.securityType.localeCompare(b.securityType),
  );

  return {
    kind: "composition",
    accountId: account.id,
    accountTotalMinor,
    groups,
    excludedCount,
  };
}
