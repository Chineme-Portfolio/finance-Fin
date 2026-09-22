# Verify: plan formula library · spec 0007 · updated 2026-09-22

_Steps derived from spec 0007 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones. This slice is a PURE library (no I/O, no app surface, no database), so verification is the test suite plus static checks, not a running app._

## Commands (the whole proof)

- [ ] `npx vitest run lib/plans lib/insights` is green. The match arithmetic worked examples hold: tiered `[{10000,300},{5000,500}]` on $100,000 gives $3,000 at 3%, $4,000 at 5%, $4,000 at 10% (capped); `unclaimedMatchMinor` from 3% is $1,000; the simple and flat cap shapes compute correctly. → AC-3, AC-4, AC-7
- [ ] Same run: a fractional cent input yields an exact integer minor unit; degenerate inputs (single tier, zero gross pay, zero contribution) return sensible integers, no crash, no float. → AC-3, AC-7
- [ ] Same run: the catalog test confirms the FedEx entry is `verified: false` with a non empty note, and the two generic shapes are present and verified. → AC-5
- [ ] `npx tsc --noEmit` is clean, which also validates the `@ts-expect-error` in `lib/plans/catalog.test.ts`: a `verified: false` `CatalogEntry` with no `note` does not compile (honesty unrepresentable to break). → AC-5
- [ ] Placement and purity: the arithmetic is in `lib/insights/match.ts`, the data and lookup in `lib/plans/`, and neither imports `lib/db`, `lib/aggregator`, `server-only`, or anything async. `lib/insights/match.ts` imports only the types from `@/lib/plans`. → AC-1
- [ ] `npx next build` succeeds. → AC-1

## Acceptance-criteria coverage

- AC-1 covered by the placement/purity check and the build.
- AC-2 covered by tsc (the non empty tuple and the tier shape are enforced by the types) and the compute tests.
- AC-3 covered by the compute worked examples and the rounding/degenerate test.
- AC-4 covered by the max match and unclaimed (clamped) tests, and the `maxMatchContributionBps` lookup test.
- AC-5 covered by the catalog test and the `@ts-expect-error` type check.
- AC-6 covered structurally: every function returns a `number`; no function returns advice or a recommendation (return type, not a runtime test).
- AC-7 covered by the three-shape worked examples, the cap behavior, the unclaimed calc, rounding, and the degenerate inputs.

## Note (out of scope for this slice)

The suite's `lib/db/roundtrip.test.ts` is a live integration test against the hosted Supabase project (spec 0004). When the free tier project is paused after about a week idle, it fails with a network error ("fetch failed" / connection timeout). That is environmental and unrelated to this pure slice; restore or unpause the project to make that live test pass again.
