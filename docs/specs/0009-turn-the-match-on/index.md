# 0009. Turn the match on (F8)

**Date**: 2026-09-24
**Status**: In Progress

## Summary

This slice builds F8, the highest priority flow: the walkthrough that takes the user from "I don't match" to a changed contribution rate. It renders F3's match differential (spec 0008) as a three step walk on the Match surface. Step 1 confirms the plan's match as a question (never a fact). Step 2 collects the user's gross pay, then shows what they are leaving behind and what each target rate would capture, in their own dollars. Step 3 gives plain in app steps to change the rate in their plan's site and celebrates when they report they did it. Every figure is computed in `lib/insights/`, never invented; the wording is templated (no language model yet, that is F5); F8 never picks or sets the rate.

## Requirements

**User stories**:
- As the confused holder, I want to see how much employer match I am leaving behind and be walked to turning it on, so I stop losing my employer's money.
- As the confused holder, I want the tool to confirm my plan's match with me rather than assert it, and to tell me how to change my rate without making me read plan paperwork.

**Acceptance criteria** (each independently checkable):
- **AC-1**: The Match surface renders F3's `match_differential` for the employer 401k as a three step walk (confirm, then see and choose, then turn on). When there is no employer match account or no `match_differential`, it shows an honest empty state, never a blank or a fabricated opportunity (foundation §4 #7).
- **AC-2**: Step 1 shows the inferred or recognized formula as a question through a `BuddyMessage` (the inferred and unconfirmed state, ui-rules §5), never as a settled fact. An unverified catalog formula (the Northwind entry, `verified: false`) is surfaced provisionally with its note (foundation §7 #13, #16). The user confirms or corrects it by picking a shape from the catalog, and the choice persists to `plan_facts.match_formula` (the catalog entry id). There is always an explicit "none of these match" or "I am not sure" outcome, so the user is never forced to affirm a formula that is not theirs; choosing it keeps the walk in the "cannot quantify with confidence" state (AC-9), never a laundered guess. An actively confirmed pick is a genuine tier 2 recognition (foundation §7 #12); a formula the user did not actively confirm is never treated as verified for this user.
- **AC-3**: Step 2 collects the tier 3 gross pay (persisted to `gross_pay_minor`) and the confirmed current contribution rate (persisted to `contribution_rate_bps`). The current rate is suggested from the observed deferrals and gross pay where derivable and shown as a question to confirm (foundation §7 #13); otherwise it is asked. Pay frequency is likewise derived by a named `lib/insights/` function from the contribution events and shown as a question to confirm (never silently assumed), because contribution cadence is an unreliable signal (foundation §5). If the user cannot confirm a frequency, the per paycheck figures are withheld (see AC-4).
- **AC-4**: Step 2 shows, for the chosen target rate, four figures, each computed only in `lib/insights/` (foundation §7 #1): the unclaimed annual match (from `unclaimedMatchMinor`), the annual match captured at that rate, the before tax per paycheck contribution cost (rate delta times gross divided by confirmed pay periods), and a tax adjusted take home estimate using `DEFAULT_MARGINAL_RATE_BPS`. The last is clearly labelled a rough illustration and not tax advice (foundation §7 #14, §8). The two per paycheck figures appear only once pay frequency is confirmed (AC-3); until then the annual figures show and the per paycheck ones are withheld, not guessed.
- **AC-5**: The user picks the target rate from options that EACH render their own consequence with identical visual and copy treatment: every option shows its own captured amount, before tax cost, and take home estimate (ui-rules §4), so no option wins by narrative weight. F8 never pre selects or recommends a rate, and never sets it (foundation §7 #2a): the ported `Radio` group renders with NO option checked until the user acts. The "at the cap you capture the full match" option states the mechanical consequence as a fact about the plan, not a recommendation, and carries no extra emphasis over the others.
- **AC-6**: Step 3 gives generic, provider neutral, in app steps to change the rate; it never sends the user to a plan document (foundation §4 #6). A `Dialog` confirms the user is proceeding (the person acts, ui-rules §4, foundation §7 #2a).
- **AC-7**: When the user reports they changed the rate ("I changed it"), a `WinMoment` shows the projected annual match now captured, clearly labelled a projection and not a secured balance (foundation §7 #14). The report is not persisted (we cannot verify it); the "at most once" cap is a client side flag scoped to the route's mount (a page refresh may reset it, which is acceptable since nothing is persisted). No claim of secured or captured money is made anywhere.
- **AC-8**: When there is nothing unclaimed (the contribution is already at or above the cap), the walk congratulates and offers no rate change; it never invents a reason to contribute more (foundation §7 #2a).
- **AC-9**: When something is unresolved, the walk collects it and says so honestly, with copy that matches the real blocker: "we need more history to be sure" ONLY when F3's window is insufficient (a genuine waiting problem), and "tell us a bit more" when the blocker is a missing recognition, gross pay, or pay frequency (answerable now). It never tells the user to wait when the real blocker is an unanswered question, and never shows a dollar figure it does not have (foundation §4 #7, and §7 #16's spirit of not overstating uncertainty either way).
- **AC-10**: `plan_facts` reads and writes are user scoped through `lib/db` (RLS plus the deferred auth `DEV_USER_ID` gate, like the rest of the data layer, spec 0004). The resolve path maps the stored formula id to a `CatalogEntry` through `getCatalogEntry` and passes it to the engine as `EngineInput.matchFormulas`. If the stored id is no longer in the catalog (a later catalog change), the walk degrades to the recognition state (AC-9), never throws.
- **AC-11**: No figure originates in the view or in any copy string; every displayed amount traces to a `lib/insights/` function and appears with its label and a plain sentence (ui-rules §2, foundation §4 #3). Money is integer minor units, rates integer basis points.
- **AC-12**: The surface follows the design system: money in the serif `Stat`, apricot reserved for the unclaimed opportunity and the `WinMoment`, one primary action per step, `Rule` not borders. Every ported component consumes semantic tokens only (ui-rules §1, §3; ui-tokens §7).

## Decision

**Chosen option**: Option 1: One coherent F8 flow, templated copy, LLM deferred.

Build the whole Match walk end to end in this slice (plan facts persistence, acquisition, the three step walk, the four figures, the Dialog confirm, and the projected WinMoment), rendering F3's differential, with the wording rendered as templated copy from structured data (the language model layer is deferred to F5), and F8 never picking or setting the rate.

**Implementation skills**: `supabase` (`supabase/*`, `.claude/skills/supabase/`) for the new `lib/db/plan-facts.ts` access module over the existing `plan_facts` table (reads and writes, RLS already on it from spec 0004).

## Feature design

**Data model sketch** (persisted plus in memory; no new table, no migration):

`plan_facts` (existing table, spec 0004, now written by F8; upserted per `(user_id, account_id)`):
| Column | Type | F8 use |
|---|---|---|
| `employer` | text | the plan's employer, from the account |
| `match_formula` | text | the resolved catalog entry id the user recognized |
| `contribution_rate_bps` | integer | the confirmed current rate |
| `gross_pay_minor` | bigint | the tier 3 remembered number |

Pay frequency is not stored: a named pure function (`observedPeriodsPerYear(events)` in `lib/insights/`) derives it from the contribution events, and it is confirmed with the user as a question before any per paycheck figure uses it (foundation §5, §7 #13). The marginal tax rate is a labelled constant `DEFAULT_MARGINAL_RATE_BPS` (not stored). The user's reported rate change is session state only (not persisted; unverifiable).

In memory: the walk view model (`lib/view/match.ts`) carries the three step data: the step 1 question and provisional flag, the step 2 figures and rate options, the step 3 generic steps, and the empty or insufficient states.

**State transitions** (the walk, client UI state; facts persist as steps complete):
`step 1 confirm` (persist formula on confirm) → `step 2 see and choose` (persist gross pay and current rate; user selects a target rate) → `step 3 turn on` (generic steps, Dialog confirm) → `reported changed` (session only) → `WinMoment`. The user can leave and return; persisted facts resume the walk. Insufficient inputs hold the walk at the step that collects them.

**API surface** (server actions and the view loader; no HTTP endpoints, no external callers):
| Function | Kind | Key inputs | Key outputs | Auth | Key cases |
|---|---|---|---|---|---|
| `getPlanFactsForAccount` | lib/db read | accountId | `PlanFacts \| null` | user scoped | none for a new account |
| `savePlanFacts` | lib/db write | accountId, {employer, matchFormulaId, contributionRateBps, grossPayMinor} | ok | user scoped | upsert on (user, account) |
| `loadMatch` | view loader (server) | (current user) | the Match walk view model | user scoped | empty state when no 401k / no differential |
| `confirmFormulaAction` / `saveGrossPayAction` / `confirmRateAction` | server action | the field(s) | updated view model | user scoped, re-checks scope | validates input at the boundary |

**Key invariants**:
- The model computes no figure. Every displayed number comes from `lib/insights/` (foundation §7 #1); the view and the templated copy only format and place figures the engine returned.
- F8 never picks a rate and never sets it. It states consequences; the person chooses and acts (foundation §7 #2a). The rate change happens in the user's own plan site. A user picked target rate is validated to a sane range (at least zero, no more than a reasonable ceiling) at the server action boundary.
- Inference is a question, never a claim. The formula (especially the unverified Northwind one) is confirmed with the user, never asserted (foundation §7 #13, #16).
- Never send the user to a plan document (foundation §4 #6): the step 3 guidance is in app.
- Never a blank or a false zero. Absence, uncertainty, and "already fully matched" are explicit designed states (foundation §4 #7, ui-rules §5).
- The tax adjusted figure is a labelled illustration, not advice, and never crosses into tax optimization (foundation §7 #14, §8).

**Security model**: no new data surface beyond `plan_facts`, which already carries `user_id` and RLS (spec 0004). Reads and writes go through the user scoped `lib/db` client, which uses the server only secret key and stamps `DEV_USER_ID` until real auth lands (spec 0004's deferred auth, unchanged here). Server actions validate their input and re-check scope (code-standards §4). No new secret and no new environment variable: the LLM is deferred, so no provider key; the marginal rate is a plain constant, not a secret.

**Configuration required**:
- `DEFAULT_MARGINAL_RATE_BPS`: a code constant (for example 2200 for 22 percent) for the labelled take home illustration. Not an environment variable, not a secret.

**Critical test scenarios** (each maps to an AC):
- Happy path: a recognized formula plus gross pay yields the unclaimed figure and per rate consequences; the user picks a target rate and reaches the projected WinMoment, verifies **AC-4**, **AC-5**, **AC-7**.
- Figures are pure: the four figures equal their `lib/insights/` function outputs; no arithmetic in the view, verifies **AC-11**.
- Never assert: an unverified formula is shown as a question with its note, never as a fact, verifies **AC-2**.
- Never pick or set: no rate is pre selected or recommended, and no action changes the rate anywhere, verifies **AC-5**.
- Nothing unclaimed: an at cap contribution congratulates and offers no change, verifies **AC-8**.
- Not enough to say: an insufficient window or an unrecognized differential shows "we need more history" and collects inputs, no dollar figure, verifies **AC-9**.
- Honest empty: no 401k or no differential shows the empty state, verifies **AC-1**.
- Scope: `plan_facts` reads and writes are user scoped and resolve the formula id to a catalog entry, verifies **AC-10**.

## Build plan

No migration: `plan_facts` and its RLS already exist (spec 0004). The approach is a thin end to end thread first (real numbers onto a minimal surface), then thicken with the full walk and the ported components, so the UI always binds to a real figure.

1. `lib/db/plan-facts.ts`: `getPlanFactsForAccount` and `savePlanFacts` (upsert on `(user_id, account_id)`) over the existing `plan_facts` table, user scoped like the rest of `lib/db`, satisfies **AC-10**
2. `lib/insights/match.ts` additions: `observedPeriodsPerYear(events)` (derive pay frequency from the contribution events, reusing the cadence logic), `contributionCostPerPeriodMinor`, and `takeHomeCostPerPeriodMinor` (using `DEFAULT_MARGINAL_RATE_BPS`), all pure, integer money and basis points, unit tested per case, satisfies **AC-3**, **AC-4**, **AC-11**
3. The resolve and read path plus `lib/view/match.ts`: read `plan_facts` and `contribution_events`, resolve `matchFormulas` through `getCatalogEntry` (degrade to the recognition state if the id is gone), run `deriveInsights`, and assemble the three step walk view model including the "none of these match", empty, insufficient (split waiting versus answerable copy), and already fully matched states, satisfies **AC-1**, **AC-2**, **AC-9**, **AC-10**
4. Server actions (`confirmFormulaAction`, `saveGrossPayAction`, `confirmRateAction`): validate input and re-check scope, persist through `lib/db/plan-facts.ts`, satisfies **AC-2**, **AC-3**
5. Port the export components into `components/ui/` consuming semantic tokens only, as an isolated batch verified against the design tokens on its own (so a visual or token bug stays separable from an advice line bug, mirroring how spec 0003 ported components ahead of feature logic): Button (including the `pop` variant), Radio (`boxed`, rendering with NO option checked by default), Input, BuddyMessage, Dialog, StepProgress, WinMoment, satisfies **AC-5**, **AC-12**
6. Build the Match surface and its route: step 1 (confirm the formula through `BuddyMessage`, provisional handling), step 2 (collect gross pay and current rate, show the four figures, the user picks a target rate), step 3 (generic in app steps, `Dialog` confirm), satisfies **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-6**, **AC-8**, **AC-9**, **AC-12**
7. The projected `WinMoment` on a reported change: session only, at most one, clearly a projection, satisfies **AC-7**

## Consequences

**Positive**:
- Ships F8, the highest priority flow (foundation §3): the match loop is now usable end to end, from the differential to a walked change.
- Gives `plan_facts` its first write path and the tier 2 and tier 3 acquisition UX, which later features reuse.
- Ports seven design system components (Button, Radio, Input, BuddyMessage, Dialog, StepProgress, WinMoment), which every later surface can reuse.
- Keeps the number rule airtight: templated copy means no language model anywhere near a figure.

**Negative / tradeoffs**:
- Templated copy is less flexible and less conversational than the language model wording F5 will bring; some phrasing will feel fixed until then.
- The tax adjusted take home figure rests on a single assumed marginal rate. If a reader misses the label it could mislead, and it sits closest to the §8 tax optimization line; it is kept as a labelled illustration for that reason.
- The generic portal steps are less helpful than provider specific ones would be; a per provider steps library is deferred.
- The WinMoment celebrates a projected, self reported change, not verified captured money; honest labelling carries that weight until a later sync can confirm the change.

**Neutral**:
- Pay frequency is derived from the observed cadence rather than stored; if a user's pay cadence differs from their contribution cadence, the per paycheck figure would be off, which is why it is confirmed as a question.
- No new table, no migration; `plan_facts` and its RLS already existed unused.
- The current contribution rate is derived where possible and asked otherwise, so the number of questions varies by data.

## Follow-up

- [ ] Wire the language model layer (F5) and replace the templated copy with grounded wording, keeping figures out of the model.
- [ ] Build a per provider portal steps library (starting with the Northwind recordkeeper), replacing the generic guidance.
- [ ] Upgrade the WinMoment from a projection to verified capture once a later data sync can detect the changed contribution.
- [ ] Reconsider the fixed marginal rate: offer a coarse income band input if the single default proves too rough.
- [ ] Lock the "provisional figure" visual mark (ui-rules §5 open question) now that the match differential ships in a real surface.
- [ ] When a real source for the current contribution rate exists (from the provider), reduce the asked inputs.

## Rationale

Reasoning, options considered, and references: see [rationale.md](rationale.md). Verify steps: see [verify.md](verify.md).
