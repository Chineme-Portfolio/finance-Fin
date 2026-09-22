# FINBUDDY — UI Tokens

> ✅ **Generated from the design export** committed at `design-system/` (2026-09-01). The exhaustive, authoritative values live in `design-system/TOKENS.md` and the CSS in `design-system/source/tokens/`. This file is the in-repo contract and the port notes; when a value here and the export disagree, the export wins and this file is stale.
> Codename `FINBUDDY` is a placeholder until the name is locked (`foundation.md` header).
> **For *why* the product looks and behaves as it does** → `foundation.md` (§1 the wedge, §2 the audience, §4 the principles). This file never restates that reasoning; it records the values that serve it.
> **For how tokens compose into UI** → `ui-rules.md`. **For the components that consume them** → `ui-registry.md`.
> **Authority:** when this file and `foundation.md` disagree, **`foundation.md` wins.**

**Status key:** ✅ from the export · 🕗 TBD (the export did not settle it) · ⚠️ flagged substitution (a placeholder the export used, to be replaced)

---

## §1 The layered architecture — the one rule that makes tokens work

Three layers, and product code only ever touches the middle one.

```
raw ramp            semantic alias                  framework binding / consumption
--clay-500          --action-primary-bg  ─────────▶ var(--action-primary-bg) in a component,
#A83E28             --text-brand                    or the .fb-figure / .fb-label utility class
(PRIVATE)           (THE CONTRACT)                  (WHAT COMPONENTS WRITE)
```

- **Raw ramps are private.** `--clay-500`, `--paper`, `--ink-80`, the pine/apricot/slate ramps. A component that writes `--clay-500`, or worse a literal `#A83E28`, has reached past the contract. See §7, the invariant.
- **Semantic aliases are the contract.** `--action-primary-bg`, `--text-body`, `--data-gain`, `--border-hairline`. These are what components code against, so a ramp can be retuned in one place without touching a component.
- **Framework binding** for this project is **plain CSS custom properties imported globally**, not Tailwind. This follows from the stack: the app was scaffolded without Tailwind (`library-docs.md` → Next.js). The port is therefore: bring `design-system/source/tokens/*.css` into the app (via `app/globals.css` `@import`, or copied into it) and consume with `var(...)`. The export explicitly supports this: *"Port these into whatever token format the target codebase uses."*

---

## §2 Colour

Exact values in `design-system/TOKENS.md` → Colour and `design-system/source/tokens/colors.css`. The load-bearing facts:

**The ground is paper, never white.** `--bg-page` = `--paper` `#FDF6EE`. `--white` `#FFFFFF` is for cards only, so surfaces read as *paper on paper*. `--ink` is a warm near-black `#1E1913`; **`#000` appears nowhere.**

**Client-mandated colours (do not retune):** clay-500 `#A83E28`, apricot-500 `#E0965C`, paper `#FDF6EE`, ink `#1E1913`.

**The ramps:** ink neutrals (`--ink` → `--ink-12`), **clay** (primary, 100–700), **apricot** (secondary / pop, 100–600), **pine** (gains), **slate** (neutral chart data only, never an action).

**Money semantics — red/green is deliberately broken** (this is a `foundation.md` §2 decision made visible: the audience is intimidated by exactly the ticker aesthetic red/green belongs to):

| Semantic | Resolves to | Meaning |
|---|---|---|
| `--data-gain` | pine-500 `#2F6A4F` | money that grew |
| `--data-loss` | clay-600 `#8B331E` | loss, deepened so it can never read as the clay-500 action colour |
| `--data-neutral` | slate-500 | flat |
| `--data-attention` | apricot-500 `#E0965C` | **anything unclaimed** — the match. The single most important semantic in the product |

**The full semantic alias set** (bg, text, border, focus, the three action tiers, chart ramp, inverse) is in the export. Consume those names, never the ramps.

---

## §3 Typography

Two Google Fonts. Exact scale in `design-system/TOKENS.md` → Typography.

- `--font-display` — **Instrument Serif, weight 400 only** (plus italic). Display, headlines, **and every money figure.**
- `--font-sans` — **Instrument Sans**, weights 400 / 500 / 600. **600 is the heaviest weight in the system** — nothing is bolder.
- `--font-figure` aliases `--font-display`.

**The money rule, load-bearing:** a dollar amount set in the sans is a bug. Money is always serif, always `font-variant-numeric: tabular-nums`. Enforced by the `.fb-figure` utility and the `Stat` component. This is the visual expression of `foundation.md` §1 (money is the hero of every screen).

Scales present: **Display** 1–4 (72/54/40/30px), **Figures** xl–s (56/38/26/19px, tabular), **Titles** l/m/s (sans 600), **Body** l/m/s, **Caption**, and **Label/eyebrow** (the only tracked-out style: 11.5px, 0.14em, uppercase, faint; never a button label). Measures: prose 66ch, narrow 44ch.

⚠️ **Flagged substitution — fonts.** No licensed font binaries were supplied; the export uses a Google Fonts `@import`. If FINBUDDY licenses or self-hosts them, replace the `@import` in `design-system/source/tokens/fonts.css` with `@font-face` rules under `assets/fonts/`. Until then, the `@import` stands.

---

## §4 Spacing, layout, radii

- **Spacing scale** `--space-0` … `--space-13` (0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96, 128px). Component rhythm tokens: `--pad-card` 24, `--pad-card-lg` 32, control padding, `--gap-stack` 16, `--gap-section` 40.
- **Layout:** `--page-max` 1180px · `--page-gutter` 32 (20 small) · `--sidebar-w` 236px (rail collapses below 900px) · `--topbar-h` 64px · control heights 34/42/50px.
- **Radii:** xs 6 · sm 10 · **md 16 (the system default: cards, tinted panels)** · lg 22 · xl 28 (feature surfaces: dialogs, win moments, match banner) · **pill 999 (anything you press).**

**The signature motif — rounded rules.** Dividers are **not** 1px borders. They are 2px bars with fully rounded caps (`--rule-thickness` 2px, `--rule-color` = `--border-hairline`). Use the `Rule` component / `.fb-rule` utility instead of a border wherever content is separated. An ink-coloured rule sits under a section heading, one per region.

---

## §5 Elevation, motion, iconography

- **Elevation:** warm-tinted, low, tight. Never grey, never a wide soft glow. `--shadow-1` resting card, `--shadow-2` hover/popover, `--shadow-3` dialog, plus focus rings. **Maximum two elevation levels in one view.**
- **Motion:** durations instant→count (90ms→900ms), `--ease-out` for everything, `--ease-spring` reserved for toggles/dialogs/win moments. `--dur-count` 900ms is the money count-up. `--press-scale` 0.975.
- **Iconography:** ⚠️ **Lucide 0.544.0 at stroke width 1.75** is a flagged substitution — no bespoke icon set was supplied. If FINBUDDY commissions one, swap the source in the `Icon` component only. Sizes 14/18/22/28. Colour is `currentColor`, `--text-faint`, or `--text-brand` only.
- **No emoji, ever** — not in UI, copy, or notifications (`foundation.md` §4 tone; reinforced by the brand voice card). The only special characters: `—`, `¢`, `−` (true minus for negative figures), curly quotes.

---

## §6 Theming switches

- **`.fb-inverse`** re-points the semantic tokens for full-bleed ink panels (match banner, win moment, footer, marketing band). **It is a scope, not a theme.** `Card tone="inverse"` and `tone="brand"` apply it automatically.
- **`prefers-reduced-motion: reduce`** is enforced in the token layer — every animation and transition collapses to ~0ms. **Preserve this in the port**; it is an accessibility guarantee, not a nicety.
- 🕗 **Dark mode is undefined.** The export states this explicitly: `.fb-inverse` is a component scope and there is no dark theme. Whether the product ever gets one is a `foundation.md`-level decision, not a token to invent here. Until then, there is one light theme on paper.

---

## §7 The invariant

**Tokens only. No raw hex, no off-palette value, and no raw ramp token in a component.** A component reads a **semantic alias** (`--action-primary-bg`, `--data-attention`, `--text-body`) or a **utility class** (`.fb-figure`, `.fb-label`, `.fb-rule`). It never reads a raw ramp (`--clay-500`) and never a literal colour (`#A83E28`).

Two consequences worth stating because this product turns on them:

1. **A money figure is always `.fb-figure` or `Stat`** — serif, tabular. A raw `<span>$1,240</span>` in the sans is the bug §3 names.
2. **"Unclaimed" is always `--data-attention` / apricot**, never a red alert. Reaching for red here would undo the single most deliberate colour decision in the system (§2).

---

## §8 What the export did not settle (do not invent)

- 🕗 **Dark mode** (§6).
- ⚠️ **Font binaries** (§3) and ⚠️ **the icon set** (§5) — placeholders in use, to be replaced if licensed/commissioned.
- 🕗 **The three product-specific states** — missing capability (`foundation.md` §4 #7), inferred-and-unconfirmed (`foundation.md` §7 #13), and a broken connection (`code-standards.md` §6) — are **not visually designed in the export.** The tokens to build them exist (`--data-attention`, `--bg-sunk`, the `Badge`/`BuddyMessage`/`Card` primitives), but the specific composition is a design decision the export did not make. `ui-rules.md` §5 specifies how to compose them from these primitives and marks what remains genuinely open.

---

## References

- The export: `design-system/TOKENS.md`, `design-system/source/tokens/*.css`, checked 2026-09-01.
- Brand voice and colour rationale cards: `design-system/source/guidelines/`.
