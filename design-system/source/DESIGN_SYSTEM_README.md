# FINBUDDY Design System

FINBUDDY is a conversational companion that reads someone's real investment accounts and translates what they already own into their own dollars. It is built for low-to-middle-income earners in their 20s–40s who acquired a 401(k) through a job and a brokerage account on impulse, and were never given a map. It runs on the **web only** — a responsive web app. There is no native mobile app, and nothing in this system should be designed as one.

The product has two surfaces:

1. **The web app** (signed in) — link an account, see what you actually own, and get walked through capturing an employer match you may be leaving unclaimed.
2. **The marketing site** (signed out) — one page whose only job is to get a stranger to link one account.

The companion inside the product is named **Fin**. Fin has a voice, an avatar (a serif "F"), and a rule: Fin explains, the person decides.

## Sources

No codebase, Figma file, brand assets, slide deck, or font binaries were provided. This system was authored from a written brief plus a direction chosen by the client from three explorations (calm/clinical, warm/human, editorial). The chosen direction is **editorial bones with a warm paper ground and rounded geometry**, with these specific colours mandated by the client: `#A83E28`, `#E0965C`, `#FDF6EE`, and a dark anchor of `#1E1913`.

The three original exploration files are kept in `directions/` for reference (`A-calm.html`, `B-warm.html`, `C-editorial.html`). Everything else in this project is derived from direction C plus the client's mix instructions.

Because there were no sources, everything here is an **origination, not a recreation**. Three substitutions are flagged in this document: fonts (Google Fonts, no licensed binaries), icons (Lucide from CDN), and imagery (none — no logo mark exists and no illustration or photography is used).

---

## Content fundamentals

The product exists because financial language is a wall. Every word choice here is about removing that wall without becoming cute.

**Person and stance.** Second person, always: "you own", "your employer", "you are leaving". FINBUDDY refers to itself as "Fin" inside conversation and as "FINBUDDY" in legal or marketing contexts. Never "we recommend". Fin lays out the numbers and the trade-off, and the person makes the call.

**Casing.** Sentence case everywhere — headlines, buttons, labels, dialog titles. The only uppercase in the system is the eyebrow/label style (11.5px, 0.14em tracking) and the wordmark. No Title Case Buttons.

**The dollar figure comes before the concept.** This is the core rule. Not "you may be under-utilising your employer match" but "you are leaving about $1,240 a year behind." Concepts are explained after the number lands, and only as much as the moment needs.

**Plain nouns, real objects.** "A fund that holds every public US company" beats "a total-market index vehicle". "Money your employer adds" beats "employer contribution". When jargon is unavoidable (vested, contribution rate, target date), the term is defined inline in a Tooltip the first time it appears, in one sentence.

**Answer first, then the reason.** Fin's messages open with a bolded resolution and follow with the explanation:

> **It means the match is yours to keep.** Your own contributions are always yours. The money your employer adds becomes yours after you have been there three years. You are at year two, so about $980 of your balance would stay behind if you left tomorrow.

**Honest about limits.** Numbers are hedged where they are estimates ("about $84 a paycheck", "roughly 62%"), and never hedged where they are facts ("$5,215").

**The person's own words are never cleaned up.** In mocks and in the real thread, user messages appear exactly as typed: `what does vested mean`, `ok do it`. Lowercase, no punctuation. This is a deliberate contrast with Fin's careful sentences.

**Playfulness lives in four places, and nowhere else** (the client's choice):
- Fin's consistent voice — dry, warm, occasionally wry: "You can change it back whenever you want — it is your plan."
- Motion — figures count up on arrival, panels rise in.
- Unexpected colour — apricot appears where a serious fintech would use nothing.
- Win moments — the `WinMoment` panel, capped at one per session, only when money is actually secured.

**Never:** emoji, exclamation marks outside a win moment, "🎉 Congrats!", scare copy about market crashes, urgency language, gamified streaks, or any sentence that begins "In today's economy".

**Sample copy that is on-brand**

| Where | Copy |
| --- | --- |
| Hero headline | You already own investments. Do you know what they are? |
| Overview headline | You own $8,412 across three accounts. |
| Match banner | Brightline adds 50¢ for every $1 you put in, up to 6% of your pay. You are putting in 2%. The rest of their offer is sitting there. |
| Onboarding | Pick the company on your statement. If you only have a login and no idea what it is, pick that one anyway. |
| Empty cash line | Sitting in the account, not buying anything. |
| Trust section | FINBUDDY can read your balances and holdings. It cannot move money, place trades, or change your plan on its own. |
| Win moment | That is your employer's money, and it is now coming to you. |

---

## Visual foundations

**The idea in one line:** a financial magazine printed on warm paper, with rounded corners — authority from typography, approachability from geometry and colour.

### Colour

The page ground is never white. `--paper` (`#FDF6EE`) carries every screen; `--bg-surface` (white) is reserved for cards so that surfaces read as *paper on paper*. Text is `--ink` (`#1E1913`), a warm near-black — pure `#000` appears nowhere.

- **Clay `#A83E28`** — the primary. Actions, links, the active nav state, chart series 1. One clay fill per view; if two primary buttons appear on a screen, one of them is wrong.
- **Apricot `#E0965C`** — the secondary and the pop. Celebratory buttons, the unclaimed-match eyebrow, chart series 2. Apricot is the colour that says *this is the good part*.
- **Pine `#2F6A4F`** — gains, confirmations, "synced" states.
- **Slate `#5C6B70`** — neutral chart series only, never an action.
- **Ink `#1E1913`** — text, and full-bleed inverse panels (the match banner, the marketing band, the win moment).

Money semantics deliberately break the usual red/green convention: gain is pine, loss is **clay-600** `#8B331E` — deepened so it can never be confused with the clay-500 action colour. Anything unclaimed is apricot.

Inverse surfaces flip through a single class, `.fb-inverse`, which re-points the semantic tokens; components like `Card tone="inverse"` apply it automatically.

### Type

Two families, both from Google Fonts.

- **Instrument Serif** (400 + italic) — display, headlines, and **every money figure**. High contrast, tight tracking (−0.02em), sentence case. This is the editorial spine of the brand.
- **Instrument Sans** (400/500/600) — UI, body, labels. 600 is the heaviest weight in the system; there is no bold-bold.

Money is always serif, always `font-variant-numeric: tabular-nums`, so columns of figures align. A dollar amount set in the sans is a bug. The `.fb-figure` utility and the `Stat` component both enforce this.

The only letterspaced style is the eyebrow/label: 11.5px, 600, 0.14em, uppercase, `--text-faint`. It appears above headlines and above figures, never as a button.

Prose is capped at 66ch, narrow explanations at 44ch.

### Shape and surface

16px is the system radius (`--radius-md`) — cards, tinted panels, boxed radio options. Big feature surfaces (dialogs, win moments, the hero product card, the match banner) step up to 28px. Anything you press is a **pill**: buttons, chips, badges, the composer, toast. Small internal chrome (inputs, checkboxes, icon tiles) sits at 6–10px.

Cards: white on paper, `1px solid var(--border-soft)`, radius 16, `--shadow-1`, 24px padding (32 when they carry a display figure). Interactive cards lift 2px and step to `--shadow-2` on hover. Shadows are warm-tinted (`rgba(46,30,16,…)`), low and tight — never grey, never a wide soft glow. Maximum two elevation levels in one view.

### Rounded rules — the signature motif

Dividers are not 1px borders. They are 2px bars with fully rounded caps (`.fb-rule` / the `Rule` component), in `--border-hairline`; an ink-coloured rule sits under a section heading, one per region. This is the single most identifying detail of the system: editorial rules, softened. Holdings lists, settings lists, the trust table and card internals all use them.

### Backgrounds and imagery

Flat warm paper. No gradients as decoration, no repeating patterns, no textures, no full-bleed photography, no illustration. The only non-flat fill in the system is the soft vertical wash under a `LineChart` (16% of the line colour fading to zero), which is data, not decoration.

**No brand imagery was supplied and none has been invented.** There is no logo mark: the wordmark is FINBUDDY set in Instrument Serif, uppercase, 0.18em tracking, and that *is* the identity. Fin's avatar is a serif "F" in a clay circle, not a character. If photography or illustration is ever commissioned, the two places it belongs are the marketing hero and the band above the footer; the tonal target would be warm, natural light, real domestic settings — never stock-photo people pointing at laptops.

### Motion

Understated and short. `--ease-out` `cubic-bezier(.2,.7,.3,1)` for everything; `--ease-spring` `cubic-bezier(.34,1.32,.5,1)` only for toggles, dialogs and win moments.

| Duration | Used for |
| --- | --- |
| 90ms | press |
| 150ms | hover, focus ring |
| 220ms | state change, switch travel |
| 360ms | element enter (`fb-rise`, `fb-pop`) |
| 900ms | figure count-up |

Entrances rise 8px and fade. Money figures count from zero, once, on the hero figure of a view only — never on a list. Everything respects `prefers-reduced-motion`, which the token layer enforces globally.

### Interaction states

- **Hover:** background shifts one step warmer or darker — never opacity fades. Primary buttons darken clay-500 → clay-600 and gain `--shadow-pop`. Ghost controls take `--paper-deep`. Cards lift.
- **Press:** `scale(0.975)` plus the next colour step down (clay-700). No ripple.
- **Focus:** 2px clay outline at 2px offset, or `--ring-focus` (a 3px 28%-opacity clay halo) on filled inputs.
- **Selected:** clay border with a clay-100 tint fill (boxed radios, tags).
- **Disabled:** `--paper-deep` fill, `--ink-25` text, `not-allowed`. Never below 40% opacity.

### Transparency and blur

Used once: the dialog backdrop, `rgba(30,25,19,.42)` with a 6px blur. Nothing else in the system is translucent — no frosted cards, no glass nav.

### Layout

Max width 1180, gutter 32 (20 on small screens), 236px side rail that disappears below 900px leaving the top nav, 64px top bar. Sections are separated by 40px; card interiors stack at 16px. The app is a single scrolling column; nothing is sticky except the top bar and the chat composer.

---

## Iconography

**Lucide**, loaded from CDN (`https://unpkg.com/lucide@0.544.0/dist/umd/lucide.js`), at stroke width **1.75** — slightly lighter than Lucide's 2 default, to sit with the light serif.

⚠️ **Flagged substitution.** No icon set came with the brief. Lucide was chosen for its even, humanist stroke and its rounded caps, which match the rounded-rule motif. If FINBUDDY has or commissions its own set, replace it by swapping the CDN script and the `Icon` component; nothing else references glyph names outside props.

- Sizes: 14 inline with small text, **18 default** (buttons, rows), 22 in nav, 28+ in empty states.
- Colour: `currentColor`, `--text-faint`, or `--text-brand`. Icons are never multicoloured and never sit in a coloured circle except the 42px clay-100 step markers on the marketing page and the apricot glyph in `WinMoment`.
- Glyphs in regular use: `home`, `layers`, `gift`, `message-circle`, `landmark`, `wallet`, `piggy-bank`, `trending-up`, `trending-down`, `shield-check`, `lock`, `info`, `check`, `x`, `plus`, `settings`, `chevron-right`, `chevron-down`, `arrow-right`, `arrow-up`, `party-popper`, `bell`, `link`, `user`, `sparkles`.
- **No emoji, ever** — not in UI, not in copy, not in notifications. No unicode characters pressed into service as icons; the only special characters used are `—`, `¢`, `−` (true minus in negative figures) and curly quotes.
- Access it through the `Icon` component rather than raw `<i data-lucide>` so the stroke weight stays consistent.

---

## Index

### Root
- `styles.css` — the entry point consumers link. `@import` lines only.
- `thumbnail.html` — homepage tile.
- `readme.md` — this file.
- `SKILL.md` — Agent Skills wrapper for use outside this environment.

### `tokens/`
`fonts.css` (Google Fonts import) · `colors.css` (ramps + semantic aliases + `.fb-inverse` scope) · `typography.css` · `spacing.css` (spacing, layout, control heights) · `effects.css` (radii, rules, shadows, motion, keyframes) · `base.css` (element defaults and the `.fb-label` / `.fb-figure` / `.fb-wordmark` / `.fb-rule` / `.fb-prose` utilities).

### `guidelines/` — 20 specimen cards
Colors: Clay · Apricot · Pine & slate · Paper & ink · Money semantics · Chart ramp.
Type: Display · Figures · Body & titles · Label & eyebrow · Pairing in use.
Spacing: Scale · Layout & control heights · Radii.
Brand: Rounded rules · Wordmark · Elevation · Motion · Fin's voice · Iconography.

### `components/` — 30 components in 6 groups

**core/** — `Button`, `IconButton`, `Card`, `Rule`, `Badge`, `Tag`, `Wordmark`, `Icon`
**forms/** — `Input`, `Select`, `Checkbox`, `Radio`, `Switch`
**data/** — `Stat`, `AllocationBar`, `DonutChart`, `LineChart`, `HoldingRow`
**chat/** — `BuddyAvatar`, `BuddyMessage`, `UserMessage`, `ChatComposer`
**feedback/** — `Dialog`, `Toast`, `Tooltip`, `StepProgress`, `WinMoment`
**navigation/** — `TopNav`, `Tabs`, `SideNav`

Each has a `.d.ts` props contract, a `.prompt.md` usage note, and one `@dsCard` HTML per group.

**Intentional additions** (no source defined a component inventory, so a standard set was authored; these two are brand-specific rather than standard):
- `Icon` — a wrapper over the Lucide CDN build, so stroke weight and sizing stay consistent and the icon set can be swapped in one place.
- `Rule` — the rounded-rule divider. It exists as a component because it is a brand motif, not a default border.
- `WinMoment` — the celebration surface, added because "milestone / win moments" were a specified requirement of the direction.
- `BuddyAvatar` — Fin's mark, added because the product's companion needs a consistent, non-illustrated presence.

### `ui_kits/`
- `finbuddy-app/` — the signed-in web app: shell + Overview, Match walkthrough, Ask Fin, Accounts/settings, Link-an-account onboarding. See its README.
- `finbuddy-site/` — the marketing homepage. See its README.

### `directions/`
The three original explorations shown to the client. Kept for provenance; not part of the system.

---

## Known gaps

- **Fonts are not self-hosted.** Instrument Serif and Instrument Sans load from Google Fonts. If licensed binaries exist, drop them in `assets/fonts/` and replace the `@import` in `tokens/fonts.css` with real `@font-face` rules.
- **No logo, no imagery, no illustration.** Nothing has been drawn or approximated. Every place a mark would go uses the type wordmark.
- **Icons are a substitution** (Lucide), flagged above.
- **Dark mode is not defined.** `.fb-inverse` handles inverse panels but is not a full theme.
- **No slide template.** None was requested and no deck was supplied.
