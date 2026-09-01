import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { deriveInsights } from "./index";
import { makeAccount, makeHolding } from "./_test-helpers";
import type { EngineInput } from "@/lib/types";

describe("deriveInsights (spec 0002)", () => {
  it("emits composition and cash_drag per account with holdings [AC-5, AC-6]", () => {
    const input: EngineInput = {
      accounts: [makeAccount({ id: "a" }), makeAccount({ id: "b" })],
      holdings: [
        makeHolding(8000_00, "equity", { accountId: "a" }),
        makeHolding(2000_00, "cash", { isCashEquivalent: true, accountId: "a" }),
        makeHolding(5000_00, "mutual fund", { accountId: "b" }),
      ],
      contributionEvents: [],
      planFacts: [],
    };
    const insights = deriveInsights(input);
    const comps = insights.filter((i) => i.kind === "composition");
    const cash = insights.filter((i) => i.kind === "cash_drag");
    expect(comps.length).toBe(2); // both accounts have holdings
    expect(cash.length).toBe(1); // only account "a" has cash
  });

  it("produces nothing for an account with no holdings, never a fake [AC-8]", () => {
    const insights = deriveInsights({
      accounts: [makeAccount()],
      holdings: [],
      contributionEvents: [],
      planFacts: [],
    });
    expect(insights).toEqual([]);
  });

  it("runs on the real committed Plaid fixture: shares sum to 10000 [AC-5, real data]", () => {
    const fx = JSON.parse(
      readFileSync(join(process.cwd(), "fixtures/holdings-ymw6pgkb.json"), "utf8"),
    ).data;
    const TYPES = ["mutual fund","etf","equity","fixed income","cash","cryptocurrency","derivative"];
    const toMinor = (a: number) => Math.round(a * 100);
    const toSec = (t: string) =>
      TYPES.includes((t ?? "").toLowerCase()) ? t.toLowerCase() : "other";
    const secById = new Map(fx.securities.map((s: { security_id: string }) => [s.security_id, s]));
    const input: EngineInput = {
      accounts: fx.accounts.map((a: { account_id: string }) =>
        makeAccount({ id: a.account_id }),
      ),
      holdings: fx.holdings.map((h: { account_id: string; security_id: string; institution_value: number }) => {
        const raw = secById.get(h.security_id) as { type?: string; is_cash_equivalent?: boolean } | undefined;
        return makeHolding(
          toMinor(h.institution_value),
          toSec(raw?.type ?? "") as never,
          { isCashEquivalent: raw?.is_cash_equivalent === true, accountId: h.account_id },
        );
      }),
      contributionEvents: [],
      planFacts: [],
    };
    const comps = deriveInsights(input).filter((i) => i.kind === "composition");
    expect(comps.length).toBeGreaterThan(0);
    for (const c of comps) {
      if (c.kind !== "composition") continue;
      expect(c.groups.reduce((s, g) => s + g.shareBps, 0)).toBe(10000);
    }
  });

  it("is pure: lib/insights imports nothing from aggregator/db/llm/server-only [AC-4]", () => {
    const dir = join(process.cwd(), "lib/insights");
    const files = readdirSync(dir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
    for (const f of files) {
      const src = readFileSync(join(dir, f), "utf8");
      const importLines = src
        .split("\n")
        .filter((l) => /^\s*import\b/.test(l));
      for (const line of importLines) {
        expect(line).not.toMatch(/aggregator|\/db\/|\/llm\/|server-only/);
      }
    }
  });
});
