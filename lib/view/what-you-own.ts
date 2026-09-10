import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { mapHoldingsResponseToDomain } from "@/lib/aggregator";
import type { AccountCapability } from "@/lib/aggregator";
import { getAccountsForUser, getHoldingsForAccount } from "@/lib/db";
import { deriveInsights } from "@/lib/insights";
import type { Account, Holding, Insight } from "@/lib/types";

/**
 * The view model for the "what you own" screen. It maps and runs the engine, but
 * performs no financial arithmetic of its own beyond the explicit, named
 * portfolio-total helper below (spec 0003 AC-6, foundation.md §4 #1).
 *
 * `loadWhatYouOwnLive` (spec 0005) is the real path the screen uses: it reads the
 * user's persisted accounts and holdings from lib/db and runs the engine over
 * them. Real per-account capabilities drive the missing-capability state; there
 * is no demo strip. `loadWhatYouOwn` (the fixture path below) is kept only for
 * the view-model unit test; it is no longer on the render path.
 */

export interface AccountView {
  account: Account;
  insights: Insight[];
  holdings: Holding[];
  seesHoldings: boolean;
}

export interface WhatYouOwnView {
  accounts: AccountView[];
  portfolioTotalMinor: number;
}

const INVESTMENT_TYPES: ReadonlySet<Account["type"]> = new Set([
  "401k", "roth_ira", "traditional_ira", "taxable_brokerage", "hsa",
]);

interface RawHoldingsResponse {
  accounts: unknown[];
  holdings: unknown[];
  securities: unknown[];
}

function readFixture(): RawHoldingsResponse {
  const file = path.join(process.cwd(), "fixtures", "holdings-ymw6pgkb.json");
  const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
  // Validate the shape at the boundary rather than trusting a double cast
  // (code-standards.md §2, §6): a hand-edited or regenerated fixture should fail
  // loudly with a clear message, not crash the page with "cannot read undefined".
  const data = (parsed as { data?: RawHoldingsResponse }).data;
  if (!data || !Array.isArray(data.accounts) || !Array.isArray(data.holdings) || !Array.isArray(data.securities)) {
    throw new Error("what-you-own view: fixture is not a Plaid holdings response with data.{accounts,holdings,securities}");
  }
  return data;
}

/**
 * The one cross-account figure the engine does not produce. A pure sum of what
 * we can see per account: the holdings total where holdings are visible, else the
 * provider balance. Lives here, never in a component (spec 0003 AC-6).
 */
export function portfolioTotalMinor(accounts: AccountView[]): number {
  return accounts.reduce((sum, view) => {
    if (view.seesHoldings) {
      // Read the engine's account total (single source of truth, invariant 8),
      // never re-sum here, so the header total cannot drift from the per-account
      // figures shown directly below it (foundation.md §4 #3).
      const composition = view.insights.find(
        (i): i is Extract<Insight, { kind: "composition" }> => i.kind === "composition",
      );
      return sum + (composition ? composition.accountTotalMinor : 0);
    }
    return sum + (view.account.balanceMinor ?? 0);
  }, 0);
}

/**
 * The live view model (spec 0005): read the user's persisted accounts and
 * holdings from lib/db and run the engine over them. Real capabilities drive the
 * missing-capability state (foundation.md §4 #7, §7 #15); no demo strip. Only
 * investment accounts appear (this screen is about what you own, not spending),
 * and only accounts with something to show: holdings to break down, or the
 * balance-only state that a real gap (like the FedEx 401k) produces.
 */
export async function loadWhatYouOwnLive(): Promise<WhatYouOwnView> {
  const accounts = await getAccountsForUser();
  const investmentAccounts = accounts.filter((a) => INVESTMENT_TYPES.has(a.type));

  const views: AccountView[] = await Promise.all(
    investmentAccounts.map(async (account) => {
      const seesHoldings = account.capabilities.includes("holdings");
      // Positive-value holdings only, matching what the engine counts toward the
      // composition and total (composition.ts excludes value <= 0), so the row
      // list, the bar, and the total agree (foundation.md §4 #3).
      const accountHoldings = seesHoldings
        ? (await getHoldingsForAccount(account.id)).filter((h) => h.valueMinor > 0)
        : [];
      const insights = seesHoldings
        ? deriveInsights({ accounts: [account], holdings: accountHoldings, contributionEvents: [], planFacts: [] })
        : [];
      return { account, insights, holdings: accountHoldings, seesHoldings };
    }),
  );

  const shown = views.filter((v) => v.holdings.length > 0 || !v.seesHoldings);
  return { accounts: shown, portfolioTotalMinor: portfolioTotalMinor(shown) };
}

export function loadWhatYouOwn(): WhatYouOwnView {
  const raw = readFixture();

  // Every account in a holdings response is holdings-capable in the fixture.
  const rawAccounts = raw.accounts as Array<{ account_id: string }>;
  const capabilities: AccountCapability[] = rawAccounts.map((a) => ({
    accountId: a.account_id,
    accountName: "",
    accountType: "",
    accountSubtype: null,
    holdings: { status: "data", attempts: 1 },
    investmentTransactions: { status: "data", attempts: 1 },
    observedAt: new Date(0).toISOString(),
  }));

  const { accounts, holdings } = mapHoldingsResponseToDomain(
    { accounts: raw.accounts, holdings: raw.holdings, securities: raw.securities } as Parameters<
      typeof mapHoldingsResponseToDomain
    >[0],
    capabilities,
  );

  // Investment accounts only; this screen is about what you own, not spending.
  const investmentAccounts = accounts.filter((a) => INVESTMENT_TYPES.has(a.type));

  // DEMO SCAFFOLDING (spec 0003 AC-5): the sandbox fixture's 401k returns holdings,
  // but the confirmed real FedEx 401k (foundation.md §11) does not. To show the
  // required missing-capability state, strip the "holdings" capability from the
  // 401k here. TODO(live-data): remove this strip when the live source lands; the
  // real account's true capabilities will drive the state on their own.
  const gapped401kId = investmentAccounts.find((a) => a.type === "401k")?.id;

  const views: AccountView[] = investmentAccounts.map((account) => {
    const isGapped = account.id === gapped401kId;
    const seesHoldings = isGapped ? false : account.capabilities.includes("holdings");
    // Positive-value holdings only, matching what the engine counts toward the
    // composition and total (composition.ts excludes value <= 0). Keeps the row
    // list, the bar, and the total in agreement (foundation.md §4 #3).
    const accountHoldings = seesHoldings
      ? holdings.filter((h) => h.accountId === account.id && h.valueMinor > 0)
      : [];
    const scopedAccount: Account = isGapped
      ? { ...account, capabilities: account.capabilities.filter((c) => c !== "holdings") }
      : account;
    const insights = seesHoldings
      ? deriveInsights({ accounts: [scopedAccount], holdings: accountHoldings, contributionEvents: [], planFacts: [] })
      : [];
    return { account: scopedAccount, insights, holdings: accountHoldings, seesHoldings };
  });

  // Show accounts that have something to render: holdings to break down, or the
  // balance-only (gapped) account that demonstrates the missing-capability state.
  // An investment-typed account with no holdings and full capability (e.g. an
  // unfunded HSA in the fixture) has nothing to show here and is left off.
  const shown = views.filter((v) => v.holdings.length > 0 || !v.seesHoldings);

  return { accounts: shown, portfolioTotalMinor: portfolioTotalMinor(shown) };
}
