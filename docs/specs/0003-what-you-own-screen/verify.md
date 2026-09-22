# Verify: what-you-own-screen · spec 0003 · updated 2026-09-08

_Steps derived from spec 0003 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones. This is a UI slice: some checks are visual (render and look), some are grep/build gates._

## Commands

- [ ] `npx tsc --noEmit` → exits 0 → AC-7
- [ ] `npx eslint app lib components` → exits 0 → AC-7
- [ ] `npx next build` → compiles; routes `/` and `/dev/plaid-spike` both build → AC-8
- [ ] `grep -rnE "[a-zA-Z_]+ */ *(total|100|[Tt]otal)|value *[*/]" components/ui app/page.tsx` → no money arithmetic in components/screen (AllocationBar uses flex-grow, no division) → AC-6, AC-10
- [ ] `grep -rniE "#[0-9a-f]{3,6}" components/ui` → no raw hex in ported components (tokens only) → AC-1

## UI / manual (render at localhost, look at it)

- [ ] Home `/` renders the dashboard shell (FINBUDDY wordmark + nav, "What you own" active) on the paper ground → AC-8
- [ ] Hero: "Everything you own" as a serif figure that counts up, with an ink rule beneath → AC-3, AC-9
- [ ] The Traditional IRA card shows its total (serif), an AllocationBar with legend percentages (etf/derivative/cash), and a HoldingRow per holding with a plain sub line, rows split by a rounded Rule → AC-2, AC-3
- [ ] The AllocationBar legend percentages match the engine's shareBps (not a self-computed number); segments sum to 100% → AC-10
- [ ] The 401(k) renders the missing-capability state: its balance shown, a "Balance only" badge, and the plain line "We can see this account's balance, but your plan doesn't share what's inside it yet..." — never a blank, `$0`, or broken card → AC-5
- [ ] No red/green money colour anywhere; money figures are ink/serif → AC-4
- [ ] The Lucide info icon renders in the 401(k) card (Lucide script loaded) → AC-8
- [ ] Mobile (375px): the page does not scroll horizontally; the nav scrolls instead of overflowing; cards reflow to one column → AC-9
- [ ] `/dev/plaid-spike` still renders the Plaid Link + sandbox flow (spec 0001 task 9 preserved) → regression guard

## Acceptance-criteria coverage

- **AC-1** tokens wired, no raw hex → the hex grep + render on paper
- **AC-2** per-account total + allocation + holdings → the IRA card render
- **AC-3** money is serif/tabular → hero + card figures
- **AC-4** money semantics not red/green → colour check (no deltas shown)
- **AC-5** missing-capability state → the 401(k) card
- **AC-6** no arithmetic in the view → the grep + view-model builder owns the total
- **AC-7** Server Component default, strict TS → tsc + build; Card/Stat/Icon are the client leaves
- **AC-8** dashboard shell + build → the render + route build
- **AC-9** interaction/motion states → focus visible; count-up honours reduced motion; mobile no-overflow
- **AC-10** ported components compute no displayed figure → the grep; AllocationBar shows engine shareBps only

## Deviations from the spec (flagged for the record)

- The spec said the spike page and its actions are removed. Instead they were **relocated to `/dev/plaid-spike`**, because spec 0001 task 9 (the real Plaid observation) is unrun and needs that Link + fetch UI. Removing it would have deleted the only way to run task 9. The home page is the new screen as specified; the spike lives on at a dev route until task 9 is done.
