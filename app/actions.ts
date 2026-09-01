"use server";

import { revalidatePath } from "next/cache";
import { getAggregator, listConnections } from "@/lib/aggregator";
import { createSandboxInvestmentsPublicToken } from "@/lib/aggregator/plaid";
import type { CreateLinkTokenResult, ExchangeResult } from "@/lib/aggregator";
import { capture } from "@/lib/aggregator/capture";
import { saveObservation } from "@/lib/aggregator/observation-store";

/**
 * Server Actions for the spike.
 *
 * architecture.md section 2 reserves Route Handlers for external callers and
 * webhooks. This slice has neither, so every mutation is a Server Action.
 *
 * A Server Action is a public endpoint wearing a function's clothes
 * (code-standards.md section 4). There is no auth layer in this slice, which is
 * only acceptable because it is never deployed. See spec 0001, Security model.
 */

export async function createLinkTokenAction(): Promise<CreateLinkTokenResult> {
  try {
    return { ok: true, linkToken: await getAggregator().createLinkToken() };
  } catch (error: unknown) {
    // Message only, never the underlying provider payload (security.md section 6).
    return {
      ok: false,
      message: error instanceof Error ? error.message : "createLinkToken failed",
    };
  }
}

export async function exchangePublicTokenAction(
  publicToken: string,
): Promise<ExchangeResult> {
  try {
    const summary = await getAggregator().exchangePublicToken(publicToken);
    revalidatePath("/");
    return { ok: true, itemId: summary.itemId };
  } catch (error: unknown) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "exchange failed",
    };
  }
}

export async function observeAction(formData: FormData): Promise<void> {
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) return;

  const result = await getAggregator().fetchAccountData(itemId);

  // Raw payloads to captures/ (gitignored), synthetic fixtures to fixtures/
  // (committed, and only if the leak check passes).
  const captures = [
    await capture(`holdings-${itemId.slice(0, 8)}`, result.rawHoldings),
    await capture(`investment-transactions-${itemId.slice(0, 8)}`, result.rawTransactions),
  ];

  saveObservation(itemId, {
    result,
    captures,
    observedAt: new Date().toISOString(),
  });
  revalidatePath("/");
}

export async function connectionsAction() {
  return listConnections();
}

/**
 * SANDBOX TEST SHIM (dev only). Mints a sandbox investments connection without
 * the Link widget, then runs the real exchange path. Refuses outside sandbox.
 * Part of the disposable spike surface.
 */
export async function sandboxLinkAction(): Promise<ExchangeResult> {
  try {
    const publicToken = await createSandboxInvestmentsPublicToken();
    return await exchangePublicTokenAction(publicToken);
  } catch (error: unknown) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "sandbox link failed",
    };
  }
}

/** Void form wrapper for the sandbox shim, so it can drive a plain <form>. */
export async function sandboxLinkFormAction(): Promise<void> {
  await sandboxLinkAction();
  revalidatePath("/");
}
