# FINBUDDY — Code Standards

> Codename `FINBUDDY` is a placeholder until the name is locked (`foundation.md` header).
> **Governs:** how code is written in this repo. **Read this file top to bottom at the start of every session.**
> **For *why*** → `foundation.md` (cited as §7 #n). **For where things live** → `architecture.md`. **For which libraries** → `library-docs.md`. **For anything touching sensitive data** → `security.md`, which is the authority in that domain and overrides this file there.
> **Authority:** when this file and `foundation.md` disagree, **`foundation.md` wins.**

---

## §1 Engineering mindset

Before the style rules, the posture. These cause more good outcomes than everything below combined.

1. **Read the context system before writing code.** This file, `architecture.md`, and `library-docs.md` at minimum. The system only works as a contract (`README.md` → golden rule).
2. **Think, then write.** State the approach before implementing anything non-trivial. A wrong approach implemented well is still wrong.
3. **Scope is sacred.** Build what was asked. Something out of scope but worth doing gets noted in `progress-log.md`, not built on the side. `foundation.md` §8 lists what is deliberately cut — those are decisions, not oversights.
4. **One thing at a time.** One concern per change. A change that touches the schema, the engine, and the UI at once cannot be reviewed or reverted cleanly.
5. **Honest gaps beat confident guesses.** If something is undecided, mark it `TODO` with a question — do not invent an answer and move on. This applies to code exactly as it applies to the docs.
6. **When a rule and a shortcut conflict, the rule wins.** If the rule is genuinely wrong, change the rule in this file — deliberately, with a `decision` entry in `progress-log.md`. Do not quietly bypass it.

---

## §2 Language and types

- ✅ **Strict TypeScript.** `strict: true`. No loosening to make an error go away.
- ✅ **No `any`.** Use `unknown` and narrow. If a third-party type is genuinely unavailable, define the shape in `lib/types/` and note why.
- ✅ **One source of truth for every type.** A domain type is defined once in `lib/types/` and imported. Two slightly-different `Account` types is the beginning of drift.
- ✅ **Money is never a float.** Store and compute in integer minor units (cents). Format only at the display edge. *Floating-point drift in a product whose entire value is being correct about dollars is not an acceptable class of bug (`foundation.md` §4 #1).*
- ✅ **Parse at the boundary.** External data — Plaid responses, LLM output, form input — is validated into a known type at the edge. Past that boundary, types are trusted because they were checked.
- ✅ **Prefer discriminated unions over optional-field soup.** `Insight` in particular: each variant carries exactly the fields it needs, so an impossible state cannot be represented.

---

## §3 Boundaries

The import rules in `architecture.md` §4 are **enforced law**, not guidance. Restated with their consequences:

| Rule | Consequence if broken |
|---|---|
| `insights/` imports nothing async, no DB, no LLM | The engine stops being unit-testable, and the match differential (`foundation.md` §5) ships untested — the product's worst failure mode |
| `llm/` cannot import `db/` or `aggregator/` | The model gains access to raw figures and §4 #1 becomes a hope instead of a property |
| `plaid` appears only inside `lib/aggregator/plaid/` | A provider swap or a revoked connection becomes a rewrite instead of one directory |

**If a calculation lives anywhere but `lib/insights/`, that is the bug** (`architecture.md` §7). Not a style issue — the bug.

---

## §4 Next.js conventions

The framework does not impose this structure; this file does.

- ✅ **Server Components by default.** Add `'use client'` only for state, effects, event handlers, or browser APIs — and add it as far down the tree as possible.
- ✅ **Initial data comes from Server Components.** Not `useEffect`. Client fetching is for what changes after mount.
- ✅ **Server Actions for UI-originated mutations. Route Handlers for external callers** (Plaid webhooks) and anything needing real HTTP semantics. Server Actions are the wrong tool for programmatic or externally-callable endpoints.
- ✅ **Every Server Action validates its input and re-checks authorization.** It is a public endpoint wearing a function's clothes. Never trust the caller because a component called it.
- ✅ **Wrap external calls.** Plaid and the LLM are reached through `lib/aggregator/` and `lib/llm/` — never called directly from a route or a component.
- ✅ **One response shape for Route Handlers.** A consistent `{ data }` / `{ error }` envelope, so callers never guess.

---

## §5 Tenancy

**`security.md` §4 is the authority. It wins over this file.** Summarized so it cannot be missed:

- Every query is scoped by `auth.uid()`. **An unscoped query is a security bug**, fixed with that priority.
- RLS is on for every table in the `public` schema.
- The Supabase secret key bypasses RLS — every use is a deliberate, commented exception.

---

## §6 Error handling

- ✅ **No empty catches.** Ever. If an error is genuinely ignorable, the comment says why.
- ✅ **Context-prefix on throw:** `plaid.getHoldings: item not found` beats `Error: not found` at 2am.
- ✅ **User-facing messages are safe and useful.** No stack traces, no internal identifiers, no provider error text passed through raw (`security.md` §6).
- ✅ **Aggregator failures are expected, not exceptional.** Connections break — a recordkeeper can revoke access outright (`foundation.md` §10), and there is no manual fallback (§7 #4). Handle a dead connection as a normal state with an explanation (F7), never as a crash or a blank.
- ✅ **A missing capability is not an error** (`foundation.md` §7 #15). "This account doesn't provide holdings" renders as an explanation, never as a zero, a blank, or a thrown exception.

---

## §7 Secrets

**`security.md` §2 is the authority.** The one-line version: environment variables only, server-side keys never carry `NEXT_PUBLIC_`, and nothing sensitive is ever logged (`security.md` §6).

---

## §8 Testing

Proportionate to a solo build at 5–15 hrs/week (`foundation.md` §0) — which means deliberately uneven, not uniformly thin.

| Area | Posture |
|---|---|
| **`lib/insights/`** | **Thorough, non-negotiable.** Pure functions, so tests are cheap. The match differential is tested against fixture histories covering **every case in `foundation.md` §5**: paired deposits, eligibility waiting period, annual lump-sum, blended single line, genuine no-match, true-up. This is the product's highest-consequence code and its cheapest code to test — there is no excuse |
| `lib/plans/` | Tested. Static data with pure lookups |
| `lib/aggregator/` | Thin tests against recorded fixtures. Do not test Plaid; test the mapping into domain types |
| UI | ⬜ Deferred until the design export lands (the UI trio) |
| LLM output | Not unit-tested for wording. Tested only for the boundary rule: no figure originates in `lib/llm/` |

**The rule that decides all of it:** *if being wrong here would show a user an incorrect dollar figure, it is tested.*

---

## §9 Naming, imports, comments

- Domain language everywhere: `contributionEvent`, `planFacts`, `matchRatio` — the words `foundation.md` uses. If code and docs use different words for the same thing, the docs have drifted or the code has.
- Absolute imports from `lib/`. No `../../..`.
- Comments explain **why**, never what. A comment restating the code is noise; a comment explaining a non-obvious constraint is the most valuable line in the file.
- **Any inference, threshold, or heuristic carries a comment citing its source** — `foundation.md` §5, or the plan document it came from. Six months on, an uncommented threshold is indistinguishable from an accident.

---

## §10 Patterns

- **Simplest thing that works, first.** At 10 hrs/week, cleverness is a tax paid every session.
- **SOLID as a guide, not a ceremony.** No abstraction without a second real caller — with one deliberate exception: the aggregator adapter (`foundation.md` §7 #8), which exists precisely because the second implementation is foreseeable and the first is revocable.
- **Pure where possible, effectful at the edges.** The engine is the model for the whole codebase, not a special case.
- **No premature multi-tenancy features** beyond `user_id` + RLS (§7 #10). The schema is ready; the product is not multi-user, and building for imagined users is how a 10-hour week disappears.

---

**Standing rule:** this file is read top to bottom at the start of every session. When a rule and a shortcut conflict, **the rule wins.**
