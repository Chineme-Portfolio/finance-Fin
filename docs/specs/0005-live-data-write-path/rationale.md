# 0005 Live data write path, rationale

Decision record for [`index.md`](index.md). Reasoning, the options weighed, the migration reality. `/develop` skips this file.

## Context

Spec 0001 built a Plaid read spike that deliberately holds everything in server memory: an in memory connection store keeps the access token keyed by item id, and an in memory observation store keeps the last fetched payload. Spec 0001 chose that on purpose, no database, because the observation was read once by a human and written up, so persisting real financial data bought nothing and keeping a long lived token off disk was safer.

Spec 0002 built the insight engine and spec 0003 built the "what you own" screen, but the screen reads a committed fixture (a real captured Plaid response) run through the engine, with a hard coded hack that strips the 401k's holdings capability to demonstrate the missing capability state. Spec 0004 then built the real persistence layer: `lib/db` with `saveLinkedItem`, `getAccountsForUser`, `getHoldingsForAccount`, `deleteItem`, and Vault backed token storage, with row level security and a proven round trip. But nothing in the running app calls `lib/db`. The link flow still writes to memory, and the screen still reads the fixture.

So the parts are all built and all disconnected. The forces: the token is the crown jewel (`security.md` §3) and currently lives in a second place (in memory) as well as, after this slice, Vault; the aggregator seam must stay provider neutral and must not learn about our database (`foundation.md` §7 #8); the screen must never compute a financial figure and must never show fake data as real; and auth is still deferred, so the durable token read back path has never actually run outside a test. The cost of not doing this: the product cannot hold state, and the match feature (the headline) cannot be built, because it needs real persisted contribution history that only a live write path can produce.

## The token re read problem

The load bearing detail: `fetchAccountData(itemId)` resolves the token from the in memory connection store internally. After a restart that store is empty, so once the token is durable in Vault, something has to get it back to the aggregator. That is the fork the options below turn on.

## Options considered

### Option 1: Rehydrate the in memory cache from Vault, keep the seam unchanged

Keep `fetchAccountData(itemId)` and the connection store as they are, but when the store misses (after a restart), read the token from Vault and repopulate the store, then call `fetchAccountData(itemId)` as before. The in memory store becomes a cache over the Vault source of truth.

**Pros**
- Smallest change to the aggregator; the seam signature and the spike keep working untouched.
- No change to existing callers.

**Cons**
- The token now lives in two places at once (Vault and the in memory cache), which is exactly the duplication `security.md` §3 wants to avoid for a standing credential.
- The seam keeps a hidden token lookup with a hidden dependency on a store, which is the design smell that made the re read confusing in the first place.
- Cache invalidation becomes a real question (when is the cached token stale, e.g. after an unlink?).

### Option 2: Refactor the seam to take the token, remove the in memory store (chosen)

Change `fetchAccountData(accessToken)` to receive the token, have `exchangePublicToken` return the token to its server side caller, delete the connection store, and add a `lib/sync/` layer that reads the durable token from Vault and passes it in. Vault is the single durable home.

**Pros**
- One durable home for the token (Vault); no second in memory copy to reason about or invalidate.
- The seam is honest: it takes exactly what it needs (the token) and hides no store lookup.
- `lib/sync/` gives a clean composition point for link, refresh, and unlink, keeping the aggregator and `lib/db` unaware of each other.

**Cons**
- Changes the provider facing interface and forces the disposable spike surface to be updated with it.
- Every refresh reads the token from Vault (one extra round trip) rather than from memory.

## Rationale

Option 2, because the token is the crown jewel and the strongest force in Context is `security.md` §3: a standing credential should have one durable home, not a durable home plus a live in memory duplicate whose staleness (after unlink, after re link) becomes a second thing to get right. Option 1 is less code today but keeps the exact duplication and the hidden lookup that make the token harder to reason about, and it adds a cache invalidation question we would rather not own.

The seam change is the honest version of the same wiring: `fetchAccountData` should take the token it uses, not reach into a store for it, which also removes the aggregator's only stateful dependency and leaves it a pure function of its inputs. The extra Vault read on refresh is negligible at single user scale and is the price of the simpler token story. The spike surface has to move with the seam, but the spike is dev only and disposable (spec 0001), and the change only ever removes state, never adds it.

The replace path for re link and refresh (delete then save, built on the existing atomic `delete_item`) is chosen over an in place upsert because the delete plus save path already exists and is tested, an upsert would be new `lib/db` code with on conflict handling, and at single user scale the small delete then save window is acceptable and re runnable. `saveLinkedItem` already cleans up a half saved item, so the only exposed failure is "item unsaved, re link," not "orphaned rows."

## Migration reality

There is no data migration: no schema change, and no live data to transform (single local user, sandbox only). The change is code shaped, a strict simplification (a deleted module, a narrower seam, a new orchestration layer), and revertible by reverting one commit. Strict TypeScript makes a missed caller of the old seam a loud build failure rather than a silent runtime bug, so the replace is safe to do directly rather than behind a flag. The full phased plan and rollback are in `index.md` under `## Migration plan`.

## References

Grounded in the project's own specs and context: spec 0001 (the in memory spike and its token stance), spec 0004 (the `lib/db` layer and Vault this slice consumes), `foundation.md` §4 #1 (no arithmetic outside the engine), §7 #8 (the provider seam), §7 #15 (per account capabilities), §7 #7 (insights never stored), and `security.md` §3, §6, §9 (the token, logging, minimization).
