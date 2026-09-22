import "server-only";
import { CountryCode, Products } from "plaid";
import { plaidClient, plaidEnvName, plaidErrorCode } from "./client";
import type {
  AccountCapability,
  AccountDataResult,
  Aggregator,
  ExchangedItem,
  ObservedTransaction,
  ProductOutcome,
} from "../types";

/**
 * The Plaid implementation of the Aggregator seam.
 * Nothing outside this directory imports from here except the composition root
 * in ../index.ts.
 */

/** Plaid populates investments data asynchronously after a link. */
const NOT_READY_CODES = new Set([
  "PRODUCT_NOT_READY",
  "PRODUCTS_NOT_SUPPORTED",
]);

const MAX_ATTEMPTS = 4;
const BACKOFF_MS = [1000, 3000, 6000];

/** Investments transactions need a window wide enough to catch an annual match. */
const HISTORY_MONTHS = 24;

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function historyWindow(): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - HISTORY_MONTHS);
  return { start: isoDate(start), end: isoDate(end) };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type CallResult<T> =
  | { kind: "ok"; value: T; attempts: number }
  | { kind: "not_ready"; attempts: number; errorCode: string }
  | { kind: "error"; attempts: number; errorCode: string };

/**
 * Call a Plaid endpoint, retrying while it reports that the product is not
 * ready yet. The distinction between "not ready" and "failed" is preserved all
 * the way out, because collapsing them would let a race answer the question
 * this whole slice exists to answer (foundation.md section 7 #16).
 */
async function callWithRetry<T>(fn: () => Promise<T>): Promise<CallResult<T>> {
  let lastCode = "UNKNOWN";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return { kind: "ok", value: await fn(), attempts: attempt };
    } catch (error: unknown) {
      const code = plaidErrorCode(error);
      lastCode = code ?? "UNKNOWN";
      if (code && NOT_READY_CODES.has(code)) {
        if (attempt < MAX_ATTEMPTS) {
          await sleep(BACKOFF_MS[attempt - 1] ?? 6000);
          continue;
        }
        return { kind: "not_ready", attempts: attempt, errorCode: code };
      }
      return { kind: "error", attempts: attempt, errorCode: lastCode };
    }
  }
  return { kind: "error", attempts: MAX_ATTEMPTS, errorCode: lastCode };
}

/**
 * Turn a whole-Item call result into one outcome for one account.
 * Both investments endpoints return every account in the Item at once, so they
 * are called once per Item and the result is split per account here.
 */
function outcomeFor<T>(
  result: CallResult<T>,
  countForAccount: (value: T) => number,
): ProductOutcome {
  if (result.kind === "not_ready") {
    return {
      status: "not_ready",
      errorCode: result.errorCode,
      attempts: result.attempts,
    };
  }
  if (result.kind === "error") {
    return {
      status: "error",
      errorCode: result.errorCode,
      attempts: result.attempts,
    };
  }
  const count = countForAccount(result.value);
  return {
    status: count > 0 ? "data" : "empty",
    recordCount: count,
    attempts: result.attempts,
  };
}

/** Plaid sends money as a JSON number. Convert to integer minor units on read. */
function toMinorUnits(amount: number | null | undefined): number {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

export function createPlaidAggregator(): Aggregator {
  return {
    environmentName(): string {
      return plaidEnvName();
    },

    async createLinkToken(): Promise<string> {
      const redirectUri = process.env.PLAID_REDIRECT_URI;
      const response = await plaidClient().linkTokenCreate({
        client_name: "FINBUDDY spike",
        language: "en",
        country_codes: [CountryCode.Us],
        // Investments only. Identity and banking transactions are deliberately
        // not requested: do not pull what you will not read (security.md section 7).
        products: [Products.Investments],
        user: { client_user_id: "finbuddy-local-spike" },
        ...(redirectUri ? { redirect_uri: redirectUri } : {}),
      });
      return response.data.link_token;
    },

    async exchangePublicToken(publicToken: string): Promise<ExchangedItem> {
      // The public token is used exactly once and then dropped. The access token
      // is returned to the server side caller (lib/sync), which hands it straight
      // to Vault; it is never stored here and never returned to a client
      // (security.md section 3).
      const response = await plaidClient().itemPublicTokenExchange({
        public_token: publicToken,
      });
      return {
        itemId: response.data.item_id,
        institutionName: "unknown",
        linkedAt: new Date().toISOString(),
        accessToken: response.data.access_token,
      };
    },

    async fetchAccountData(accessToken: string): Promise<AccountDataResult> {
      const client = plaidClient();
      const token = accessToken;
      const window = historyWindow();

      const holdings = await callWithRetry(async () => {
        const res = await client.investmentsHoldingsGet({ access_token: token });
        return res.data;
      });

      const transactions = await callWithRetry(async () => {
        const res = await client.investmentsTransactionsGet({
          access_token: token,
          start_date: window.start,
          end_date: window.end,
        });
        return res.data;
      });

      // Accounts come from whichever call succeeded. If both failed we have no
      // account list, which is itself a finding rather than a crash.
      const accounts =
        holdings.kind === "ok"
          ? holdings.value.accounts
          : transactions.kind === "ok"
            ? transactions.value.accounts
            : [];

      const observedAt = new Date().toISOString();
      const capabilities: AccountCapability[] = accounts.map((account) => ({
        accountId: account.account_id,
        accountName: account.name,
        accountType: String(account.type),
        accountSubtype: account.subtype ? String(account.subtype) : null,
        holdings: outcomeFor(holdings, (data) =>
          data.holdings.filter((h) => h.account_id === account.account_id).length,
        ),
        investmentTransactions: outcomeFor(
          transactions,
          (data) =>
            data.investment_transactions.filter(
              (t) => t.account_id === account.account_id,
            ).length,
        ),
        observedAt,
      }));

      const observedTransactions: ObservedTransaction[] =
        transactions.kind === "ok"
          ? transactions.value.investment_transactions
              .map((t) => ({
                accountId: t.account_id,
                date: t.date,
                amountMinor: toMinorUnits(t.amount),
                currency: t.iso_currency_code ?? null,
                name: t.name,
                type: String(t.type),
                subtype: t.subtype ? String(t.subtype) : null,
              }))
              .sort((a, b) => a.date.localeCompare(b.date))
          : [];

      return {
        capabilities,
        transactions: observedTransactions,
        rawHoldings: holdings.kind === "ok" ? holdings.value : { failed: holdings },
        rawTransactions:
          transactions.kind === "ok" ? transactions.value : { failed: transactions },
      };
    },
  };
}

/**
 * SANDBOX TEST SHIM. Not production, and never reached when PLAID_ENV is not
 * "sandbox" (it refuses). Plaid's returning-user Link flow is awkward to drive
 * headlessly, so this mints a public token for a sandbox institution that
 * carries investment accounts, using Plaid's own /sandbox/public_token/create
 * endpoint. Everything downstream (exchange, fetch, classify, capture, leak
 * check) then runs exactly as it would from a real link. Delete with the rest
 * of the disposable spike surface.
 */
export async function createSandboxInvestmentsPublicToken(): Promise<string> {
  if (plaidEnvName() !== "sandbox") {
    throw new Error(
      "sandbox shim refused: PLAID_ENV is not sandbox. This path is never for real data.",
    );
  }
  const res = await plaidClient().sandboxPublicTokenCreate({
    // First Platypus Bank, a Plaid sandbox institution that supports investments.
    institution_id: "ins_109508",
    initial_products: [Products.Investments],
  });
  return res.data.public_token;
}

export { plaidEnvName };
