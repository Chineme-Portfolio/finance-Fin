# 0005. Live data write path: persist a real link through lib/db and read the screen from it

**Date**: 2026-09-10
**Status**: Accepted

## Summary

Today five good parts do not touch each other: the Plaid read spike writes to in memory stores, the "what you own" screen renders a committed fixture, and the `lib/db` persistence layer (spec 0004) exists but nothing in the app writes to it. This slice connects them into one thread. Linking an account now persists its token to Vault and its accounts and holdings to the database, the screen reads that live data instead of the fixture, and a refresh action re fetches and re saves. The Plaid token stops living in a second in memory place: the aggregator is changed to take the token as a parameter, and Vault becomes its single durable home. No new tables and no migration; this is wiring, not schema.

## Requirements

**User stories**

- As the builder, I want a linked account to actually persist (its token, accounts, and holdings) so it survives a server restart instead of vanishing with process memory.
- As the builder, I want the "what you own" screen to read my real linked data instead of a committed fixture, so the app shows the truth.
- As the builder, I want to refresh an already linked account, so I can prove the durable token in Vault can be read back and reused in a real flow, not only in a test.

**Acceptance criteria**

- **AC-1**: Linking a Plaid item (through the dev link surface) persists it through `lib/db`: the access token to Vault, its accounts and holdings as rows, and each account's discovered capabilities, all scoped to the current user. No fixture data is written.
- **AC-2**: The aggregator seam takes the access token explicitly. `fetchAccountData(accessToken)` no longer looks a token up from any store, and `exchangePublicToken` returns the token to server side callers only. The in memory connection store (`connection-store.ts`, the `LinkedConnection` type) is removed. The token's only homes are Vault (durable) and request scoped server memory in transit; it never reaches the client, a log, or disk, including the error and catch paths of the new `lib/sync` layer that holds it longest (`security.md` §3, §6).
- **AC-3**: The "what you own" screen reads live from the database (`getAccountsForUser` + `getHoldingsForAccount`, run through the insight engine), not the committed fixture. The demo 401k capability strip in the view is removed; the missing capability card is driven by real persisted capabilities (`foundation.md` §4 #7, §7 #15).
- **AC-4**: When the current user has no linked account, the screen shows a simple empty state (a prompt to link an account), never a blank screen, a crash, or fixture data.
- **AC-5**: A refresh action re fetches an already linked item using the token read back from Vault (`getItemToken` resolves `token_secret_id`, then `read_token`) and re persists it. This exercises the durable token round trip in a real app flow.
- **AC-6**: Re linking or refreshing an already persisted item does not violate the unique constraints on `plaid_items` or `accounts`: the replace path deletes the existing item (its rows and its Vault secret, via `delete_item`) then writes fresh, so there is no duplicate and no error.
- **AC-7**: Only accounts, holdings, the token, and capabilities are persisted. Transactions and raw observations are not written to the domain tables, `contribution_events` stays empty, and no insight is stored (data minimization, `security.md` §9; `foundation.md` §5, §7 #7).
- **AC-8**: The orchestration lives in a new layer (`lib/sync/`) that composes the aggregator seam and `lib/db`. Neither the aggregator nor `lib/db` imports the other, so the provider seam stays clean (`foundation.md` §7 #8). Server actions call this layer only.
- **AC-9**: End to end proof against the live project: link a sandbox item and confirm the rows and the Vault secret exist and the screen renders them; clear process memory (or restart) and refresh the item, confirming it re fetches via the Vault token and re renders; unlink and confirm the rows and the secret are gone and the screen returns to the empty state.

## Decision

**Chosen option**: Option 2: refactor the aggregator seam to take the token as a parameter, remove the in memory connection store, and add a thin `lib/sync/` orchestration layer above both seams. The screen reads live from `lib/db`.

The token stops living in two places. `exchangePublicToken` hands the token to its server side caller, `fetchAccountData(accessToken)` receives it, and Vault is the one durable home. `lib/sync/` composes the aggregator and `lib/db` (link, refresh, unlink); neither seam imports the other. Re link and refresh use a replace path (delete the old item, then save fresh) built on the existing atomic `delete_item`.

**Implementation skills**: none installed that shape this slice. The Supabase skills informed spec 0004's `lib/db`, which this slice consumes unchanged.

## Rationale

Reasoning, the options weighed, and the migration reality: see [`rationale.md`](rationale.md).

## Feature design

**Data model**: no schema change. This slice uses the spec 0004 tables (`plaid_items`, `accounts`, `holdings`) and Vault exactly as they are. It adds three read functions to `lib/db` (code, not schema), the durable replacements for the deleted in memory connection store:
- `listLinkedItems()`: token free item summaries scoped to the user.
- `getItemByPlaidItemId(plaidItemId)`: resolves the stable Plaid item id to the row's internal fields `{ id, tokenSecretId }`, or null if not linked. This is the missing link the replace path needs: `plaid_items.id` is a fresh `gen_random_uuid()` on every insert, so it is not a handle a caller can hold across a refresh (which deletes and re inserts). Callers hold the stable `plaid_item_id` and resolve to the current internal `id` through this function.
- `getItemToken(plaidItemId)`: built on the resolver above, then calls the existing `read_token` RPC on `tokenSecretId`.

`deleteItem` is unchanged (it takes the internal `plaid_items.id`); the orchestration always resolves the internal id through `getItemByPlaidItemId` first, never passes a Plaid item id to it.

**Seam change** (the heart of the slice):
- `exchangePublicToken(publicToken)` returns a server internal shape that carries the access token (call it `ExchangedItem`: `itemId`, `institutionName`, `linkedAt`, `accessToken`). The client facing `ExchangeResult` stays token free (`{ ok, itemId }`).
- `fetchAccountData(accessToken)` takes the token directly. It no longer reads `connection-store`.
- `connection-store.ts` and the `LinkedConnection` type are deleted. The dev spike's `observeAction` switches to reading the token via `getItemToken`.

**Graceful degradation when a product call fails** (`selectHoldingsShape`, pure): the holdings call can fail at the call level (an error, or `not_ready` because Plaid populates investments after a link). When it does, the account list is still taken from the transactions response (which also carries accounts and securities), and holdings are treated as zero for those accounts. The account is never discarded with the failed call; its real per account capabilities drive the missing capability state (`foundation.md` §7 #15 LOCKED, §4 #7 never a blank). Only when neither call returned an account list is there nothing to persist, and only then does it throw.

**Orchestration** (`lib/sync/`, server only):
- `linkAndPersist(publicToken)`: `exchangePublicToken` → `fetchAccountData(token)` → select the raw payload (`selectHoldingsShape`) → map + capabilities to domain (`mapHoldingsResponseToDomain`) → `saveLinkedItem({ token, accounts, holdings })`. On a re link of an existing `plaid_item_id` (found via `getItemByPlaidItemId`), replace first (`deleteItem(resolved.id)` then save).
- `refreshItem(plaidItemId)`: `getItemByPlaidItemId` → `read_token` on its `tokenSecretId` → `fetchAccountData(token)` → map → replace save (`deleteItem(resolved.id)` then `saveLinkedItem`). The token is read before the delete and held in request memory across the replace.
- `unlinkItem(plaidItemId)`: `getItemByPlaidItemId` → `deleteItem(resolved.id)` (cascade rows + Vault secret).

**API surface** (server actions and lib functions, not HTTP; this slice adds no route):

| Surface | Purpose | Token exposure |
|---|---|---|
| `linkAccountAction(publicToken)` → `{ ok, itemId }` | Link + persist through `lib/sync` | none returned |
| `refreshItemAction(plaidItemId)` → `{ ok }` | Re fetch via Vault token + re persist | none returned |
| `unlinkItemAction(plaidItemId)` → `{ ok }` | Delete item, rows, and Vault secret | none returned |
| `lib/sync.linkAndPersist / refreshItem / unlinkItem` | Server side orchestration | token in server memory only |
| `lib/db.listLinkedItems() / getItemByPlaidItemId() / getItemToken()` | Durable item summaries, id resolver, token read back | `getItemToken` server only |

**Key invariants**
1. The access token has exactly two homes: Vault (durable) and request scoped server memory while a call is in flight. No in memory store, no client return, no log, no disk (AC-2, `security.md` §3, §6). `lib/sync` holds the token longest (across exchange, fetch, map, save), so its catch and error paths log only the item id, never the token or the `ExchangedItem` object, matching the discipline already in `lib/db/tokens.ts`.
2. The aggregator and `lib/db` never import each other; only `lib/sync` (and server actions) know both (AC-8, `foundation.md` §7 #8).
3. Only engine consumed fields are persisted: accounts, holdings, token, capabilities. No transactions, no raw payloads, no insight (AC-7, `security.md` §9).
4. The screen computes no financial figure; every number still comes from an Insight or a named `lib/` helper, now over live rows (`foundation.md` §4 #1). Its only data source is `lib/db`, never a fixture (AC-3).
5. Re link and refresh are idempotent by replace: one item id yields one item, its rows, and one Vault secret (AC-6).

**Security model**: unchanged from spec 0004 and still deferred auth. The server uses the secret key (which bypasses row level security) and stamps the fixed `DEV_USER_ID`; RLS is written and proven but is not the runtime gate until real auth lands (spec 0004 Follow-up). This slice does not widen that: it moves the token from in memory to Vault (a tightening), returns no token to any client, and adds no new secret. Institution name is not yet fetched from Plaid; it persists as null or "unknown" for now (Follow-up).

**Configuration required**: none new. Uses the spec 0004 env vars (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `DEV_USER_ID`) and the spec 0001 Plaid vars already in `.env.local`.

**Critical test scenarios** (each maps to an AC in Requirements)
- Happy path: link a sandbox item, the token lands in Vault and accounts + holdings land as rows, the screen renders them. Verifies **AC-1**, **AC-3**.
- Durable token: clear process memory, refresh the item, it re fetches using the Vault token and re renders. Verifies **AC-5**.
- Idempotency: refresh twice, no duplicate rows and no unique constraint error. Verifies **AC-6**.
- Empty state: a user with no linked item sees the link prompt, not a blank or the fixture. Verifies **AC-4**.
- Token containment: no client facing result and no log carries the token, including a forced failure inside `lib/sync` (the error path logs the item id only). Verifies **AC-2**.
- Degraded capability: when the holdings call fails but transactions returned the account list, the account still persists (balance only, driven by real capabilities), rather than the whole link being dropped. Verifies **AC-3**, **AC-7** (unit tested in `lib/sync/payload.test.ts`).
- Unlink: after unlink the rows and the Vault secret are gone and the screen returns to empty. Verifies **AC-9**.

## Build plan

Tracer Bullet: stand up the thin end to end thread (link → persist → read → render), then thicken with refresh and unlink.

1. Add `listLinkedItems()`, `getItemByPlaidItemId(plaidItemId)`, and `getItemToken(plaidItemId)` to `lib/db` (the durable replacements for the in memory connection store, plus the id resolver the replace path needs). Satisfies **AC-2**, **AC-5**, **AC-6**.
2. Refactor the aggregator seam: `fetchAccountData(accessToken)`, `exchangePublicToken` returns the server internal `ExchangedItem` with the token, delete `connection-store.ts` + `LinkedConnection`, and update every caller of the deleted store. `observeAction` switches to `getItemToken`. Note `exchangePublicToken`'s return only widens (still has `itemId`), so callers of it do NOT fail to compile: `exchangePublicTokenAction`, and through it `sandboxLinkAction` / `sandboxLinkFormAction`, must be moved to the persist path by hand (task 4), not assumed caught by the type checker. Replace the deleted `listConnections` re export (used by `connectionsAction` and the dev spike page) with `listLinkedItems()`. Satisfies **AC-2**.
3. Add `lib/sync/`: `linkAndPersist`, `refreshItem`, `unlinkItem`, composing the aggregator and `lib/db` with the replace path (resolving the internal id via `getItemByPlaidItemId` before any `deleteItem`). Error paths log only the item id, never the token or the `ExchangedItem`. Satisfies **AC-1**, **AC-5**, **AC-6**, **AC-7**, **AC-8**.
4. Add the server actions (`linkAccountAction`, `refreshItemAction`, `unlinkItemAction`), keep client facing results token free, and wire the dev link surface (the `PlaidLinkButton` path AND the `sandboxLinkAction` shim used by AC-9's proof) to `linkAndPersist`. Satisfies **AC-1**, **AC-5**.
5. Replace the screen's fixture loader with a live loader (`getAccountsForUser` + `getHoldingsForAccount` → engine), remove the 401k demo strip, add the empty state. The dev spike page's own listing switches to `listLinkedItems()`. Satisfies **AC-3**, **AC-4**.
6. Prove the thread end to end against the live project: link, refresh after clearing memory, unlink, checking rows, the Vault secret, and the rendered screen at each step. Satisfies **AC-9**.

## Consequences

**Positive**
- The system finally holds real state end to end: a link, its holdings, and its token survive a restart, and the screen shows the truth.
- The token gets safer, not just persistent: one durable home (Vault), no second in memory copy, and the seam no longer hides a token lookup.
- Every downstream flow (match, ask Fin) now has a live source to read, not a fixture.

**Negative and tradeoffs**
- The aggregator seam changes shape, and the disposable spike surface must be updated with it. Acceptable: the spike is dev only and the change is a strict simplification.
- The replace path on refresh has a small window where the old item is deleted and the new save could fail. Because `deleteItem` also drops the Vault secret, what is lost is not just the derived rows but the durable token itself, even though it was still valid at Plaid and sitting safely in request memory moments before; recovery is a re link. Accepted for a manual, re runnable action at single user scale; `saveLinkedItem`'s own cleanup already prevents a half saved item. (An in place upsert that kept the secret would avoid this window, and is the noted alternative if refresh ever runs unattended.)
- Every fetch now reads the token from Vault rather than memory (one extra round trip on refresh). Negligible at this scale, and the correctness win is worth it.

**Neutral**
- No schema change and no new env var; purely code wiring on top of spec 0004.
- Still single user and deferred auth; this slice neither adds nor removes that (spec 0004 owns it).
- The committed fixture and its view loader are no longer on the render path; kept only for the view model unit test.

## Follow-up

- [ ] Fetch and persist the real institution name from Plaid (`institutionsGetById`) instead of "unknown".
- [ ] Revoke the token at Plaid (`/item/remove`) on unlink, once that call is added (carried over from spec 0004; this slice still deletes only the local Vault secret).
- [ ] Real Supabase Auth, which makes RLS the live runtime gate and scopes these flows to a logged in user instead of `DEV_USER_ID` (spec 0004 Follow-up).
- [ ] A real link surface in the product UI (this slice reuses the dev spike surface; UI is deferred by preference).

## Migration plan

**Strategy**: direct replace, no data migration. There is no schema change and no live data to transform (single local user, sandbox only). The code change (new seam signature, deleted connection store, new `lib/sync`) is a strict simplification and is revertible by reverting the one commit.
**Phases**:
1. Land `lib/db` reads + the seam refactor + `lib/sync` + actions + the live loader together (they are interdependent; a partial land would not build).
2. Verify end to end against the live project, then commit.
**Rollback**: revert the commit; the app returns to the fixture backed screen and the in memory spike. Vault and the spec 0004 tables are untouched by a revert.
**Risks**: the seam change touches the spike surface; if any caller of the old `fetchAccountData(itemId)` or `connection-store` is missed, the build fails loudly (strict TypeScript), which is the safe direction.
