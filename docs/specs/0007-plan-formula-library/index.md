# 0007. Plan formula library: the employer side of the match math

**Date**: 2026-09-11
**Status**: Accepted

## Summary

The match feature (F3, F8) is FINBUDDY's headline: tell the user whether they are capturing their full employer 401k match, and in dollars. That needs two halves, what the employee contributes (already persisted as contribution events, spec 0006) and what the employer's formula would match. This slice builds the employer half: `lib/plans/` models a match formula as typed data and holds the seeded catalog, and a small pure `match` module in `lib/insights/` (where the locked architecture puts every calculation) computes the match, the maximum match, and the money left on the table, all in integer minor units and basis points. It seeds a tiny catalog of common formula shapes plus the user's own employer plan, and it is honest that the seeded numbers are provisional until confirmed. It computes figures only; it never recommends a contribution rate or gives advice (foundation §7 #2a). The match differential engine (F3) is the consumer, a later slice.

## Context

Reasoning, the options weighed, and the honesty tension: see [`rationale.md`](rationale.md).

## Requirements

**User stories**

- As the builder, I want an employer match formula modeled as typed data, so the match engine can compute against it instead of parsing free text.
- As the builder, I want pure functions that turn a formula plus a contribution rate plus gross pay into the match, the max match, and the unclaimed amount, so F3 and F8 have the exact dollar figures foundation §7 #2a allows.
- As the builder, I want a tiny seeded catalog of common shapes and the user's own plan, so the recognition step (foundation §7 #12 tier 2) has something to show, without asserting an unverified formula as fact.

**Acceptance criteria**

- **AC-1**: The code honors the locked module rule (`architecture.md` §4, §7; `code-standards.md` §3): a calculation lives in `lib/insights/`, and `lib/plans/` holds static data plus pure lookups only. So the match **arithmetic** (functions that multiply and round money) lives in `lib/insights/` (a new `match` module) and the **formula data, the catalog, and trivial field lookups** live in `lib/plans/`. Both are pure and synchronous like the rest of `lib/insights/`: no I/O, no database, no network, no `server-only`, no import of `lib/db` or `lib/aggregator`.
- **AC-2**: A typed `MatchFormula` models an employer match as a **non empty**, ordered list of tiers, each `{ matchRateBps, uptoContributionBps }`, ascending by `uptoContributionBps`. The last tier's ceiling is the point past which more employee contribution earns no more match. Money is integer minor units; rates and percentages are integer basis points; no floating point money value exists.
- **AC-3**: `computeEmployerMatchMinor(formula, contributionBps, grossPayMinor)` (in `lib/insights/`) returns the employer match in minor units for a given employee contribution rate, applying each tier only to its own band of pay. A contribution above the last tier's ceiling earns no additional match. The result is an exact integer minor unit, computed with a **single** division and one explicit rounding step (no intermediate rounding across tiers, never a float).
- **AC-4**: `maxMatchContributionBps(formula)` (a pure lookup in `lib/plans/`) returns the contribution rate at or above which the match is fully captured (the last tier's ceiling). `maxEmployerMatchMinor(formula, grossPayMinor)` and `unclaimedMatchMinor(formula, currentContributionBps, grossPayMinor)` (calculations in `lib/insights/`) return the maximum match and the money left on the table (max minus current), the latter clamped to never be negative.
- **AC-5**: A seeded catalog (in `lib/plans/`) includes the Northwind Retirement Savings Plan as entry #1 (foundation §7 #12), marked `verified: false` with a provisional formula and a note that it is not confirmed against the plan document, plus the two most common generic shapes. The `CatalogEntry` type makes the honesty **unrepresentable to break**: an unverified entry must carry a note (a discriminated union on `verified`), so a `verified: false` entry with no disclosure cannot type check. Nothing in the library presents an unverified formula as fact.
- **AC-6**: The library returns figures only, guaranteed structurally by the `number` return type: no function returns advice text, recommends a contribution rate, picks a number, or ranks funds (foundation §7 #2a allowed side only). Framing the figures for the user is the caller's job (F8), not this library's.
- **AC-7**: Unit tests cover the three shapes (simple, tiered, flat cap) with worked dollar examples, the cap behavior (contribution above the ceiling earns no more), the unclaimed calculation, exact integer rounding (a fractional cent input yields an integer minor unit), and the degenerate inputs (a single tier, a zero gross pay, a zero contribution). Money never floats in a test assertion.

## Decision

**Chosen option**: Option 2: a tiered percentage of pay formula model plus pure compute functions and a tiny honest catalog, split across the two modules the locked architecture assigns.

A `MatchFormula` is a non empty, ordered list of tiers `{ matchRateBps, uptoContributionBps }`; the terminal tier's ceiling is the match cap (a flat cap is one tier, a tiered match is several). Per `architecture.md` §7 (a calculation lives in `lib/insights/`, a known employer match formula in `lib/plans/`), the formula types, the seeded catalog, and trivial field lookups live in `lib/plans/`, while the match arithmetic (compute the match, the max match, the unclaimed amount, in minor units) lives in a new `match` module in `lib/insights/` and imports the types from `lib/plans/`. The catalog seeds the Northwind plan (provisional, `verified: false`) and two common shapes. The library computes the mechanical dollar consequence only (foundation §7 #2a); it makes no recommendation and stores nothing.

**Implementation skills**: none installed that shape this slice.

## Rationale

Reasoning and the options weighed: see [`rationale.md`](rationale.md).

## Feature design

**Module split** (`architecture.md` §4, §7): `lib/plans/` holds only static data and pure lookups (the formula types, the catalog, and reads like "the last tier's ceiling"). The match **arithmetic** (functions that multiply money and round) is a calculation, so it lives in `lib/insights/` and imports the formula types from `lib/plans/`. This is the same rule that keeps the whole match differential in `lib/insights/` where the test discipline is non negotiable.

**The model** (`lib/plans/types.ts`, pure):
- `MatchTier = { matchRateBps: number; uptoContributionBps: number }`. `matchRateBps` is the employer match rate for this tier's band (10000 = 100%, 5000 = 50%). `uptoContributionBps` is the cumulative employee contribution, as basis points of pay, up to which this tier applies.
- `MatchFormula = { tiers: [MatchTier, ...MatchTier[]] }`. Tiers are a **non empty** tuple, ascending by `uptoContributionBps`; each tier's band runs from the previous tier's ceiling to its own. The last tier's `uptoContributionBps` is the max matchable contribution. A simple "100% up to 3%" is one tier `{10000, 300}`; a tiered "100% up to 3%, then 50% up to 5%" is `[{10000,300},{5000,500}]`; a flat "50% up to 6%" is `{5000, 600}`. No separate cap field is needed; the terminal tier expresses it. Compute assumes tiers are ascending; the catalog's entries are authored ascending, and a test pins the behavior.
- `CatalogEntry` is a **discriminated union on `verified`**, so honesty is unrepresentable to break: `{ id: string; label: string; employer: string | null; formula: MatchFormula } & ({ verified: true } | { verified: false; note: string })`. A `verified: false` entry MUST carry a `note` (it will not type check otherwise). `verified` means the formula is confirmed to match the named real world plan; a generic shape is `employer: null`, `verified: true`; a named plan whose numbers are not confirmed is `verified: false` with the disclosure `note`.

**The math** (`lib/insights/match.ts`, pure):
- Match for a contribution of `c` bps, as a single expression with no intermediate rounding (avoids compounding a per tier round): `matchMinor = Math.round((grossPayMinor * Σ_i (matchRateBps_i * bandWidth_i)) / 100_000_000)`, where `bandWidth_i = max(0, min(c, upto_i) - upto_{i-1})` (with `upto_0 = 0`) and `100_000_000 = 10000 * 10000` (the two basis point scales). One division, one `Math.round`, matching the `lib/insights/` convention.
- `computeEmployerMatchMinor(formula, contributionBps, grossPayMinor): number` computes the formula's theoretical match for the given inputs; it is not a forecast of actual deposits (the docstring says so). (AC-3)
- `maxEmployerMatchMinor(formula, grossPayMinor): number` = `computeEmployerMatchMinor` at the max contribution (AC-4).
- `unclaimedMatchMinor(formula, currentContributionBps, grossPayMinor): number` = `max(0, maxEmployerMatchMinor - computeEmployerMatchMinor(current))` (AC-4). This is the foundation §7 #2a figure ("contributing N% more would capture ~$X of employer money").

**The lookup** (`lib/plans/`, pure): `maxMatchContributionBps(formula): number` = the last tier's `uptoContributionBps`, a field read, not a calculation (AC-4).

**The catalog** (`lib/plans/catalog.ts`, pure):
- Entry #1: Northwind Retirement Savings Plan, `employer` set, a provisional common formula, `verified: false`, `note` stating it is not confirmed against the plan document and must be surfaced as a question, never asserted (foundation §7 #13, §7 #16 are the downstream F3 duties).
- Two generic shapes: a full match to a cap ("100% up to X%") and the classic tiered safe harbor ("100% up to 3%, then 50% up to 5%"), `employer: null`, `verified: true`.

**Key invariants**
1. The placement rule holds: a calculation lives in `lib/insights/`, `lib/plans/` is static data plus pure lookups only (`architecture.md` §4, §7; AC-1). Both are pure and synchronous: no I/O, no `server-only`, no `lib/db` or `lib/aggregator` import.
2. Money is integer minor units; rates and percentages are integer basis points; every division rounds explicitly to an integer (AC-2, AC-3). No floating money.
3. The library computes the allowed dollar consequence only (foundation §7 #2a). It never recommends, ranks, selects, or advises (AC-6). It returns numbers; the caller frames them.
4. An unverified catalog formula is flagged `verified: false` with a note; the library never presents it as fact (AC-5). Turning a provisional formula into a user claim is forbidden downstream (foundation §7 #13, §7 #16), not this library's concern to assert but its duty not to hide.
5. `unclaimedMatchMinor` is clamped to be non negative: contributing above the cap yields zero unclaimed, never a negative "you over contributed" figure (AC-4).

**Security model**: none engaged. Pure library, no data handling, no secrets, no user data stored or transmitted. It operates on numbers passed to it.

**Configuration required**: none.

**Critical test scenarios** (each maps to an AC)
- Tiered worked example: formula `[{10000,300},{5000,500}]`, gross pay $100,000 (10,000,000 minor). At 3% contribution the match is $3,000 (300,000 minor); at 5% it is $4,000 (400,000); at 10% it is still $4,000 (capped). `maxMatchContributionBps` = 500. From 3% current, `unclaimedMatchMinor` = 100,000 ($1,000). Verifies **AC-3**, **AC-4**, **AC-7**.
- Simple and flat cap: "100% up to 3%" and "50% up to 6%" compute correctly and cap correctly. Verifies **AC-3**, **AC-7**.
- Rounding and degenerate inputs: a gross pay and rate that would give a fractional cent yields an exact integer minor unit (asserted as an integer); a single tier formula, a zero gross pay, and a zero contribution each return a sensible integer (0 where appropriate), not a crash or a float. Verifies **AC-3**, **AC-7**.
- Catalog honesty: the Northwind entry is `verified: false` with a note; the generic shapes are present; the type rejects a `verified: false` entry with no note. Verifies **AC-5**.
- Placement and purity: the arithmetic is under `lib/insights/`, the data and lookups under `lib/plans/`, and neither imports `lib/db`, `lib/aggregator`, or `server-only`. Verifies **AC-1**. (AC-6, "returns figures only", is guaranteed by the `number` return type, not a runtime test.)

## Build plan

Tracer Bullet: the thin thread is type, then compute, then catalog, then the tests that pin the dollars.

1. Define `MatchTier`, `MatchFormula` (non empty tuple of tiers), and the `CatalogEntry` discriminated union in `lib/plans/types.ts` (pure), plus the `maxMatchContributionBps` lookup and a `lib/plans/index.ts` barrel. Satisfies **AC-2**, **AC-4** (the lookup).
2. Seed the catalog in `lib/plans/catalog.ts`: the Northwind plan (provisional formula, `verified: false`, disclosure note) and the two generic shapes. Satisfies **AC-5**.
3. Implement the match arithmetic in `lib/insights/match.ts` (`computeEmployerMatchMinor`, `maxEmployerMatchMinor`, `unclaimedMatchMinor`), one division and one round, no advice, importing the types from `lib/plans/`. Satisfies **AC-1** (placement), **AC-3**, **AC-4**, **AC-6**.
4. Unit tests (`lib/plans/` for the catalog and lookup, `lib/insights/` for the arithmetic) covering the three shapes with worked dollar examples, the cap behavior, the unclaimed calculation, rounding, the degenerate inputs, and the placement/purity check. Satisfies **AC-1**, **AC-7**.

## Consequences

**Positive**
- The match feature gets its employer half as a small, pure, exhaustively testable unit, the cheapest place to get the money math exactly right before F3 depends on it.
- The seeded catalog gives the recognition step (foundation §7 #12 tier 2) real shapes to show, while the `verified` flag keeps an unconfirmed formula honest.
- Following the `lib/insights/` purity discipline means no I/O to mock and no database to reach; the tests are fast and total.

**Negative and tradeoffs**
- The Northwind formula is provisional and unverified against the plan document (the build graph tension). The `verified: false` flag and note contain the risk, but F3 and F8 must honor foundation §7 #13 and §7 #16 and surface it as a question, never a claim; this library cannot enforce that downstream.
- The model covers percentage of pay tiers only. Annual dollar caps, the IRS 402(g) elective deferral limit, and per paycheck true up are not modeled here (noted as follow ups); a plan that needs them is not fully expressible yet.
- The library computes a match but does not know if a formula actually applies to a user (eligibility, vesting); that judgment is F3's, over the contribution events and the differential (foundation §5).

**Neutral**
- `PlanFacts.matchFormula` stays free text (`string | null`) for now; wiring a `PlanFacts` to a typed `MatchFormula` (by catalog id or a typed field) is F3's concern, not this slice's (a follow up).
- Nothing renders these numbers yet; F3 and F8 are the first callers.

## Follow-up

- [ ] Verify the Northwind Retirement Savings Plan match formula against the real plan document (or infer it from the user's own paired deposits, foundation §7 #12 tier 1), then set `verified: true` with the real numbers.
- [ ] Model annual dollar caps and the IRS 402(g) elective deferral limit, applied at compute time, when a real plan needs them.
- [ ] Wire `PlanFacts` to a typed `MatchFormula` (by catalog id or a typed field) when F3 is built; decide whether `PlanFacts.matchFormula` changes type or references a catalog entry.
- [ ] Build the match differential engine (F3) that consumes this library plus the persisted contribution events, with the eligibility, lump sum, blended, and true up cases (foundation §5).
