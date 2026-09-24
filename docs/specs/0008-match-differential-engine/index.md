# 0008. Match differential engine (F3)

**Date**: 2026-09-24
**Status**: Accepted

## Summary

This slice builds F3, the match check, as a pure function in `lib/insights/`. It reads the raw contribution deposits already persisted (spec 0006, all stored `source: "unknown"`) and works out whether the user is capturing their full employer match. It never says "you are not being matched." Instead it emits a ranked list of possible explanations plus a question, because a single unpaired deposit has at least five different causes with opposite right answers (foundation §5, §7 #16). When a formula and gross pay are both known, it also reports the dollars left on the table, computed only by the existing match math in `lib/insights/match.ts`. This slice is the engine and its exhaustive test suite only; the screen, the language model wording, and the F8 walkthrough come later.

## Requirements

**User stories**:
- As the confused holder, I want the tool to tell me whether I am capturing my full employer match, so that I can stop leaving the employer's money unclaimed.
- As the confused holder, when the tool cannot be sure, I want an honest question rather than a wrong verdict, so that I never act on a problem I do not actually have.

**Acceptance criteria** (the contract, each independently checkable):
- **AC-1**: `deriveMatch(account, events, planFacts | null, formulaEntry | null)` returns a `match_differential` Insight for an employer account (type `401k`) that has at least one contribution event, and returns `null` for a non employer account or one with no contribution events (honest absence, foundation §4 #7). No fabricated insight.
- **AC-2**: The engine never emits a bare "no match" finding. When no match deposit is observed, it emits a differential whose `hypotheses` list is non empty and includes the plausible causes, together with a non empty `questions` list. `no_match_offered` is never the only hypothesis and is never stated as fact (foundation §7 #16). For the single deposit bundle (no pairing) the live causes are `not_yet_eligible`, `below_match_threshold`, `annual_lump_sum_timing`, and `no_match_offered`, and the questions include `confirm_whether_plan_matches`.
- **AC-3**: When itemized paired deposits are observed, the engine computes `observedRatioBps` (employer to employee) as the modal ratio across the paired dates, excluding any date flagged `true_up_correction`, and ranks `match_detected` first, carrying the `confirm_ratio_looks_like_match` question (surfaced as a question, not asserted: foundation §7 #13).
- **AC-4**: When the observed history spans fewer than 13 months, OR spans longer but with too few observed periods to have caught an annual cycle (a sparse or gapped history), `observation.windowSufficient` is `false`, the `annual_lump_sum_timing` hypothesis is retained (not excluded), the `questions` include `widen_window`, and no unclaimed figure is asserted (build-graph ≥13 month requirement).
- **AC-5**: `unclaimed.amountMinor` is produced solely by `unclaimedMatchMinor` in `lib/insights/match.ts`, never by the differential logic (foundation §7 #1). It is populated only per the unclaimed gating rule (formula and `planFacts.grossPayMinor` both present AND the rank 1 hypothesis supports a match existing). When formula or gross pay is absent, `unclaimed` is `null` and the `questions` ask for the missing input (`provide_gross_pay` or `recognize_formula`).
- **AC-6**: When the resolved formula entry is unverified (`CatalogEntry.verified === false`), `unclaimed.formulaVerified` is `false` and `unclaimed.formulaNote` carries the entry's disclosure note. The figure is still computed, but the honesty flag travels into the Insight so the surface can disclose the unconfirmed basis (foundation §7 #13).
- **AC-7**: A late anomalous deposit (off the observed cadence, atypical magnitude) raises the `true_up_correction` hypothesis rather than being read as a changed match pattern, and that date is excluded from the `observedRatioBps` computation so it cannot skew the detected ratio (foundation §5, the true-up wrinkle).
- **AC-8**: A blended, unitemized pattern (a line that cannot be split into deferral and match) sets `observation.pairing = "blended"`, `observedRatioBps = null`, and the `questions` include `recognize_formula` (fall back to recognition, foundation §7 #12 tier 2). A pairing counts as itemized only when a date carries a DISTINCT deferral line AND a DISTINCT match line; a single line that happens to match both hint words (for example "EMPLOYEE MATCH") is ambiguous, classified blended, and never read as a pair or a ratio (this guards the false positive mirror of §7 #16).
- **AC-9**: The engine is pure and synchronous. It imports only domain types, `lib/plans`, and `lib/insights/match.ts`; no I/O, no network, no database, no language model, nothing async. It computes every number it returns (foundation §7 #7). It reads a contribution event's `source` but never mutates or persists a classification (spec 0006, foundation §7 #7).
- **AC-10**: `deriveInsights` wires `deriveMatch` in through a new optional `EngineInput.matchFormulas` (a per account resolved formula entry). A `match_differential` is produced for a 401k account that has contribution events; `matchFormulas` only adds the dollar figure, it does not gate whether the insight appears. Existing callers pass no contribution events, so their `composition` and `cash_drag` output is unchanged, and one account may produce a `match_differential` alongside its other insights.
- **AC-11**: Hypotheses are ranked deterministically (`rank` ascending, 1 is best supported), each carrying the `signal` that placed it. The same input always yields the same ranking (determinism, code-standards §8). Ranking uses observed signals only: a present ratio ranks `match_detected` first; a below cap contribution ranks `below_match_threshold` above `no_match_offered`; a short or sparse window keeps `annual_lump_sum_timing` high, and a sufficient window with a full clean cycle and no lump seen demotes it; `no_match_offered` is always present but never alone and never ranked 1 while another cause is live.
- **AC-12**: The unclaimed gating rule holds: when the rank 1 hypothesis is `no_match_offered` or `blended_unitemized`, `unclaimed` is `null` even if a formula and gross pay are present, so a dollar figure is never emitted while the engine is unsure a match exists (the false positive mirror of foundation §7 #16).
- **AC-13**: `questions` is a non empty list that carries every live uncertainty at once, priority ordered. When two are live together (for example blended pairing with a missing gross pay), both `recognize_formula` and `provide_gross_pay` appear.

## Decision

**Chosen option**: Option 1: A pure differential engine emitting a new typed `Insight` variant, built now against fixtures with every classification rule flagged PROVISIONAL.

Build F3 as `deriveMatch` in `lib/insights/`, emitting a `match_differential` Insight (ranked typed hypotheses plus a typed question code, with optional unclaimed dollars), wired into `deriveInsights`; build it now against hand written fixtures covering all five causes, because the "question, never a claim" rule (§7 #16) makes a wrong assumption degrade to a question rather than a false finding.

**Implementation skills**: none (pure TypeScript over existing domain types; no community skill governs this).

## Feature design

**Data model sketch** (typed shapes, not persisted; Insights are always computed, never stored, foundation §5):

New `Insight` variant added to the discriminated union in `lib/types/domain.ts`:

| Field | Type | Meaning |
|---|---|---|
| `kind` | `"match_differential"` | discriminant |
| `accountId` | `string` | the employer account |
| `observation` | `MatchObservation` | the computed, deterministic facts |
| `hypotheses` | `MatchHypothesis[]` | ranked, non empty, rank 1 best supported; the rank 1 cause always travels with the Insight so a surface cannot show a number without its caveat |
| `questions` | `MatchQuestion[]` | non empty, priority ordered; carries every live uncertainty at once (for example blended pairing and missing gross pay both) |
| `unclaimed` | `UnclaimedMatch \| null` | dollars; present only when formula and gross pay are both known AND the differential supports a match existing (see the gating rule below) |

Helper types:
- `MatchObservation`: `windowMonths: number`, `observedPeriodCount: number` (distinct contribution periods actually seen), `windowSufficient: boolean` (span ≥13 months AND enough observed periods to have caught an annual cycle, not a single gapped span), `depositCount: number`, `pairing: "paired" | "single" | "blended"` (no `"none"`: an account with no events returns `null`, AC-1, so a pairing is always observed; a pair requires distinct deferral and match lines, so a single line matching both hints is ambiguous and classified blended), `observedRatioBps: number | null` (null when no ratio was readable, which can happen even when `pairing` is "paired", for example every itemized date was a true-up; the engine then treats the pairing as unsplittable).
- `MatchHypothesis`: `cause: MatchCause`, `rank: number`, `signal: MatchSignal`.
- `UnclaimedMatch`: `formulaId: string`, `amountMinor: number`, `currentContributionBps: number`, `atCapContributionBps: number`, `formulaVerified: boolean`, `formulaNote: string | null`.
- `MatchCause` = `"match_detected" | "not_yet_eligible" | "annual_lump_sum_timing" | "blended_unitemized" | "below_match_threshold" | "no_match_offered" | "true_up_correction"`.
- `MatchSignal` = `"paired_deposits_present" | "single_deposit_only" | "blended_single_line" | "window_below_13_months" | "contribution_below_cap" | "ratio_below_headline" | "late_anomalous_deposit"`.
- `MatchQuestion` = `"confirm_ratio_looks_like_match" | "provide_gross_pay" | "provide_contribution_rate" | "confirm_eligibility_status" | "widen_window" | "recognize_formula" | "confirm_whether_plan_matches"`. `provide_contribution_rate` names the missing contribution rate as the reason no dollar figure appeared when a match is the leading read, so the absence is explained not silent (§4 #7).

`EngineInput` gains one optional field: `matchFormulas?: Record<string, CatalogEntry>` (account id to the resolved catalog entry). The caller resolves the formula upstream (catalog recognition, tier 2, or a user answer). Absent means the differential is emitted without dollars.

**The unclaimed gating rule** (the false positive guard, the mirror of §7 #16). `unclaimed` is populated only when all of these hold: a formula is resolved, `planFacts.grossPayMinor` and `planFacts.contributionRateBps` are known, the differential itself supports a match existing (the rank 1 hypothesis is `match_detected` (a match is visible) or `below_match_threshold` (a match exists but is not fully captured)), and the match was either observed directly (`pairing === "paired"`) OR the window is sufficient. That last clause matters: in an unpaired single stream a match was not seen directly, so an annual lump sum could still mean the person is fully matched. The engine therefore withholds the dollar figure for an unpaired stream until the window is long enough to have excluded that. When the rank 1 hypothesis is `no_match_offered` or `blended_unitemized`, `unclaimed` stays `null` even if formula and gross pay are present: the engine is not yet sure a match exists, so it must not state a dollar figure that reads as one. Because the rank 1 hypothesis always travels in `hypotheses[0]`, a surface can never render the number without the cause that qualifies it.

**API surface** (function signatures, no HTTP; the engine is a library):

| Function | Inputs | Outputs | Auth | Key cases |
|---|---|---|---|---|
| `deriveMatch` | `account: Account`, `events: ContributionEvent[]`, `planFacts: PlanFacts \| null`, `formulaEntry: CatalogEntry \| null` | `Insight \| null` | none (pure) | `null` for non 401k / no events; dollars only when formula and gross pay present AND the rank 1 hypothesis supports a match (the gating rule) |
| `deriveInsights` (extended) | `EngineInput` (now with optional `matchFormulas`) | `Insight[]` | none (pure) | existing insights unchanged; adds match_differential per employer account |

**Key invariants**:
- Never assert the absence of a match. Any "no match" reading is one ranked hypothesis among others, always paired with a question (foundation §7 #16). This is the load bearing invariant of the whole feature.
- Never assert a match in dollars while unsure one exists. `unclaimed` is `null` whenever the rank 1 hypothesis is `no_match_offered` or `blended_unitemized` (the unclaimed gating rule). This is the false positive mirror of the invariant above, and equally load bearing.
- The rank 1 hypothesis always travels with the Insight (`hypotheses[0]`), so a surface can never render `unclaimed` without the cause that qualifies it.
- The model computes no figure; every number here is computed in `lib/insights/`, and the dollar figure specifically comes from `unclaimedMatchMinor` (foundation §7 #1, §7 #7).
- A contribution event's stored `source` is read only. Classification (deferral vs match) happens in the engine at read time and is never written back (spec 0006, foundation §7 #7).
- Deterministic: identical input yields an identical Insight, ranking included.
- Purity: no I/O, no async; imports limited to domain types, `lib/plans`, `lib/insights/match.ts`.

**Security model**: no new data surface. The engine is pure and reads only the domain data handed to it; the contribution events it reads are already scoped to the user by the database layer (spec 0004 RLS and the `DEV_USER_ID` gate). No new query, no new secret, no new env var. The product trust concern here is correctness, not access: a wrong "no match" is the damaging failure, and AC-2 plus the never assert absence invariant are what guard it.

**Critical test scenarios** (each maps to an AC in Requirements; the full per case suite is the point of this slice, code-standards §8):
- Happy path: itemized paired deposits at a 2 to 1 ratio produce `match_detected` ranked first with `observedRatioBps` and the confirm question, verifies **AC-3**.
- Unclaimed: contribution below the cap, formula and gross pay present, yields a positive `unclaimed.amountMinor` from `unclaimedMatchMinor`, verifies **AC-5**.
- Never assert absence: a single employee only deposit stream produces a ranked differential (not_yet_eligible, below_match_threshold, annual_lump_sum_timing, no_match_offered) with `confirm_whether_plan_matches` in `questions`, and no bare "no match" finding, verifies **AC-2**.
- Unclaimed gating: a below cap contribution with a resolved formula and gross pay yields a positive `unclaimed.amountMinor` (verifies **AC-5**); the SAME formula and gross pay with a blended or no match top hypothesis yields `unclaimed` null (verifies **AC-12**).
- Combined uncertainty: blended pairing with a missing gross pay yields both `recognize_formula` and `provide_gross_pay` in `questions`, verifies **AC-13**.
- Short and sparse window: fewer than 13 months, and separately a long but sparse or gapped history, both keep annual_lump_sum_timing in play, set `windowSufficient` false, include `widen_window`, and emit no dollars, verifies **AC-4**.
- Long clean history: a full clean cycle beyond 13 months with no lump seen demotes annual_lump_sum_timing, verifies **AC-11**.
- Unverified formula: a `verified: false` entry still yields dollars but with `formulaVerified` false and the note carried through, verifies **AC-6**.
- True-up on a payroll date: a late off cadence deposit that lands on a normal payroll date raises `true_up_correction` and is excluded from `observedRatioBps`, verifies **AC-7**.
- Blended: an unsplittable single line sets `pairing` blended, ratio null, includes `recognize_formula`, verifies **AC-8**.
- Honest absence: a non 401k account, and a 401k with no events, both return `null`, verifies **AC-1**.
- Determinism and purity: the same fixture run twice is identical; a static check confirms no import outside the allowed set, verifies **AC-9**, **AC-11**.

## Build plan

No migration: this slice is pure and adds no table (Insights are never stored). The project's evident approach is pure engine first (build the deterministic logic and its tests before any renderer, as spec 0002 did for the keystone), so task 1 is the type additions rather than a schema change, and the renderer, language model wording, and F8 walkthrough are explicitly out of this slice.

1. Add the `match_differential` variant and helper types (`MatchObservation` with `observedPeriodCount`, `MatchHypothesis`, `MatchCause`, `MatchSignal`, `MatchQuestion`, `UnclaimedMatch`) to `lib/types/domain.ts` with `questions: MatchQuestion[]` (not a single code) and no `"none"` pairing, and add optional `matchFormulas` to `EngineInput`, satisfies **AC-1**, **AC-6**, **AC-10**, **AC-13**
2. Build the observation layer in `lib/insights/match-differential.ts`: window span in months plus observed period count and `windowSufficient` (span AND density), deposit count, pairing classification (same calendar date grouping plus rawName hints, all PROVISIONAL), true-up flagging, and `observedRatioBps` as the modal ratio across non true-up paired dates, satisfies **AC-3**, **AC-4**, **AC-7**, **AC-8**
3. Build the ranked differential and questions logic: map observed signals to ranked hypotheses (with the cycle based demotion) and the priority ordered `questions`, enforcing the never assert absence rule, satisfies **AC-2**, **AC-11**, **AC-13**
4. Wire the unclaimed figure through `unclaimedMatchMinor` (`lib/insights/match.ts`), applying the unclaimed gating rule (formula and gross pay present AND rank 1 hypothesis supports a match), carrying `formulaVerified` and `formulaNote` from the `CatalogEntry`, satisfies **AC-5**, **AC-6**, **AC-12**
5. Export `deriveMatch` from `lib/insights/index.ts` and wire it into `deriveInsights` over `EngineInput.matchFormulas`, leaving `composition` and `cash_drag` unchanged, satisfies **AC-9**, **AC-10**
6. Write the exhaustive fixture suite: one fixture per cause plus the true-up (on a payroll date), positive detection, unclaimed gating both ways, combined uncertainty, short window, sparse or gapped window, long clean history, blended, missing gross pay or formula, unverified formula, and honest absence; assert determinism and the purity import boundary, satisfies **AC-1** through **AC-13**

## Consequences

**Positive**:
- Unlocks F8, the highest priority flow (build-graph): the match check is F8's one missing prerequisite.
- The product's most correctness sensitive logic becomes unit testable against plain fixtures, no infrastructure, so the cases that would otherwise ship wrong (eligibility waiting period, annual lump sum, blended line, true-up) are pinned by tests.
- Keeps the keystone property intact: F3 is one more pure function plus its tests, no new I/O, no schema change.

**Negative / tradeoffs**:
- The pairing and classification rules rest on assumptions about how Plaid itemizes 401k contributions, which has not been observed for the real Northwind plan (spec 0001 task 9 is deferred). The rules are flagged PROVISIONAL and the tests encode assumed shapes; when real data arrives the rules and fixtures must be revisited.
- Emitting a differential with a question rather than a verdict asks more of the surface and the user than a flat answer would. That is the deliberate bet (foundation §11), but it is more work downstream to render well.
- The unclaimed figure can be computed on an unverified formula (user #1's Northwind entry is `verified: false`). The honesty flag mitigates this, but a careless surface that ignores `formulaVerified` would state an unconfirmed number as fact.

**Neutral**:
- `EngineInput` gains an optional field; existing callers keep working unchanged (they pass no `matchFormulas`, so no match insight is produced).
- Formula resolution (catalog recognition, the user answer) lives upstream of the engine and is not built here; the caller supplies the resolved entry.

## Follow-up

- [ ] Observe the real Northwind 401k contribution history (spec 0001 task 9), then revisit the PROVISIONAL pairing and classification rules and the fixtures against reality.
- [ ] Verify the Northwind formula against plan documents and set the catalog entry `verified: true` (spec 0007 follow-up), which removes the unverified basis path for user #1.
- [ ] Build the surface that renders the differential and the typed question (the screen and the language model wording), and F8, the "turn the match on" walkthrough, which consumes this Insight.
- [ ] Decide upstream where formula resolution lives (catalog recognition plus the tier 2 recognition question and the tier 3 gross pay question) so `matchFormulas` gets populated in the real read path.
- [ ] Add a hire or eligibility date input so the ranking can demote `not_yet_eligible` after long tenure. The data model carries no such date today, so until it does, `not_yet_eligible` stays a live hypothesis for a single line history even for a long tenured user.

## Rationale

Reasoning, options considered, and references: see [rationale.md](rationale.md). Verify steps: see [verify.md](verify.md).
