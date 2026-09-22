# Review, insight-engine (spec 0002), 2026-09-01

**Reviewed by**: Claude Sonnet 5 (author on Claude Opus 4.8)
**Scope**: 6 files, uncommitted (lib/types/domain.ts, lib/types/index.ts, lib/insights/index.ts, lib/insights/composition.ts, lib/insights/cash-drag.ts, lib/aggregator/plaid/map.ts; plus one added export line in lib/aggregator/index.ts)
**Verdict**: Approve with nits

## Summary
This slice delivers the domain model, the pure `deriveInsights` engine, and the Plaid-to-domain mapping exactly as spec 0002 describes. Purity is real and mechanically verified (no `any`, no async/await/Promise/fetch, no imports outside `@/lib/types` and sibling files in `lib/insights/`), the composition rounding-remainder and alphabetical tie-break logic is correct for every case I traced (including negative/zero holdings, all-excluded accounts, and ties), and `tsc --noEmit` is clean under `strict: true`. The main issues are two small correctness/maintainability risks that don't affect this slice's shipped behavior today but are worth a look before the next slice builds on them, plus a couple of nits.

## Minor
### 🟡 `toAccountType` fallback miscategorizes non-brokerage investment accounts, `lib/aggregator/plaid/map.ts:39`
**Problem**: `if (sub === "brokerage" || rawType === "investment") return "taxable_brokerage";` — the `rawType === "investment"` clause fires for *any* investment account whose subtype didn't match 401k/roth/ira/hsa/brokerage above it, not just ones that are actually brokerage accounts. Plaid's real subtype set includes things like `"sep ira"`, `"simple ira"`, `"529"`, `"non-taxable brokerage account"`, `"trust"`, `"keogh"`, `"pension"`, none of which are handled above.
**Why it matters**: A SEP IRA or SIMPLE IRA (tax-advantaged, not taxable) would be silently labeled `"taxable_brokerage"` instead of falling through to `"other"`. Nothing in this slice consumes `Account.type` yet, so there's no visible bug today — but the moment a later slice keys behavior off account type (tax treatment framing, the 401k-specific match differential, grouping in the UI), this mislabels real accounts, and the current fixture (only `"ira"` and `"401k"` subtypes) won't catch it.
**Suggested fix**: Drop the `rawType === "investment"` disjunct so the fallback is `sub === "brokerage" ? "taxable_brokerage" : "other"`, letting unrecognized investment subtypes land honestly in `"other"` rather than being guessed into `"taxable_brokerage"`.

### 🟡 `accountTotalMinor` computation is duplicated between `composition.ts` and `cash-drag.ts`, `lib/insights/composition.ts:21-28` and `lib/insights/cash-drag.ts:19-21`
**Problem**: Both files independently filter `holdings.filter(h => h.valueMinor > 0)` and reduce to a total. This is exactly the invariant-8 calculation (`sum(holdings.valueMinor)`, positive-only) that the spec calls out as critical, computed identically in two places instead of one named place.
**Why it matters**: Spec 0002 invariant 4 explicitly asks for the rounding/remainder logic to live "in one named place, not scattered" — the same reasoning applies to the total itself. If a future change adjusts the positive-holding filter (e.g. to handle a new edge case) in one file and not the other, `composition` and `cash_drag` insights for the *same account* could silently report two different `accountTotalMinor` values, which is the exact kind of inconsistency this slice's design is trying to make impossible.
**Suggested fix**: Extract a small shared helper (e.g. `sumPositiveHoldings(holdings): { positive: Holding[]; totalMinor: number }`) in `lib/insights/` and have both derive functions call it.

### 🟡 AC-8's "non-investment account" exclusion is not independently enforced, `lib/insights/composition.ts` / `lib/insights/cash-drag.ts`
**Problem**: AC-8 lists three conditions that should yield no insight: no holdings, a non-investment account, or a holdings total ≤ 0. The code only checks the first and third (via `positive.length === 0` and `accountTotalMinor <= 0`); there is no check on `account.type`. In today's data flow this is harmless because only Plaid Investments-product accounts ever carry holdings, so a non-investment account naturally has zero holdings and falls through the same "no holdings" branch — but the engine itself doesn't structurally guarantee that; it relies on an assumption about what upstream data looks like.
**Why it matters**: If a future change (e.g. a different provider, or a bug in the aggregator) ever attaches a holding to a checking/savings account, the pure engine would happily emit a composition/cash-drag insight for it, which AC-8 says should never happen.
**Suggested fix**: Either accept this as a deliberate simplification (data shape makes the case unreachable) and say so in a comment, or add an explicit `account.type !== "other"` — or better, a real `isInvestmentAccount` predicate — guard for defense in depth. Not urgent given current inputs.

## Nits
- ⚪ `lib/aggregator/plaid/map.ts:130`, `import type { AccountCapability } from "../types";` sits in the middle of the file (after `toDomainAccounts`/`toDomainHoldings`), not with the other imports at the top — looks like an artifact of `mapHoldingsResponseToDomain` being appended later. Move it up.
- ⚪ `lib/insights/composition.ts:34-49`, `valueByType` is typed `Map<string, number>` even though its keys are always `SecurityType`; the cast `securityType as CompositionGroup["securityType"]` on line 45 could be avoided entirely by typing the map as `Map<SecurityType, number>`.
- ⚪ `lib/insights/composition.ts:60` and `:70` use two different string-comparison idioms for the same "alphabetical" concept (`<` for the remainder tie-break, `localeCompare` for the final sort). Harmless for the current plain-ASCII security type strings, but worth using one consistently.

## Strengths
- Purity is genuinely enforced, not just claimed: `lib/insights/*.ts` import only `@/lib/types` and each other, contain zero `any`/`async`/`await`/`Promise`/`fetch`, and `tsc --noEmit` is clean under `strict: true`.
- The composition rounding logic is correct: `Math.floor` per-group guarantees the remainder is always ≥ 0, the largest-value/alphabetical-first tie-break is transitive and order-independent (verified by hand-tracing several tie orderings), and divide-by-zero is guarded before every division in both `composition.ts` and `cash-drag.ts`.
- The provider boundary holds: `securityType` is normalized to the closed union at the mapping boundary with an explicit `"other"` fallback, and no raw Plaid string or shape is visible from `lib/insights/`.
- `ContributionEvent`/`PlanFacts` are correctly left unused with clear comments explaining why, matching the deferred-scope instruction.
- The `Insight` discriminated union and the two variants are shaped exactly as the spec's data model sketch describes, and extending it with a `match` variant later needs no change to `composition`/`cash_drag`.

## Test coverage
No test file exists yet, which is expected and by design for this slice (`code-standards.md` §8: `/test` writes the suite in a later step). I hand-traced the critical scenarios from the spec's "Critical test scenarios" list against the actual code — rounding, tie-break, zero-total, excluded-short, empty-account, no-cash, and purity — and found the logic sound in each case. The two Minor findings above (the account-type fallback and the duplicated total calculation) are exactly the kind of thing a fixture-based test suite for `lib/aggregator/plaid/map.ts` and `lib/insights/` would be well positioned to catch once `/test` runs.
