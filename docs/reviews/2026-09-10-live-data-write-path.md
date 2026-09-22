# Review, master (uncommitted), 2026-09-10

**Reviewed by**: Claude Sonnet 5 (author on Claude Opus)
**Scope**: 10 files, uncommitted vs HEAD (master)
**Verdict**: Blocked

## Summary

Spec 0005 wires the previously-disconnected pieces (Plaid spike, `lib/db`, the "what you own" screen) into one real write path, and does it cleanly on the axes that matter most here: token handling is honest (Vault is now the single durable home, `connection-store.ts` and `LinkedConnection` are fully gone, no reference to either remains anywhere in the tree), the aggregator/`lib/db` seam isolation holds (verified by grep — neither imports the other), and data minimization is respected (only accounts, holdings, capabilities, and the token are persisted; transactions and raw payloads never reach `saveLinkedItem`). The one serious problem is in `lib/sync`'s replace/persist logic: it silently discards an entire link or refresh — accounts, balances, and the just-created Plaid Item — whenever the whole-item holdings call errors or comes back `not_ready`, even though the aggregator already computed valid per-account capabilities and even though `investmentsTransactionsGet` may have succeeded with the account list. That is precisely the failure mode the project's own capability-tier model (`foundation.md` §7 #15) exists to survive gracefully, and it's untested. Test coverage for all three new/changed server-side files (`lib/sync`, `lib/db/items.ts`, `loadWhatYouOwnLive`) is currently zero.

## Blockers

### 🔴 `persist()` discards the whole link/refresh when the holdings call fails, even when accounts are recoverable, `lib/sync/index.ts:32-42` and `:55`

**Problem**: `asHoldingsResponse` (called at the top of `persist`, `lib/sync/index.ts:55`) throws unless `result.rawHoldings` is a plain object with `accounts`/`holdings`/`securities` arrays. But `fetchAccountData` (`lib/aggregator/plaid/index.ts:214-220`) sets `rawHoldings: holdings.kind === "ok" ? holdings.value : { failed: holdings }` — so *any* whole-item `investmentsHoldingsGet` failure or `not_ready` (not a per-account gap, a call-level one) makes `rawHoldings` take the `{ failed }` shape, which `asHoldingsResponse` rejects. When that happens, `persist()` throws before it ever calls `getItemByPlaidItemId`/`deleteItem`/`saveLinkedItem` — so *nothing* is persisted: not the accounts, not the balances, not the token, not even the fact that a Plaid Item now exists (it was already created via `exchangePublicTokenAction`, but we never record it, so re-running Link is the only recovery and can create a duplicate Item at Plaid).

This is not a hypothetical: `investmentsHoldingsGet` returning `PRODUCT_NOT_READY` for the whole Item shortly after Link is common enough that the aggregator already has a 4-attempt/~10s backoff specifically for it (`lib/aggregator/plaid/index.ts:20-26,57-76`). If the product is still not ready after that window, or the call errors for any other reason, `holdings.kind` is `"not_ready"`/`"error"`, `rawHoldings` becomes `{ failed }`, and the entire item is dropped — even in the case where `investmentsTransactionsGet` succeeded and gave us a full account list with balances (`transactions.value.accounts`, `lib/aggregator/plaid/index.ts:176-178`), and even though `fetchAccountData` already produced a correct `capabilities` array marking `holdings: { status: "error" | "not_ready" }` per account for exactly this situation.

To be precise about what *does* work: the fixture-confirmed Northwind/the recordkeeper 401k case (`foundation.md` §11, `fixtures/holdings-ymw6pgkb.json`) is fine, because Plaid's real behavior there is a 200 response that includes the 401k in `accounts` with simply no matching `holdings` rows — `holdings.kind` is `"ok"`, so `asHoldingsResponse` succeeds. The bug is specifically the whole-item error/not-ready case, which the review brief flagged as the thing to check, and which the code does not handle.

**Why it matters**: This is the exact scenario `foundation.md` §7 #15 (a **[LOCKED]** decision) exists to make survivable: "Assuming uniform data depth — produces blank screens, false zeros, and features that silently do nothing" is called out as the wrong alternative. Here, a transient/slow holdings product doesn't produce a degraded-but-present account (which AC-3 and the missing-capability card are built for) — it produces *no account at all*, silently (from the DB's point of view) discarding a link the user just completed, including a Plaid Item that now exists un-tracked. On a real (non-sandbox) institution, where investments products can take longer than ~10 seconds to populate after Link, this could make the primary happy path (AC-9's own end-to-end proof: "link a sandbox item... confirm the rows... exist") fail nondeterministically depending on Plaid's timing.

**Suggested fix**: In `persist()`, don't gate the whole operation on `rawHoldings` being well-formed. Derive the account list the same way `fetchAccountData` already does internally (prefer `rawHoldings.accounts`, fall back to `rawTransactions.accounts`, i.e. read `result.rawTransactions` too), and treat a call-level holdings failure as "zero holdings for every account this call covers," not as "abort." `result.capabilities` already carries the right per-account `holdings` status to drive the missing-capability card once the account is persisted — the fix is to stop throwing away the account along with the failed call.

## Major

### 🟠 No test coverage for the new write path: `lib/sync/index.ts`, `lib/db/items.ts`, and `loadWhatYouOwnLive`

**Problem**: `lib/sync/index.ts` (new) and `lib/db/items.ts` (new) have no corresponding test file, and `lib/view/what-you-own.ts`'s new `loadWhatYouOwnLive` — now the screen's actual render path (`app/page.tsx`) — is untested; the existing `what-you-own.test.ts` only covers the old fixture-backed `loadWhatYouOwn`, which the file's own comment says "is no longer on the render path."

**Why it matters**: `lib/sync` is where the project's own doc says the token "is held... longest" and where the replace-path (delete-then-save) and the capability-degradation logic live — i.e. exactly the branching, error-handling, and security-relevant code the review guide calls out as warranting a Major when untested. It's also precisely the file with the Blocker above: a test exercising a `not_ready`/`error` holdings outcome (easy to construct — `AccountDataResult.rawHoldings = { failed: ... }` with a populated `rawTransactions`) would have caught it directly. The existing `lib/db/roundtrip.test.ts` shows the project's own pattern for this (a `describe.skipIf(!hasCreds)` integration test against live Supabase) — `lib/sync`'s link/refresh/unlink flow and `lib/db/items.ts`'s resolver fit that same pattern and currently have none of it.

**Suggested fix**: Add a `lib/sync/index.test.ts` following the `roundtrip.test.ts` pattern (real `lib/db`, a stubbed/injected aggregator result) covering: the holdings-error-but-transactions-ok case (the Blocker above), the replace path leaving exactly one item/account set after two `linkAndPersist` calls with the same `plaidItemId` (AC-6), and `unlinkItem` on an already-gone item being a no-op. Add a small unit test for `loadWhatYouOwnLive`'s account filtering (or extend the existing suite to also drive the live path with a stub `getAccountsForUser`/`getHoldingsForAccount`).

## Minor

### 🟡 Refresh/unlink form actions swallow failures silently, `app/actions.ts:97-104`

**Problem**: `refreshItemFormAction` and `unlinkItemFormAction` call `refreshItemAction`/`unlinkItemAction` and discard the returned `ActionResult` entirely — no `ok: false` case is surfaced anywhere. Contrast with `PlaidLinkButton` (`lib/aggregator/plaid/link-button.tsx:38-41`), which does render `result.message` on a failed exchange.

**Why it matters**: Now that refresh/unlink are real, stateful DB operations rather than in-memory ones, a failure (including the Blocker above, which can now legitimately fire on refresh) is indistinguishable from success in the dev page: the page just doesn't change, with no indication anything went wrong. This is a dev-only surface ("Local only. Never deploy this") and mirrors the pre-existing `sandboxLinkFormAction` pattern, so it's not urgent, but it works against AC-9's own end-to-end proof, which needs to see failures, not just successes.

**Suggested fix**: Have the two form actions call through to the underlying action and pass the `message` somewhere visible (even a `console.error`-free query param or a `saveObservation`-style side channel the page already reads), or accept the gap explicitly as scoped to manual server-log inspection during the AC-9 proof.

### 🟡 Redundant `getItemByPlaidItemId` lookup on refresh, `lib/sync/index.ts:64` and `:89`

**Problem**: `refreshItem` resolves `existing = await getItemByPlaidItemId(plaidItemId)` at line 89 to read the token, then calls `persist(plaidItemId, ...)`, which immediately resolves the *same* `plaidItemId` again via its own `getItemByPlaidItemId` call at line 64.

**Why it matters**: Harmless correctness-wise (idempotent lookup), but it's an extra round trip on every refresh, and the duplication makes it easy for the two call sites to drift if one is ever changed (e.g. to pass the already-resolved internal id) without the other.

**Suggested fix**: Thread the already-resolved `{ id, tokenSecretId }` through to `persist` (or a small internal helper) instead of re-resolving by `plaidItemId` inside it.

## Nits

- ⚪ `lib/sync/index.ts:56-57`, the cast `raw as Parameters<typeof mapHoldingsResponseToDomain>[0]` widens `unknown[]`-typed fields straight into the strongly-typed `RawAccount[]`/`RawHolding[]`/`RawSecurity[]` shapes without validating element contents (only array-ness is checked in `asHoldingsResponse`) — a "parse at the boundary" gap (code-standards §2). It mirrors a pre-existing cast in `lib/view/what-you-own.ts`'s fixture loader, so it's not a new pattern, but this file is now on the live-data path rather than a committed fixture.
- ⚪ `lib/sync/index.ts:93-94`, `refreshItem` always re-persists `institutionName: "unknown"`, overwriting whatever was there before (already tracked as a spec Follow-up, not new).

## Strengths

- Token discipline is exactly what the spec asked for: `connection-store.ts`/`LinkedConnection` are fully removed (verified — zero remaining references anywhere in the tree), the token's only homes are now Vault and request-scoped locals in `lib/sync`, and no error path anywhere in the diff (`app/actions.ts`'s `message()` helper, `lib/db/tokens.ts`, `lib/sync`) constructs a message that could embed the token — they consistently carry only item ids and provider/Supabase error text.
- Seam isolation is real, not just asserted: a grep across `lib/aggregator/` and `lib/db/` confirms neither imports the other; `lib/sync` is the only layer that knows both, matching `foundation.md` §7 #8 / AC-8.
- The `saveLinkedItem` holding-to-account matching (by `plaid_account_id`, not array index) plus `persist()`'s `plaidAccountId = a.id` correctly round-trips the domain account id back to the Plaid account id — a subtle spot that would silently mis-attribute holdings if done by position instead.
- The empty state (`app/page.tsx`'s `EmptyState`) and the live loader's capability-driven filtering (`loadWhatYouOwnLive`) correctly avoid ever rendering a blank or a fake number when there's no linked account, per foundation.md §4 #7.

## Test coverage

`npx tsc --noEmit` and the full `vitest` suite (35 tests, 7 files) both pass clean, but that reflects the *unchanged* code paths only — none of the new files (`lib/sync/index.ts`, `lib/db/items.ts`) or the new live loader (`loadWhatYouOwnLive`) are exercised by any test, existing or new. See the Major finding above for what's missing and why it matters here specifically (it would have caught the Blocker).
