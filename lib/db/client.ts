import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase clients. Server-only (security.md §2).
 *
 * `getAdminClient` uses the SECRET key, which BYPASSES row-level security. It is
 * used for the deferred-auth path (spec 0004): the single trusted server stamps
 * and filters every query by the fixed dev user id itself (RLS is written and
 * SQL-tested but is not the runtime gate until real auth lands).
 *
 * When real auth arrives, user-facing reads/writes move to a per-request client
 * built from the session JWT with the publishable key, and RLS becomes the live
 * gate (spec 0004 Follow-up). This admin client then narrows to admin and Vault
 * operations only.
 */

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`db.client: ${name} is not set. Copy .env.example to .env.local.`);
  return v;
}

// Safe to cache: this admin client carries no per-user session, so one instance
// serves every request. Do NOT copy this module-level caching for the future
// JWT-bound client (spec 0004 Follow-up): that one is scoped to a request's user
// and must be built per request, or one user's session would leak to another.
let cached: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** The fixed dev user id standing in for auth.uid() until real login lands. */
export function currentUserId(): string {
  return required("DEV_USER_ID");
}
