# Verify: persist contribution events · spec 0006 · updated 2026-09-10

_Steps derived from spec 0006 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones. Targets: the Plaid sandbox and the live Supabase project (`vnvfjxlojjjxhluoqyzc`), `.env.local` holds the keys._

_Important: the sandbox may return few or no true `contribution` / `deposit` transactions, so a live link can legitimately produce zero `contribution_events` rows. That is not a failure. The deterministic proof of the mapping is the unit test (`lib/aggregator/plaid/map.test.ts`) and the round trip (`lib/db/roundtrip.test.ts`); the live run proves the path integrates and does not regress the write path._

## Commands (deterministic, the real proof)

- [ ] `npx vitest run` green. The mapper tests pass: a contribution and a deposit are kept; a buy, sell, dividend, fee, and bare transfer are dropped; a provider negative amount is normalized to a positive magnitude; every event has `source = 'unknown'`. → AC-1, AC-2
- [ ] Same run: the guarded round trip saves a contribution event through `saveLinkedItem` and reads it back through `getContributionEventsForAccount` with `amountMinor` a `number` and `source = 'unknown'`, then confirms it is gone after `deleteItem` (cascade). → AC-5, AC-6
- [ ] `npx tsc --noEmit` and `npx eslint` clean; grep confirms `lib/sync` and `lib/db` import no Plaid type (the provider semantics live only in `lib/aggregator/plaid/`). → AC-4
- [ ] `npx next build` succeeds.

## UI / manual + database (live integration)

- [ ] Link a sandbox item on `/dev/plaid-spike`. The write path runs without error. Query `contribution_events` against the live project: any rows present are scoped to the user, carry `source = 'unknown'`, a positive `amount_minor`, an ISO `date`, and a `raw_name`. (Zero rows is acceptable if the sandbox returned no contribution or deposit transactions.) → AC-1, AC-2, AC-3
- [ ] If rows are present: confirm they came only from contribution or deposit transactions, not buys, sells, dividends, fees, or transfers. → AC-2
- [ ] Refresh the item twice. `contribution_events` for the item is rebuilt, not duplicated: the row count is stable and there is no unique or foreign key error. → AC-5
- [ ] Unlink the item. Its `contribution_events` rows are gone (cascade with the account). → AC-5
- [ ] Confirm the slice makes no user facing match or absence claim: nothing on the "what you own" screen or elsewhere asserts a match from these rows (groundwork only). → AC-7

## Acceptance-criteria coverage

- AC-1 covered by the mapper test (source unknown, positive magnitude) and the DB rows query.
- AC-2 covered by the mapper filter test (contribution/deposit in, others out) and the contribution only DB check.
- AC-3 covered by the live link step (rows exist for accounts with the transactions capability).
- AC-4 covered by the import grep and the build.
- AC-5 covered by the round trip cascade assertion and the refresh twice / unlink steps.
- AC-6 covered by the round trip typed read back.
- AC-7 covered by the no user facing claim check and the provisional framing in the spec.
