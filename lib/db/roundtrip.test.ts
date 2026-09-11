import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Account, Holding, ContributionEvent } from "@/lib/types";

/**
 * Round-trip integration check for lib/db against the live Supabase project
 * (spec 0004 AC-6, AC-7, AC-8). This is a DEV-TIME check, not a CI test: it
 * needs real credentials in .env.local and hits the network, so it skips itself
 * when SUPABASE_SECRET_KEY is absent (the review's honest framing). It cleans up
 * everything it creates.
 */

// Load .env.local into process.env before lib/db lazily creates its client.
function loadEnvLocal(): boolean {
  try {
    const raw = readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    /* no .env.local */
  }
  return Boolean(process.env.SUPABASE_SECRET_KEY && process.env.DEV_USER_ID);
}

const hasCreds = loadEnvLocal();
const TEST_ITEM = `rt-item-${Date.now()}`;
const TEST_NAME = `RT Test IRA ${Date.now()}`;

describe.skipIf(!hasCreds)("lib/db round-trip against live Supabase (spec 0004)", () => {
  let db: typeof import("./index");

  beforeAll(async () => {
    db = await import("./index");
  });

  // Cleanup is inline: the round-trip test deletes the item it creates (AC-8),
  // and saveLinkedItem's own failure path removes a partially saved item/token.

  it("stores a token in Vault and reads it back exactly [AC-5]", async () => {
    // Unique name per run: Vault enforces a unique secret name, so a fixed name
    // would collide with a leftover from an earlier run that failed before cleanup.
    const secretId = await db.storeAccessToken(
      "access-sandbox-FAKE-rt-token",
      `rt-vault-test-${Date.now()}`,
    );
    expect(typeof secretId).toBe("string");
    const recovered = await db.readAccessToken(secretId);
    expect(recovered).toBe("access-sandbox-FAKE-rt-token");
    // Clean up the standalone secret this test created (the round-trip test's
    // token is removed by deleteItem instead).
    await db.deleteAccessToken(secretId);
  }, 20000);

  it("round-trips an item + account + holding through lib/db, money as number [AC-6, AC-7]", async () => {
    const account: { plaidAccountId: string } & Account = {
      id: "rt-domain-acct-1",
      plaidAccountId: `rt-pa-${Date.now()}`,
      name: TEST_NAME,
      type: "traditional_ira",
      subtype: "ira",
      linked: true,
      capabilities: ["balance", "holdings", "transactions"],
      balanceMinor: 21254, // $212.54
      currency: "USD",
    };
    const holding: Holding = {
      accountId: "rt-domain-acct-1",
      security: {
        securityId: "rt-sec-1",
        name: "RT Test Fund",
        ticker: "RTF",
        securityType: "mutual fund",
        isCashEquivalent: false,
      },
      quantity: 1.5,
      valueMinor: 13964, // $139.64
      costBasisMinor: 13000,
      currency: "USD",
    };
    const contribution: ContributionEvent = {
      accountId: "rt-domain-acct-1",
      date: "2026-01-15",
      amountMinor: 50000, // $500 paid in, positive magnitude
      currency: "USD",
      source: "unknown",
      rawName: "RT Payroll contribution",
    };

    const { itemId } = await db.saveLinkedItem({
      plaidItemId: TEST_ITEM,
      institutionName: "RT Test Bank",
      accessToken: "access-sandbox-FAKE-rt-token-2",
      accounts: [account],
      holdings: [holding],
      contributionEvents: [contribution],
    });
    expect(typeof itemId).toBe("string");

    // Read the account back.
    const accounts = await db.getAccountsForUser();
    const saved = accounts.find((a) => a.name === TEST_NAME);
    expect(saved).toBeDefined();
    expect(saved!.balanceMinor).toBe(21254);
    expect(typeof saved!.balanceMinor).toBe("number"); // bigint came back as a number, not a string
    expect(saved!.type).toBe("traditional_ira");
    expect(saved!.capabilities).toContain("holdings");

    // Read the holding back.
    const holdings = await db.getHoldingsForAccount(saved!.id);
    expect(holdings).toHaveLength(1);
    expect(holdings[0].valueMinor).toBe(13964);
    expect(typeof holdings[0].valueMinor).toBe("number");
    expect(holdings[0].security.ticker).toBe("RTF");

    // Read the contribution event back, money typed as number, source unknown [spec 0006 AC-6].
    const events = await db.getContributionEventsForAccount(saved!.id);
    expect(events).toHaveLength(1);
    expect(events[0].amountMinor).toBe(50000);
    expect(typeof events[0].amountMinor).toBe("number");
    expect(events[0].source).toBe("unknown");
    expect(events[0].rawName).toBe("RT Payroll contribution");

    // Delete the item; its account, holding, contribution event, and Vault token
    // go with it (cascade) [spec 0005 AC-8, spec 0006 AC-5].
    await db.deleteItem(itemId);
    const after = await db.getAccountsForUser();
    expect(after.find((a) => a.name === TEST_NAME)).toBeUndefined();
    expect(await db.getContributionEventsForAccount(saved!.id)).toHaveLength(0);
  }, 30000);
});
