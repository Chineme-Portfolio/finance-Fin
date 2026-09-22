# FINBUDDY — Build Graph

> Codename `FINBUDDY` is a placeholder until the name is locked (`foundation.md` header).
> **Governs:** what depends on what.
> **For *why*** → `foundation.md`. **For the keystone's rationale** → `architecture.md` §6. **For what has actually been built** → `progress-log.md`.
> **Authority:** when this file and `foundation.md` disagree, **`foundation.md` wins.**

---

## How to read this file

**This is a map, not a plan.** It says what *requires* what. It does not say what to build next week, and it is not a checklist to work through in order. Pick work from it based on what you want to exist; the graph tells you what has to be true first.

Two kinds of edge, and the difference matters:

- **Hard requirement** — cannot be built without it. Attempting anyway produces rework.
- **Soft benefit** — easier, safer, or better-informed with it. Skippable at a known cost.

---

## Layer 0 — foundational prerequisites

Nothing product-shaped exists until these do. All hard.

| # | Thing | Unblocks |
|---|---|---|
| 0.1 | Next.js app scaffolded, strict TS, repo layout per `architecture.md` §3 | Everything |
| 0.2 | Supabase project; migrations wired; **RLS on from the first migration** (`foundation.md` §7 #10) | All persistence |
| 0.3 | Domain types in `lib/types/` (`foundation.md` §5) | The engine, the adapter, the DB layer |
| 0.4 | Auth (single user, but `auth.uid()` is the tenancy key from day one) | Any scoped query |
| 0.5 | Secrets handling per `security.md` §2 | Any third-party call |

**0.3 deserves emphasis.** The domain types are the contract every module codes against. Getting `Account`, `Holding`, `ContributionEvent`, `PlanFacts`, and `Insight` right early is what lets the engine and the adapter be built without waiting on each other.

---

## The keystone unlock

**`lib/insights/` — the deterministic engine** (`architecture.md` §6). Pure, synchronous, no I/O.

Once it exists, everything downstream is a renderer:

```
                        ┌──▶ F2  what do I own
lib/insights/ ──────────┼──▶ F3  match check
  (pure functions)      ├──▶ F6  what this means for my dollars
                        ├──▶ F7  what can't you see
                        └──▶ F8  turn the match on      ★ highest priority
```

**Why it goes early:** every flow above becomes "one pure function plus one test" instead of a feature build. And the match differential (`foundation.md` §5) — the product's highest-consequence logic — becomes unit-testable against fixture histories, including the cases that would otherwise ship wrong (eligibility waiting period, annual lump-sum, blended line, true-up).

---

## Dependency edges

| To build… | Hard requirements | Soft benefits |
|---|---|---|
| **Aggregator adapter** (`lib/aggregator/`) | 0.1–0.5; the `Aggregator` interface | A real Plaid response to shape the mapping against |
| **Plaid implementation** | The adapter interface; Plaid credentials | `foundation.md` §12 Q4 answered |
| **Capability detection** (§7 #15) | Plaid implementation | — |
| **Insight engine** (keystone) | 0.3 domain types **only** | Real transaction shapes (see *The one genuine tension*) |
| **Plan formula library** (`lib/plans/`) | 0.3 | Northwind plan facts verified against plan documents |
| **F2 / F6** — what do I own | Engine; holdings present on some account | Q4 answered — the 401k cannot serve these (`foundation.md` §11) |
| **F3** — match check | Engine; `contribution_events`; **≥13 months history** | Plan formula library |
| **F8** — turn the match on ★ | F3; plan formula for that employer | — |
| **F7** — what can't you see | Capability detection | — |
| **F5** — ask anything | Engine; `lib/llm/`; LLM provider decided (§7 #11) | F2/F3/F6 for grounded context |
| **UI beyond scaffolding** | ⬜ **The design export** — the UI trio is PENDING | — |

---

## Buildable from a cold start

No prerequisites beyond 0.1–0.3. Useful when the aggregator is blocked, or when there is one free hour:

- **The insight engine, against hand-written fixtures.** Pure functions; no database, no network, no Plaid account.
- **The match differential test suite** — every case in `foundation.md` §5. Arguably the single highest-value thing in the repo, and it needs nothing external.
- **The plan formula library** — static data plus pure lookups.
- **Domain types.**

**That is the good news in this graph:** the most valuable and most correctness-critical code has almost no dependencies.

---

## The one genuine tension

**The keystone should be built first, but its input shapes can only be validated against real aggregator responses.**

The engine is pure and depends on nothing (`architecture.md` §4) — which argues for building it immediately, against invented fixtures. But fixtures are a *guess* at what Plaid actually returns for a workplace 401k: how contributions are itemized, whether employer and employee deposits arrive as separate rows, what the description strings look like. **The entire match differential is built on those assumptions.** Guess wrong and the engine is well-tested against a fiction.

Stated honestly rather than resolved by fiat. The pragmatic path — not a rule, a suggestion:

1. Do enough of 0.1–0.5 and the Plaid implementation to **pull one real transaction history** for the Northwind plan.
2. **Look at it.** Are employer and employee contributions separate rows? Is the source itemized? What is the actual weekly cadence?
3. *Then* write the engine's fixtures from reality, and build against them.

The cost is that the keystone waits on the aggregator it is designed to be independent of. The benefit is that the product's most consequential logic is modeled on real data instead of an assumption. Given `foundation.md` §11 — where an assumption about data depth was already wrong once — that trade looks worth making. **Your call; it is a real trade-off, not a solved problem.**

---

## Explicitly out of scope

Not in this graph because they are not being built (`foundation.md` §8):

- Manual entry of accounts or holdings (§7 #4)
- Budgeting, spending, net-worth-over-time
- Buy/sell recommendations, allocation, rebalancing (§7 #2a)
- Push notifications, scheduled jobs, background workers
- Multi-user features beyond `user_id` + RLS
- Native mobile
