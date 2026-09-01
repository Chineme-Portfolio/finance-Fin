# Handoff: FINBUDDY design system + web app

## Overview

FINBUDDY is a conversational companion that reads someone's real investment accounts and translates what they already own into their own dollars. The audience is low-to-middle-income earners in their 20s–40s who acquired a 401(k) through a job and a brokerage account on impulse, and were never given a map.

It is **web only** — a responsive web app. There is no native mobile app, and nothing in this system should be implemented as one.

Two surfaces are designed:

1. **The web app** (signed in) — link an account, see what you actually own, get walked through capturing an employer match you may be leaving unclaimed.
2. **The marketing site** (signed out) — one page whose only job is to get a stranger to link one account.

The companion inside the product is named **Fin**. Fin has a voice, an avatar (a serif "F"), and one governing rule: **Fin explains, the person decides.**

## About the design files

Everything in `source/` is a **design reference created in HTML** — a prototype showing intended look and behaviour, not production code to copy directly. The components are React function components written as plain classic scripts (no ESM, no bundler, Babel-in-the-browser) precisely so they run in a bare browser for review.

**The task is to recreate these designs in the target codebase's existing environment** — React, Vue, Svelte, Rails+Hotwire, whatever is already there — using its established patterns, component library, and styling approach. If no environment exists yet, choose the framework appropriate for a responsive web app and implement the designs there.

The one part that *should* port near-verbatim is the **token layer** (`source/tokens/`). Those are plain CSS custom properties with no framework assumptions; port them into whatever token format the codebase uses and consume them by name.

## Fidelity

**High-fidelity.** Colours, typography, spacing, radii, shadows, motion timings, interaction states, and copy are all final and specified to the value. Recreate the UI to match. Where a value is not in this document, it is in the source files — read them rather than guessing.

Three substitutions are flagged and need a decision:

| Area | Current state | What's needed |
| --- | --- | --- |
| Fonts | Instrument Serif + Instrument Sans from Google Fonts | If licensed binaries exist, self-host them and replace the `@import` in `tokens/fonts.css` with `@font-face` rules. |
| Icons | Lucide 0.544.0 from CDN, stroke width 1.75 | Fine to ship as-is. If FINBUDDY commissions its own set, swap it inside the `Icon` component only. |
| Imagery | **None.** No logo mark, no illustration, no photography — none was supplied and none was invented. | The wordmark (FINBUDDY in Instrument Serif, uppercase, 0.18em tracking) *is* the identity. Do not substitute placeholder stock imagery. |

Also open: **dark mode is not defined.** `.fb-inverse` handles inverse panels but is not a full theme.

## Screens / views

Sources: `source/ui_kits/finbuddy-app/` (app) and `source/ui_kits/finbuddy-site/` (marketing). Both are mounted by their own `index.html`; open either directly in a browser to see the design running. Fixtures live in `source/ui_kits/finbuddy-app/data.js` as `window.FB_DATA` — one fictional person, Marisol, at Brightline Foods.

### App shell — `finbuddy-app/index.html`

**Purpose:** frame for every signed-in view; also the router.

**Layout:** 64px sticky `TopNav` at page top (`--topbar-h`). Below it, a two-column grid: 236px `SideNav` rail (`--sidebar-w`) + content column. Content column capped at `--page-max` 1180px with `--page-gutter` 32px (20px below 640px). Sections stack at 28px; the rail collapses entirely below 900px, leaving the top nav to carry navigation. Nothing is sticky except the top bar and the chat composer. A toast layer sits above everything.

**Nav items:** Overview (`home`), What you own (`layers`), Employer match (`gift`), Ask Fin (`message-circle`), Accounts (`settings`). Active state is clay.

### Overview — `Overview.jsx`

**Purpose:** the typical landing view. Answers "what do I own, and is anything wrong?"

**Layout, top to bottom, 28px gaps:**

1. **Header block** — `.fb-label` eyebrow with the date ("Wednesday, 1 September"), then an `h1` in `--font-display` 400 at `--display-2-size` 54px / 1.04 / −0.022em, `--text-strong`, `margin-top: 10px`, `max-width: 18ch`. Copy: "You own $8,412 across three accounts."
2. **Two-card row** — `grid-template-columns: 300px 1fr`, `gap: 20px`.
   - *Left card:* `--pad-card-lg` 32px, column flex, 18px gap. `Stat` (label "Everything you own", size `xl`, `animate`, `delta={12.4}`, deltaLabel "since January") → `Rule` → three `--body-s` `--text-muted` lines: "You put in $4,890 of that." / "Your employer put in $1,610." / "The market added $1,912."
   - *Right card:* 32px padding, 14px gap. Header row (`.fb-label` "Last twelve months" · `Badge tone="gain"` "+$1,912", baseline-aligned, space-between) → `LineChart points={d.history} height={150}` → footer row of `--caption-size` `--text-faint` labels "Sep 2025" / "Sep 2026".
3. **Match banner** — `Card tone="inverse"`, radius `--radius-xl` 28px, padding 32px, elevation 0, `grid-template-columns: 1fr auto`, 28px gap, centre-aligned. Left: `.fb-label` in `--apricot-400` reading "Unclaimed" → `.fb-figure` at `--figure-l-size` 38px in `--paper` reading "$1,240 a year" → paragraph in `#D9CEC2`, `max-width: 48ch`, `--body-m` / 1.6: "Brightline adds 50¢ for every $1 you put in, up to 6% of your pay. You are putting in 2%. The rest of their offer is sitting there." Right: `Button variant="pop" size="lg" iconRight="arrow-right"` — "Walk me through it".
4. **Holdings card** — 32px padding. Header row: `h4` in sans 600 at `--title-m-size` "Where your money sits" · `Button variant="ghost" size="sm" iconRight="arrow-right"` "See every holding"; 18px bottom margin. Then `AllocationBar showLegend` over the holdings, then (20px down) the holdings list: `HoldingRow` per holding with a `Rule` between each (not before the first).
5. **Ask-Fin card** — `Card tone="sunk"` elevation 0, 32px padding, 14px gap. Header row: `Icon name="message-circle" size={18}` in `--clay-500` + `--title-s` 600 `--text-strong` "Anything you want explained?" Then `ChatComposer` with three suggestion pills: "What is a target date fund?", "Am I too concentrated?", "What happens if I quit?"

**Behaviour:** the hero figure counts up from zero once on arrival (900ms) — never on a list. Suggestion pills navigate to Ask Fin with the question seeded. "Walk me through it" enters the match walkthrough.

### Employer match walkthrough — `MatchWalkthrough.jsx`

**Purpose:** the product's core job — raise the contribution rate to capture the full employer match.

**Layout:** `StepProgress` across the top, then a single-column step body, three steps: the situation (what the employer offers vs. what the person contributes), the change (rate control with the per-paycheck cost shown in real dollars), the confirm. Submitting opens a confirm `Dialog` (radius 28px, `--shadow-3`, backdrop `rgba(30,25,19,.42)` + 6px blur); confirming replaces the view with `WinMoment` (inverse, radius 28px, apricot glyph, `fb-pop` entrance).

**Copy anchor:** the win moment reads "That is your employer's money, and it is now coming to you."

**State:** current step (0–2), proposed contribution rate, dialog open, win-moment shown. `WinMoment` is capped at **one per session**, and only fires when money is actually secured.

### Ask Fin — `AskFin.jsx`

**Purpose:** the conversation. Explains anything the person asks about their own holdings.

**Layout:** scrolling thread, `ChatComposer` pinned at the bottom (the only other sticky element besides the top bar). `BuddyMessage` (with `BuddyAvatar`) left, `UserMessage` right. Fin's messages open with a **bolded resolution** and follow with the explanation. A typing state precedes each reply.

**State:** message list, typing flag, composer draft. Replies are canned in the prototype — wire to the real backend.

**Critical copy rule:** the person's own words are **never cleaned up**. User messages render exactly as typed — `what does vested mean`, `ok do it` — lowercase, no punctuation. This is a deliberate contrast with Fin's careful sentences. Do not add autocapitalisation or punctuation correction.

### Accounts / settings — `Accounts.jsx`

**Purpose:** manage linked accounts and what the product may read.

**Layout:** linked-accounts list (rounded-rule separated, each row with provider, last-synced state in pine, and a menu), notification `Switch` rows, and a data-scope card stating what FINBUDDY can and cannot do.

### Link an account (onboarding) — `LinkAccount.jsx`

**Purpose:** the one conversion action. Runs as a full-page flow **over** the shell.

**Layout:** three stages — provider choice (boxed radio options, 16px radius, clay border + clay-100 tint when selected), sign-in, then a reading/parsing state. `StepProgress` throughout.

**Copy anchor:** "Pick the company on your statement. If you only have a login and no idea what it is, pick that one anyway."

### Marketing homepage — `finbuddy-site/Home.jsx`

**Purpose:** get a stranger to link one account. One page.

**Sections** (each exported to `window` separately so a page can recompose them): `Nav`, `Hero`, `Steps`, `MatchBand`, `Trust`, `Faq`, `Footer`.

- **Hero** headline: "You already own investments. Do you know what they are?" The right side is a **real product card** built from `Stat`, `AllocationBar` and `HoldingRow` — the site never shows a fake screenshot. Preserve this: if the product changes, the hero changes with it.
- **Steps** — three steps with 42px clay-100 circular markers (one of only two places an icon sits in a coloured circle).
- **MatchBand** — the only inverse section on the page. Carries a real Fin exchange, not a testimonial.
- **Trust** — a rounded-rule table, deliberately dull, listing what the product *cannot* do: "FINBUDDY can read your balances and holdings. It cannot move money, place trades, or change your plan on its own."
- **Faq**, **Footer** (inverse).

### Not yet designed

The **"What you own" detail screen** (nav item 2) has no mock. The nav links to it. Either design it before build or stub it.

## Interactions & behaviour

**Hover** — background shifts one step warmer or darker; **never** an opacity fade. Primary buttons go clay-500 → clay-600 and gain `--shadow-pop`. Ghost controls take `--paper-deep`. Cards lift 2px and step from `--shadow-1` to `--shadow-2`.

**Press** — `scale(0.975)` (`--press-scale`) plus the next colour step down (clay-700). 90ms. No ripple.

**Focus** — 2px clay outline at 2px offset (`:focus-visible` global), or `--ring-focus` (3px clay halo at 28% opacity) on filled inputs. 150ms.

**Selected** — clay border with a clay-100 tint fill (boxed radios, tags).

**Disabled** — `--paper-deep` fill, `--ink-25` text, `cursor: not-allowed`. Never below 40% opacity.

**Entrances** — rise 8px and fade (`fb-rise`, 360ms, `--ease-out`). Dialogs, toggles and win moments use `--ease-spring` `cubic-bezier(.34,1.32,.5,1)`.

**Count-up** — money figures count from zero once, 900ms, on the **hero figure of a view only**. Implementation note from the prototype (`components/data/Stat.jsx`): it respects `document.visibilityState` and uses a timeout to land the figure on target regardless of frame delivery, so a backgrounded tab never leaves `$0` on screen. Reproduce that guarantee.

**Charts** — `LineChart` draws on via `fb-sweep` (stroke-dashoffset). The only non-flat fill in the whole system is the soft vertical wash under a `LineChart` (16% of the line colour fading to zero) — that is data, not decoration.

**Reduced motion** — `prefers-reduced-motion: reduce` collapses all animation and transition durations to 0.001ms, enforced globally in `tokens/effects.css`. Keep this at the token layer, not per-component.

**Transparency and blur** — used exactly once: the dialog backdrop. Nothing else is translucent. No frosted cards, no glass nav.

**Responsive** — single breakpoint story: the 236px rail disappears below 900px; gutters drop from 32px to 20px on small screens; the app is a single scrolling column. Two-column card rows collapse to one.

## State management

Prototype state is local React state per screen; the real app will need:

| State | Owner | Notes |
| --- | --- | --- |
| Linked accounts, balances, holdings, 12-month history | server | Read-only. The product cannot move money or place trades — enforce this at the API layer, not just the UI. |
| Match offer (rate, cap, current contribution, annual unclaimed) | server | Drives the banner figure and the walkthrough. |
| Contribution-rate change | server, write | The only write action in the product. Confirm dialog before submit. |
| Chat thread + typing state | server (streamed) + local | Canned in the prototype. |
| Win-moment shown | session | Capped at one per session, only on real money secured. |
| Toast queue | client | |
| Onboarding progress | client, resumable | |

## Content rules (these are design, not copy suggestions)

- **Second person, always.** "you own", "your employer", "you are leaving". Never "we recommend".
- **Sentence case everywhere** — headlines, buttons, labels, dialog titles. The only uppercase is the eyebrow/label style and the wordmark. No Title Case Buttons.
- **The dollar figure comes before the concept.** Not "you may be under-utilising your employer match" but "you are leaving about $1,240 a year behind."
- **Answer first, then the reason.** Fin's messages open with a bolded resolution.
- **Hedge estimates, never hedge facts.** "about $84 a paycheck" vs "$5,215".
- **Jargon gets defined inline** in a `Tooltip` the first time it appears, in one sentence.
- **Never:** emoji, exclamation marks outside a win moment, scare copy about market crashes, urgency language, gamified streaks, or any sentence beginning "In today's economy".
- Playfulness lives in exactly four places: Fin's voice, motion, unexpected apricot, and win moments.

## Design tokens

See **`TOKENS.md`** — full tables for colour (ramps, semantic aliases, money semantics, chart ramp, the `.fb-inverse` scope), typography, spacing, radii, elevation, motion, utility classes, and iconography. Values are also live in `source/tokens/*.css`.

Headline values, if you read nothing else: paper `#FDF6EE` ground (never white at page level), ink `#1E1913` text (never `#000`), clay `#A83E28` primary, apricot `#E0965C` pop, 16px default radius, pills for anything pressable, 2px round-capped rules instead of 1px dividers, money always in the serif with tabular figures.

## Components

See **`COMPONENTS.md`** — 30 components in 6 groups, each with its verbatim props contract and usage notes. Reference implementations in `source/components/<group>/<Name>.jsx`.

- **core** — Button, IconButton, Card, Rule, Badge, Tag, Wordmark, Icon
- **forms** — Input, Select, Checkbox, Radio, Switch
- **data** — Stat, AllocationBar, DonutChart, LineChart, HoldingRow
- **chat** — BuddyAvatar, BuddyMessage, UserMessage, ChatComposer
- **feedback** — Dialog, Toast, Tooltip, StepProgress, WinMoment
- **navigation** — TopNav, Tabs, SideNav

Four are brand-specific rather than standard, and matter more than their size suggests: `Rule` (the rounded-rule motif exists as a component because it is a brand mark, not a border), `Icon` (single swap point for the icon set), `WinMoment` (the celebration surface), `BuddyAvatar` (Fin's non-illustrated presence).

## Assets

**None.** No logo files, no illustration, no photography, no icon binaries.

- Fonts: Google Fonts CDN (see Fidelity table).
- Icons: Lucide 0.544.0 CDN.
- If imagery is ever commissioned, the two places it belongs are the marketing hero and the band above the footer. Tonal target: warm, natural light, real domestic settings — never stock-photo people pointing at laptops.

## Files

```
design_handoff_finbuddy_design_system/
├── README.md          ← this file
├── TOKENS.md          full token reference
├── COMPONENTS.md      30 props contracts + usage notes
└── source/
    ├── styles.css                 the single entry point consumers link
    ├── DESIGN_SYSTEM_README.md    the system's own documentation
    ├── _ds_bundle.js              compiled components, as used by the kits
    ├── tokens/                    fonts · colors · typography · spacing · effects · base
    ├── components/<group>/        Name.jsx + Name.d.ts + Name.prompt.md, ×30
    ├── guidelines/                20 specimen cards (open any in a browser)
    └── ui_kits/
        ├── finbuddy-app/          index.html + 5 screens + data.js + README
        └── finbuddy-site/         index.html + Home.jsx + README
```

**Start here:** open `source/ui_kits/finbuddy-app/index.html` in a browser to see the app, and `source/ui_kits/finbuddy-site/index.html` for the marketing page. Then read `source/DESIGN_SYSTEM_README.md` for the design rationale behind every rule in this document.
