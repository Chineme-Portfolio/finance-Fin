# 0008. Match differential engine (F3) — rationale

> Decision record for [index.md](index.md). `/develop` skips this file; it is for humans and for `/architect` on a later update.

## Context

> ⚠️ Premise note: this feature is built against synthesized fixtures because the real Northwind 401k contribution history has not been observed (spec 0001 task 9 is deferred, and the build-graph names this "the one genuine tension"). The risk is that the pairing and classification rules are modeled on a guess at how Plaid itemizes contributions, so the engine could be well tested against a fiction. What makes building now safe rather than reckless is foundation §7 #16: the engine never asserts a match verdict, it emits a ranked differential with a question, so a wrong assumption degrades to a slightly worse question rather than a false finding. The right framing is therefore to build the pure logic and its exhaustive test suite now, flag every classification rule PROVISIONAL, and revisit the rules and fixtures when real data arrives, rather than block the product's highest priority flow on an aggregator task that is itself deferred.

F3, the match check, is the highest value instance of the product's core loop (foundation §1, §6) and the one missing prerequisite for F8, the highest priority flow (§3, build-graph). The inputs it needs already exist: the pure insight engine (spec 0002), the persisted contribution events stored raw as `source: "unknown"` (spec 0006), and the employer side match math plus the seeded formula catalog (spec 0007).

The hard part is not the arithmetic, which spec 0007 already built. It is the inference. Employer contributions typically appear as paired deposits on the same date, the employee deferral and the employer match, and the ratio between them is the match rate, observable without knowing salary (foundation §5). But a single unpaired deposit has at least five distinct causes, and they call for opposite responses: not yet eligible (nothing lost), annual lump sum timing (widen the window), a blended unitemized line (ratio unavailable, fall back to recognition), a contribution below the match threshold (the real finding), or a plan with genuinely no match (nothing to capture). A separate wrinkle, true-up, means a late anomalous deposit can be a correction rather than a new pattern. Asserting "you are not being matched" to someone in their eligibility waiting period, or on an annual lump sum plan, is the single most damaging error the product can make (foundation §7 #16, §11).

Two forces shape the design. First, the model must never compute a figure; all arithmetic lives in `lib/insights/` (foundation §7 #1, §7 #7), and the dollar figure specifically must come from the existing `unclaimedMatchMinor`. Second, the contribution events are stored raw and unclassified by deliberate decision (spec 0006, foundation §7 #7): deciding deferral vs match is the product's highest consequence inference and belongs in the engine at read time, never at persist time. So F3 receives `source: "unknown"` events and must infer pairing itself.

## Options considered

### Option 1: A pure differential engine emitting a new typed Insight variant, built now against fixtures (PROVISIONAL rules)

Add `deriveMatch` to `lib/insights/`, emitting a `match_differential` Insight: ranked typed hypotheses (the causes), a typed question code, and optional unclaimed dollars. Wire it into `deriveInsights`. Build now against hand written fixtures covering all five causes plus true-up, positive detection, short window, blended, and honest absence.

**Pros**:
- Unblocks F8 immediately without waiting on the deferred aggregator observation.
- The §7 #16 discipline makes building on assumptions safe: a wrong rule produces a worse question, not a false claim.
- Delivers the build-graph's stated highest value artifact, the match differential test suite, which needs nothing external.
- Keeps the keystone property: one more pure function plus tests, no I/O, no schema change.

**Cons**:
- The pairing and classification rules rest on unobserved assumptions and must be revisited against real data.
- More work downstream: a differential with a question is harder to render well than a flat verdict.

### Option 2: Defer F3 until the real Northwind data is observed

Wait for spec 0001 task 9 to pull a real transaction history, then write fixtures from reality and build the engine.

**Pros**:
- The rules would be modeled on real data, not a guess, so fewer PROVISIONAL flags.

**Cons**:
- Blocks the highest priority flow (F8) on an aggregator task that is itself deferred, with no committed date.
- Leaves the repo's single highest value, most correctness critical artifact unbuilt, though it needs nothing external to build.
- The §7 #16 discipline already contains the risk that deferral is meant to avoid, so the wait buys little safety.

### Option 3: Build the logic now but keep it dormant (not wired into `deriveInsights`)

Build `deriveMatch` and its tests, but do not wire it into the engine's output until real data is seen.

**Pros**:
- The logic exists and is tested, and nothing user facing runs on assumptions yet.

**Cons**:
- A half measure: the wiring (one call site in `deriveInsights`) is the trivial part, so keeping it out saves almost nothing.
- Dead code that is not exercised end to end tends to rot; the honest gate is not "is it wired" but "does the surface assert a verdict," and §7 #16 already forbids that.

## Rationale

Option 1 wins on the two forces that dominate here. The build-graph calls the match differential test suite "arguably the single highest-value thing in the repo," and it needs nothing external, so deferring it (Option 2) trades the most valuable available work for a safety the §7 #16 discipline already provides. The genuine tension (real data unobserved) is real, but the locked decision to emit a question rather than a verdict is precisely the mitigation: a wrong pairing rule makes the tool ask a slightly clumsier question, not state a false "no match." That converts the data risk from a correctness risk into a quality of question risk, which PROVISIONAL flags and a follow-up against real data handle well.

Option 3's dormancy buys nothing, because the dangerous act is a surface asserting a verdict, and that is forbidden regardless of wiring; the wiring itself is a single call site. Emitting a new typed `Insight` variant (rather than a bare status, or English prose baked into the engine) keeps the engine language free and unit testable and lets the eventual surface and the language model do the wording, which is the keystone contract (foundation §7 #7, §4 #1).

On the formula input path, having the caller pass a resolved `CatalogEntry` (rather than typing `PlanFacts.matchFormula` now, or having the engine resolve from the catalog itself) keeps this slice pure and narrow: no persistence change, no coupling of the engine to catalog recognition logic that belongs upstream. Gross pay and contribution rate are already typed on `PlanFacts`, so only the formula needed a path. Passing the whole `CatalogEntry` rather than a bare `MatchFormula` is what lets the honesty flag (`verified` and its `note`) travel into the Insight, so the dollar figure computed on user #1's unverified Northwind entry can be disclosed as an unconfirmed basis (foundation §7 #13) rather than stated as fact.

## RECOMMEND decisions settled here

These finer rules were left to the architect to set with full design context; each is PROVISIONAL pending real data (foundation §11):
- **Window sufficiency**: `windowMonths` is the span from the earliest to the latest contribution event date for the account, but span alone is not enough. `windowSufficient` requires the span to be at least 13 months AND enough observed contribution periods (`observedPeriodCount`) to have actually caught an annual cycle. A gapped or dormant history that crosses 13 calendar months without continuous observation is NOT sufficient, because the annual lump sum was never given a real chance to appear. This closes the sparse history hole (a pure span check would prematurely down weight `annual_lump_sum_timing`).
- **Pairing**: group an account's events by calendar date. Two or more on one date is a candidate pair; one is `single`; a date whose single line cannot be split (a rawName hint of a combined or total contribution) is `blended`. There is no `"none"` variant: an account with no events returns `null` (AC-1), so a pairing is always observed. Runner up (amount ratio pairing across a date window) was set aside as assuming more about amounts than has been observed.
- **Ratio**: `observedRatioBps` is the employer amount over the employee amount in basis points, and is the MODAL ratio across the paired dates (the recurring value), not a single date's, so one odd date cannot define it. Dates flagged `true_up_correction` are excluded from this computation, because a reconciling deposit would skew the ratio at the very moment `match_detected` claims high confidence. Computed only when itemized pairs exist (both a deferral hint and a match hint in the rawNames); otherwise `null`.
- **True-up**: a `true_up_correction` hypothesis is raised for a deposit that is off the modal cadence and atypical in magnitude (for example a single large deposit after year end among weekly ones); it can coincide with a normal payroll date, so the flag is by amount and timing, not by date uniqueness. PROVISIONAL heuristic. The flagged date is excluded from the ratio (above).
- **Ranking**: hypotheses are ranked by the strength of the observed signal, deterministically. A present ratio ranks `match_detected` first; a below cap contribution ranks `below_match_threshold` above `no_match_offered`; a short or sparse window keeps `annual_lump_sum_timing` high, and a `windowSufficient` history with a full clean cycle and no lump seen demotes it (a convergence rule, so the tool stops offering an excuse the data has ruled out). `no_match_offered` is always present but never alone and never ranked 1 while another cause is live (foundation §7 #16). Note: demoting `not_yet_eligible` after long tenure would need a hire or eligibility date, which the data model does not carry yet (see the index Follow-up); until then it stays a live hypothesis for a single line history.
- **Unclaimed gating** (the false positive mirror of §7 #16): `unclaimed` is populated only when formula and gross pay are present AND the rank 1 hypothesis is `match_detected` or `below_match_threshold`. When the rank 1 hypothesis is `no_match_offered` or `blended_unitemized`, `unclaimed` stays `null`, so the engine never states a dollar figure while it is unsure a match exists. The rank 1 cause travels in `hypotheses[0]` so a renderer cannot divorce the number from its caveat.
- **Questions**: `questions` is a non empty priority ordered list, not a single code, so two live uncertainties (for example a blended pairing with a missing gross pay) both surface. Priority: quantify blockers first (`recognize_formula`, then `provide_gross_pay`), then the confidence questions (`confirm_ratio_looks_like_match`, `confirm_eligibility_status`, `widen_window`), then `confirm_whether_plan_matches` as the honest catch all for the single line bundle.

**On AC-6 and foundation §7 #13.** Emitting the unclaimed dollar figure on an unverified formula is not asserting an inference as fact. Two things keep it honest: the figure is the mechanical dollar consequence of a stated formula, which §7 #2a explicitly allows; and it is emitted WITH the `questions` (a `confirm_ratio_looks_like_match` or `recognize_formula`) and the `formulaVerified`/`formulaNote` flags, so the surface frames it as "if your plan matches this shape (does it?), you are leaving about $X" rather than a settled number. That is a question carrying a figure, which is what §7 #13 asks for, not a bare assertion.

## References

**Project sources** (verifiable, in this repo):
- `context/foundation.md` §5 (the match inference method and the five causes table), §7 #1, #7, #12, #13, #16 (the locked rules this engine obeys), §11 (the deepest risk and the bet).
- `context/build-graph.md` (F3's dependency edges, the ≥13 month requirement, the one genuine tension, and the note that the match differential suite is the highest value artifact).
- Spec 0002 (the pure insight engine and the `Insight` union this extends), spec 0006 (contribution events stored raw as `source: "unknown"`), spec 0007 (`lib/plans` formula types and catalog, and `lib/insights/match.ts` arithmetic this calls).
- `context/code-standards.md` §3 (arithmetic lives in `lib/insights/`), §8 (per case test coverage is non negotiable).

**Practices & standards**:
- Differential diagnosis over a single verdict for an ambiguous signal (foundation §5, §7 #16).
- 401k true-up: a late reconciling deposit is a correction, not a new pattern (foundation §5; the SHRM and Newfront true-up sources recorded in foundation's research appendix).
- Deterministic pure functions for correctness sensitive logic, tested against fixtures with no infrastructure.
