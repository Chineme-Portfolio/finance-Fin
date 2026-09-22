# 0006. Persist contribution events: the raw deposits the match feature will reason over

**Date**: 2026-09-10
**Status**: Accepted

## Summary

The write path (spec 0005) persists accounts, holdings, and the token, but not the deposits that flow into a retirement account. This slice adds that: when an account is linked or refreshed, its cash contribution deposits (the money paid in) are mapped from the provider's investment transactions and saved into the `contribution_events` table, scoped to the user. Each row is stored raw, with `source = 'unknown'`; deciding whether a deposit is an employee contribution or an employer match is an inference, so it is deferred to the pure match engine (a later slice), never done or stored here (foundation §7 #7, §7 #16). No schema change. This is groundwork for the headline match feature, not a user facing claim yet.

## Context

Reasoning, the options weighed, and the real data tension: see [`rationale.md`](rationale.md).

## Requirements

**User stories**

- As the builder, I want a linked account's contribution deposits persisted, so the match feature has real dated history to run its differential over instead of nothing.
- As the builder, I want those deposits stored as raw facts with no employee vs match label, so a future classification change never means re migrating stored inferences (foundation §7 #7).
- As the builder, I want the deposits rebuilt cleanly on every refresh, so re running never duplicates or strands rows.

**Acceptance criteria**

- **AC-1**: Linking or refreshing an account persists its cash contribution deposits into `contribution_events`, scoped to the current user. Each row carries `source = 'unknown'`, `raw_name` = the provider's transaction description, `amount_minor` as a **positive** integer minor unit (the magnitude paid in, normalized regardless of the provider's own sign convention), an ISO `date`, and the account's `currency`. No deferral vs match classification is computed or stored (foundation §7 #7, §7 #16 LOCKED).
- **AC-2**: Only unambiguous cash contributions and deposits INTO the account become rows, selected by the provider's transaction type and subtype (`contribution`, `deposit`). Buys, sells, dividends, fees, and outflows are not persisted. A bare `transfer` (whose direction the provider encodes only in the amount sign, not the subtype) is **excluded** for now rather than risk persisting a transfer out as a contribution; this is part of the provisional filter (AC-7) and revisited against real data (data minimization, `security.md` §7).
- **AC-3**: Rows are persisted for every account whose `transactions` capability returned data, not only `401k` accounts.
- **AC-4**: The provider transaction semantics (which types and subtypes count as a contribution) live only in the Plaid adapter (`lib/aggregator/plaid/`). `lib/sync` and `lib/db` never learn a Plaid transaction shape (foundation §7 #8).
- **AC-5**: Refresh or re link rebuilds the rows without duplication: the replace path (`delete_item` cascades `contribution_events` via the foreign key) clears the old rows, then the fresh set is inserted. Re running yields the same set, no duplicates, no unique or foreign key error.
- **AC-6**: Round trip proof: a persisted contribution event reads back through `lib/db` as a `ContributionEvent` domain object with `amountMinor` typed as a `number` (the `bigint` is parsed, not a string), and correct `date`, `currency`, `rawName`, and `source = 'unknown'`.
- **AC-7**: The contribution filter is documented as provisional, pending the real 401k observation (spec 0001 task 9). This slice makes no user facing match or absence claim from the data; it is groundwork only (foundation §7 #16).

## Decision

**Chosen option**: Option 2: extend the existing write path to also persist contribution deposits, storing them raw with `source = 'unknown'` and deferring all classification to the pure engine.

The Plaid adapter gains a pure mapper that filters the observed investment transactions down to cash contributions and returns domain `ContributionEvent` objects. `lib/sync` passes them into an extended `saveLinkedItem`, which inserts them alongside accounts and holdings, keyed to the same account rows. The replace path already cascades `contribution_events` on `delete_item`, so refresh and re link rebuild them for free. Nothing classifies a deposit as employee or match; that is the deferred match engine's job.

**Implementation skills**: none installed that shape this slice.

## Rationale

Reasoning and the options weighed: see [`rationale.md`](rationale.md).

## Feature design

**Data model**: no schema change. Uses the spec 0004 `contribution_events` table as is (`id`, `user_id`, `account_id` foreign key with cascade, `date`, `amount_minor` bigint, `currency`, `source` enum default `'unknown'`, `raw_name`). The `ContributionEvent` domain type in `lib/types/domain.ts` already matches this shape and already documents `source = 'unknown'` as the honest default. This slice writes only `'unknown'`.

**The mapping** (`lib/aggregator/plaid/map.ts`, pure, exported through the aggregator barrel):
- `toContributionEvents(transactions: ObservedTransaction[]): ContributionEvent[]`: filter the observed investment transactions to unambiguous cash contributions and deposits into the account (the provider's `contribution` and `deposit` type and subtype), and map each to a `ContributionEvent` with `accountId` = the transaction's account id (the Plaid account id, the same id holdings key on), `source: "unknown"`, `rawName` = the transaction name, `date` passed through, `currency` passed through, and `amountMinor` = the **positive magnitude** of the amount. The provider's sign convention for cash entering vs leaving an investment account is easy to invert, so the mapper normalizes to a positive minor unit (the money paid in) rather than passing the raw sign through; a downstream sum must never be polarity confused. A bare `transfer` is excluded (its direction is in the sign, not the subtype). The exact provider type and subtype set, and the sign handling, are validated against the sandbox and flagged provisional (see the real data tension in `rationale.md`).
- Keeping this in the Plaid adapter is the point: `lib/sync` and `lib/db` see only domain `ContributionEvent` objects and never a Plaid transaction field (foundation §7 #8).

**Persistence** (`lib/db`):
- Extend `saveLinkedItem` to accept `contributionEvents: ContributionEvent[]` and insert them after accounts, mapping each event's `accountId` to the saved account's database id the same way holdings are mapped (by `plaid_account_id`). Events for an account with no saved row are a bug and throw, matching the holdings guard.
- Add `getContributionEventsForAccount(accountId): Promise<ContributionEvent[]>` (the read side, `bigint` parsed to `number`), so the persistence is provably round trippable and ready for the engine.

**Orchestration** (`lib/sync`):
- In `persist`, after the accounts and holdings are mapped, map `result.transactions` (the aggregator already fetches a 24 month window) to contribution events via the adapter mapper, and pass them to `saveLinkedItem`. The `transactions` capability already gates which accounts returned transaction data; events only exist for those accounts.

**Key invariants**
1. `contribution_events` holds only raw observed facts: date, amount, currency, provider description, and `source = 'unknown'`. No classification, no inference, no insight is ever stored (AC-1; foundation §7 #7, §7 #16).
2. Provider transaction semantics live only in `lib/aggregator/plaid/`; nothing above the adapter learns them (AC-4, foundation §7 #8).
3. Only contribution inflows are persisted; other transaction kinds are dropped at the mapper (AC-2, `security.md` §7).
4. Money is `bigint` minor units in the table and comes back as a `number` through `lib/db` (AC-6). Dates are ISO date strings.
5. Contribution events belong to an item through their account; `delete_item` cascades them, so the replace path rebuilds them with no duplication (AC-5).

**Security model**: unchanged from spec 0004 and 0005. Still deferred auth (secret key plus fixed `DEV_USER_ID`, RLS written and proven but not the runtime gate yet). `contribution_events` RLS policies (spec 0004) already require parent account ownership. This slice stores less inference, not more: raw deposits only, no derived label. Data minimization holds: only contribution inflows are kept, and only the fields the match engine will read.

**Configuration required**: none new.

**Critical test scenarios** (each maps to an AC)
- Mapper filter: a fixture transaction list with a contribution, a deposit, a buy, a sell, a dividend, a fee, and a bare transfer yields exactly the contribution and the deposit as `ContributionEvent`s (`source = 'unknown'`); the transfer, buy, sell, dividend, and fee are dropped. Verifies **AC-2**, **AC-1**.
- Sign normalization: a contribution the provider reports with a negative amount (cash credited) is stored as a positive `amountMinor` magnitude. Verifies **AC-1**.
- Adapter isolation: `lib/sync` and `lib/db` import no Plaid type; the mapper is the only place the provider subtypes appear. Verifies **AC-4**.
- Round trip: a contribution event saved through `saveLinkedItem` reads back through `getContributionEventsForAccount` with `amountMinor` a `number` and `source = 'unknown'`. Verifies **AC-6**.
- Idempotency: two links or a refresh of the same item leave exactly one set of contribution events, no duplicates. Verifies **AC-5**.
- Account scope: an account with the `transactions` capability gets events; one without does not. Verifies **AC-3**.

## Build plan

Tracer Bullet: the thin thread is map to domain, persist in the existing write path, read back, prove it.

1. Add `toContributionEvents` to `lib/aggregator/plaid/map.ts` (filter to `contribution` and `deposit` type/subtype, exclude bare `transfer`, map to `ContributionEvent` with `source: "unknown"` and a positive `amountMinor` magnitude), export it through the aggregator barrel. Satisfies **AC-1**, **AC-2**, **AC-4**.
2. Extend `lib/db` `saveLinkedItem` to insert `contributionEvents` (keyed to accounts by `plaid_account_id`, like holdings), and add `getContributionEventsForAccount` (bigint parsed to number). Satisfies **AC-1**, **AC-5**, **AC-6**.
3. Wire `lib/sync` `persist` to map `result.transactions` through the adapter mapper and pass the events to `saveLinkedItem`. Satisfies **AC-1**, **AC-3**, **AC-5**.
4. Add a unit test for the mapper (contribution and deposit in; buy, sell, dividend, fee, and bare transfer out; `source = 'unknown'`; a negative provider amount normalized to a positive magnitude) and extend the guarded round trip to save and read back a contribution event typed as `number`. Satisfies **AC-2**, **AC-6**.
5. Live verify: link a sandbox item, confirm any contribution inflows persisted as rows with the right fields and `source = 'unknown'`, refresh with no duplication, unlink clears them; document the filter as provisional. Satisfies **AC-3**, **AC-5**, **AC-7**.

## Consequences

**Positive**
- The match feature finally has a real, dated deposit history to run its differential over, the missing input that blocked F3 and F8.
- The deposits are stored as raw facts, so the eventual classification (employee vs match) can change without a data migration; nothing stored is an inference.
- It rides the existing write path and replace logic, so refresh and unlink already handle it correctly for free.

**Negative and tradeoffs**
- The contribution filter is a best guess against sandbox shapes; the real Northwind 401k contribution shape is still unobserved (spec 0001 task 9). The filter may need to change once real data is seen, which is why nothing user facing depends on it yet.
- The sandbox may return few or no true contribution transactions, so the live proof can show zero rows; the deterministic proof of the mapping is the unit test, not the sandbox.
- One more thing the write path fetches and maps, a little more work per link, though the transactions were already being fetched.

**Neutral**
- `contribution_events` was defined but unused since spec 0004; this slice fills it. `plan_facts` stays unused until the plan formula slice.
- No insight reads these rows yet; the match differential (a later slice) is the first reader, and it is where real data validation gates a user facing claim.

## Follow-up

- [ ] Observe the real Northwind 401k transaction history (spec 0001 task 9) and revisit the contribution filter and the `source` classification against it, before the match differential trusts them.
- [ ] Build the match differential engine (F3) that reads `contribution_events` and `plan_facts` and produces the match insight, with the eligibility, lump sum, blended, and true up cases (foundation §5).
- [ ] The plan formula library (`lib/plans/`) the differential needs for the employer side.

## Migration plan

**Strategy**: no migration needed. No schema change (the table exists from spec 0004); the change is additive code on the write path, revertible by reverting one commit. No live data to transform.
