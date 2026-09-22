import { describe, it, expect } from "vitest";
import { selectHoldingsShape } from "./payload";
import { mapHoldingsResponseToDomain } from "@/lib/aggregator";
import type { AccountCapability } from "@/lib/aggregator";

/**
 * Guards the write path's payload selection (spec 0005). The Blocker this covers:
 * a holdings CALL failure must NOT discard the account, when the transactions
 * call returned the account list (foundation.md §7 #15, §4 #7).
 */

const validHoldings = {
  accounts: [
    {
      account_id: "a1",
      name: "Roth IRA",
      type: "investment",
      subtype: "roth",
      balances: { current: 212.54, iso_currency_code: "USD" },
    },
  ],
  holdings: [{ account_id: "a1", security_id: "s1", quantity: 2, institution_value: 212.54 }],
  securities: [{ security_id: "s1", name: "Some Fund", type: "mutual fund" }],
};

const failedHoldings = { failed: { kind: "not_ready", attempts: 4, errorCode: "PRODUCT_NOT_READY" } };

const txnResponse = {
  accounts: [
    {
      account_id: "a2",
      name: "Workplace 401k",
      type: "investment",
      subtype: "401k",
      balances: { current: 5000, iso_currency_code: "USD" },
    },
  ],
  securities: [],
  investment_transactions: [],
};

describe("selectHoldingsShape (spec 0005 write-path payload selection)", () => {
  it("returns the holdings response when it is well formed", () => {
    const shape = selectHoldingsShape({ rawHoldings: validHoldings, rawTransactions: {} });
    expect(shape.accounts).toHaveLength(1);
    expect(shape.holdings).toHaveLength(1);
    expect(shape.securities).toHaveLength(1);
  });

  it("falls back to the transactions accounts when the holdings CALL failed [Blocker]", () => {
    const shape = selectHoldingsShape({ rawHoldings: failedHoldings, rawTransactions: txnResponse });
    // The account survives; holdings are treated as zero for it, not discarded.
    expect(shape.accounts).toHaveLength(1);
    expect((shape.accounts[0] as { account_id: string }).account_id).toBe("a2");
    expect(shape.holdings).toHaveLength(0);
    expect(shape.securities).toHaveLength(0);
  });

  it("throws only when neither call returned an account list", () => {
    expect(() =>
      selectHoldingsShape({ rawHoldings: failedHoldings, rawTransactions: { failed: {} } }),
    ).toThrow(/neither/i);
  });

  it("a holdings-call failure persists the account as balance-only, driven by real capabilities", () => {
    const shape = selectHoldingsShape({ rawHoldings: failedHoldings, rawTransactions: txnResponse });
    const capabilities: AccountCapability[] = [
      {
        accountId: "a2",
        accountName: "Workplace 401k",
        accountType: "investment",
        accountSubtype: "401k",
        holdings: { status: "not_ready", attempts: 4 },
        investmentTransactions: { status: "data", attempts: 1 },
        observedAt: new Date(0).toISOString(),
      },
    ];
    const { accounts, holdings } = mapHoldingsResponseToDomain(
      shape as Parameters<typeof mapHoldingsResponseToDomain>[0],
      capabilities,
    );
    expect(accounts).toHaveLength(1);
    expect(accounts[0].balanceMinor).toBe(500000); // $5000, real balance preserved
    expect(accounts[0].capabilities).toContain("balance");
    expect(accounts[0].capabilities).toContain("transactions");
    expect(accounts[0].capabilities).not.toContain("holdings"); // the call failed
    expect(holdings).toHaveLength(0);
  });
});
