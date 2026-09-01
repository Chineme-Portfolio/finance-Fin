import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { toDomainAccounts, toDomainHoldings, mapHoldingsResponseToDomain } from "./map";
import type { AccountCapability } from "../types";

// server-only is aliased to a no-op stub in vitest.config.ts so this pure
// mapping module can be unit tested.

describe("raw Plaid -> domain mapping (spec 0002, AC-3)", () => {
  it("normalises securityType to the closed union; unknown -> 'other'", () => {
    const holdings = toDomainHoldings(
      [
        { account_id: "a", security_id: "s1", institution_value: 100 },
        { account_id: "a", security_id: "s2", institution_value: 200 },
      ],
      [
        { security_id: "s1", type: "MUTUAL FUND", is_cash_equivalent: false },
        { security_id: "s2", type: "some-new-plaid-type", is_cash_equivalent: false },
      ],
    );
    expect(holdings[0].security.securityType).toBe("mutual fund"); // lower-cased match
    expect(holdings[1].security.securityType).toBe("other"); // unknown -> other
  });

  it("maps a missing security type to 'other', not a crash", () => {
    const holdings = toDomainHoldings(
      [{ account_id: "a", security_id: "s1", institution_value: 100 }],
      [{ security_id: "s1" }], // no type field
    );
    expect(holdings[0].security.securityType).toBe("other");
    expect(holdings[0].security.name).toBe("Unknown security");
  });

  it("converts money to integer minor units [AC-1]", () => {
    const holdings = toDomainHoldings(
      [{ account_id: "a", security_id: "s1", institution_value: 5215.5503, cost_basis: 4000.1 }],
      [{ security_id: "s1", type: "equity" }],
    );
    expect(holdings[0].valueMinor).toBe(521555); // rounded to cents, integer
    expect(Number.isInteger(holdings[0].valueMinor)).toBe(true);
    expect(holdings[0].costBasisMinor).toBe(400010);
  });

  it("maps account types; obscure subtypes fall to 'other', not taxable_brokerage", () => {
    const accounts = toDomainAccounts(
      [
        { account_id: "a", name: "A", type: "investment", subtype: "401k", balances: { current: 100 } },
        { account_id: "b", name: "B", type: "investment", subtype: "roth", balances: { current: 100 } },
        { account_id: "c", name: "C", type: "investment", subtype: "brokerage", balances: { current: 100 } },
        { account_id: "d", name: "D", type: "investment", subtype: "sep ira", balances: { current: 100 } },
      ],
      new Map(),
    );
    expect(accounts.find((a) => a.id === "a")?.type).toBe("401k");
    expect(accounts.find((a) => a.id === "b")?.type).toBe("roth_ira");
    expect(accounts.find((a) => a.id === "c")?.type).toBe("taxable_brokerage");
    expect(accounts.find((a) => a.id === "d")?.type).toBe("other"); // not mislabelled
  });

  it("maps the real committed fixture: every security type is recognised", () => {
    const fx = JSON.parse(
      readFileSync(join(process.cwd(), "fixtures/holdings-ymw6pgkb.json"), "utf8"),
    ).data;
    const caps: AccountCapability[] = fx.accounts.map((a: { account_id: string }) => ({
      accountId: a.account_id,
      accountName: "x",
      accountType: "investment",
      accountSubtype: null,
      holdings: { status: "data", attempts: 1 },
      investmentTransactions: { status: "data", attempts: 1 },
      observedAt: "now",
    }));
    const { accounts, holdings } = mapHoldingsResponseToDomain(fx, caps);
    expect(accounts.length).toBe(fx.accounts.length);
    expect(holdings.length).toBe(fx.holdings.length);
    // none should be "other" for this fixture (all its types are known)
    expect(holdings.every((h) => h.security.securityType !== "other")).toBe(true);
    // all money integers
    expect(holdings.every((h) => Number.isInteger(h.valueMinor))).toBe(true);
  });
});
