import "server-only";
import { getAdminClient, currentUserId } from "./client";
import { readAccessToken } from "./tokens";

/**
 * Reads over the plaid_items table (spec 0005). These are the durable
 * replacements for the in memory connection store that spec 0001 used: the
 * linked items and their tokens now live in the database and Vault, so they
 * survive a restart.
 *
 * The token itself is never returned by listLinkedItems; only getItemToken
 * returns it, and only to a server side caller (security.md §3).
 */

/** A linked item, safe to surface: no access token. */
export interface LinkedItem {
  plaidItemId: string;
  institutionName: string | null;
  linkedAt: string;
}

interface ItemRow {
  plaid_item_id: string;
  institution_name: string | null;
  linked_at: string;
}

export async function listLinkedItems(): Promise<LinkedItem[]> {
  const { data, error } = await getAdminClient()
    .from("plaid_items")
    .select("plaid_item_id, institution_name, linked_at")
    .eq("user_id", currentUserId())
    .order("linked_at", { ascending: true });
  if (error) throw new Error(`db.listLinkedItems: ${error.message}`);
  return (data as ItemRow[]).map((r) => ({
    plaidItemId: r.plaid_item_id,
    institutionName: r.institution_name,
    linkedAt: r.linked_at,
  }));
}

/**
 * Resolve the stable Plaid item id to the row's internal fields. This is the
 * link the replace path needs: plaid_items.id is a fresh gen_random_uuid() on
 * every insert, so it is not a handle a caller can hold across a refresh (which
 * deletes and re inserts). Callers hold the stable plaid_item_id and resolve to
 * the current internal id here. Returns null when the item is not linked.
 */
export async function getItemByPlaidItemId(
  plaidItemId: string,
): Promise<{ id: string; tokenSecretId: string } | null> {
  const { data, error } = await getAdminClient()
    .from("plaid_items")
    .select("id, token_secret_id")
    .eq("user_id", currentUserId())
    .eq("plaid_item_id", plaidItemId)
    .maybeSingle();
  if (error) throw new Error(`db.getItemByPlaidItemId: ${error.message}`);
  if (!data) return null;
  const row = data as { id: string; token_secret_id: string };
  return { id: row.id, tokenSecretId: row.token_secret_id };
}

/**
 * Read a linked item's Plaid access token back from Vault, by its stable Plaid
 * item id. Server only. Used by the refresh path to re fetch after a restart,
 * when the token is no longer in process memory (spec 0005 AC-5).
 */
export async function getItemToken(plaidItemId: string): Promise<string> {
  const item = await getItemByPlaidItemId(plaidItemId);
  if (!item) throw new Error(`db.getItemToken: no linked item ${plaidItemId}`);
  return readAccessToken(item.tokenSecretId);
}
