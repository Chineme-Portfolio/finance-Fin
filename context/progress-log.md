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
**What:** The FedEx Corporation Retirement Savings Plan II (Vanguard recordkeeping) returns **balance ✅, transactions ✅ (weekly), holdings ❌**.
**Notes:** First-party evidence from Credit Karma, outranking vendor documentation. Drove per-account capability tiers (§7 #15) and the rewrite of §11. **Consequence: the match layer runs on the 401k; the "what do I own" loop runs on retail brokerage only.** Still unverified for Plaid specifically (Q4b) — different aggregation stack.

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
