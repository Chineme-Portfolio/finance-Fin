# FINBUDDY — Agent context

> Front door for AI agents. Durable decisions live in `context/` (built by context-system).
> This file routes you there and states the rules that never bend. It **points**; it never copies.
> Codename `FINBUDDY` is a placeholder until the name is locked.

## Authority
`context/foundation.md` is the top source of truth. When anything here or in the code
disagrees with it, **foundation wins**. Never re-decide a decision the foundation already
locked — cite it (`foundation.md §7 #N`) instead.

**One exception, named in advance:** `context/security.md` is the authority on data handling —
tokens, keys, RLS, logging, and what may cross the LLM boundary. On those questions it wins
over every other file except `foundation.md`.

## Context files (read before you build)
- `context/foundation.md` — locked decisions + reasoning (**authority**)
- `context/architecture.md` — stack, shape, boundaries, what-lives-where
- `context/security.md` — data handling (**authority in its domain**)
- `context/code-standards.md` — how code is written here (read top-to-bottom)
- `context/library-docs.md` — approved dependencies; do not install outside this list
- `context/build-graph.md` — what depends on what (the plan)
- `context/progress-log.md` — what's been built (newest first)
- `context/project-overview.md` — five-minute orientation
- `context/design-handoff.md` — design intake + the UI-trio generation prompt

## Agent skills
Skills installed for this build (open a skill's `SKILL.md` on demand; paths are
`.claude/skills/<name>/` or `.agents/skills/<name>/`, user- or project-level):
- `context-system` — builds and maintains the `context/` system
- `architect` — designs a slice; writes its spec to `docs/specs/`
- `develop` — builds a slice from its spec's `## Build plan`
- `check` — `verify` proves behavior against the spec; `review` is a senior code review
- `test` — writes the test suite for a built slice

## Standing instructions
1. Before writing code: read `code-standards.md` and the relevant `context/` files.
2. After completing any work: append an entry to `context/progress-log.md`
   (category · area · what · notes · date). Mandatory — like reading context first.
3. A decision made mid-work updates the affected `context/` file immediately —
   and `foundation.md` first if it changes a locked decision.

## The four that must never bend
Full list in `README.md`; these are the ones most easily broken in a hurry:
1. **The model never computes a number.** Figures come from `lib/insights/` only.
2. **Never assert someone is not being matched** — ranked differential with a question, never a finding (`foundation.md` §7 #16).
3. **No unscoped query. No server key with `NEXT_PUBLIC_`.** (`security.md` §2, §4)
4. **Never render a blank or zero for missing data** — explain what can't be seen (`foundation.md` §4 #7).
