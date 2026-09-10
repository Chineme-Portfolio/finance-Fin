# 0004. Persistence layer: Supabase Postgres, row-level security, and Vault token storage

**Date**: 2026-09-08
**Status**: Accepted

## Summary

This slice stands up the real data layer the whole system needs to hold state. It creates a Supabase Postgres schema for the domain model (accounts, holdings, and the tables the match feature will need), with a `user_id` on every table and row-level security turned on from the first migration, so a query can only ever see one user's rows. The Plaid access token, the crown jewel, is stored encrypted in Supabase Vault, never in a plain column. A login screen is deliberately left for later: the tenancy structure is built and tested now, and a fixed single-user id stands in until real auth arrives. The slice proves the layer works with a round-trip (write a row and a token, read them back), but does not yet replace the aggregator's in-memory stores.

## Requirements

**User stories**

- As the builder, I want the domain model persisted in Postgres with tenancy and encryption built in from the first migration, so the data foundation is correct before any real account data flows through it.
- As the builder, I want the Plaid access token stored encrypted and never in a plain column or a log, so a database dump can never hand someone standing access to a real financial account.
- As the builder, I want a typed, scoped data-access layer, so every read and write is bound to one user and no query can accidentally cross that line.

**Acceptance criteria**

- **AC-1**: A migration in `supabase/migrations/` creates the schema: `plaid_items`, `accounts`, `holdings`, `contribution_events`, `plan_facts`. Every table has a `user_id` column. There is **no** `insights` table (insights are computed, never stored, `foundation.md` §5, §7 #7).
- **AC-2**: All money columns are `bigint` integer minor units (cents); share `quantity` is `numeric` (fractional shares are not money); percentages/rates are integer basis points. No floating point money column exists.
- **AC-3**: Row-level security is **enabled on every table** in the migration, with policies for select/insert/update/delete keyed on `auth.uid()`. RLS is on before any row can be written. **Because real auth is deferred, the app is not yet gated by these policies at runtime** (server code uses the secret key with a fixed dev user id); what this AC proves is that the policy *expressions* are enabled and correct, verified by SQL impersonation (AC-4). The runtime gate arrives with auth (Follow-up), and the post-auth architecture is recorded in the Security model so the transition is real, not decorative.
- **AC-4**: The RLS policy expressions are proven by SQL impersonation (setting the request JWT claims / role, not through the app): as user A, user B's rows are invisible and inserts stamped for user B are rejected; as anon, nothing is visible; and **a child row (holding/contribution) whose own `user_id` matches but whose `account_id` points at another user's account is rejected** (child policies check parent ownership, Issue below). These are dev-time SQL checks against the live project, documented, not automated CI tests.
- **AC-5**: The Plaid `access_token` is stored as a Supabase Vault secret; the owning `plaid_items` row holds only the secret's id (`token_secret_id`), never the token itself. No table has a plaintext token column (`security.md` §3).
- **AC-6**: A typed data-access layer in `lib/db/` exposes scoped read/write functions for the domain model. Every query is scoped by the current user id. The `sb_secret_` key (which bypasses RLS) is used only server-side, never with a `NEXT_PUBLIC_` prefix, and every use is a deliberate, commented exception (`security.md` §2, §4).
- **AC-7**: A round-trip proof (a dev-time integration check against the live project, with teardown of the rows/secret it creates, not a self-contained CI test): a token is written to Vault and read back by id, and one `plaid_item` + `account` + `holding` is written and read back through `lib/db/`, mapping to and from the domain types in `lib/types/`. Money survives as integer minor units **and comes back typed as `number`** (PostgREST serializes `bigint` as a JSON string, so the mapping layer must parse it; the check asserts `typeof value === "number"`, not just the value).
- **AC-8**: Deletion is real and atomic: removing a `plaid_item` cascades to its `accounts` and their `holdings` **and deletes the Vault secret in the same transaction** (via one `security definer` Postgres function invoked over RPC, so a mid-delete crash cannot leave an orphaned secret or a row pointing at a gone secret). No soft-delete flags retain financial history (`security.md` §7). This deletes the *local* encrypted token; revoking the token at Plaid (`/item/remove`, `security.md` §3 rule 5) arrives with the aggregator write path (Follow-up).
- **AC-9**: Only fields the engine consumes are persisted (data minimization, `security.md` §7). No account numbers, no raw Plaid payloads, are stored in these tables.

## Decision

**Chosen option**: Option 2: the full schema with RLS and Vault now, real login deferred, a fixed user id standing in, and a round-trip proof but not the aggregator rewrite.

Create the Supabase schema and RLS in one migration, store the Plaid token in Vault, build a typed scoped `lib/db/` access layer, and prove the layer with a round-trip. Real Supabase Auth (a login) is a follow-up; until then a fixed development user id is used, so the tenancy structure is real and tested even though a live login does not yet gate it. Development runs against a hosted Supabase free-tier project.

**Implementation skills**: none installed. The connected Supabase MCP server is available to the build for applying migrations and inspecting the schema; the Supabase agent skill (`supabase/agent-skills`) is worth installing (Follow-up).

## Rationale

Reasoning, the options weighed, and the four design decisions: see [`rationale.md`](rationale.md).
Verification steps: see [`verify.md`](verify.md) once `/develop` writes it.

## Feature design

**Build approach**: no project-wide approach is recorded; this Layer-0 data slice is built as a coherent bottom-up thread: schema + RLS first (nothing exists without it), then the client and the token storage, then the typed access layer, then the round-trip proof that runs through all of it. The migration is task 1, as it always is for a data slice.

**Data model** (the persistence shape; the domain model in `lib/types/` is the in-memory shape it maps to. `foundation.md` §5 is the source).

```
plaid_items
  id                uuid pk default gen_random_uuid()
  user_id           uuid not null            -- RLS key; = auth.uid() when auth lands
  plaid_item_id     text not null            -- Plaid's Item id
  institution_name  text
  token_secret_id   uuid not null            -- FK-by-id into Vault (vault.secrets); the access token lives there
  linked_at         timestamptz not null default now()
  unique (user_id, plaid_item_id)

accounts
  id                uuid pk default gen_random_uuid()
  user_id           uuid not null
  item_id           uuid not null references plaid_items(id) on delete cascade
  plaid_account_id  text not null
  name              text not null
  type              account_type not null     -- enum: 401k | roth_ira | traditional_ira | taxable_brokerage | hsa | other
  subtype           text
  balance_minor     bigint                    -- integer minor units; null when no balance
  currency          text
  capabilities      capability[] not null default '{}'  -- typed enum array: balance|holdings|transactions this connection returned (§7 #15)
  unique (user_id, plaid_account_id)

holdings
  id                uuid pk default gen_random_uuid()
  user_id           uuid not null
  account_id        uuid not null references accounts(id) on delete cascade
  security_id       text not null
  security_name     text not null
  ticker            text
  security_type     security_type not null    -- enum: mutual fund | etf | equity | fixed income | cash | cryptocurrency | derivative | other
  is_cash_equivalent boolean not null default false
  quantity          numeric not null          -- a count of shares, NOT money (may be fractional)
  value_minor       bigint not null           -- integer minor units
  cost_basis_minor  bigint                    -- integer minor units; null when none
  currency          text

contribution_events                            -- defined now, populated when the match feature lands (foundation §5)
  id                uuid pk default gen_random_uuid()
  user_id           uuid not null
  account_id        uuid not null references accounts(id) on delete cascade
  date              date not null
  amount_minor      bigint not null
  currency          text
  source            contribution_source not null default 'unknown'  -- enum: deferral | match | unknown
  raw_name          text not null

plan_facts                                      -- defined now, populated later (foundation §5, §7 #12)
  id                uuid pk default gen_random_uuid()
  user_id           uuid not null
  account_id        uuid not null references accounts(id) on delete cascade
  employer          text
  match_formula     text
  contribution_rate_bps integer                 -- integer basis points
  gross_pay_minor   bigint                       -- integer minor units
  unique (user_id, account_id)
```

- **No `insights` table.** Insights are recomputed by the engine, never stored (`foundation.md` §5, §7 #7).
- **Indexes:** a `user_id` index on every table; `accounts(item_id)`, `holdings(account_id)` for the cascade/joins.
- **Extensions:** the migration enables `supabase_vault` (`create extension if not exists supabase_vault`). `gen_random_uuid()` needs no extension on Supabase's Postgres (core since PG13).
- **Enums** are Postgres enum types matching every closed domain union (`account_type`, `security_type`, `contribution_source`, **and `capability`**), so the DB rejects an off-list value at the boundary. `capabilities` is a `capability[]`, not an untyped `text[]`.

**State transitions**: none at the table level. A `plaid_item` is created on link and deleted on unlink (cascading); there is no soft-delete lifecycle.

**API surface** (functions in `lib/db/`, not HTTP. This slice adds no route.)

| Function | Purpose | Scope |
|---|---|---|
| `getSupabaseServerClient()` | The server-side client using the `sb_secret_` key. Server-only. | n/a |
| `storeAccessToken(itemId, token)` | Write the token to Vault, return its secret id | server-only |
| `readAccessToken(secretId)` | Read a token back from Vault by id | server-only |
| `saveLinkedItem(item, accounts, holdings)` | Persist a linked item + its accounts + holdings, all scoped to the user | user-scoped |
| `getAccountsForUser()` / `getHoldingsForAccount(accountId)` | Read domain objects back, scoped by user id | user-scoped |
| `deleteItem(itemId)` | Cascade-delete an item and revoke its Vault token | user-scoped |

Every user-scoped function stamps and filters by the current user id (the fixed dev id for now, `auth.uid()` once auth lands).

**Key invariants**
1. RLS is on for every table before any row exists (AC-3). An unscoped query is a security bug (`security.md` §4, `code-standards.md` §5).
2. The access token exists only in Vault and in server memory in transit. No plaintext token column, never logged (AC-5, `security.md` §3, §6).
3. The `sb_secret_` key (bypasses RLS) is server-only, never `NEXT_PUBLIC_`, every use commented (`security.md` §2).
4. Money is `bigint` minor units; `quantity` is `numeric`; rates are integer basis points (AC-2).
5. Deletes are real and cascade; no soft-delete retains financial history (AC-8).
6. The DB layer maps to and from `lib/types/` domain objects; nothing above `lib/db/` sees a raw database row shape. Money columns (`bigint`) come back from PostgREST as strings and are parsed to `number` in the mapping layer.
7. `lib/db/` never logs a row, a decrypted token, or a key, even in a caught-error path (`security.md` §6). `readAccessToken` handles the crown jewel; a client error there logs a context prefix and the secret id at most, never the value.

**Security model** (this is the heart of the slice; `security.md` is the authority and wins on any conflict):
- Every table carries `user_id`; RLS policies permit a row only when `user_id = auth.uid()`, **and child-table (holdings, contribution_events, plan_facts) policies additionally require the referenced parent row to belong to the same user** (an `exists (select 1 from accounts a where a.id = <child>.account_id and a.user_id = auth.uid())` clause). This closes the gap where a foreign-key insert can reference another user's account: Postgres FK validation runs elevated and bypasses RLS on the parent, so the child policy must check parent ownership itself, not rely on the FK.
- **Auth is deferred, so RLS is not the runtime gate yet.** Server code supplies a fixed dev user id and uses the secret key (which bypasses RLS); the policy expressions are enabled and SQL-impersonation-tested (AC-4), which proves they are *correct*, not that the app is *gated* by them. **The recorded post-auth architecture** (so this is not permanently decorative): user-facing reads/writes move to a per-request client built from the logged-in user's session JWT with the publishable key, so RLS enforces them; the secret key is then reserved for admin and Vault operations only. Until then, this is single-user and explicitly not multi-user ready.
- The Plaid token is a Vault secret; the row holds its id. A DB dump yields no usable token.
- Secrets are env vars only: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the publishable key, RLS-bound, safe to expose) and `SUPABASE_SECRET_KEY` (server-only, bypasses RLS, **never** `NEXT_PUBLIC_`). The names here match the Configuration section exactly so the unprefixed form is never miscopied into code (`security.md` §2 calls this the single highest-consequence mistake in the stack). The user creates the project and supplies these; the builder never enters them.
- No monitoring, no compliance program (`security.md` §8): accepted at single-user scale, revisit before other people's data is held.

**Configuration required**
- `NEXT_PUBLIC_SUPABASE_URL`: the project URL (safe to expose).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `sb_publishable_...`): client key, RLS-bound, safe to expose.
- `SUPABASE_SECRET_KEY` (`sb_secret_...`): server-only, bypasses RLS. **Never** `NEXT_PUBLIC_`.
- `DEV_USER_ID`: the fixed development user id standing in for `auth.uid()` until auth lands.
- **Prerequisite:** the user creates a hosted Supabase free-tier project and fills these into `.env.local` (gitignored). The Vault extension is enabled by the migration, not by hand. The builder never enters the keys. *(On hosted Supabase, if `create extension supabase_vault` in a migration is not permitted and Vault must be toggled in the dashboard, the build flags it; the migration remains the source of truth for intent.)*

**Critical test scenarios**
- Round-trip: `saveLinkedItem` then `getAccountsForUser` returns the same account with money intact as minor units. Verifies **AC-7**.
- Vault: `storeAccessToken` returns a secret id; `readAccessToken` returns the original; no table column holds the token. Verifies **AC-5**.
- RLS impersonation: as user A, user B's rows are invisible and inserts for user B are rejected; a holding with own `user_id` but a foreign `account_id` is rejected; as anon, nothing is visible. Verifies **AC-3**, **AC-4**.
- Money type: a `value_minor` written as an integer comes back from `lib/db/` as a `number`, not a string. Verifies **AC-7**.
- Cascade delete: `deleteItem` removes the item, its accounts, its holdings, and the Vault secret; no orphans remain. Verifies **AC-8**.
- Type boundary: an off-list `security_type` is rejected by the enum. Verifies **AC-1**, **AC-2**.

## Build plan

Bottom-up: the schema and RLS come first (task 1, the migration), because nothing else can exist without them; then the client and token storage, then the typed layer, then the proof.

1. Add the Supabase dependencies to `library-docs.md` and install (`@supabase/supabase-js`, `@supabase/ssr`); record the versions. Add the env vars to `.env.example`. Satisfies **AC-6**.
2. Write migration `0001_init.sql` in `supabase/migrations/`: `create extension if not exists supabase_vault`; the enum types (`account_type`, `security_type`, `contribution_source`, `capability`); the five tables with `user_id`, money as `bigint`, `quantity` as `numeric`, `capabilities` as `capability[]`; indexes; and cascade foreign keys. Satisfies **AC-1**, **AC-2**.
3. In `0002_rls.sql`: enable RLS on every table; add the `user_id = auth.uid()` policies for all four operations; and on the child tables (holdings, contribution_events, plan_facts) add the parent-ownership `exists (...)` clause so a foreign `account_id` is rejected. Apply the migration to the hosted project (the Supabase MCP can do this). Satisfies **AC-3**.
4. Build `lib/db/client.ts`: the server-side Supabase client (secret key, server-only) and, if needed, the RLS-bound browser client. Satisfies **AC-6**.
5. Build `lib/db/tokens.ts`: `storeAccessToken` / `readAccessToken` / `deleteAccessToken` over Vault. No token ever returned to the client. Satisfies **AC-5**.
6. Write `0003_delete_item.sql`: a `security definer` Postgres function `delete_item(p_item_id)` that, in one transaction, cascade-deletes the item (accounts and holdings follow via FK) and removes its Vault secret, so the delete cannot half-fail. Build `lib/db/accounts.ts` (and siblings): typed, user-scoped `saveLinkedItem`, `getAccountsForUser`, `getHoldingsForAccount`, and `deleteItem` (one RPC call to `delete_item`), mapping rows to and from `lib/types/` and parsing `bigint` strings to `number`. Satisfies **AC-6**, **AC-8**, **AC-9**.
7. Prove the RLS policy expressions by SQL impersonation (as user A / user B / anon, plus the foreign-`account_id` child case), and prove the round-trip (write then read an item + account + holding + token; assert money comes back as `number`; tear down the rows and secret the check created). These are documented dev-time checks against the live project. Satisfies **AC-3**, **AC-4**, **AC-7**.

## Consequences

**Positive**
- The system can finally hold state: a linked account, its holdings, and its token survive beyond one process. This is the unlock for live data and, later, multiple users.
- Tenancy and token encryption are correct from the first migration, the cheapest moment to get them right; adding either later is the migration nobody wants.
- The typed `lib/db/` layer gives every future feature one scoped, safe way to read and write, so no feature reinvents (or forgets) user scoping.

**Negative and tradeoffs**
- RLS is written and SQL-tested but not yet the runtime gate: with a fixed dev user id and the secret key, the database does not enforce per-user isolation in the app yet. The post-auth architecture is recorded (user-facing queries move to a JWT-bound publishable-key client), so the transition is real rather than decorative, but this slice is explicitly single-user and not multi-user ready.
- The Vault indirection (token in Vault, id on the row) is one more hop and one more failure mode (a dangling secret id if a delete half-fails); the cascade + revoke has to be careful.
- The hosted free tier pauses after about a week idle, so the first request after a lull is slow, and the project is a real remote that can be misconfigured. A local stack would avoid both but adds Docker.
- The aggregator still uses its in-memory stores after this slice; nothing is wired to actually persist a real link yet. That is the next slice, deliberately.

**Neutral**
- `contribution_events` and `plan_facts` tables are created but unused until the match feature; intentional groundwork, commented as such.
- No auth UI is built; the login is a clean, self-contained follow-up.
- The Supabase MCP is used to apply migrations during the build; the migrations themselves are the source of truth in `supabase/migrations/`, not the MCP.

## Follow-up

- [ ] Real Supabase Auth (a login). This moves user-facing reads/writes onto a per-request client built from the session JWT with the publishable key, making RLS the live gate, and reserves the secret key for admin/Vault operations. *(A lighter alternative, considered and deferred: seed one real auth user via the dashboard, no login UI, and use its session JWT server-side so RLS is live from day one. Deferred to keep this slice's wiring minimal; revisit if per-user enforcement is wanted before a real login.)*
- [ ] Revoke the token at Plaid (`/item/remove`, `security.md` §3 rule 5) on unlink, once the aggregator write path is wired. This slice deletes only the local Vault secret.
- [ ] Wire the aggregator to persist through `lib/db/`: replace the in-memory connection and observation stores so a real link is saved and survives a restart (the "live data" slice).
- [ ] Install the `supabase/agent-skills` skill and add Supabase conventions to `AGENTS.md` (via `/sync`).
- [ ] Consider a local Supabase stack for offline dev if the hosted free-tier pausing becomes a friction.
- [ ] Revisit monitoring and a compliance posture before any other person's data is stored (`security.md` §8).
