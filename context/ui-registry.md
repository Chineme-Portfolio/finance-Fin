# FINBUDDY — UI Registry

> ✅ **Generated from the design export** at `design-system/` (2026-09-01). The export ships 30 components across 6 groups; full prop contracts are in `design-system/COMPONENTS.md`, reference implementations in `design-system/source/components/<group>/<Name>.jsx`.
> Codename `FINBUDDY` is a placeholder until the name is locked (`foundation.md` header).
> **For tokens** → `ui-tokens.md`. **For how they compose** → `ui-rules.md`. **For *why*** → `foundation.md`.
> **Authority:** when this file and `foundation.md` disagree, **`foundation.md` wins.**

**Status legend:** ⬜ planned (designed in the export, not yet ported into this codebase) · 🟡 in progress · ✅ built (ported, in the app)

---

## The rule

**Check this registry before building any component.**

- **Built (✅)** → reuse it. Do not re-implement.
- **Planned (⬜)** → port it from the export: the `.d.ts` prop contract and the `.prompt.md` usage notes in `design-system/source/components/` are the specification; the `.jsx` is the reference implementation. Recreate it in this codebase's idiom (a real React component in `components/`, consuming tokens per `ui-tokens.md` §7).
- **Not in the export at all** → it has not been designed. Stop and route to the design step (`design-handoff.md`), do not invent a component. The export is thorough (30 components); a genuine need it does not cover is a design gap to surface, not a thing to improvise.

**Every component consumes semantic tokens only** (`ui-tokens.md` §7). A ported component carrying a raw hex or a raw ramp token is a bug, not a port.

**Ported so far (spec 0003, the "what you own" screen):** nine components are built and live in `components/ui/`, marked ✅ below with their paths: Card, Rule, Badge, Wordmark, Icon, Stat, AllocationBar, HoldingRow, TopNav. Reuse them; do not re-implement. Everything else is still ⬜ planned (designed in the export, not yet ported). The throwaway spike page (`foundation.md` → spec 0001, now at `/dev/plaid-spike`) is deliberately unstyled and is not a registry component.

---

## core

| Component | Status | Built path | Variants / key props | Purpose |
|---|---|---|---|---|
| Button | ⬜ planned | — | variant: primary·secondary·ghost·inverse·pop; size sm·md·lg; iconLeft/Right; full; pill | The action control. One primary per view; `pop` (apricot) for win moments only |
| IconButton | ⬜ planned | — | variant: ghost·outline·tint·solid; size; required `label` | Round icon-only control for toolbars and row actions |
| Card | ✅ built | `components/ui/Card.tsx` | tone: surface·sunk·tint·warm·brand·inverse; elevation 0–3; interactive | The surface container. `inverse`/`brand` auto-apply the `.fb-inverse` scope |
| Rule | ✅ built | `components/ui/Rule.tsx` | tone: hairline·strong·brand; vertical; inset | The signature rounded divider. Use instead of a border |
| Badge | ✅ built | `components/ui/Badge.tsx` | tone: neutral·brand·gain·loss·attention·ink; size | Status pill. `attention` = unclaimed |
| Tag | ⬜ planned | — | selected; onRemove | Filter / choice chip |
| Wordmark | ✅ built | `components/ui/Wordmark.tsx` | size; tone: ink·paper·clay | The brand signature in Instrument Serif. There is no drawn logo mark |
| Icon | ✅ built | `components/ui/Icon.tsx` | name (Lucide); size; strokeWidth 1.75 | Lucide glyph at the brand stroke. ⚠️ icon set is a flagged substitution (`ui-tokens.md` §5) |

## forms

| Component | Status | Built path | Variants / key props | Purpose |
|---|---|---|---|---|
| Input | ⬜ planned | — | label; hint; error; prefix; suffix; iconLeft; size | Text field. Money inputs use `prefix="$"` so the mark is serif |
| Select | ⬜ planned | — | label; hint; options; size | Native select with FINBUDDY chrome |
| Checkbox | ⬜ planned | — | label; description; checked | Multi-select; `description` when the choice affects money |
| Radio | ⬜ planned | — | label; description; boxed | Single choice; `boxed` is the tap-target option card used in onboarding and the match walk |
| Switch | ⬜ planned | — | label; description; checked | Immediate on/off (notifications, auto-escalation) |

## data

| Component | Status | Built path | Variants / key props | Purpose |
|---|---|---|---|---|
| Stat | ✅ built | `components/ui/Stat.tsx` | label; value; prefix; suffix; delta; size s·m·l·xl; animate | **The primary way money is shown** — serif figure, label above, optional delta. `animate` on one hero figure per view only |
| AllocationBar | ✅ built | `components/ui/AllocationBar.tsx` | segments; gap; showLegend | Split pill showing how a balance divides; the gap is what makes it not a progress bar |
| DonutChart | ⬜ planned | — | segments; size; thickness; label; value | Round-capped donut; total goes in the hole |
| LineChart | ⬜ planned | — | points; color; fill; showDot | Balance-over-time line, soft wash, no axes — the figure beside it carries precision |
| HoldingRow | ✅ built | `components/ui/HoldingRow.tsx` | name; sub; value; percent; delta; color | One holdings line item. `sub` is the plain-language meaning (`ui-rules.md` §4) |

## chat

| Component | Status | Built path | Variants / key props | Purpose |
|---|---|---|---|---|
| BuddyAvatar | ⬜ planned | — | size; tone: clay·ink·apricot | Fin's mark: a serif "F" in a clay circle. No illustrated character exists |
| BuddyMessage | ⬜ planned | — | typing; showAvatar; footer | Fin speaking; leads with the answer in bold. **The vehicle for the inferred-and-unconfirmed state** (`ui-rules.md` §5) |
| UserMessage | ⬜ planned | — | — | The person's own words, shown verbatim and lowercase |
| ChatComposer | ⬜ planned | — | placeholder; suggestions; onSend | The pill ask field with suggestion pills above |

## feedback

| Component | Status | Built path | Variants / key props | Purpose |
|---|---|---|---|---|
| Dialog | ⬜ planned | — | open; title; footer; width | Centred modal over a blurred ink veil. Where a money change is confirmed (`foundation.md` §7 #2a) |
| Toast | ⬜ planned | — | tone: info·success·attention; action | Pill confirmation, one at a time, ~5s |
| Tooltip | ⬜ planned | — | content; side | One-sentence jargon definition on the underlined term |
| StepProgress | ⬜ planned | — | steps; current | Dots-and-rounded-rules progress for onboarding and the match walk |
| WinMoment | ⬜ planned | — | headline; value; action | The celebration surface: ink panel, apricot glyph, serif figure. **Money actually secured only** — max one per session |

## navigation

| Component | Status | Built path | Variants / key props | Purpose |
|---|---|---|---|---|
| TopNav | ✅ built | `components/ui/TopNav.tsx` | items; active; right; tone: paper·ink | 64px header: wordmark, pill nav, one right-hand action |
| Tabs | ⬜ planned | — | items; active | In-page section switch; active tab carries a 2px clay underline |
| SideNav | ⬜ planned | — | items; active; footer | 236px rail on wide viewports; collapses to TopNav below 900px |

---

## Components the product needs that the export does not name

Per the rule above, these are **design gaps to resolve, not components to improvise.** They are the three first-class states in `ui-rules.md` §5, which the export did not mock:

- A **missing-capability** surface (`foundation.md` §4 #7) — currently composed from `Card tone="sunk"` + muted text (`ui-rules.md` §5), no dedicated component.
- An **inferred-and-unconfirmed** treatment (`foundation.md` §7 #13) — currently composed from `BuddyMessage` + confirm/correct actions.
- A **broken-connection** treatment (`code-standards.md` §6) — currently composed from `Badge` + a reconnect `Button`.

If any of these recurs enough to deserve its own component, that is a design step (`design-handoff.md`), and it gets added here once designed.

---

## References

- Component contracts and reference implementations: `design-system/COMPONENTS.md`, `design-system/source/components/`, checked 2026-09-01.
