import "server-only";
import { getAdminClient } from "./client";

/**
 * Plaid access token storage, over Supabase Vault (security.md §3). The token is
 * a Vault secret; callers get back only its id. The token value is never returned
 * to a client, never logged (security.md §6).
 */

export async function storeAccessToken(token: string, name?: string): Promise<string> {
  const { data, error } = await getAdminClient().rpc("store_token", {
    p_token: token,
    p_name: name ?? null,
  });
  // Error messages here carry only the RPC name and Supabase's own text, never the
  // token value (security.md §6).
  if (error) throw new Error(`db.storeAccessToken: ${error.message}`);
  if (typeof data !== "string") throw new Error("db.storeAccessToken: no secret id returned");
  return data;
}

export async function readAccessToken(secretId: string): Promise<string> {
  const { data, error } = await getAdminClient().rpc("read_token", { p_secret_id: secretId });
  if (error) throw new Error(`db.readAccessToken: ${error.message} (secret ${secretId})`);
  if (typeof data !== "string") throw new Error(`db.readAccessToken: no secret for id ${secretId}`);
  return data;
}

/** Delete a Vault secret by id. Used to clean up an orphaned token when an item
 * save fails after the token was stored (see saveLinkedItem). */
export async function deleteAccessToken(secretId: string): Promise<void> {
  const { error } = await getAdminClient().rpc("delete_token", { p_secret_id: secretId });
  if (error) throw new Error(`db.deleteAccessToken: ${error.message} (secret ${secretId})`);
}
