# FINBUDDY — Progress Log

> Codename `FINBUDDY` is a placeholder until the name is locked (`foundation.md` header).
> **Governs:** the living record of what has actually been built and decided.
> **For the current settled state** → `foundation.md`. **For what depends on what** → `build-graph.md`.
> **Authority:** when this file and `foundation.md` disagree, **`foundation.md` wins.**

---

## Standing instruction for the AI agent

**After completing any work in this project, before ending your response, add a progress entry here.**

This is mandatory, in the same way reading the context files before writing code is mandatory. It is not optional, not "when significant," and not batched up for later. A session that produced work and no entry has broken the contract the system runs on.

**The drift rule:** if an entry is a `decision` that changes anything in `foundation.md` or another context file, **update that file in the same session** and add a `docs` entry noting it. Context files must never drift from what was actually decided. Two files disagreeing is the failure this system exists to prevent.

**Entries are newest-first — prepend, never append.**

### Entry template

```
### YYYY-MM-DD · <category> · <short title>
**Area:** <backend | app | lib/insights | lib/aggregator | db | infra | context>
**What:** one line. Itemize if one session produced several parts.
**Notes:** gotchas, limitations, follow-ups. Omit if genuinely none.
```

**Categories:** `feature` · `fix` · `refactor` · `chore` · `decision` · `docs`

---

## Entries

### 2026-09-22 · feature · Plan formula library — the employer side of the match math (spec 0007)
**Area:** lib/plans, lib/insights
**What:** Built the employer half of the match feature as a pure library. `lib/plans/` holds the typed formula model (`MatchTier`, `MatchFormula` as a non empty tuple of tiers ascending by contribution ceiling, `CatalogEntry` as a discriminated union on `verified`), the seeded catalog, and the `maxMatchContributionBps` lookup. The match arithmetic (`computeEmployerMatchMinor`, `maxEmployerMatchMinor`, `unclaimedMatchMinor`) lives in `lib/insights/match.ts`, because a calculation belongs in `lib/insights/` per the locked rule (`architecture.md` §4/§7, `code-standards.md` §3), not in the data module. Money in integer minor units, rates in basis points, one division and one round, no floats. The catalog seeds the Northwind Retirement Savings Plan as entry #1 with a PROVISIONAL formula flagged `verified: false` plus a disclosure note, and two generic shapes ("100% up to 4%" and the tiered "100% up to 3%, then 50% up to 5%"). Spec 0007 → Accepted.
**Notes:** Pure, no I/O, mirrors `lib/insights/`. Computes figures only, never a recommendation or a rate to pick (foundation §7 #2a allowed side; F8 frames the number). The `source`/classification and the "is there a match gap" judgment stay in the deferred match differential engine (F3); this slice is just the employer formula math it will call. Honesty is type enforced: a `verified: false` catalog entry cannot compile without a note (a `@ts-expect-error` test pins it). The Northwind formula is unverified against the plan document (the build graph soft dependency); F3/F8 must surface it as a question, never assert it (foundation §7 #12, #13, #16). **Fresh model spec cross check (Sonnet)** re-derived the money math (correct) and caught the architecture placement (the arithmetic belongs in `lib/insights/`, not `lib/plans/`), the sign/tuple/rounding details, and the discriminated union honesty; all folded in before building. **/check verify (pure, all 7 ACs PASS):** 27 tests green (tiered worked example 3%→$3,000, 5%→$4,000, 10%→$4,000 capped, unclaimed from 3% = $1,000; simple + flat shapes; fractional cent → integer; degenerate inputs), tsc clean (validates the honesty type check), placement/purity greps clean, `next build` clean. Follow ups: verify the real Northwind formula (or infer from paired deposits) then set `verified: true`; model dollar caps + the IRS 402(g) limit + true up when needed; wire `PlanFacts` to a typed `MatchFormula`; build the match differential engine (F3). Note: the live `lib/db/roundtrip.test.ts` (spec 0004) fails while the free tier Supabase project is paused; unpaused as part of this ship.

### 2026-09-11 · feature · Persist contribution events — the raw deposits the match feature runs on (spec 0006)
**Area:** lib/aggregator, lib/db, lib/sync
**What:** Extended the write path (spec 0005) to also persist a linked account's cash contribution deposits into the `contribution_events` table (spec 0004, previously defined and empty). Added `toContributionEvents` to the Plaid adapter (`lib/aggregator/plaid/map.ts`): it filters the observed investment transactions to `contribution` and `deposit` subtypes, excludes bare `transfer` (its direction is in the amount sign, not the subtype), and maps each to a domain `ContributionEvent` with `source: "unknown"` and a positive `amountMinor` magnitude. Extended `lib/db` `saveLinkedItem` to insert those events (keyed to accounts by `plaid_account_id`, like holdings) and added `getContributionEventsForAccount` (bigint parsed to number). Wired `lib/sync` `persist` to map `result.transactions` through the adapter and pass them along. No schema change. Spec 0006 → Accepted.
**Notes:** **Store raw, classify never (here).** Every row is `source: "unknown"`; deciding employee deferral vs employer match is the product's highest consequence inference and belongs in the deferred pure match engine, never stored at persist time (foundation §7 #7, §7 #16 LOCKED). The domain type already documented this intent. Data minimization (`security.md` §7): only contribution inflows are kept, not buys/sells/dividends/fees. The provider transaction semantics live only in `lib/aggregator/plaid/`, so `lib/sync` and `lib/db` stay Plaid ignorant (§7 #8). **Fresh-model spec cross check (Sonnet)** during /architect caught two real risks, folded in before building: the Plaid amount SIGN for a deposit is easily inverted (a credit can be negative), so `amountMinor` is normalized to a positive magnitude; and a bare `transfer` carries no in/out direction in its subtype, so it is excluded rather than risk persisting a transfer out as a contribution. **/check verify (live, all 7 ACs green):** a sandbox link persisted **14 real employer contribution rows** (`source='unknown'`, amounts $1,200 to $1,500, all positive, raw names like "EMPLOYER PAYROLL CONTRIBUTION"), two refreshes kept exactly 14 rows (no duplication), unlink cascaded them to zero, and `lib/sync`/`lib/db` import no Plaid type. Gates: tsc clean, eslint clean, 44 tests pass (+5 mapper tests, round trip extended to save+read a contribution typed as number), `next build` clean, live DB left at zero. The contribution filter and the eventual classifier are PROVISIONAL pending the real Northwind 401k observation (spec 0001 task 9, still deferred); nothing user facing claims a match from these rows yet. Follow ups: observe real 401k data then revisit the filter/classifier; build the match differential engine (F3) that reads these rows; the plan formula library (`lib/plans/`).

### 2026-09-10 · feature · Live data write path — persist a real link, read the screen from it (spec 0005)
**Area:** lib/sync, lib/db, lib/aggregator, app
**What:** Wired the previously disconnected parts into one thread. Linking a Plaid account now persists through `lib/db` (token to Vault, accounts and holdings as rows, real capabilities), the "what you own" screen reads that live data instead of the committed fixture, and a refresh action re fetches and re persists. Refactored the aggregator seam so `fetchAccountData` takes the access token as a parameter and `exchangePublicToken` returns it to server callers only (new `ExchangedItem`); deleted the in memory `connection-store.ts` and `LinkedConnection`, making Vault the token's single durable home. Added `lib/sync/` (`linkAndPersist`/`refreshItem`/`unlinkItem`), which is the only layer that knows both the aggregator and `lib/db` (foundation §7 #8). Added `lib/db` reads `listLinkedItems`, `getItemByPlaidItemId` (the stable id resolver), `getItemToken`. New server actions (`linkAccountAction`/`refreshItemAction`/`unlinkItemAction`), token free client results, dev spike page rewired to the persist flow with refresh/unlink. Empty state on the screen; the 401k demo capability strip is gone (real capabilities drive it now). Spec 0005 → Accepted.
**Notes:** No schema change; built entirely on spec 0004's tables and Vault. Still deferred auth (secret key + `DEV_USER_ID`, RLS bypassed by design, owned by spec 0004). Design decision: the aggregator seam takes the token so there is one durable home, chosen over rehydrating an in memory cache; replace path (delete then save) over upsert for re link and refresh. **Fresh model spec cross check (Sonnet)** during /architect caught three build plan gaps, folded in before building (the id resolver, the sandbox shim that would silently stop persisting, the deleted `listConnections`). **/check verify (live, all 9 ACs green):** sandbox link persisted (1 item, 14 accounts, 13 holdings, 1 Vault secret), the screen rendered $31,455 with real holdings and the HSA balance only state, refresh rotated the Vault secret with no orphan and no row duplication, unlink cleared everything, no token in the logs, `contribution_events` stayed empty. **/check review (Sonnet) returned one Blocker, fixed before ship:** the persist path discarded the whole link when the holdings CALL failed (a common `PRODUCT_NOT_READY`) even when transactions returned the account list, which broke the locked capability tier model (§7 #15); now `selectHoldingsShape` falls back to the transactions accounts and persists the account as balance only, and it is unit tested (`lib/sync/payload.test.ts`). Also fixed the two minors (dev form actions now surface failures to the log; refresh no longer double resolves the item). Gates: tsc clean, eslint clean for the slice, 39 tests pass (+4 new), `next build` clean, live DB left at zero. Follow ups: real institution name from Plaid, Plaid `/item/remove` on unlink, real auth (makes RLS the live gate), a real link surface in the product UI.

### 2026-09-10 · feature · Persistence layer — Postgres, RLS, Vault (spec 0004)
**Area:** db, lib/db, infra
**What:** Stood up the real data layer on a hosted Supabase free-tier project (`vnvfjxlojjjxhluoqyzc`). Six migrations, all applied live: `0001_init` (supabase_vault extension, 4 enums, the 5 tables with money as `bigint` and `quantity` as `numeric`, indexes), `0002_rls` (RLS on every table, `to authenticated` policies keyed on `(select auth.uid())`, child tables additionally check parent-account ownership via `exists()`), `0003_functions` (security-definer `store_token`/`read_token`/`delete_item` over Vault, `set search_path`), `0004_lock_functions` (revoke execute from anon/authenticated, grant service_role only — cleared the advisor warning), `0005_delete_token` (service-role-only orphan cleanup), `0006_lock_rls_auto_enable` (revoke the default PUBLIC grant on Supabase's pre-existing `rls_auto_enable` event-trigger function). Built the typed, user-scoped `lib/db/` (client with the secret key server-only + a cached-singleton warning, tokens over Vault, accounts mapping rows↔`lib/types/` and parsing PostgREST `bigint` strings to `number`). Added a guarded live round-trip test (`lib/db/roundtrip.test.ts`, skips without creds). Spec 0004 → Accepted.
**Notes:** Deferred-auth by design: no login yet, so the server uses the secret key (bypasses RLS) and stamps a fixed `DEV_USER_ID`; RLS is written and SQL-impersonation-proven (user A can't see user B; foreign-`account_id` child insert rejected; anon sees nothing) but is **not the runtime gate until real auth lands** (Follow-up), and the spec owns that honestly. Fresh-model review (Sonnet) returned "Changes requested" — all fixed before commit: (Major) holdings were mapped to accounts by array index → now keyed by `plaid_account_id`; (Major) `saveLinkedItem` now wraps inserts in try/catch with best-effort `delete_item`/`delete_token` cleanup so a partial save leaves no orphan; (Major) documented the `delete_item` coalesce is not a footgun; (Major) wrote `verify.md`; (Minor) `toInt` throws on unexpected input instead of silently returning 0; (Minor) client caching warning. Gates green: tsc clean, eslint clean for the slice, 35 tests pass incl. the live round-trip, `next build` passes, live DB left with 0 residue, function ACLs confirmed locked. **I never entered any secret** — the user pasted `SUPABASE_SECRET_KEY` into `.env.local` themselves. Follow-ups unchanged: real Supabase Auth (makes RLS the live gate), Plaid `/item/remove` on unlink, wire the aggregator write path through `lib/db/`.

### 2026-09-08 · feature · "What you own" screen, the first real UI (spec 0003)
**Area:** app, components/ui, lib/view
**What:** Built the first real screen rendering the insight engine's output in the design system. Ported 9 components from the export to `components/ui/` (Card, Rule, Badge, Wordmark, Icon, Stat, AllocationBar, HoldingRow, TopNav), wired the design-system tokens into `app/globals.css`, added a pure view-model builder (`lib/view/what-you-own.ts`) and format helpers (`lib/format.ts`), and built the dashboard-first screen at `app/page.tsx`. Also resolved foundation §12 Q8 → §7 #17 (dashboard-first app shape).
**Notes:** Facade slice: renders the committed fixture through the real engine; live data is a later slice. The missing-capability state (foundation §4 #7) is built and visible (the 401k shows balance + "we can't see inside" rather than a blank). No arithmetic in the view (AC-6/AC-10): all conversion is in lib/format + lib/view; AllocationBar uses flex-grow, not division. **Deviation:** the spec said remove the spike page; instead it was relocated to `/dev/plaid-spike` because spec 0001 task 9 (the real Plaid observation) is unrun and needs that UI. Ran the full gate: /check verify (10/10 ACs, green), /check review on Sonnet (approve with nits; 1 major + 3 minors + 1 nit fixed), /test (33 passing, 11 new). Spec 0003 → Accepted. Committed locally (no remote).

### 2026-09-01 · feature · Insight engine keystone built, verified, tested (spec 0002)
**Area:** lib/insights, lib/types
**What:** Built the keystone (foundation.md §9): the provider-neutral domain model (`lib/types/`) and the pure, synchronous insight engine (`lib/insights/`). Ships two insights, composition ("what do I own", grouped by security type) and cash drag (uninvested cash). Raw Plaid → domain mapping in `lib/aggregator/plaid/map.ts`, validated against the committed real fixtures. Set up Vitest (first test runner in the project).
**Notes:** `accountTotalMinor` is the sum of holding values, never the provider balance (invariant 8 — the real fixture shows them diverge ~6%; a cross-check caught this at spec time). Shares are integer basis points summing to exactly 10000. `ContributionEvent`/`PlanFacts` are defined but unused, intentional groundwork for the deferred match differential (gated on spec 0001 task 9). Ran the full gate: /check verify (all 9 ACs met on real data), /check review on Sonnet (approve with nits; two minors fixed — a shared total helper, and obscure account subtypes → "other"), /test (22 Vitest tests passing, tagged to their ACs). Spec 0002 advanced to Accepted. Committed locally (no remote exists).

### 2026-09-01 · docs · UI trio generated from the design export
**Area:** context
**What:** Committed the design-system export to `design-system/` and generated the UI trio from it: `ui-tokens.md` (layered token contract, colour/type/space/radii/motion, the money-is-serif and no-red-green invariants), `ui-rules.md` (the §0 prime directive plus the three first-class product states), and `ui-registry.md` (all 30 components, every row ⬜ planned). Dropped the PENDING markers in `README.md`.
**Notes:** The export resolves the aesthetic decision (warm paper ground, Instrument Serif money figures, clay primary, red/green deliberately broken) — it maps cleanly onto `foundation.md` §1/§2/§4. Faithfully recorded what it did NOT settle rather than inventing: dark mode (undefined), font binaries and icon set (flagged substitutions), and the three product-specific states (missing capability §4 #7, inferred-and-unconfirmed §7 #13, broken connection code-standards §6), which the export never mocked — `ui-rules.md` §5 composes each from real primitives and marks the one open visual decision per state. No components are ported into the app yet.

### 2026-09-01 · chore · Root AGENTS.md provisioned; §7 #9 clarified
**Area:** context
**What:** Wrote the thin root `AGENTS.md` router (authority, context-file pointers, installed skills, standing instructions, the four easiest-to-break non-negotiables). Amended `foundation.md` §7 #9 and added §7 #9a to distinguish it from the team-mode collaboration file.
**Notes:** §7 #9 read "no `AGENTS.md`", which would have contradicted the new file. **The two are different things:** #9 rejected the *collaboration layer* (branch discipline, parallel-session coordination) — still correct for a solo build. The router is what lets `/architect`, `/develop`, and `/check` find the authority files at all. Clarified rather than reversed; nothing about the solo shape changed.

### 2026-09-01 · docs · Clarified "surface"; added §12 Q8
**Area:** context
**What:** `foundation.md` §0 and §6 said "one surface" / "a single responsive web app", which reads as *single-page app*. Reworded to "one platform" and stated explicitly that page structure is undecided. Added §12 Q8 — is the app chat-first, dashboard-first, or hybrid. `design-handoff.md` blurb reworded and §3 added to carry the open question.
**Notes:** Caught by the user reading `design-handoff.md`. A scope constraint (one platform) was being read as a UI decision (one page) — no decision had actually been made either way. **Q8 should be settled before the UI trio is generated**; it decides which flow the design treats as primary.

### 2026-09-01 · docs · Phase 3 — design handoff prepared
**Area:** context
**What:** Wrote `design-handoff.md`: the design-system intake blurb (derived from `foundation.md` §1–2), the in-repo prompt that generates the UI trio from a committed export, and the five constraints the design must serve whatever the aesthetic.
**Notes:** **The aesthetic direction is deliberately left open (🕗)** rather than guessed — four directions are laid out in §3 with a recommendation. Two UI states were identified that most design systems lack and this product requires as first-class: *missing capability* (§4 #7) and *inferred-and-unconfirmed* (§7 #13). Both are normal states here, not edge cases. `README.md` updated in the same session.

### 2026-09-01 · docs · Phase 2 — context system built
**Area:** context
**What:** Built the rest of the system in dependency order, most-settled first:
- `architecture.md` — shape, stack table, repo layout, module boundaries, data & tenancy, keystone unlock, deploy (devops folded in)
- `security.md` — split out as its own authority file
- `code-standards.md` — implementation law
- `library-docs.md` — the stack as used here, plus approved dependencies
- `build-graph.md` — dependency map, including the one genuine sequencing tension
- `progress-log.md` — this file
- `project-overview.md`, `README.md`
- UI trio (`ui-tokens.md`, `ui-rules.md`, `ui-registry.md`) — PENDING stubs awaiting the design export
**Notes:** `architecture.md`, `security.md`, `code-standards.md`, and `library-docs.md` are grounded in web research current to 2026-09-01, cited in each file's References section. Two findings would have been wrong from memory: Supabase's key format is now `sb_publishable_` / `sb_secret_`, and `pgsodium` is pending deprecation in favour of Vault. **All library versions are deliberately unpinned (🕗) — fill them in at install.**

### 2026-09-01 · decision · security.md split out; devops.md folded in
**Area:** context
**What:** `security.md` becomes its own authority file — it wins on any data-handling question. `devops.md` deliberately not created; the deploy story is `architecture.md` §8.
**Notes:** Security split because the project holds Plaid access tokens, balances, and contribution history. DevOps folded because there is one environment, one free-tier host, no pipeline, and nothing to monitor — a separate file would have been filler. Revisit if any of that changes (`foundation.md` §10).

### 2026-09-01 · docs · foundation v4 — converged
**Area:** context
**What:** Q3b resolved positive; match inference upgraded to a differential diagnosis; F8 added as the highest-priority flow; §3 success bar rewritten; employer status corrected.
**Notes:** No blocking questions remain. Q4, Q4b, Q5b, Q6, Q7 ride alongside the build.

### 2026-09-01 · decision · Never infer a negative from missing data (§7 #16)
**Area:** lib/insights
**What:** Detecting a match is high-confidence; detecting its absence is not. Any "you are not being matched" conclusion is surfaced as a ranked differential with a question, never as a finding.
**Notes:** Research found ≥5 distinct causes for a single unpaired deposit — not-yet-eligible, annual lump-sum timing, blended reporting, contribution below threshold, genuinely no match — with opposite correct responses. Plus the true-up wrinkle. **This is the product's most damaging possible error and the naive implementation gets it wrong.** Test coverage for every case is non-negotiable (`code-standards.md` §8).

### 2026-09-01 · decision · Q3/Q3b resolved by direct observation
**Area:** lib/aggregator
**What:** The Northwind Retirement Savings Plan (plan recordkeeping) returns **balance ✅, transactions ✅ (weekly), holdings ❌**.
**Notes:** First-party evidence from an account aggregator, outranking vendor documentation. Drove per-account capability tiers (§7 #15) and the rewrite of §11. **Consequence: the match layer runs on the 401k; the "what do I own" loop runs on retail brokerage only.** Still unverified for Plaid specifically (Q4b) — different aggregation stack.

### 2026-09-01 · decision · Advice line widened; projections allowed
**Area:** context
**What:** §7 #2 revised — the employer match may be stated as a dollar consequence. §7 #2a draws the line precisely. §7 #14 permits forward projections as clearly-labeled illustrative hypotheticals.
**Notes:** Allowed: the mechanical dollar consequence of a benefit election. Not allowed: fund selection, allocation, rebalancing, Roth vs traditional for the user's situation, anything market-timed.

### 2026-09-01 · decision · No manual entry; paid LLM tier
**Area:** context
**What:** §7 #4 — aggregator is the sole ingestion path for accounts and holdings. §7 #11 — paid LLM tier with a no-training guarantee.
**Notes:** Manual entry was recommended during Phase 1 as a resilience path and **declined** — the accepted risk is that a revoked connection leaves an account with no fallback. §7 #4a carves out that asking the user a question about themselves is onboarding, not manual entry. The LLM decision deliberately breaks the $0 budget, for a privacy reason: free tiers may train on prompts containing account data.

### 2026-09-01 · docs · foundation.md v1 — Phase 1 complete
**Area:** context
**What:** Foundation drafted from the Phase 1 interview: build constraints, product definition, audience, success bar, principles, core model, flows, decision table, scope, keystones, scale seams, deepest risk, open questions.
**Notes:** Converged over four versions rather than one-shot. Two of the four had their deepest-risk section rewritten by evidence rather than argument.
