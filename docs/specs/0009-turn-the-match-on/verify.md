# 0009. Turn the match on (F8) — verify

> How `/check verify` proves this slice against the spec. F8 is a real UI flow with a persistence path, so verification drives the app (the Match surface) and confirms the persisted facts and the computed figures. Prove every acceptance criterion in [index.md](index.md) plus the standing gates.

## Setup

- Run the app the project's way (the dev server). The Match surface needs a linked 401k with contribution events (spec 0006) so F3 emits a `match_differential`; use the sandbox link path that spec 0005/0006 verified, or a seeded fixture user.
- The pure figure functions (`lib/insights/match.ts` additions) and the view model can be exercised by their unit tests without the app; the walk itself is driven in the browser.

## Acceptance criteria checks

- **AC-1 three step walk / empty state**: the Match surface renders the three step walk for a 401k with a `match_differential`. A user with no 401k, or one with no differential, shows the honest empty state (no blank, no fabricated opportunity). Evidence: the rendered surface for both cases.
- **AC-2 formula as a question, with an escape**: step 1 shows the formula through a `BuddyMessage` phrased as a question, with confirm, correct, AND an explicit "none of these match / I am not sure" outcome; an unverified formula (Northwind) shows its provisional note and is never asserted. On confirm, `plan_facts.match_formula` holds the chosen catalog entry id (query the row). Choosing the escape keeps the walk in the "cannot quantify with confidence" state (AC-9), and no dollar figure appears.
- **AC-3 acquisition persists, frequency confirmed**: step 2 collects gross pay and the current rate; after saving, `plan_facts.gross_pay_minor` and `contribution_rate_bps` hold the values (query the row). Where derivable, the current rate is pre suggested and shown as a question. Pay frequency is derived by `observedPeriodsPerYear` and shown as a question to confirm; if not confirmed, the per paycheck figures do not appear.
- **AC-4 four figures, all from lib/insights, per option**: each rate option shows its own unclaimed annual match, match captured at that rate, before tax per paycheck cost, and labelled tax adjusted take home, with identical treatment. Confirm each equals its `lib/insights/` function output for the inputs, and the tax adjusted one is labelled a rough illustration, not tax advice. The per paycheck figures appear only after pay frequency is confirmed.
- **AC-5 never pick or set, no default, per option parity**: the ported `Radio` group renders with NO option checked until the user acts; no option is marked recommended or carries extra emphasis; every option renders its consequence triple with the same treatment; the user selects the target rate; no control anywhere changes the rate (the change happens in the user's plan site). Evidence: the rendered options and the absence of a rate setting action.
- **AC-6 generic steps, no plan document, Dialog confirm**: step 3 shows generic in app steps and never links out to a plan document; a `Dialog` confirms the user is proceeding.
- **AC-7 projected WinMoment**: reporting "I changed it" shows a `WinMoment` with the projected annual capture, labelled a projection, not secured money; the once cap is a route mount flag (a refresh may reset it, acceptable); nothing about the report is written to the database (confirm no new row or column changed).
- **AC-8 already fully matched**: an at cap contribution congratulates and offers no rate change.
- **AC-9 not enough to say, honest copy**: an insufficient window shows "we need more history to be sure"; a missing recognition, gross pay, or pay frequency shows "tell us a bit more" and collects it. Neither shows a dollar figure it does not have, and the waiting copy is not used for an answerable blocker.
- **AC-10 scoped persistence and resolve**: `plan_facts` reads and writes go through the user scoped `lib/db`; the stored formula id resolves to a `CatalogEntry` through `getCatalogEntry` and reaches the engine as `matchFormulas` (evidence: the differential quantifies after step 1 and step 2). A stored id no longer in the catalog degrades to the recognition state, never throws.
- **AC-11 no figure in the view**: a static check confirms no arithmetic in `lib/view/match.ts` or the components beyond formatting; every amount traces to a `lib/insights/` function. Money is integer minor units, rates integer basis points.
- **AC-12 design system**: money uses the serif `Stat`; apricot appears only on the unclaimed opportunity and the `WinMoment`; one primary action per step; `Rule` not borders; ported components use semantic tokens only (a grep for raw hex or ramp tokens in the new components returns nothing).

## Standing gates (all must pass)

- `tsc` clean.
- `eslint` clean for the slice.
- The full test suite passes, including the new `lib/insights/match.ts` figure tests and the `lib/view/match.ts` view model tests, and the existing suites (no regression). The live `lib/db/roundtrip.test.ts` (spec 0004) may fail only because the free tier Supabase project is paused; that is environmental, not this slice.
- `next build` clean.

## What NOT to expect in this slice

- No language model: the wording is templated. `lib/llm/` is not built (that is F5).
- No per provider portal steps: the guidance is generic.
- No verified capture: the WinMoment is a projection on a self reported change, not confirmed captured money.
- No migration: `plan_facts` and its RLS already exist (spec 0004); this slice adds the access module and the write path, not the table.
