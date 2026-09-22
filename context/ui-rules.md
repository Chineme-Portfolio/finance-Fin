# FINBUDDY — UI Rules

> ✅ **Generated from the design export** at `design-system/` (2026-09-01), and from the brand voice card at `design-system/source/guidelines/brand-voice.card.html`.
> Codename `FINBUDDY` is a placeholder until the name is locked (`foundation.md` header).
> **For *why*** → `foundation.md` (§1 the wedge, §2 the audience, §4 the principles, §7 #2 the advice line). This file never restates that; it says how the UI serves it. **For the token values** → `ui-tokens.md`. **For components** → `ui-registry.md`.
> **Authority:** when this file and `foundation.md` disagree, **`foundation.md` wins.**

**Status key:** ✅ from the export · 🕗 TBD · 🟡 composed from export primitives (assembled here, not mocked in the export)

---

## §0 Prime directive

> **Show the person their own money in plain words, and let them decide.**

Every screen serves that sentence, derived from `foundation.md` §1 (translate what I own into my dollars) and §4 (explain, don't prescribe). Its three operational halves, straight from the brand voice card:

- **Their money, as a figure they can read.** Money is the hero of the view — serif, large, counted up once. Not a chart with the number hidden in it.
- **Plain words.** "You are leaving about $1,240 a year behind," never "optimise your retirement outcomes." "Roughly 62% of your money is in one fund," never "your portfolio exhibits concentration risk."
- **They decide.** Fin explains; the person acts. Never "we recommend." This is `foundation.md` §7 #2 made visible in every surface.

If a screen makes the person feel they need to already understand investing to use it, it has failed §0.

---

## §1 Layout and density

- **One content column, capped at `--page-max` 1180px**, gutters 32px (20 small). The 236px `SideNav` rail on wide viewports collapses to the `TopNav` below 900px (`ui-tokens.md` §4).
- **Calm, not dense.** Generous whitespace (`--gap-section` 40px between regions, `--gap-stack` 16px within). This is a deliberate rejection of the packed fintech dashboard the audience finds intimidating (`foundation.md` §2).
- **Cards are the unit of grouping**, 16px radius, one warm hairline, at most `--shadow-1` at rest. **Never more than two elevation levels in one view** (`ui-tokens.md` §5). Feature surfaces (match banner, dialogs, win moment) get 28px radius, which is how the eye knows they matter.
- **Responsive web only.** No native app, no separate mobile design (`foundation.md` §0). The rail-to-topbar collapse is the whole adaptive story.

---

## §2 Hierarchy

The reading order on any surface, top to bottom:

1. **A label/eyebrow** (uppercase, tracked, faint) names the region.
2. **The figure or the answer** carries the weight — serif, large. On a surface with one hero number (Overview balance, a win amount), it counts up once (`--dur-count`); in a list, it never animates.
3. **The plain-language explanation** sits below in body sans, at the 66ch prose measure.
4. **The action**, if any, is one primary button.

`foundation.md` §4 #3 (every number traceable) shows up here as a rule: **a figure is never alone.** It carries its label above and, where it is derived, the plain sentence that explains where it came from.

---

## §3 Colour discipline

- **One primary action per view** — clay fill. Everything beside it is secondary (white + hairline) or ghost. Two clay buttons competing is a bug.
- **Apricot is for one thing: opportunity, chiefly the unclaimed match** (`--data-attention`). The `pop` button variant and the `WinMoment` glyph are apricot and are reserved for celebration. Spending apricot on ordinary chrome burns the one colour that should make a person lean in.
- **Money colour follows `ui-tokens.md` §2, not convention.** Gain pine, loss deep clay, unclaimed apricot. **Never red for loss, never green for gain.** A reviewer who "fixes" this to red/green has broken `foundation.md` §2.
- **Gains and losses are never the only signal** — they always pair with the signed figure and a word, so the meaning survives for anyone who can't separate the two hues (accessibility, and `foundation.md` §4 #7 honesty).

---

## §4 Per-surface rules

Surfaces map to `foundation.md` §6 flows. The export's UI kit (`design-system/source/ui_kits/finbuddy-app/`) is the reference build.

| Surface | Flow | The one rule it must hold |
|---|---|---|
| **Overview** | F6 core loop | The hero balance is the largest thing on the page and counts up once. The unclaimed-match banner, if any, is the single apricot moment. |
| **What you own** | F2 | Every holding row carries a plain-language `sub` ("Every public US company, in one fund"), never just a ticker. Rows separated by `Rule`, not borders. |
| **Match** | F3 / F8, the core job | A three-step walk to a `WinMoment`. Every rate option states the dollar consequence in take-home terms ("about $84 less per paycheck"). The change is always confirmed in a `Dialog` — the person acts, never the app (`foundation.md` §7 #2a). |
| **Ask Fin** | F5 | Fin leads with the answer in bold, then explains. The person's own words are shown verbatim, lowercase and all (`UserMessage`). Suggestion pills seed real beginner questions. |
| **Accounts / Settings** | F1, F7 | Carries the trust line verbatim from the export: FINBUDDY reads balances and holdings, cannot move money or trade, every change is one the person confirms. |
| **Onboarding** | F1 | A full-page flow over the shell: provider choice → sign-in → reading. `StepProgress` with rounded-rule connectors. |

---

## §5 The three states that are normal here, not edge cases

`foundation.md` makes three states first-class in this product. **The export did not visually design them** (it mocks the happy path). So each is 🟡 composed from export primitives below, with the genuinely open design decision marked 🕗. Do not invent beyond this; when a real screen needs one, this is the starting composition and the open question to resolve first.

### Missing capability — `foundation.md` §4 #7, §7 #15
When an account returns a balance but not holdings (the confirmed Northwind 401k case, `foundation.md` §11), the UI **states what it cannot see and why. Never a blank, never a `$0`, never a dash** — in a money product a blank reads as a real zero.
- 🟡 Compose from: a `Card tone="sunk"` in place of the holdings list, a `--text-muted` sentence in plain words ("We can see this account's balance, but your plan doesn't share what's inside it yet"), and an `info` icon at `--text-faint`.
- 🕗 Open: whether to offer an action (e.g. "why?" opening a Fin message) or leave it as a plain statement. Decide when the first real capability-gapped account is built.

### Inferred and unconfirmed — `foundation.md` §7 #13, §7 #16
Anything the system inferred (a match rate read from deposit patterns) is shown **as a question to confirm, never as a settled fact.**
- 🟡 Compose from: a `BuddyMessage` from Fin phrasing the inference as a question ("This looks like a 50% match up to 6% — does that match your plan?"), with confirm / correct actions in the message `footer`. A `Badge tone="attention"` may mark the figure as provisional.
- 🕗 Open: the exact visual mark for "provisional" on an inline figure (a dotted underline like `Tooltip`, or the attention badge). Not settled by the export; pick one when the match differential ships (it is gated on spec 0001 task 9, so this is not urgent).

### Broken connection — `code-standards.md` §6
A revoked or errored connection (a real, expected state — a recordkeeper can cut access, `foundation.md` §10) is **explained and recoverable, never a crash or a silent stale number.**
- 🟡 Compose from: a `Badge tone="neutral"` or `attention` on the account marking it needs attention, a `--text-muted` line stating the data may be out of date, and a secondary `Button` ("Reconnect"). The last-known figures stay visible but are visibly marked stale, not silently trusted.
- 🕗 Open: whether stale figures are shown greyed with a timestamp, or hidden behind the reconnect prompt. Decide when reconnection is actually built (a later slice).

---

## §6 Required interaction states

Every interactive element ships all of these — the export's components already carry them; a new component must match.

- **Hover:** cards lift 2px to `--shadow-2` only when `interactive`; primary button gains `--shadow-pop`.
- **Focus:** a visible 2px `--focus-ring` (clay) outline at 2px offset, or the `--ring-focus` halo on filled inputs. Never removed. Keyboard reachability is not optional.
- **Press:** shrink to `--press-scale` 0.975.
- **Disabled:** `--action-disabled-bg` / `--action-disabled-fg`, never just lowered opacity.
- **Loading:** Fin uses the `typing` three-dot state; figures use the count-up, which respects `prefers-reduced-motion` (collapses to instant).
- **Error (forms):** the `Input` `error` prop replaces the hint and turns the field clay — plain words, never a code.

---

## §7 Do / don't

**Do**
- Lead with the person's money and the plain-language answer.
- Keep one primary action per view.
- Use `Rule`, not borders. Use `.fb-figure` / `Stat` for every amount.
- Render absence and uncertainty as designed states (§5), not blanks.

**Don't**
- Set money in the sans, or use red/green for it.
- Say "we recommend," use an exclamation mark outside a `WinMoment`, or use an emoji anywhere.
- Stack more than two elevations, or spend apricot on ordinary chrome.
- Show a `$0` or a blank where the truth is "we can't see this."

---

## References

- The export UI kit and components: `design-system/source/ui_kits/`, `design-system/COMPONENTS.md`, checked 2026-09-01.
- Brand voice: `design-system/source/guidelines/brand-voice.card.html`.
