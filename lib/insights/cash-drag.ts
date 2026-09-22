import type { Account, Holding, Insight } from "@/lib/types";
import { positiveHoldings, holdingsTotalMinor } from "./shared";

/**
 * "How much of my money is sitting uninvested": the value held in cash or cash
 * equivalent holdings, as an amount and a share of the holdings total.
 *
 * Pure. States the amount as fact and makes NO judgement about whether it is
 * good or bad (foundation.md section 7 #2, education not advice).
 *
 * It counts cash that appears as a HOLDING. Sweep cash that a provider reports
 * only in the account balance is a known limitation (spec 0002 AC-6, Follow-up):
 * attributing the balance to cash would be a claim the data does not support
 * (foundation.md section 4 #3, section 7 #16), so it is not folded in.
 */
export function deriveCashDrag(
  account: Account,
  holdings: Holding[],
): Insight | null {
  const positive = positiveHoldings(holdings);
  const accountTotalMinor = holdingsTotalMinor(positive);
  if (accountTotalMinor <= 0) return null;

  const cashMinor = positive
    .filter((h) => h.security.isCashEquivalent)
    .reduce((sum, h) => sum + h.valueMinor, 0);

  // No cash to report -> no insight, never a zero-cash insight (spec 0002 AC-6, AC-8).
  if (cashMinor <= 0) return null;

  return {
    kind: "cash_drag",
    accountId: account.id,
    accountTotalMinor,
    cashMinor,
    cashShareBps: Math.round((cashMinor * 10000) / accountTotalMinor),
  };
}
