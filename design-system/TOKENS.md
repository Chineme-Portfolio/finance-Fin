# Design tokens — FINBUDDY

Every value below is a CSS custom property defined in `source/tokens/`. Consumers link one file, `source/styles.css`, which `@import`s all six token files plus element defaults. Port these into whatever token format the target codebase uses (CSS vars, Tailwind theme, Style Dictionary, SwiftUI constants) — names and values should survive the port unchanged.

## Colour

### Base ramps

| Token | Hex | Notes |
| --- | --- | --- |
| `--paper` | `#FDF6EE` | The brand ground. Every page background. Never pure white at page level. |
| `--paper-sunk` | `#F7EDE1` | Recessed panels. |
| `--paper-deep` | `#F0E2D1` | Ghost-control hover, disabled fill, chart track. |
| `--white` | `#FFFFFF` | Cards only — surfaces read as *paper on paper*. |
| `--ink` | `#1E1913` | Warm near-black. All strong text, inverse panels. `#000` appears nowhere. |
| `--ink-80` | `#4A423A` | Body text. |
| `--ink-60` | `#6F6459` | Muted text. |
| `--ink-45` | `#8F8377` | Faint text, eyebrows, icons. |
| `--ink-25` | `#BBB0A3` | Disabled text. |
| `--ink-12` | `#E0D6C9` | Hairline / rule colour. |

| Clay (primary) | Hex |  | Apricot (secondary / pop) | Hex |
| --- | --- | --- | --- | --- |
| `--clay-700` | `#6E2515` |  | `--apricot-600` | `#C4763C` |
| `--clay-600` | `#8B331E` |  | `--apricot-500` | `#E0965C` |
| `--clay-500` | `#A83E28` |  | `--apricot-400` | `#EAB183` |
| `--clay-400` | `#C4664F` |  | `--apricot-300` | `#F2CDAB` |
| `--clay-300` | `#DB9D8B` |  | `--apricot-100` | `#FBEBDA` |
| `--clay-200` | `#F0CFC4` |  |  |  |
| `--clay-100` | `#FAE7E0` |  |  |  |

| Pine (gains) | Hex |  | Slate (neutral data) | Hex |
| --- | --- | --- | --- | --- |
| `--pine-700` | `#1B4034` |  | `--slate-500` | `#5C6B70` |
| `--pine-500` | `#2F6A4F` |  | `--slate-300` | `#A9B5B8` |
| `--pine-300` | `#8FB8A2` |  | `--slate-100` | `#E2E8E9` |
| `--pine-100` | `#DDEBE2` |  |  |  |

Client-mandated colours: `#A83E28` (clay-500), `#E0965C` (apricot-500), `#FDF6EE` (paper), `#1E1913` (ink).

### Semantic aliases

Always consume these, not the ramps, in product code.

| Token | Resolves to |
| --- | --- |
| `--bg-page` | `--paper` |
| `--bg-surface` | `--white` |
| `--bg-sunk` | `--paper-sunk` |
| `--bg-tint` | `--clay-100` |
| `--bg-tint-warm` | `--apricot-100` |
| `--bg-inverse` | `--ink` |
| `--bg-brand` | `--clay-500` |
| `--text-strong` | `--ink` |
| `--text-body` | `--ink-80` |
| `--text-muted` | `--ink-60` |
| `--text-faint` | `--ink-45` |
| `--text-brand` | `--clay-500` |
| `--text-on-dark` | `--paper` |
| `--text-on-dark-muted` | `#B8ABA0` |
| `--text-on-brand` | `#FFF6F1` |
| `--text-link` | `--clay-500` |
| `--text-link-hover` | `--clay-700` |
| `--border-hairline` | `--ink-12` |
| `--border-soft` | `#EFE3D5` (card border) |
| `--border-strong` | `--ink` |
| `--border-brand` | `--clay-500` |
| `--focus-ring` | `--clay-500` |
| `--action-primary-bg` | `--clay-500` |
| `--action-primary-hover` | `--clay-600` |
| `--action-primary-press` | `--clay-700` |
| `--action-primary-fg` | `--text-on-brand` |
| `--action-secondary-bg` | `--white` |
| `--action-secondary-fg` | `--ink` |
| `--action-ghost-hover` | `--paper-deep` |
| `--action-disabled-bg` | `--paper-deep` |
| `--action-disabled-fg` | `--ink-25` |

### Money semantics

The usual red/green convention is deliberately broken.

| Token | Value | Meaning |
| --- | --- | --- |
| `--data-gain` | `--pine-500` `#2F6A4F` | Money that grew. |
| `--data-gain-bg` | `--pine-100` `#DDEBE2` | Gain badge fill. |
| `--data-loss` | `#8B331E` (clay-600) | Loss — deepened so it can never read as the clay-500 action colour. |
| `--data-loss-bg` | `--clay-100` | Loss badge fill. |
| `--data-neutral` | `--slate-500` | Flat / neutral. |
| `--data-attention` | `--apricot-500` | Anything unclaimed. |
| `--data-attention-bg` | `--apricot-100` | |

### Chart ramp (use in order)

`--chart-1` clay-500 · `--chart-2` apricot-500 · `--chart-3` pine-500 · `--chart-4` slate-500 · `--chart-5` apricot-300 · `--chart-track` paper-deep.

### Inverse surfaces

The class `.fb-inverse` re-points the semantic tokens for full-bleed dark panels (match banner, marketing band, win moment, footer). It is a scope, **not** a dark theme — dark mode is undefined. Overrides: `--bg-surface`/`--bg-page` → ink, `--text-strong` → paper, `--text-body` → `#D9CEC2`, `--text-muted` → `#B8ABA0`, `--text-faint` → `#8F8377`, `--border-hairline` → `#3A332B`, `--border-soft` → `#332C25`, `--action-secondary-bg` → transparent, `--action-secondary-fg` → paper, `--action-ghost-hover` → `#2C251E`, `--chart-track` → `#332C25`. `Card tone="inverse"` applies it automatically.

## Typography

Two families, both Google Fonts. **Flagged substitution** — no licensed binaries were supplied; if they exist, self-host in `assets/fonts/` and replace the `@import` in `tokens/fonts.css` with `@font-face` rules.

- `--font-display` — `"Instrument Serif", Georgia, "Times New Roman", serif`. Weight **400 only**, plus italic. Display, headlines, and every money figure.
- `--font-sans` — `"Instrument Sans", system-ui, -apple-system, "Segoe UI", sans-serif`. Weights 400 / 500 / 600. **600 is the heaviest weight in the system.**
- `--font-figure` — aliases `--font-display`.

Import URL currently in use:
`https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap`

### Display (serif, 400, sentence case)

| Token | Size | Line | Tracking |
| --- | --- | --- | --- |
| `--display-1-*` | 72px | 1.0 | −0.025em |
| `--display-2-*` | 54px | 1.04 | −0.022em |
| `--display-3-*` | 40px | 1.08 | −0.02em |
| `--display-4-*` | 30px | 1.15 | −0.015em |

### Figures (serif, tabular-nums, −0.02em)

| Token | Size | Line |
| --- | --- | --- |
| `--figure-xl-*` | 56px | 1.0 |
| `--figure-l-*` | 38px | 1.05 |
| `--figure-m-*` | 26px | 1.1 |
| `--figure-s-*` | 19px | 1.2 |

**A dollar amount set in the sans is a bug.** Money is always serif, always `font-variant-numeric: tabular-nums`. Enforced by the `.fb-figure` utility and the `Stat` component.

### Titles, body, caption (sans)

| Token | Size | Line | Weight |
| --- | --- | --- | --- |
| `--title-l-*` | 22px | 1.3 | 600 |
| `--title-m-*` | 17px | 1.4 | 600 |
| `--title-s-*` | 15px | 1.4 | 600 |
| `--body-l-*` | 17px | 1.65 | 400 |
| `--body-m-*` | 15px | 1.6 | 400 |
| `--body-s-*` | 13.5px | 1.55 | 400 |
| `--caption-*` | 12.5px | 1.45 | 400 |

### Label / eyebrow — the only tracked-out style

`--label-size` 11.5px · `--label-line` 1 · `--label-track` 0.14em · `--label-weight` 600 · uppercase · `--text-faint`. Sits above headlines and above figures. **Never** used as a button label.

Measures: `--measure-prose` 66ch, `--measure-narrow` 44ch.

## Spacing

| Token | Value |  | Token | Value |
| --- | --- | --- | --- | --- |
| `--space-0` | 0px |  | `--space-7` | 24px |
| `--space-1` | 2px |  | `--space-8` | 32px |
| `--space-2` | 4px |  | `--space-9` | 40px |
| `--space-3` | 8px |  | `--space-10` | 56px |
| `--space-4` | 12px |  | `--space-11` | 72px |
| `--space-5` | 16px |  | `--space-12` | 96px |
| `--space-6` | 20px |  | `--space-13` | 128px |

Component rhythm: `--pad-card` 24px · `--pad-card-lg` 32px (cards carrying a display figure) · `--pad-control-x` 18px · `--pad-control-y` 11px · `--gap-stack` 16px · `--gap-section` 40px.

Layout: `--page-max` 1180px · `--page-gutter` 32px · `--page-gutter-sm` 20px · `--sidebar-w` 236px · `--topbar-h` 64px · `--control-h` 42px · `--control-h-sm` 34px · `--control-h-lg` 50px.

## Radii

| Token | Value | Applied to |
| --- | --- | --- |
| `--radius-xs` | 6px | Inputs, checkboxes, small icon tiles. |
| `--radius-sm` | 10px | Small internal chrome. |
| `--radius-md` | **16px** | The system default: cards, tinted panels, boxed radio options. |
| `--radius-lg` | 22px | |
| `--radius-xl` | 28px | Feature surfaces: dialogs, win moments, hero product card, match banner. |
| `--radius-pill` | 999px | Anything you press: buttons, chips, badges, composer, toast. |

## Rounded rules — the signature motif

Dividers are **not** 1px borders. They are 2px bars with fully rounded caps.

`--rule-thickness` 2px · `--rule-color` `--border-hairline` · `--rule-strong-color` `--ink`.

Utility: `.fb-rule { border:0; height:2px; border-radius:999px; background:var(--rule-color); margin:0 }`. Component: `Rule`. An ink-coloured rule sits under a section heading, one per region.

## Elevation

Warm-tinted, low, tight. Never grey, never a wide soft glow. **Maximum two elevation levels in one view.**

| Token | Value |
| --- | --- |
| `--shadow-0` | `none` |
| `--shadow-1` | `0 1px 2px rgba(46,30,16,.06)` — resting card |
| `--shadow-2` | `0 1px 2px rgba(46,30,16,.05), 0 10px 28px -20px rgba(46,30,16,.45)` — card hover, popovers |
| `--shadow-3` | `0 2px 4px rgba(46,30,16,.06), 0 28px 56px -30px rgba(46,30,16,.5)` — dialogs |
| `--shadow-pop` | `0 8px 20px -10px rgba(168,62,40,.45)` — primary button hover |
| `--ring-focus` | `0 0 0 3px rgba(168,62,40,.28)` — filled-input focus halo |
| `--ring-inset` | `inset 0 0 0 1px var(--border-hairline)` |

## Motion

| Token | Value | Used for |
| --- | --- | --- |
| `--dur-instant` | 90ms | press |
| `--dur-fast` | 150ms | hover, focus ring |
| `--dur-base` | 220ms | state change, switch travel |
| `--dur-slow` | 360ms | element enter |
| `--dur-count` | 900ms | figure count-up |
| `--ease-out` | `cubic-bezier(.2,.7,.3,1)` | everything |
| `--ease-in-out` | `cubic-bezier(.5,0,.2,1)` | |
| `--ease-spring` | `cubic-bezier(.34,1.32,.5,1)` | toggles, dialogs, win moments only |
| `--press-scale` | 0.975 | press transform |
| `--backdrop` | `rgba(30,25,19,.42)` | dialog backdrop (with 6px blur) |
| `--blur-veil` | `blur(6px)` | dialog backdrop only |

Keyframes shipped in `tokens/effects.css`: `fb-rise` (opacity 0 + translateY 8px → none), `fb-fade`, `fb-pop` (scale .9 → 1.03 → 1), `fb-sweep` (stroke-dashoffset, for chart draw-on).

`prefers-reduced-motion: reduce` is enforced globally in the token layer — all animation and transition durations collapse to 0.001ms. Preserve this in the port.

## Utility classes (`tokens/base.css`)

| Class | Purpose |
| --- | --- |
| `.fb-label` | The eyebrow style, complete. |
| `.fb-figure` | Serif + tabular-nums + −0.02em + `--text-strong`. Every money figure. |
| `.fb-wordmark` | Instrument Serif, uppercase, 0.18em tracking, 16px. |
| `.fb-rule` | The rounded rule. |
| `.fb-prose` | 66ch measure at `--body-l`. |
| `.fb-inverse` | Inverse token scope (see above). |

`base.css` also sets element defaults: body on `--bg-page` in `--font-sans` at `--body-m`; `h1`–`h3` in the display serif at display-2/3/4; `h4` in sans 600 at title-m; `a` in `--text-link` with `--text-link-hover`; `strong` at 600 in `--text-strong`; `:focus-visible` as a 2px `--focus-ring` outline at 2px offset; `::selection` in `--clay-200`.

## Iconography

**Lucide** 0.544.0, loaded from `https://unpkg.com/lucide@0.544.0/dist/umd/lucide.js`, at stroke width **1.75** (lighter than Lucide's default 2, to sit with the light serif).

⚠️ **Flagged substitution.** No icon set came with the brief. If FINBUDDY has or commissions its own, swap the source in the `Icon` component only — nothing else references glyph names outside props.

Sizes: 14 inline with small text · **18 default** (buttons, rows) · 22 in nav · 28+ in empty states. Colour is `currentColor`, `--text-faint`, or `--text-brand`. Icons are never multicoloured and never sit in a coloured circle, except the 42px clay-100 step markers on the marketing page and the apricot glyph in `WinMoment`.

Glyphs in regular use: `home`, `layers`, `gift`, `message-circle`, `landmark`, `wallet`, `piggy-bank`, `trending-up`, `trending-down`, `shield-check`, `lock`, `info`, `check`, `x`, `plus`, `settings`, `chevron-right`, `chevron-down`, `arrow-right`, `arrow-up`, `party-popper`, `bell`, `link`, `user`, `sparkles`.

**No emoji, ever** — not in UI, not in copy, not in notifications. The only special characters used are `—`, `¢`, `−` (true minus in negative figures) and curly quotes.
