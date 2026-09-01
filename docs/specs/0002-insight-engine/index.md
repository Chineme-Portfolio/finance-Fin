# 0002. Insight engine: the domain model and the pure derivation core

**Date**: 2026-09-01
**Status**: Accepted

## Summary

This slice builds the keystone: a clean domain model for the product (Account, Holding, and the rest) and a pure function that turns those objects into typed `Insight` values. Pure means it does no input or output, calls no database, no network, and no language model, so it can be tested in isolation with plain fixtures. It computes every number itself, because the model is never allowed to do arithmetic. This slice ships two insights that need only holdings data: what you own, broken down by kind, and how much cash is sitting uninvested. The employer match differential is deliberately left for a later slice, because it needs a real observation this project has not made yet.

## Requirements

**User stories**

- As the builder, I want one clean domain model that the whole app codes against, so that Plaid's response shapes never leak past the aggregator.
- As the builder, I want insights computed by pure functions I can test with fixtures, so that the product's most correctness sensitive code is provably right before any of it is wired to a screen.
- As a beginner using the product later, I want to see what I actually hold and how much of my money is not invested, each figure traceable to the holdings it came from.

**Acceptance criteria**

- **AC-1**: The domain model exists in `lib/types/` as strict TypeScript: `Account`, `Holding` (carrying resolved security metadata), `SecurityInfo` (with a **closed** `SecurityType` union), `ContributionEvent`, `PlanFacts`, and `Insight`. All money is integer minor units (cents); there are no floating point money fields anywhere in the model.
- **AC-2**: `Insight` is a discriminated union keyed on a `kind` field, with a variant per insight, so an impossible state (fields from one insight kind mixed with another) cannot be represented.
- **AC-3**: The aggregator layer maps its raw provider output into domain `Account` and `Holding` objects, joining each holding to its security so a `Holding` carries security id, name, ticker, security type, and the cash equivalent flag. The provider's raw security type string is normalised to the closed `SecurityType` union at this boundary (an unrecognised or missing type becomes `"other"`). Nothing outside `lib/aggregator/` handles a raw Plaid shape.
- **AC-4**: `lib/insights/` is pure. It imports nothing from `lib/aggregator/`, `lib/db/` (which does not exist yet), or any language model code, and nothing async. The engine is a synchronous function `(EngineInput) => Insight[]`.
- **AC-5**: The composition insight: for each investment account with holdings, it groups holdings by security type, and reports each group's total value in minor units and its share as integer basis points (hundredths of a percent). **The account total is defined as the sum of the account's holding values, never the provider reported balance** (real data shows the two diverge; see invariant 8). Shares sum to exactly 10000 basis points: the largest group by value absorbs the rounding remainder, and ties for largest are broken alphabetically by security type so the result is deterministic. Holdings with a value of zero or less (short or fully written down positions) are excluded from the grouping and reported as an `excludedCount`, never silently folded in.
- **AC-6**: The cash drag insight: for each investment account, it reports the value held in cash or cash equivalent **holdings**, in minor units, and that value's share of the holdings total in basis points. It states the amount as fact and makes no judgement (education, not advice). It reports only cash that appears as a holding; sweep cash that a provider reports only in the account balance is a known limitation (invariant 8, Follow-up), not folded in, because attributing the balance gap to cash would be a claim the data does not support (`foundation.md` §4 #3, §7 #16).
- **AC-7**: Every `Insight` carries the figures it was computed from (the group values, the account total), so any number shown to a user later can be traced to its inputs without recomputation.
- **AC-8**: An account with no holdings, a non investment account, **or an account whose holdings total is zero or less** (which would make a basis point share undefined), produces no composition or cash drag insight for that account. It is never a crash, and never a zero filled fake insight.
- **AC-9**: Adding a new `Insight` variant later (specifically the deferred match differential) requires no change to the existing variant types or to the engine's return type. The union is open for extension.

## Decision

**Chosen option**: Option 2: a canonical domain model with mapping in the aggregator, and a pure engine over it.

Build a provider neutral domain model in `lib/types/`. Have `lib/aggregator/` map raw Plaid output into it and return domain objects. Build `lib/insights/` as a pure, synchronous engine `deriveInsights(input) => Insight[]` that computes the two composition insights and is shaped to accept the deferred match differential later.

**Implementation skills**: none (no community skills govern this pure TypeScript slice).

## Rationale

Reasoning, the problem context, and the options weighed: see [`rationale.md`](rationale.md).
Verification steps: see [`verify.md`](verify.md) once `/develop` writes it.

## Feature design

**Data model sketch** (types, not database tables. `foundation.md` §5 is the source; nothing here is persisted, per `foundation.md` §5 and the "never store derived values" rule).

```
Account
  id: string
  name: string
  type: AccountType            "401k" | "roth_ira" | "traditional_ira" | "taxable_brokerage" | "hsa" | "other"
  subtype: string | null       the provider's finer label, kept verbatim
  linked: true                 provenance. Always linked in v1 (foundation §7 #4). Field present so a future provenance is a type change, not a schema change
  capabilities: Capability[]   which of balance | holdings | transactions this account actually returned (foundation §7 #15)
  balanceMinor: number | null  integer minor units; null when the provider gave no balance
  currency: string | null

Holding
  accountId: string            references Account.id
  security: SecurityInfo        resolved at mapping time (the holding-to-security join)
  quantity: number             a count of units, not money, so not minor units (may be fractional shares)
  valueMinor: number           integer minor units: the position's current value
  costBasisMinor: number | null integer minor units; null when the provider gave none
  currency: string | null

SecurityInfo
  securityId: string           the provider's stable id, kept so a later feature can dedupe or link back
  name: string
  ticker: string | null
  securityType: SecurityType   a CLOSED union, normalised at the mapping boundary; anything unrecognised maps to "other"
  isCashEquivalent: boolean     the provider flag that drives the cash drag insight

SecurityType                   "mutual fund" | "etf" | "equity" | "fixed income" | "cash" | "cryptocurrency" | "derivative" | "other"
  the aggregator maps the provider's raw type string to one of these at mapping time (a raw
  string never reaches the engine); an unknown or missing raw type becomes "other", never a
  passthrough of the vendor's wording

ContributionEvent              DEFINED here, NOT consumed by this slice's insights. The deferred match differential needs it (foundation §5)
  accountId: string
  date: string                 ISO date
  amountMinor: number          integer minor units
  currency: string | null
  source: "deferral" | "match" | "unknown"   how the provider labelled it; "unknown" is the honest default until task 9 shows what real data looks like
  rawName: string              the provider's own description string, kept for the differential to reason over

PlanFacts                      DEFINED here, NOT consumed by this slice. The match feature needs it (foundation §5, §7 #12)
  accountId: string
  employer: string | null
  matchFormula: string | null            free text until the formula library (a later slice) types it
  contributionRateBps: number | null     integer basis points
  grossPayMinor: number | null           integer minor units

Insight                        discriminated union on `kind`
  | { kind: "composition"; accountId: string; accountTotalMinor: number; groups: CompositionGroup[]; excludedCount: number }
  | { kind: "cash_drag";   accountId: string; accountTotalMinor: number; cashMinor: number; cashShareBps: number }

CompositionGroup
  securityType: string
  valueMinor: number
  shareBps: number             integer basis points; groups sum to 10000 (rounding handled explicitly, see invariants)
```

**State transitions**: none. The engine is stateless and pure; there is no lifecycle.

**API surface** (function signatures, not HTTP. This slice adds no route and no Server Action.)

| Function | Location | Input | Output | Notes |
|---|---|---|---|---|
| `deriveInsights` | `lib/insights/index.ts` | `EngineInput { accounts, holdings, contributionEvents, planFacts }` | `Insight[]` | Pure, synchronous. The one entry point |
| `deriveComposition` | `lib/insights/composition.ts` | `Account`, its `Holding[]` | `Insight \| null` | Null when the account has no holdings |
| `deriveCashDrag` | `lib/insights/cash-drag.ts` | `Account`, its `Holding[]` | `Insight \| null` | Null when there is no cash holding to report |
| `toDomainAccounts` / `toDomainHoldings` | `lib/aggregator/plaid/map.ts` | raw Plaid payloads | `Account[]` / `Holding[]` | The holding to security join lives here |

**Key invariants**

1. `lib/insights/` is pure: no async, no I/O, no import of `aggregator`, `db`, or `llm`. This is the property that makes the engine testable and is the whole reason it is the keystone (`architecture.md` §6).
2. The engine computes every number. No figure it returns came from anywhere but its own arithmetic over the inputs (`foundation.md` §4 #1, §7 #7).
3. All money is integer minor units. Quantities of shares are not money and may be fractional. Percentages are integer basis points, never floats (`code-standards.md` §2).
4. Composition group shares sum to exactly 10000 basis points per account. Because integer basis points do not divide evenly, the largest group by value absorbs the rounding remainder, ties broken alphabetically by security type for determinism, and this is done in one named place, not scattered.
5. Insights are computed, never stored (`foundation.md` §5). This slice writes no table and no cache.
6. An absent input yields an absent insight, never a fabricated one (AC-8). Missing is a first class outcome, consistent with `foundation.md` §4 #7.
7. The domain model is the only shape the engine sees. A raw Plaid field reaching `lib/insights/` is a boundary violation (`foundation.md` §7 #8).
8. The account total used for every share is `sum(holdings.valueMinor)`, never `Account.balanceMinor`. Real data shows the two diverge (a provider balance can include sweep cash or unpriced items that no holding row accounts for), so defining the total as the sum of the parts is the only way shares can sum to 10000 by construction. The gap between `balanceMinor` and the holdings sum is not attributed to anything in this slice; it is a named limitation (Follow-up).
9. Holdings with a non positive value are excluded from composition (short or written down positions), counted in `excludedCount`, and never make a share negative or push another group past its true share.

**Security model**: this slice touches no credentials, no tokens, no network, and no persistence. It transforms in memory domain objects into other in memory objects. `security.md` still governs the values it handles (balances and holdings are sensitive), so the same never log rule applies: the engine and its tests never print real financial values. Test fixtures are the synthetic ones spec 0001 already generates, which carry no real data.

**Configuration required**: none. No new environment variable, no new dependency (a test runner is chosen when `/test` runs, not here).

**Critical test scenarios** (each maps to an acceptance criterion; `/test` writes these later, this slice makes them possible)

- Happy path: an investment account holding two mutual funds and some cash produces one composition insight whose groups sum to 10000 basis points and one cash drag insight. Verifies **AC-5**, **AC-6**, **AC-7**.
- Rounding: three holdings whose shares do not divide evenly still sum to exactly 10000 basis points, with the remainder in the largest group. Verifies **AC-5**.
- Tie break: two groups tie for largest; the remainder lands on the alphabetically first security type, deterministically across runs. Verifies **AC-5**.
- Zero total: an account whose holdings net to zero produces no insight and does not divide by zero. Verifies **AC-8**.
- Excluded short: an account with a negative value holding groups only the positive holdings and reports `excludedCount` of 1. Verifies **AC-5**.
- Empty account: an account with no holdings produces no composition and no cash drag insight, and does not throw. Verifies **AC-8**.
- No cash: an account fully invested produces a composition insight and no cash drag insight (not a zero cash drag insight). Verifies **AC-6**, **AC-8**.
- Purity: a test imports `lib/insights/` and calls it with plain fixtures, with no database, no network, and no Plaid, and it works. Verifies **AC-4**.
- Extension: a hand written `Insight` of a new `kind` type checks against the union without changing existing variants. Verifies **AC-9**.

## Build plan

Ordered as a Tracer Bullet: the domain types are the thin thread everything else hangs on (task 1, the equivalent of a migration), then the mapping fills them from real shapes, then the pure engine consumes them, then each insight, then the purity guard.

1. Define the domain model in `lib/types/` per the data model sketch: `Account`, `Holding`, `SecurityInfo`, `ContributionEvent`, `PlanFacts`, `Insight`, `CompositionGroup`, `EngineInput`. Strict types, money in minor units, `Insight` a discriminated union. Satisfies **AC-1**, **AC-2**, **AC-9**.
2. Build the mapping in `lib/aggregator/plaid/map.ts`: raw Plaid holdings and securities and accounts into domain `Account[]` and `Holding[]`, joining each holding to its security. Convert money to minor units at this boundary. Validate against the real committed fixtures in `fixtures/`. Satisfies **AC-3**.
3. Wire the mapping into the aggregator so `fetchAccountData` (or a new method) can return domain objects, keeping the raw capture path intact. Nothing outside `lib/aggregator/` sees a Plaid shape. Satisfies **AC-3**.
4. Create `lib/insights/index.ts` with the pure `deriveInsights(input) => Insight[]` entry point and the `EngineInput` contract. No async, no outside imports. Satisfies **AC-4**.
5. Build `deriveComposition` in `lib/insights/composition.ts`: group an account's holdings by security type, compute group values and integer basis point shares, absorb the rounding remainder in the largest group. Satisfies **AC-5**, **AC-7**.
6. Build `deriveCashDrag` in `lib/insights/cash-drag.ts`: sum cash equivalent holdings, report amount and basis point share, no judgement. Satisfies **AC-6**, **AC-7**.
7. Handle absence throughout: no holdings or non investment account yields no insight, never a crash or a fake. Satisfies **AC-8**.
8. Confirm purity mechanically: a check (grep or a lint boundary) that `lib/insights/` imports nothing from `aggregator`, `db`, or `llm`, and a fixture only call that runs with no network. Satisfies **AC-4**.

## Consequences

**Positive**

- The keystone exists. Once the engine is pure and typed, chat and UI become renderers of `Insight[]`, and the deferred match differential is one more pure function plus its tests (`architecture.md` §6).
- The domain model decouples the whole app from Plaid. A provider swap, or a revoked connection, changes only the aggregator.
- The product's most correctness sensitive code is unit testable from day one, against fixtures, with no infrastructure.
- Two genuinely useful, real data backed insights ship, proving the engine end to end without waiting on the real account run.

**Negative and tradeoffs**

- The domain model duplicates some fields that also exist in the aggregator boundary types (`lib/aggregator/types.ts`). That duplication is deliberate (provider shape versus domain shape are different concerns), but it is two places to keep coherent, and a lazy future change could let them drift.
- The two shipped insights are the easy ones. The feature that justifies the product, the match, is explicitly not here, so this slice moves the architecture forward more than the user visible value.
- Expense ratio insights are impossible from current data (Plaid does not provide fund expense ratios), so "what does this fund cost" is not built and would need a separate reference dataset later. What was built instead is composition and cash, which the data does support.
- Mapping money to minor units assumes the provider's currency minor unit is cents (two decimal places). True for USD, the only currency in scope, but a hardcoded assumption to revisit if a zero decimal or three decimal currency ever appears.
- The account total is the sum of holding values, not the provider balance, so every share is internally consistent. The cost is that the balance the provider reports and the total the engine shows can differ, which must be explained wherever both are surfaced, not papered over.
- Cash drag counts only cash that is a holding. On a provider that reports sweep cash only in the balance, the figure under reports, and that limitation is stated rather than guessed around.

**Neutral**

- `ContributionEvent` and `PlanFacts` are defined but unused this slice. That is intentional groundwork for the match differential, not dead code, and should be commented as such so a future reader does not delete them as unused.
- No test runner is chosen here; `/test` picks one when it writes the suite. The engine is built to be testable, which is the obligation of this slice.

## Follow-up

- [ ] The match differential is a separate slice, gated on spec 0001 task 9 (the real observation of whether contributions arrive paired or blended). It will add a `match` variant to `Insight` and a `deriveMatch` function, and it must follow `foundation.md` §7 #16 (never infer a negative from missing data). Do not start it until task 9 has run.
- [ ] Fund expense ratio insights need a data source Plaid does not provide. If they are ever wanted, that is a data acquisition decision (a static expense ratio table by ticker, or another provider), worth its own spec.
- [ ] Watch `lib/types/` (domain) and `lib/aggregator/types.ts` (provider boundary) for drift. If they start to feel like one thing, that is a signal to reconsider the split, deliberately, not by accident.
- [ ] The minor unit conversion assumes two decimal currencies. Revisit if a non USD, non two decimal currency ever enters scope.
- [ ] Sweep cash reported only in the account balance (not as a holding) is not captured by cash drag. If real linked accounts show a large balance to holdings gap, decide deliberately how to surface it (a separate, clearly labelled "unaccounted" figure), without asserting it is cash. Observe it during spec 0001 task 9.
- [ ] The balance to holdings gap (invariant 8) is currently just noted. If it turns out to be consistently meaningful, it may deserve its own honest treatment rather than being set aside.
