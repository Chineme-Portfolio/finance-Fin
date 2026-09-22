# 0004 Persistence layer, verification

How this slice was proven against the live Supabase project (project `vnvfjxlojjjxhluoqyzc`), on 2026-09-10. These are dev time checks, not CI tests: they need real credentials and hit the network. Every check cleans up the rows and secrets it creates.

## What was proven, by acceptance criterion

### AC-1, AC-2, AC-9 schema, money types, minimization

`list_tables` on the live project shows the five tables (`plaid_items`, `accounts`, `holdings`, `contribution_events`, `plan_facts`) and no `insights` table. Every table carries a `user_id` column. Every money column is `bigint` (`balance_minor`, `value_minor`, `cost_basis_minor`, `amount_minor`, `gross_pay_minor`); `quantity` is `numeric`; `contribution_rate_bps` is `integer` basis points. No floating point money column exists. No account number column and no raw payload column exists on any table.

### AC-3, AC-4 row level security enabled and correct

RLS is enabled on all five tables (verified in `list_tables`, each shows `rls_enabled: true`). The policy expressions were proven by SQL impersonation against the live project (setting the request role and JWT claims, not through the app), using `execute_sql`:

- As user A, selecting rows returned only user A's rows; user B's rows were invisible.
- As user A, an insert stamped with user B's `user_id` was rejected by the insert policy.
- As `anon`, selecting any table returned nothing.
- The child table gap was closed: a `holdings` insert whose own `user_id` matched the caller but whose `account_id` pointed at another user's account was rejected. This is the case a plain foreign key cannot catch, because foreign key validation runs elevated and bypasses RLS on the parent, so the child policy checks parent ownership itself with an `exists (select 1 from accounts a where a.id = holdings.account_id and a.user_id = (select auth.uid()))` clause.

Honest scope: auth is deferred, so RLS is not the runtime gate yet. The server uses the secret key (which bypasses RLS) and stamps a fixed dev user id. These checks prove the policy expressions are enabled and correct, not that the running app is gated by them. The runtime gate arrives with real auth (a Follow up), and the post auth architecture is recorded in the spec so the transition is real, not decorative.

### AC-5, AC-8 Vault token storage and atomic delete

The Plaid access token is stored as a Supabase Vault secret through the `store_token` security definer function; the `plaid_items` row holds only `token_secret_id`, never the token. No table has a plaintext token column. `read_token` reads the value back by id. `delete_item` removes the item, cascades to its accounts and holdings, and deletes the Vault secret in one transaction, so a mid delete crash cannot leave an orphaned secret or a row pointing at a gone secret. This deletes the local token only; revoking at Plaid is a Follow up.

### AC-6, AC-7 typed scoped access layer and the round trip

The `lib/db/roundtrip.test.ts` integration check ran green against the live project (2 tests passed). It skips itself when `SUPABASE_SECRET_KEY` is absent, so it never runs in a plain CI environment. It proves:

- A token is written to Vault and read back exactly by id (AC-5), then deleted.
- One `plaid_item` plus `account` plus `holding` is written through `saveLinkedItem` and read back through `getAccountsForUser` and `getHoldingsForAccount`, mapping to and from the `lib/types/` domain objects.
- Money survives as integer minor units and comes back typed as `number`, not a string. The check asserts `typeof balanceMinor === "number"` and `typeof valueMinor === "number"`, because PostgREST serializes `bigint` as a JSON string and the mapping layer must parse it.
- `deleteItem` removes the item, its account, and its holding; a follow up read finds none of them.

## Security advisors

`get_advisors` (security) was run after the function lock migration (`0004_lock_functions.sql`). The earlier warning that `store_token`, `read_token`, and `delete_item` were executable by `anon` and `authenticated` is cleared: those roles have `execute` revoked, and only `service_role` (held by the trusted server) can call them. The same lock and grant pattern is applied to `delete_token` (`0005_delete_token.sql`).

One further advisor finding was a pre existing Supabase artifact, not this slice's code: `public.rls_auto_enable()`, a Supabase installed event trigger function that auto enables RLS on new `public` tables, held the default `PUBLIC` execute grant. An event trigger function cannot be invoked usefully over the REST RPC path (Postgres fires it only from the DDL event trigger), so the risk is low, but `0006_lock_rls_auto_enable.sql` revokes `execute` from `anon` and `authenticated` for least privilege. Confirmed by reading the function ACL directly: only `postgres` and `service_role` retain `execute`. The advisor's own cached report can lag a few minutes behind this change.

## Secrets and logging

`SUPABASE_SECRET_KEY` is read server side only and is never given a `NEXT_PUBLIC_` prefix (`lib/db/client.ts`, `security.md` §2). The token value is never logged: error paths in `lib/db/tokens.ts` carry only the RPC name, Supabase's own error text, and at most a secret id, never the token (`security.md` §6).

## Not proven here (deferred, owned by the spec)

- Real per user runtime enforcement of RLS. Deferred with auth; the server currently bypasses RLS by design and stamps the dev user id.
- Revoking the token at Plaid on unlink. This slice deletes the local Vault secret only.
- The aggregator write path. Nothing persists a real link yet; that is the next slice.
