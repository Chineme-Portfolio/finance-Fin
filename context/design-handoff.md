# FINBUDDY — Design Handoff

> **Governs:** the two hand-offs that turn a design-system export into the UI trio.
> **This is a Phase 3 working document, not an authority file.** It carries no decisions of its own.
> **For *why*** → `foundation.md`. **Authority:** `foundation.md` wins on any conflict.

Two outputs. §1 feeds your design tool's setup step. §2 runs in this repo *after* the export is committed, and generates `ui-tokens.md`, `ui-rules.md`, and `ui-registry.md` — which are ⬜ PENDING until it does.

---

## §1 Design-system intake

Paste into your design tool's "set up your design system" fields.

**Company name and blurb**

> **FINBUDDY** — a conversational companion that reads your real investment accounts and translates what you already own into your own dollars. Built for low-to-middle-income earners in their 20s–40s who acquired a 401k through a job and a brokerage account on impulse, and were never given a map. It runs on the web only — a responsive web app, no native mobile app — where you link an account, see what you actually own, and get walked through capturing an employer match you may be leaving unclaimed.

**Attach if you have them** *(none exist yet — this is day zero)*
- Frontend code from GitHub or a local subfolder — ⬜ none yet
- A `.fig` file or design export — ⬜ none yet
- Fonts, logos, assets — ⬜ none yet

**Any other notes?**

> 🕗 **TBD — an open decision, not a blank to fill.**
>
> This is deliberately unfilled. Inventing a palette here would be the one move this whole system exists to prevent: a confident guess that later files then treat as settled fact. See §3 for the four directions worth choosing between.

**What the design must serve, whatever the aesthetic** — these come from `foundation.md` and are not negotiable by the design:

1. **Trust is the product.** The user is financially intimidated and has no basis to verify anything they are shown. The design's first job is to look like something that would not lie to them (`foundation.md` §4 #3).
2. **Numbers are the hero.** Every screen exists to make a dollar figure legible and traceable to its source.
3. **Absence must be renderable.** A missing capability is explained, never blank, dashed, or zeroed — in a money product a blank reads as a real zero (`foundation.md` §4 #7, §7 #15). **This needs a designed state, not an empty div.**
4. **Uncertainty must be renderable.** Inference is surfaced as a question the user can confirm or correct, never as a finding (`foundation.md` §7 #13, §7 #16). **This is a first-class UI state and most design systems do not have one.**
5. **Not finance-bro.** The audience is intimidated by exactly the aesthetic most fintech reaches for — dense tickers, red/green candlesticks, urgency. Calm and plain beats sophisticated.

---

## §2 In-repo prompt — generate the UI trio

Run this in the coding agent once the export is committed. It reads the actual export rather than guessing.

> Read the design-system export in this repo (at `<path/to/export>`) and the context system in `context/`. Generate three files, each referencing `foundation.md` for the *why* and never restating it:
>
> - **`context/ui-tokens.md`** — the raw tokens from the export: colour, type scale, spacing, radius, and anything else present. Values come from the export, not from assumption. Document the layered architecture: raw palette (private) → semantic aliases (the contract components code against) → framework binding. State the theming switches and the invariant: **tokens only — no raw hex or off-palette values in components.**
> - **`context/ui-rules.md`** — how tokens compose into UI. Open with a §0 prime directive derived from the brand voice (`foundation.md` §1, §4), then layout and density, hierarchy, colour discipline, per-surface rules, do/don't, and required interaction states. **Must include designed states for: missing capability (§4 #7), inferred-and-unconfirmed (§7 #13), and a broken account connection (`code-standards.md` §6)** — all three are normal states in this product, not edge cases.
> - **`context/ui-registry.md`** — the component registry with a status legend (⬜ planned · 🟡 in progress · ✅ built) and per-component rows: name, status, built path (`—` until ported), variants, purpose. Include the rule: check this registry before building any component — reuse if built, port from the export if planned; **if it is not in the export, it has not been designed.**
>
> Anything the export does not cover, mark **TBD** — do not invent it. When done, update `README.md` to drop the ⬜ PENDING markers on these three files, add a `progress-log.md` entry, and verify every cross-reference across the system still resolves.

---

## §3 Open before the trio is generated

**🕗 Q8 — the app's shape** (`foundation.md` §12 Q8). Chat-first, dashboard-first, or a hybrid home surface. This decides which flow the design system treats as primary and how much of it is conversational — settle it before generating `ui-rules.md`, not after.

**🕗 The aesthetic direction** — below.

## §4 The aesthetic decision — 🕗 open

Four coherent directions. Each is defensible; they are not equally good for this audience.

| Direction | Reads as | Risk |
|---|---|---|
| **Calm / clinical** — generous whitespace, one accent, restrained type | Trustworthy, unhurried, adult | Can read as cold or unfinished if the copy doesn't carry warmth |
| **Warm / human** — softer palette, rounded, friendly type, illustration | Approachable, non-intimidating | Can read as unserious for a product handling real money |
| **Editorial** — strong typography, generous measure, magazine-like | Authoritative, explanatory — fits a teaching product | Heavier to build; typography-dependent, so it fails badly if executed loosely |
| **Fintech-default** — dark, dense, ticker-ish, red/green | Sophisticated, "real" | ⚠️ **Recommended against.** This is precisely the aesthetic that intimidates the target audience (`foundation.md` §2). It would be building the wall the product exists to remove |

**Recommendation: warm/human as the base, with editorial discipline in the explanatory surfaces** — approachable enough that a beginner does not bounce, structured enough that a dollar figure reads as authoritative. But this is a taste call and it is yours; record whichever you pick in `foundation.md` §7 as a numbered decision, with reasoning, before generating the trio.
