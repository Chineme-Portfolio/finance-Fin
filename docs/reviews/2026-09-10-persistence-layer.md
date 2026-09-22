# Review, persistence layer (spec 0004), 2026-09-10

**Reviewed by**: Claude Sonnet 5 (author on Claude Opus)
**Scope**: 13 files, uncommitted working-tree changes vs `master`
**Verdict**: Changes requested

## Summary

This slice stands up Postgres schema, RLS, Vault token storage, and a typed `lib/db/` layer for a single-user finance app. The SQL is the strongest part of the change: RLS is enabled on every table, child-table policies correctly require parent-account ownership on both insert and update (verified live against the project), and migration `0004` closes a real Supabase-default-grant hole on the security-definer functions (confirmed live: `store_token`/`read_token`/`delete_item` are now executable only by `service_role`). The weaker part is the TypeScript access layer: `saveLinkedItem` links holdings to accounts by array *position* rather than by the `plaid_account_id` it already fetched back, which will silently mis-attribute holdings the moment more than one account is linked (the founder's real setup is exactly two accounts) with no test covering it; the same function has no rollback across its three separate insert calls, so a mid-way failure orphans a Vault secret or an item row with no way for the caller to clean it up; and `delete_item`'s `coalesce(auth.uid(), p_user_id)` has no defense-in-depth against a future caller passing a non-self id. None of these are live-exploitable today (single dev user, nothing wired to the aggregator yet), but the first two are close to guaranteed to surface real data as soon as the aggregator write-path follow-up lands.

## Major

### 🟠 `saveLinkedItem` maps holdings to accounts by array position, not by the key it already has, `lib/db/accounts.ts:130-135`
**Problem**: After inserting accounts, the code does:
```ts
const dbIdByPlaidId = new Map(
  input.accounts.map((a, i) => [a.id, (savedAccounts as ...)[i].id]),
);
```
This assumes `savedAccounts[i]` (from `.insert(accountRows).select("id, plaid_account_id")`) corresponds positionally to `input.accounts[i]`. PostgREST/Postgres does not document row-order preservation between a multi-row `INSERT ... VALUES` and its `RETURNING`/`select()` for the general case — it's a common-enough footgun that the code already fetches `plaid_account_id` back in the same `.select()`, which is the actual correlating key, and then never uses it.
**Why it matters**: If the order assumption ever breaks (a future Postgres/PostgREST version, a trigger, a conflict-handling change, or simply an untested edge case), holdings get attached to the wrong account for the same user — e.g., a 401k's holdings rendered under the taxable brokerage. This is exactly the "wrong dollar figure, and it's not even flagged as wrong" failure the product's foundational principle (`foundation.md` §4 #1/#3) exists to prevent. It is also completely untested: the round-trip test (`lib/db/roundtrip.test.ts`) only ever saves one account, so this path has zero coverage for the >1-account case — which is the founder's actual, real-world setup (Northwind 401k + the brokerage, `foundation.md` §2).
**Suggested fix**: Build the map from the `plaid_account_id` that's already selected back (`savedAccounts.map(a => [a.plaid_account_id, a.id])`, keyed the same way `input.accounts` exposes its Plaid id), not from positional index. Add a round-trip test case with 2+ accounts and holdings split across them to lock this in.

### 🟠 No atomicity across `saveLinkedItem`'s three inserts; a mid-way failure orphans state with no recovery path, `lib/db/accounts.ts:86-152`
**Problem**: `saveLinkedItem` calls `storeAccessToken` (creates a Vault secret), then inserts `plaid_items`, then `accounts`, then `holdings` — four separate network round trips, no transaction. If the `plaid_items` insert fails (e.g., a duplicate `(user_id, plaid_item_id)` re-link), the just-created Vault secret is now orphaned forever with nothing pointing at it. If the `accounts` or `holdings` insert fails, the `plaid_items`/`accounts` rows already committed remain, but the thrown `Error` never surfaces the `itemId`, so the caller has no id to pass to `deleteItem` for cleanup.
**Why it matters**: This is the same failure class the spec explicitly worries about for *deletion* (AC-8: "a mid-delete crash cannot leave an orphaned secret") and solves with one `security definer` RPC — but the symmetric risk on the *write* path is unaddressed and undocumented. `security.md` §7 ("deletion means deletion") and the spec's own "Negative and tradeoffs" section name dangling secrets as a known risk class; this code path creates exactly that risk without anyone deciding it's acceptable.
**Suggested fix**: Either wrap the three table inserts in one `security definer` RPC (mirroring `delete_item`'s pattern) so a partial failure can't happen, or at minimum: catch a failure after the token/item insert and compensate (delete the just-created secret/row) before re-throwing, and always include `itemId`/`tokenSecretId` on thrown errors so a human can clean up manually. At minimum, document this as an accepted gap the way the RLS-not-yet-the-runtime-gate limitation is documented elsewhere in this same slice.

### 🟠 `delete_item`'s `coalesce(auth.uid(), p_user_id)` has no defense-in-depth once anything besides `currentUserId()` can reach it, `supabase/migrations/0003_functions.sql:40-64` and `lib/db/accounts.ts:174-180`
**Problem**: Post-`0004`, only `service_role` can execute `delete_item` (confirmed live: `anon_exec=false, authenticated_exec=false, service_role_exec=true`), and today `lib/db/accounts.ts`'s `deleteItem()` only ever passes `currentUserId()` as `p_user_id`. But the function itself enforces nothing about *whose* id `p_user_id` is — it trusts the caller completely. The comment in the migration acknowledges this ("only the trusted server holds the secret key that can pass an arbitrary id") but that is a promise about *today's calling code*, not a property the function or the database enforces.
**Why it matters**: The security boundary here rests entirely on every future server-side call site remembering to pass `currentUserId()` and never a client-supplied id. The moment a Server Action is added that takes an id from a request and forwards it to `deleteItem` (an easy mistake once real auth and multiple users exist — exactly the transition this slice is explicitly preparing for), it becomes a straight IDOR: delete anyone's `plaid_item` by guessing/knowing their `item_id` and `user_id`. `security.md` §4 treats an unscoped query as "a security bug, not a style issue" — this is the RPC equivalent of an unscoped query, just currently unreachable.
**Suggested fix**: Have `delete_item` require `auth.uid()` to be non-null (i.e., stop accepting a `p_user_id` fallback) once any authenticated-role caller can reach it, or — while the deferred-auth era continues — assert in code review that every `p_user_id`/caller-id argument passed into these RPCs is server-derived, never client-supplied, and add a one-line comment at each call site saying so (the same discipline `security.md` §4 asks for every secret-key use).

### 🟠 AC-4's required RLS impersonation proof isn't in the repo, `docs/specs/0004-persistence-layer/` (no `verify.md`)
**Problem**: AC-4 requires the RLS policies to be "proven by SQL impersonation... documented." No `verify.md` exists yet (the spec says it arrives "once `/develop` writes it"), and `lib/db/roundtrip.test.ts` exclusively uses the admin/service-role client, which bypasses RLS entirely — it cannot and does not exercise the policies at all.
**Why it matters**: RLS correctness is the single most safety-critical property in this slice (`security.md` §4: "an unscoped query is a security bug"). I independently re-verified the basic case live during this review (as user A, only user A's account is visible) and read the child-table policies closely enough to confirm the parent-ownership `exists()` clause is present on both insert and update-with-check for all three child tables — so the policies as written are almost certainly correct. But nothing durable in the repo proves this, so a future edit to these policies has no regression check to fail against, automated or documented.
**Suggested fix**: Write `verify.md` (or a checked-in, clearly-labeled dev-only script) recording the actual impersonation queries and their results, per AC-4's own wording, before this spec is considered done. This doesn't need to be a CI test (the spec is explicit that it isn't), just recorded evidence.

## Minor

### 🟡 `toInt()` silently coerces unexpected/missing input to `0` instead of throwing, `lib/db/accounts.ts:18-22`
```ts
function toInt(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.length > 0) return Number(v);
  return 0;
}
```
`value_minor` is a `NOT NULL` column and always in the current `select()` string, so this isn't reachable today. But if a future edit typos a column name in a `select()` or a nullable money column is ever run through `toInt` instead of `toIntOrNull`, this silently renders a wrong dollar figure (`$0.00`) instead of throwing — the opposite of `code-standards.md` §1 #5 ("honest gaps beat confident guesses") and `foundation.md` §4 #1. Prefer throwing on anything that isn't a number or a non-empty numeric string.

### 🟡 Module-level Supabase client singleton is safe today, but a footgun template for the planned successor, `lib/db/client.ts:24-32`
`getAdminClient()` caches one `SupabaseClient` at module scope. That's fine now because the admin client is stateless with respect to user identity (it's the same service-role client for everyone; `currentUserId()` scopes each query separately). But the spec's own Follow-up plans a per-request client "built from the session JWT with the publishable key" once real auth lands — if that successor reuses this exact caching pattern, a JWT-bound client cached at module scope would leak one user's session across concurrent requests on a warm serverless instance. Worth a one-line comment now warning the next author not to copy the caching pattern for the JWT-bound client.

## Nits

- ⚪ `lib/db/accounts.ts:130`, the map is named `dbIdByPlaidId` but is actually keyed by the domain `Account.id`, not `plaidAccountId` — confusing given `plaid_account_id` is a distinct field one line above it in the same function.
- ⚪ `lib/db/tokens.ts:15`, the comment "Log a context prefix only, never the token" sits above code that doesn't log anything (it only throws) — either log intentionally at the call boundary or move/reword the comment so it doesn't imply logging happens here.
- ⚪ Live performance advisor flags 4 unused indexes (`*_user_id_idx` on the new tables) — expected on freshly-created, near-empty tables; not actionable yet.
- ⚪ Live security advisor flags `public.rls_auto_enable()` as anon/authenticated-executable — this is a pre-existing Supabase-managed function, not part of this diff; noted for awareness, not a finding against this change.

## Strengths

- RLS is correct where it matters most: every child table (`holdings`, `contribution_events`, `plan_facts`) requires parent-account ownership via `exists(...)` on **both** insert and update-with-check, not just one — this is the exact gap `security.md` §4 and the spec's AC-4 call out, and it's closed. Verified live (RLS enabled on all 5 tables; a basic cross-user `select` impersonation test during this review returned only the impersonated user's own row).
- `0004_lock_functions.sql` is a genuinely good catch: it revokes the execute privileges Supabase auto-grants to `anon`/`authenticated` on newly created functions (a real, easy-to-miss default), closing an actual hole the Supabase security advisor flagged after `0003`. Confirmed live: `store_token`, `read_token`, and `delete_item` are now executable only by `service_role`.
- Token handling is clean: no plaintext token column anywhere, `readAccessToken`/`storeAccessToken` error paths surface only a context prefix and the secret id, never the value — matches `security.md` §6 exactly.
- Money handling is otherwise sound: `bigint` minor units throughout, the PostgREST string→number parsing is applied to every money field the round-trip test checks, `quantity` is `numeric`, rates are integer basis points. No floating-point money column exists.
- Honest, specific documentation throughout the SQL and TS comments about the deferred-auth reality (`client.ts`, `0002_rls.sql`, spec §"Security model") — this is exactly the "honest gaps beat confident guesses" standard the codebase sets for itself, and it's followed here even though it would have been easy to gloss over.
- Data minimization (AC-9) holds: no account numbers, no raw Plaid payload columns anywhere in the schema.

## Test coverage

Configured (Vitest); the guarded live round-trip (`lib/db/roundtrip.test.ts`) is a reasonable shape for a dev-time integration check against a real project and correctly skips without credentials.

**Covered**: Vault store/read round trip (AC-5); a single account + single holding written and read back through `lib/db/` with an explicit `typeof === "number"` assertion on both `balanceMinor` and `valueMinor` (AC-7); delete removing the account from a subsequent listing (a proxy for AC-8's cascade, though holdings removal isn't independently asserted).

**Not covered, and should be**:
- The account-to-holding mapping with more than one account (directly exercises the array-index bug above — this is the single highest-value test to add).
- Any partial-failure path in `saveLinkedItem` (item insert succeeds, accounts/holdings insert fails).
- RLS policy behavior itself — by design this isn't a CI test per the spec, but per AC-4 it should exist somewhere recorded (see Major finding above); right now it exists nowhere.
