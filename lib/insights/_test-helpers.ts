import type { Account, Holding, SecurityType } from "@/lib/types";

/** Small hand-built domain fixtures, so each test states exactly its inputs. */
export function makeAccount(over: Partial<Account> = {}): Account {
  return {
    id: "acc-1",
    name: "Test account",
    type: "taxable_brokerage",
    subtype: null,
    linked: true,
    capabilities: ["holdings"],
    balanceMinor: 999_999_99, // deliberately unrelated to holdings, to prove invariant 8
    currency: "USD",
    ...over,
  };
}

export function makeHolding(
  valueMinor: number,
  securityType: SecurityType,
  opts: { isCashEquivalent?: boolean; accountId?: string } = {},
): Holding {
  return {
    accountId: opts.accountId ?? "acc-1",
    security: {
      securityId: `sec-${securityType}-${valueMinor}`,
      name: `${securityType} holding`,
      ticker: null,
      securityType,
      isCashEquivalent: opts.isCashEquivalent ?? securityType === "cash",
    },
    quantity: 1,
    valueMinor,
    costBasisMinor: null,
    currency: "USD",
  };
}
