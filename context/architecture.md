# FINBUDDY — Architecture

> Codename `FINBUDDY` is a placeholder until the name is locked (`foundation.md` header).
> **Governs:** how the pieces fit — the stack, the repo layout, module boundaries, the data and tenancy model, and the keystone unlock.
> **For *why* any of this was chosen** → `foundation.md` (cited inline as §7 #n). **For how code is written** → `code-standards.md`. **For data handling and secrets** → `security.md`, which is the authority in its domain. **For what depends on what** → `build-graph.md`.
> **Authority:** when this file and `foundation.md` disagree, **`foundation.md` wins.**

**Status key:** ✅ locked/built · 🕗 TBD · ⬜ planned · 🟡 in progress

---

## §1 Shape

```
                    ┌──────────────────────────────────────┐
   Browser ────────▶│  Next.js App Router (single app)     │
                    │  Server Components render insights   │
                    └───────────────┬──────────────────────┘
                                    │ server-only
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐          ┌─────────────────┐         ┌────────────────┐
│  aggregator/  │          │   insights/     │         │     llm/       │
│   adapter     │          │  PURE ENGINE    │         │  explains only │
│  (Plaid impl) │─────────▶│  no I/O, no LLM │────────▶│  never computes│
└───────┬───────┘          └────────┬────────┘         └────────────────┘
        │                           │  ▲
        │                           │  │ plans/  (formula library)
        ▼                           ▼  │
┌──────────────────────────────────────┴───────────────────────────────┐
│  Supabase Postgres — RLS on every table, user_id on every row        │
└──────────────────────────────────────────────────────────────────────┘
```

The one-sentence version: **the aggregator fills the database, the pure engine turns rows into typed `Insight`s, and the LLM only puts them into words.** Numbers never originate in the model (`foundation.md` §4 #1, §7 #7).

---

## §2 Stack

| Layer | Choice | Notes |
|---|---|---|
| Language | TypeScript, strict | End-to-end; no second service (§7 #5) |
| Framework | **Next.js, App Router** | App Router only — Pages Router gets maintenance, not features. Server Components by default; `'use client'` only for state, effects, handlers, browser APIs |
| Mutations | **Server Actions** for UI-originated mutations; **Route Handlers** for Plaid webhooks and anything needing real HTTP semantics | Server Actions are the wrong tool for externally-callable endpoints |
| Database | **Supabase Postgres** | Chosen for bundled auth + RLS, which is the open-up path (§7 #6, §7 #10) |
| Auth | Supabase Auth | Single user today; `auth.uid()` is the tenancy key from day one |
| Aggregator | **Plaid** (Investments), behind an adapter | Plaid must not be load-bearing (§7 #8) |
| LLM | Paid tier, no-training guarantee | The one place the budget is deliberately broken (§7 #11) |
| Hosting | Vercel Hobby | Free; non-commercial only — a known scale seam (`foundation.md` §10) |

**Versions are pinned and justified in `library-docs.md`, not here.**

---

## §3 Repo layout

Single Next.js app. **Not a monorepo** — at 5–15 hrs/week (§0) a workspace boundary costs more than it returns, and nothing is shared with a second deploy target.

```
/
├─ README.md                  front door to the context system
├─ context/                   the context system (this file lives here)
├─ app/                       routes, layouts, Server Components
│  ├─ (dashboard)/            accounts, holdings, insights
│  └─ api/                    Route Handlers — Plaid webhooks only
├─ lib/
│  ├─ aggregator/             adapter interface + plaid/ implementation
│  ├─ insights/               ★ THE PURE ENGINE — no I/O, no LLM, no DB
│  ├─ plans/                  employer match formula library
│  ├─ llm/                    explanation layer — consumes Insights, never data
│  ├─ db/                     Supabase clients + queries
│  └─ types/                  shared domain types
├─ supabase/migrations/       schema, RLS policies
└─ components/                UI (⬜ awaits the design export — the UI trio)
```

---

## §4 Module boundaries

The import rules. Violations are bugs, not style issues.

| Module | May import | May **not** import | Why |
|---|---|---|---|
| `insights/` | `types/`, `plans/` | `db/`, `aggregator/`, `llm/`, anything async | It is a **pure function library**. Purity is what makes it testable without fixtures, mocks, or network — and testability is what makes §7 #7 real |
| `llm/` | `types/` | `db/`, `aggregator/`, `insights/` internals | It receives finished `Insight` objects and renders prose. It must be structurally incapable of computing a figure (§4 #1) |
| `aggregator/` | `types/`, `db/` | `insights/`, `llm/` | It fills the database. Nothing downstream knows Plaid exists (§7 #8) |
| `plans/` | `types/` | everything else | Static data + pure lookups |
| `app/` | all of `lib/` | — | Composition root |

**The adapter rule (§7 #8):** the string `plaid` appears only inside `lib/aggregator/plaid/`. Everywhere else talks to the `Aggregator` interface. When a provider is swapped or a recordkeeper revokes access (`foundation.md` §10), the blast radius is one directory.

---

## §5 Data & tenancy

**Every table carries `user_id`. RLS is enabled on every table in the public schema, from the first migration** (§7 #10) — not because there are other users today, but because retrofitting tenancy is the migration nobody wants, and a table without RLS is readable by anyone holding the publishable key.

Rules:

- Policies key on **`auth.uid()`**, never on a client-supplied id.
- **An unscoped query is a security bug.** See `security.md` — that file is the authority here.
- Capability tiers (§7 #15) are **stored, not inferred**: each `account` row records which of `balance` / `holdings` / `transactions` that connection actually returned, discovered at link time. Features gate on the stored value, and a missing capability renders an explanation rather than a blank or a zero (§4 #7).

**Core tables** (detail in migrations; shape from `foundation.md` §5):
`accounts` → `holdings`, `contribution_events`, `plan_facts`. **`insights` is not a table** — insights are always computed, never persisted as truth (§5), so they cannot go silently stale.

---

## §6 The keystone unlock

**`lib/insights/` — the deterministic insight engine.** Build it before anything that consumes it.

```ts
(accounts, holdings, contributionEvents, planFacts) => Insight[]
```

Pure. Synchronous. No I/O. Once it exists:

- **Chat and UI both become renderers.** Neither computes anything.
- **Adding an insight is one pure function plus one test** — no LLM change, no UI change, no migration.
- **The match differential (§5, §7 #16) is unit-testable** against fixture transaction histories — including the hard cases: the eligibility waiting period, the annual lump-sum plan, the blended single line. Those are exactly the cases that would otherwise ship wrong.

That last point is the real argument for the keystone. The product's most damaging possible failure is a confidently wrong "you are not being matched," and purity is what lets that failure be tested for instead of hoped against.

---

## §7 What lives where — the quick rule

| It is… | It goes in |
|---|---|
| A calculation, a rule, a threshold, a differential | `lib/insights/` — **always**, never in a component, a route, or a prompt |
| A provider-specific API call or response shape | `lib/aggregator/<provider>/` |
| A known employer match formula | `lib/plans/` |
| Wording, tone, explanation | `lib/llm/` — prose only |
| A database read or write | `lib/db/` |
| A type used by more than one module | `lib/types/` |
| A mutation triggered by the UI | A Server Action |
| An endpoint Plaid calls | A Route Handler in `app/api/` |

**If a number is computed anywhere other than `lib/insights/`, that is the bug.**

---

## §8 Deploy

*(`devops.md` was deliberately not split out — one environment, one free-tier host, no pipeline, nothing to monitor. Revisit when any of those changes: `foundation.md` §10.)*

- **One environment.** Vercel Hobby, deploying from `main`. No staging.
- **Secrets are environment variables only.** Server-side keys must never carry the `NEXT_PUBLIC_` prefix. Authority: `security.md`.
- **Migrations** are files in `supabase/migrations/`, applied deliberately — never ad-hoc schema edits in the dashboard, or the repo stops describing reality.
- **No CI initially.** Types and tests run locally. Revisit if the project opens up (§7 #1).

---

## §9 Open build-time decisions

Record the answer in `progress-log.md` as a `decision` entry when each is made, and update this file the same session (`README.md` → golden rule).

- 🕗 **Plaid environment path.** Limited Production vs the free Trial's Production Items, and when to request Production access. Gated on `foundation.md` §12 Q4/Q4b.
- 🕗 **How the LLM receives account context.** Structured `Insight` objects only, or a redacted summary? Bears directly on §7 #11's privacy reasoning — the less raw data crosses the boundary, the better.
- 🕗 **Transaction history window for match inference.** §5 requires ≥13 months to rule out an annual lump-sum match; what the aggregator actually returns is unverified.
- 🕗 **Testing framework.** Deferred to `code-standards.md`; the engine's purity means the choice is low-stakes.

---

## References

Checked **2026-09-01**. Frameworks move; re-check before acting on this.

| Source | Used for |
|---|---|
| [Next.js App Router patterns, 2026](https://pristren.com/blog/nextjs-app-router-patterns-2026/) | App Router as default; Server Components first (§2) |
| [Server Actions vs Route Handlers](https://nextjsreactjs.com/latest-article/nextjs-server-actions/) | Which to use for which mutation (§2) |
| [Supabase security best practices, 2026](https://supaexplorer.com/guides/supabase-security-best-practices) | RLS on every public-schema table; `auth.uid()` over client-supplied ids (§5) |
| [Supabase service-role key guidance](https://securie.ai/guides/supabase-service-role-key) | Server-only secret key; never `NEXT_PUBLIC_` (§8) |
| [Plaid — security best practices](https://plaid.com/core-exchange/docs/security/) | Tokens are server-side only (§4, and `security.md`) |
