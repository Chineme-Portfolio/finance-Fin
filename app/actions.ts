"use server";

import { revalidatePath } from "next/cache";
import { getAggregator } from "@/lib/aggregator";
import { createSandboxInvestmentsPublicToken } from "@/lib/aggregator/plaid";
import type { CreateLinkTokenResult, ExchangeResult } from "@/lib/aggregator";
import { capture } from "@/lib/aggregator/capture";
import { saveObservation } from "@/lib/aggregator/observation-store";
import { linkAndPersist, refreshItem, unlinkItem } from "@/lib/sync";
import { getItemToken } from "@/lib/db";

/**
 * Server Actions (spec 0005).
 *
 * architecture.md section 2 reserves Route Handlers for external callers and
 * webhooks. This slice has neither, so every mutation is a Server Action.
 *
 * Linking, refreshing, and unlinking go through lib/sync, which persists through
 * lib/db. No action returns the access token to the client: results carry an
 * item id or an error message only (security.md section 3, section 6). Auth is
 * still deferred (spec 0004): the fixed dev user id scopes every write.
 */

/** A mutation result with no payload beyond success or an error message. */
export type ActionResult = { ok: true } | { ok: false; message: string };

function message(error: unknown, fallback: string): string {
  // Message only, never the underlying provider payload or token (security.md section 6).
  return error instanceof Error ? error.message : fallback;
}

export async function createLinkTokenAction(): Promise<CreateLinkTokenResult> {
  try {
    return { ok: true, linkToken: await getAggregator().createLinkToken() };
  } catch (error: unknown) {
    return { ok: false, message: message(error, "createLinkToken failed") };
  }
}

/**
 * Exchange a public token and persist the linked item (token to Vault, accounts
 * and holdings to the database) through lib/sync. Returns the item id only.
 */
export async function linkAccountAction(publicToken: string): Promise<ExchangeResult> {
  try {
    const { itemId } = await linkAndPersist(publicToken);
    revalidatePath("/");
    revalidatePath("/dev/plaid-spike");
    return { ok: true, itemId };
  } catch (error: unknown) {
    return { ok: false, message: message(error, "link failed") };
  }
}

/** Re fetch an already linked item (token read from Vault) and re persist it. */
export async function refreshItemAction(plaidItemId: string): Promise<ActionResult> {
  try {
    await refreshItem(plaidItemId);
    revalidatePath("/");
    revalidatePath("/dev/plaid-spike");
    return { ok: true };
  } catch (error: unknown) {
    return { ok: false, message: message(error, "refresh failed") };
  }
}

/** Unlink an item: delete its rows and its Vault secret. */
export async function unlinkItemAction(plaidItemId: string): Promise<ActionResult> {
  try {
    await unlinkItem(plaidItemId);
    revalidatePath("/");
    revalidatePath("/dev/plaid-spike");
    return { ok: true };
  } catch (error: unknown) {
    return { ok: false, message: message(error, "unlink failed") };
  }
}

/**
 * Void form wrappers so the dev spike page can drive refresh and unlink from a
 * plain <form>. A failure is surfaced to the server log (the message carries no
 * token, only an item id and provider/Supabase text), so a dropped operation is
 * visible during the manual proof rather than looking like a silent success.
 */
export async function refreshItemFormAction(formData: FormData): Promise<void> {
  const id = String(formData.get("itemId") ?? "");
  if (!id) return;
  const res = await refreshItemAction(id);
  if (!res.ok) console.error(`refresh failed for ${id}: ${res.message}`);
}
export async function unlinkItemFormAction(formData: FormData): Promise<void> {
  const id = String(formData.get("itemId") ?? "");
  if (!id) return;
  const res = await unlinkItemAction(id);
  if (!res.ok) console.error(`unlink failed for ${id}: ${res.message}`);
}

/**
 * DEV inspection (the spike page): fetch an item's raw holdings and investment
 * transactions for reading by eye, using the token read back from Vault. Writes
 * the raw payloads to captures/ (gitignored). Does not touch the domain tables.
 */
export async function observeAction(formData: FormData): Promise<void> {
  const plaidItemId = String(formData.get("itemId") ?? "");
  if (!plaidItemId) return;

  const token = await getItemToken(plaidItemId);
  const result = await getAggregator().fetchAccountData(token);

  const captures = [
    await capture(`holdings-${plaidItemId.slice(0, 8)}`, result.rawHoldings),
    await capture(`investment-transactions-${plaidItemId.slice(0, 8)}`, result.rawTransactions),
  ];

  saveObservation(plaidItemId, {
    result,
    captures,
    observedAt: new Date().toISOString(),
  });
  revalidatePath("/dev/plaid-spike");
}

/**
 * SANDBOX TEST SHIM (dev only). Mints a sandbox investments connection without
 * the Link widget, then runs the real link + persist path. Refuses outside
 * sandbox. Part of the disposable spike surface.
 */
export async function sandboxLinkAction(): Promise<ExchangeResult> {
  try {
    const publicToken = await createSandboxInvestmentsPublicToken();
    return await linkAccountAction(publicToken);
  } catch (error: unknown) {
    return { ok: false, message: message(error, "sandbox link failed") };
  }
}

/** Void form wrapper for the sandbox shim, so it can drive a plain <form>. */
export async function sandboxLinkFormAction(): Promise<void> {
  await sandboxLinkAction();
  revalidatePath("/");
  revalidatePath("/dev/plaid-spike");
}
