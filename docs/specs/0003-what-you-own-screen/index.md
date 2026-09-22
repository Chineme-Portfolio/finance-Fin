# 0003. "What you own" screen: the first real UI, rendering the insight engine

**Date**: 2026-09-04
**Status**: Accepted

## Summary

The first real screen. It shows the person what they hold, account by account, in the FINBUDDY design language: a warm paper page, money set in a serif, each account broken into what it owns with a plain-language line per holding. It renders the insight engine's output and computes no figure of its own. It sits in a dashboard-first shell (you land on your money, Fin is a panel you open), which resolves the app-shape question. Because there is no database or login yet, it renders the committed real fixture through the real engine, plus one account that returns a balance but no holdings, so the "we can see the balance, not what is inside" state, which this product must handle, is built and visible from day one.

## Requirements

**User stories**

- As the person, I want to see what I actually own, account by account, in plain words, so that my statements finally make sense.
- As the person, I want an account the tool cannot see inside to say so plainly, so that a gap never looks like a zero or a broken screen.
- As the builder, I want the screen to render the engine's output and never do its own arithmetic, so that the "the model and the UI never compute a number" rule holds at the view layer too.

**Acceptance criteria**

- **AC-1**: The design system tokens are wired into the app (the `design-system/source/tokens/` CSS is imported so `var(--...)` resolves), and every component this screen uses consumes semantic aliases only, no raw hex and no raw ramp token (`ui-tokens.md` §7).
- **AC-2**: The screen renders, per account with holdings: the account name, its total as a serif money figure, a composition breakdown (an `AllocationBar` of the engine's composition groups), and one `HoldingRow` per holding with a plain-language `sub`. Rows are separated by `Rule`, not borders.
- **AC-3**: Every money figure on the screen is set in the serif with tabular numerals (via the `Stat` component or the `.fb-figure` utility). A dollar amount rendered in the sans is a defect (`ui-tokens.md` §3).
- **AC-4**: Gains, losses, and the "unclaimed"/attention colour follow the money semantics (`--data-gain` pine, `--data-loss` deep clay, `--data-attention` apricot); red for loss or green for gain does not appear (`ui-rules.md` §3). A delta is never colour alone; it carries its signed figure.
- **AC-5**: An account whose capabilities do not include `holdings` (demonstrated by stripping the `holdings` capability from the fixture's 401k, standing in for the confirmed Northwind case, `foundation.md` §11, §7 #15) renders a designed missing-capability state: its balance shown, and a plain-language line saying the tool can see the balance but not what is inside, and why. It is never a blank, a `$0`, a dash, or a broken card (`foundation.md` §4 #7, `ui-rules.md` §5).
- **AC-6**: The screen and its components compute no financial figure. Every number shown comes from an `Insight` produced by the engine, or from a pure helper in `lib/` (the cross-account portfolio total), never from arithmetic inside a React component (`foundation.md` §4 #1, §7 #7).
- **AC-10**: Ported components do not compute a displayed figure of their own. Specifically: the reference `AllocationBar` computes and can display its own rounded percentage from raw segment values; the port must **not** show a self-computed percentage. Any percentage label comes from the engine's `CompositionGroup.shareBps`, which already sums to exactly 10000 by a careful integer algorithm. And the props that have no source in the engine's output on this screen (`HoldingRow.percent`, `HoldingRow.delta`, `Stat.delta`, `Stat.deltaLabel`) are **left unset** here, because the domain model carries no per-holding share, no per-holding gain, and no time series. No delta or "since January" figure appears on this screen.
- **AC-7**: The page is a Server Component by default; any interactivity is isolated to `'use client'` leaf components. Strict TypeScript, no `any` (`code-standards.md` §2, §4).
- **AC-8**: A dashboard-first shell places the screen: the FINBUDDY wordmark and top chrome, the page frame at `--page-max`. Fin is not the front door (`foundation.md` §7 #17). Building every nav destination is out of scope; the shell just frames this screen.
- **AC-9**: Interaction states and reduced motion hold: focus is visible on every interactive element, and the token layer's `prefers-reduced-motion` collapse is preserved so the `Stat` count-up honours it (`ui-rules.md` §6).

## Decision

**Chosen option**: Option 2: a Server Component screen rendering the engine's output over a static view model, in a dashboard-first shell.

Build the screen as a React Server Component that loads a **view model** built in `lib/` (the committed fixture mapped through the aggregator mapping and the insight engine, plus one representative capability-gapped account), and renders it with components ported from the design system registry. No database, no live fetch, no arithmetic in the view. The cross-account total is a pure `lib/` helper. Replaces the disposable spike page.

**Implementation skills**: none (the design system is documentation and reference code, not an installed agent skill).

## Rationale

Reasoning, the options weighed, and the app-shape decision: see [`rationale.md`](rationale.md).
Verification steps: see [`verify.md`](verify.md) once `/develop` writes it.

## Feature design

**Build approach**: **Facade.** A UI-first slice: the real shell and the real screen, rendered over static demo data, with the live data source deferred. `foundation.md` records no project-wide approach, and for a first screen whose job is to prove the render and exercise the design system, the Facade frame is the honest fit. The data-loading seam is built so a live source (a server action over the aggregator, or the future database) drops in behind it without touching the screen.

**Data model / view model** (no persistence; these are in-memory shapes the screen renders):

```
AccountView
  account: Account                 the domain account (lib/types)
  insights: Insight[]              this account's composition + cash_drag, from deriveInsights
  holdings: Holding[]              this account's holdings (for the HoldingRow list)
  seesHoldings: boolean            derived from account.capabilities.includes("holdings")

WhatYouOwnView
  accounts: AccountView[]
  portfolioTotalMinor: number      a PURE lib helper sums the account totals (never in a component)
```

- Holdings-capable accounts come from mapping the committed fixture (`fixtures/holdings-ymw6pgkb.json`) through `mapHoldingsResponseToDomain`, then `deriveInsights`.
- The missing-capability state is demonstrated by **deriving it from the fixture's own `investment/401k` account**: the view-model builder strips `"holdings"` from that account's `capabilities` and empties its holdings list, leaving its real (synthetic) balance. This stands in for the confirmed Northwind 401k (`foundation.md` §11), whose sandbox fixture happens to return holdings. Deriving from a real fixture account (rather than fabricating a separate fake `Account` with an invented name and balance) ties the demo to real data, and makes the eventual removal a one line revert (stop stripping the capability) once live data lands. The strip is done in one named, commented place with a `TODO` tied to the live-data follow-up, so it cannot survive silently.

**Component inventory** (all ⬜ planned in `ui-registry.md`; port each from `design-system/source/components/`, consuming tokens):

| Component | Role on this screen |
|---|---|
| `Card` | The surface for each account section and the missing-capability state (`tone="sunk"` for the gap) |
| `Stat` | Every money figure: the portfolio total and each account total, serif + tabular. **`delta`/`deltaLabel` are not used** (no time series exists, AC-10). Note: `Stat` runs a count-up hook and is therefore a client leaf, see below |
| `AllocationBar` | Each account's composition, one segment per security-type group. **Fed the engine's per-group `valueMinor` for segment proportions; its internal percentage display is suppressed** (any percent label the screen shows comes from the engine's `shareBps`, never from the component's own division). See AC-10 |
| `HoldingRow` | One per holding, carrying the plain-language `sub`. **`percent` and `delta` are not used** on this screen (AC-10); rows are non-interactive so the trailing chevron (which pulls in `Icon`) does not render |
| `Rule` | The rounded divider between holdings and sections |
| `Badge` | Account-state marks (e.g. an attention/neutral tag on the gapped account) |
| `Wordmark`, `TopNav` (minimal), `Icon` | The dashboard shell chrome |

If a component the screen needs is not portable from the registry as-is, that is a design gap to flag in Follow-up, not to invent.

**Porting gotchas the build will hit (from reading the reference `.jsx`):**
- **`Icon` and `Stat` must be `'use client'` leaves.** `Icon` polls `window.lucide` and injects an SVG imperatively; `Stat` runs a count-up hook using `window.matchMedia`/`requestAnimationFrame` even when not animating. Neither can be a Server Component. AC-7's "Server Component by default" holds at the page level; these two are the isolated client leaves.
- **`Icon` needs the Lucide UMD script** loaded once in the root layout (the export loads `lucide@0.544.0` from a CDN). Without it, icons never render. There is a first-paint flash while it polls; acceptable for now, noted so it is not mistaken for a bug. (The CDN dependency is itself worth a later look, but not this slice.)
- **`TopNav` in the export hardcodes two literal hex values** (`#332C25`, `#2C251E`) for its inverse-active and border states. A faithful port would reintroduce a raw-hex token violation (AC-1). During the port, replace these with a semantic token, or if none fits, flag it as a design gap in Follow-up rather than shipping the hex.
- **Fonts load via `@import` of Google Fonts** inside the token CSS (not `next/font`). Deliberate and temporary (`ui-tokens.md` §3, a flagged substitution); keep it, do not "fix" it to `next/font` in this slice.

**Where things live**:
- `components/ui/`: the ported design-system components (real React components, tokens only).
- `lib/view/what-you-own.ts`: the pure view-model builder and the `portfolioTotalMinor` helper (no React, no I/O beyond reading the committed fixture).
- `app/page.tsx`: the screen (Server Component), replacing the spike page. The spike's Plaid link UI and its actions are removed with it (they were disposable per spec 0001).
- `app/globals.css`: imports the design-system tokens.

**Key invariants**
1. No React component computes a financial figure (AC-6). The view-model builder and the engine own all arithmetic; components receive finished numbers and format them.
2. Components read semantic tokens only (AC-1). A raw hex or ramp token in `components/ui/` is a defect.
3. Money is always serif + tabular (AC-3); money colour is always the money semantics, never red/green (AC-4).
4. Missing capability is a rendered, explained state, never an absence (AC-5).

**Security model**: this screen reads a committed synthetic fixture and renders it. It touches no credentials, no token, no live account, no network, no persistence. `security.md` still forbids logging real financial values, but the fixture carries none (it is the synthetic, leak-checked output of spec 0001).

**Configuration required**: none.

**Critical test scenarios**
- Happy path: an account with holdings renders its total, an `AllocationBar` whose segments match the engine's composition groups, and a `HoldingRow` per holding. Verifies **AC-2**, **AC-3**.
- Missing capability: the capability-gapped account renders the explained "balance visible, holdings not" state, not a blank or `$0`. Verifies **AC-5**.
- No-arithmetic guard: every figure on the page traces to an `Insight` field or the pure `portfolioTotalMinor` helper. A grep of `components/ui/` and `app/` finds no arithmetic on money or share values (no `* `, `/ `, or `- ` between numeric identifiers; no `value / total` shaped expression), and `AllocationBar` displays no self-computed percentage. Verifies **AC-6**, **AC-10**.
- Token discipline: no raw hex and no raw ramp token in `components/ui/`. Verifies **AC-1**.
- Colour discipline: no red/green money colour in the rendered output. Verifies **AC-4**.

## Build plan

**This slice is large for a solo build; it is built in two phases with a working checkpoint between them.** Phase 1 stands the design system up in the codebase and proves it renders (a natural session boundary). Phase 2 builds the screen and its states on those proven components. The order is Facade with an early Tracer-Bullet checkpoint: something real renders by the end of Phase 1, not only at the end.

**Phase 1: the UI foundation (checkpoint: components render on paper)**

1. Wire the design-system tokens: import `design-system/source/tokens/*.css` (or a copy) into `app/globals.css` so `var(--...)` resolves; set the paper ground and base type. Add the Lucide UMD script to the root layout (for `Icon`). Satisfies **AC-1**.
2. Port the core surface components into `components/ui/` as real strict-TypeScript React, tokens only: `Card`, `Rule`, `Stat` (a `'use client'` leaf, count-up honouring `prefers-reduced-motion`), `Badge`, `Icon` (a `'use client'` leaf). Satisfies **AC-1**, **AC-3**, **AC-9**.
3. Port the data and shell components: `AllocationBar` (**internal percentage display suppressed**, fed the engine's group values, AC-10), `HoldingRow` (`percent`/`delta` unused), `Wordmark`, a minimal `TopNav` (**replace its hardcoded hex with a semantic token or flag the gap**). Satisfies **AC-2**, **AC-8**, **AC-10**.
   - **Checkpoint:** render a couple of ported components with hand-fed props on a scratch page (or the page stub) and confirm they look right on the paper ground, with no raw hex in `components/ui/`. Phase 1 is a natural stopping point.

**Phase 2: the screen (built on the proven components)**

4. Build the pure view-model builder `lib/view/what-you-own.ts`: map the committed fixture through `mapHoldingsResponseToDomain` + `deriveInsights`, assemble `AccountView[]`, derive the capability-gapped account by stripping the fixture 401k's `holdings` capability (one commented place, `TODO` tied to live data), and the pure `portfolioTotalMinor` helper. No React, no arithmetic elsewhere. Satisfies **AC-5**, **AC-6**.
5. Build the screen `app/page.tsx` (Server Component): the dashboard shell, the portfolio total `Stat`, and a section per holdings-capable account rendering total + `AllocationBar` (percent labels from `shareBps`) + `HoldingRow` list. Remove the disposable spike page and its Plaid link UI/actions. Satisfies **AC-2**, **AC-6**, **AC-7**, **AC-8**, **AC-10**.
6. Build the missing-capability state for the gapped account: balance shown, plain-language explanation, `Card tone="sunk"`, no blank or `$0`. Satisfies **AC-5**.
7. Apply money colour discipline and interaction/motion states: money semantics not red/green, visible focus, `prefers-reduced-motion` preserved. Satisfies **AC-4**, **AC-9**.

## Consequences

**Positive**
- The keystone becomes visible: the engine's insights render in the real design language, the first proof the architecture produces something a person can use.
- The design system gets exercised for the first time, and the ported components (`Card`, `Stat`, `AllocationBar`, `HoldingRow`, `Rule`, `Badge`, shell chrome) are reusable by every later screen; `ui-registry.md` moves them from planned to built.
- The missing-capability state, the product's most distinctive honesty requirement, is built and visible from the first screen rather than bolted on later.
- The app shape is settled (dashboard-first), unblocking every future UI slice.

**Negative and tradeoffs**
- The screen renders static demo data, not the person's live accounts. It proves the render, not the live path; the data seam is built so the swap is clean, but the swap is a later slice.
- The capability-gapped account is scaffolding. It represents a real, confirmed case, but it is not from the fixture, and it must be removed when live data lands, or it becomes a lie on screen.
- Porting components by hand from the export's plain-script JSX to real React is real work, and a faithful port must preserve the token discipline rather than paraphrasing it.
- A cross-account total is shown, which is a figure the engine does not produce; it is computed in a pure `lib/` helper to respect §4 #1, but it is a small new surface to keep honest.

**Neutral**
- The spike page and its Plaid link UI are deleted here. The aggregator, the engine, and the fixtures stay; only the throwaway view goes.
- No test runner choice is made here; `/test` covers the view-model builder and any pure helper. Component rendering tests are optional for a Facade slice and can wait.
- Dark mode stays undefined (`ui-tokens.md` §6); this screen is the one light theme on paper.

## Follow-up

- [ ] Replace the static view model with a live source (a server action over the aggregator, or the future database) once persistence and auth land. Remove the representative capability-gapped account at that point.
- [ ] The other dashboard nav destinations (Match, Ask Fin, Accounts) are stubs or absent after this slice; each is its own later screen slice.
- [ ] If porting reveals a component the screen needs that the registry does not cover (for example a dedicated missing-capability component, currently composed from `Card` + text), design it and add it to `ui-registry.md`.
- [ ] The inferred-and-unconfirmed and broken-connection states (`ui-rules.md` §5) are not exercised by this screen; they arrive with the features that need them (the match differential, reconnection).
