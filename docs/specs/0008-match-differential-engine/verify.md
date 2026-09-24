# 0008. Match differential engine (F3) — verify

> How `/check verify` proves this slice against the spec. The engine is pure, so verification is fixture driven and needs no live data, no database, and no network. Prove every acceptance criterion in [index.md](index.md) plus the standing gates.

## Setup

- No environment or credentials needed. The engine is pure and synchronous.
- Verification runs the test suite and the static gates. There is no app surface to drive in this slice (engine only, by design).

## Acceptance criteria checks

Run the suite and confirm one or more tests map to each AC:

- **AC-1 honest absence**: a non `401k` account returns `null`; a `401k` account with no contribution events returns `null`. No fabricated insight.
- **AC-2 never assert absence**: an employee only single deposit stream returns a `match_differential` whose `hypotheses` is non empty and contains more than one live cause (not_yet_eligible, below_match_threshold, annual_lump_sum_timing, no_match_offered), with `confirm_whether_plan_matches` in `questions`. Assert `no_match_offered` is never the only hypothesis and is never presented as a settled finding.
- **AC-3 positive detection**: itemized paired deposits at a 2 to 1 ratio yield `observedRatioBps` set to the modal ratio across paired dates, `match_detected` at rank 1, and `confirm_ratio_looks_like_match` in `questions`.
- **AC-4 short and sparse window**: fewer than 13 months sets `observation.windowSufficient` false; separately, a long but sparse or gapped history (low `observedPeriodCount`) also sets it false. Both keep `annual_lump_sum_timing` in the hypotheses, include `widen_window` in `questions`, and leave `unclaimed` null.
- **AC-5 unclaimed figure source and gating**: with a resolved formula, `planFacts.grossPayMinor`, and a match supporting rank 1 hypothesis, a below cap contribution yields a positive `unclaimed.amountMinor`. Confirm the value equals `unclaimedMatchMinor(formula, currentContributionBps, grossPayMinor)` (the figure comes from `lib/insights/match.ts`, not the differential). With formula or gross pay missing, `unclaimed` is null and `questions` ask for the missing input.
- **AC-6 unverified basis**: a `verified: false` catalog entry still produces `unclaimed`, but with `formulaVerified` false and `formulaNote` equal to the entry's note.
- **AC-7 true-up**: a late off cadence, atypical magnitude deposit (including one landing on a normal payroll date) raises `true_up_correction`, and that date is excluded from `observedRatioBps`.
- **AC-8 blended**: an unsplittable single line sets `observation.pairing` to `blended`, `observedRatioBps` null, and includes `recognize_formula` in `questions`.
- **AC-9 purity**: a static check (grep or an import lint) confirms `lib/insights/match-differential.ts` imports only from `@/lib/types`, `@/lib/plans`, and `./match` (or the `lib/insights` siblings), with no database, aggregator, network, or language model import and nothing async. Confirm `source` on an input event is never reassigned.
- **AC-10 wiring**: `deriveInsights` over a 401k account with contribution events produces a `match_differential` for it and leaves the `composition` and `cash_drag` outputs for other accounts unchanged. A populated `EngineInput.matchFormulas` adds the dollar figure; without it the differential still appears, just without dollars. With no contribution events (what existing callers pass), no match insight is produced and existing behavior is identical.
- **AC-11 determinism and ranking**: the same fixture run twice yields a deeply equal Insight, including hypothesis order. Ranks are ascending from 1 and each hypothesis carries a `signal`. A long clean history beyond a sufficient window demotes `annual_lump_sum_timing`.
- **AC-12 unclaimed gating (false positive guard)**: with the same resolved formula and gross pay as AC-5, a fixture whose rank 1 hypothesis is `no_match_offered` or `blended_unitemized` yields `unclaimed` null. Confirm `hypotheses[0]` is present on every emitted Insight.
- **AC-13 combined uncertainty**: a blended pairing with a missing gross pay yields both `recognize_formula` and `provide_gross_pay` in `questions`, priority ordered and non empty.

## Standing gates (all must pass)

- `tsc` clean (the discriminated union exhaustiveness holds; the new variant does not break existing `Insight` consumers).
- `eslint` clean for the slice.
- The full test suite passes, including the existing insight, view, and round trip tests (no regression).
- `next build` clean.

## What NOT to expect in this slice

- No screen, no route, no language model wording. The typed `questions` codes are emitted; rendering them into prose is a later slice.
- No F8 walkthrough.
- No persistence: Insights are never stored; there is no migration and no new table.
- No populated real read path: `matchFormulas` is populated by fixtures here. Wiring formula resolution into the live read path is a follow-up (see index.md Follow-up).
