# FINBUDDY

> An AI companion that reads your real investment accounts and translates what you already own into your own dollars.
> Codename `FINBUDDY` is a placeholder until the name is locked — a find-and-replace when it is.

This repo carries a **context system**: the source-of-truth markdown an AI coding agent reads *before writing any code*, so it stays consistent across sessions and does not drift. It lives in `context/`. This file is the front door.

**If you are an agent starting a session: read `context/code-standards.md` top to bottom, then the files your task routes to below. Log a `progress-log.md` entry before you finish.**

---

## The files

| File | Its job |
|---|---|
| **`context/foundation.md`** | **The source of truth.** Every locked decision with its reasoning. Everything else references it; nothing restates it |
| `context/project-overview.md` | Plain-English digest. Five minutes to orient. Explains, never decides |
| `context/architecture.md` | How the pieces fit — stack, repo layout, module boundaries, tenancy, the keystone, deploy |
| `context/code-standards.md` | Implementation law. Read top to bottom every session |
| `context/security.md` | **Authority on data handling.** Tokens, keys, RLS, logging, the LLM boundary |
| `context/library-docs.md` | The stack as used *here* — why, how, gotchas, approved dependencies |
| `context/build-graph.md` | What depends on what. A map, not a plan |
| `context/progress-log.md` | What has actually been built and decided. **Write to this every session** |
| `context/design-handoff.md` | The design-system intake, the prompt that generates the UI trio, and the open aesthetic decision |
| `context/ui-tokens.md` ✅ | Design tokens from the export: the layered palette/type/space contract |
| `context/ui-rules.md` ✅ | How tokens compose into UI; the §0 prime directive and the three product states |
| `context/ui-registry.md` ✅ | The 30-component registry; check before building any component |

---

## Reading order

**First time:** `project-overview.md` → `foundation.md` → `architecture.md` → `code-standards.md`

**Every session after:** `code-standards.md` → whatever the route table below points you to → `progress-log.md` (write)

---

## Route by need

| Doing this? | Read |
|---|---|
| Anything at all | `code-standards.md` |
| Wondering *why* something is the way it is | `foundation.md` — check §7, the numbered decisions |
| Adding a calculation, rule, or threshold | `architecture.md` §6–7 — it goes in `lib/insights/`, always |
| Touching Plaid | `library-docs.md` → Plaid · `security.md` §3 · `architecture.md` §4 |
| Touching the LLM | `security.md` §5 · `foundation.md` §4 #1 |
| Writing a query | `security.md` §4 — tenancy is a security boundary |
| Adding a dependency | `library-docs.md` → approved dependencies. **Add it there first** |
| Deciding what to build next | `build-graph.md` |
| Building UI | The UI trio: `ui-tokens.md` · `ui-rules.md` · `ui-registry.md`. Check the registry first |
| Setting up the design system | `design-handoff.md` |
| Finished any work | `progress-log.md` — **mandatory** |

---

## The golden rule

**When a decision changes, update `foundation.md` first, then ripple the change into every file that references it — in the same session.**

Never let two files disagree. A contradiction between context files is worse than a missing file: the missing file is an obvious gap, the contradiction quietly teaches the agent something false. Every decision that changes a context file also gets a `decision` entry and a `docs` entry in `progress-log.md`.

---

## Non-negotiables

The things that must never happen. Each is load-bearing; each has a file that explains it.

1. **The model never computes a number.** Every figure comes from `lib/insights/` and is handed to the LLM to explain. A number that originates in a prompt is a bug. *(`foundation.md` §4 #1)*
2. **Never assert that someone is not being matched.** Detecting a match is high-confidence; detecting its absence is not — it has at least five causes with opposite correct responses. Always a ranked differential with a question. *(`foundation.md` §7 #16)*
3. **No buy/sell, allocation, or rebalancing advice.** The employer match may be stated as a dollar consequence. Fund selection may not. *(`foundation.md` §7 #2a)*
4. **Plaid tokens never leave the server.** Not the browser, not a log, not an analytics event. *(`security.md` §3)*
5. **No server key ever carries `NEXT_PUBLIC_`.** *(`security.md` §2)*
6. **No unscoped query.** RLS on every table, policies keyed on `auth.uid()`. An unscoped query is a security bug, not a style issue. *(`security.md` §4)*
7. **Never render a blank or a zero for missing data.** Explain what cannot be seen and why. In a product about money, a blank reads as a real zero. *(`foundation.md` §4 #7)*
8. **Never install a dependency not listed in `library-docs.md`.**
9. **Never end a work session without a progress entry.**

---

## Currently PENDING

- **The UI trio is generated** (`ui-tokens.md`, `ui-rules.md`, `ui-registry.md`) from the design export committed at `design-system/`. None of the 30 components are ported into the app yet, so every registry row is ⬜ planned until built.
- **Font binaries and the icon set** are flagged substitutions in the export (Google Fonts, Lucide) — replace if licensed/commissioned (`ui-tokens.md` §3, §5).
- **Dark mode** is undefined (`ui-tokens.md` §6), and the three product-specific states are composed from primitives with one open visual decision each (`ui-rules.md` §5).
- **Library versions** in `library-docs.md` are deliberately unpinned (🕗). Fill each in at install, in the same session.

## Open questions

Non-blocking; tracked in `foundation.md` §12. Briefly: whether SoFi returns holdings via Plaid (Q4), whether Plaid matches Credit Karma's depth on the FedEx plan (Q4b), confirmation that FedEx is a current employer (Q5b), retention (Q6), and the real product name (Q7). (Q8, the app's shape, is resolved: dashboard-first, `foundation.md` §7 #17.)
