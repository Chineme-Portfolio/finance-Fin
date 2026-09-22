# Verify: insight-engine · spec 0002 · updated 2026-09-01

_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones into a real suite (no test runner is chosen yet)._

## Commands

- [ ] `npx tsc --noEmit` → exits 0, strict types hold → AC-1, AC-2
- [ ] `npx eslint app lib` → exits 0
- [ ] `npx next build` → compiles
- [ ] `grep -rE "^\s*import.*(aggregator|/db/|/llm/|server-only)" lib/insights/` → **no match** (the engine imports nothing impure) → AC-4
- [ ] `grep -rn "async\|await\|fetch(\|new Promise" lib/insights/*.ts` (ignoring comments) → nothing in code → AC-4

## Behaviour (proven against the committed real fixture; `/test` locks these)

- [ ] Composition on an account with holdings: `groups` sum to exactly 10000 basis points → AC-5, AC-7
- [ ] All `shareBps` and `valueMinor` are integers; no floating point money anywhere → AC-1
- [ ] `accountTotalMinor` equals the sum of the account's positive holding values, not `Account.balanceMinor` (the two diverge in the real fixture) → AC-5, invariant 8
- [ ] An account with no holdings: `deriveComposition` and `deriveCashDrag` return `null`, no crash → AC-8
- [ ] An account whose holdings all have value 0 or less: returns `null`, no divide by zero → AC-8
- [ ] A holding with value ≤ 0 (short): excluded from groups, counted in `excludedCount`, remaining groups still sum to 10000 → AC-5, invariant 9
- [ ] Two groups tied for largest: the remainder lands deterministically (alphabetical by security type), identical across runs → AC-5, invariant 4
- [ ] An account with a cash-equivalent holding: `deriveCashDrag` reports `cashMinor` and `cashShareBps`, no judgement text → AC-6
- [ ] `securityType` reaching a group is always one of the closed union values; an unknown raw type maps to `"other"` at the boundary → AC-3
- [ ] A hand-written `Insight` of a new `kind` type-checks against the union without changing existing variants → AC-9

## Mapping (validated against fixtures/, `/check verify` can re-run)

- [ ] `mapHoldingsResponseToDomain` on `fixtures/holdings-ymw6pgkb.json` (payload under `.data`): all holdings map, every `securityType` is recognised (none fall to `"other"` for this fixture), all `valueMinor` are integers → AC-3

## Acceptance-criteria coverage

- **AC-1** domain types, money in minor units → tsc + integer checks
- **AC-2** Insight is a discriminated union → tsc + AC-9 extension check
- **AC-3** aggregator maps raw → domain, closed securityType → mapping validation
- **AC-4** engine is pure → the two grep checks
- **AC-5** composition, shares sum to 10000, exclusions, tie-break → the composition behaviour checks
- **AC-6** cash drag, amount + share, no judgement → cash-drag check
- **AC-7** every insight carries its source figures → composition/cash-drag checks
- **AC-8** absence yields no insight, no crash → empty and zero-total checks
- **AC-9** union open for extension → the new-kind type-check
