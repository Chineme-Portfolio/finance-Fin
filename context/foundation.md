# FINBUDDY — Foundation

> **Status:** v4 — **converged.** Last updated 2026-09-01. Changes from v3: **Q3b resolved positive** — the FedEx/Vanguard 401k *does* return transactions, so the match layer survives the holdings failure (§11). Match inference upgraded from ratio-detection to **differential diagnosis** (§5) after research showed absence of a paired deposit has at least five distinct causes. New §7 #16 (never infer a negative from missing data) and **F8, the "turn the match on" walkthrough — now the product's highest-priority flow** (§6). Employer status corrected (§2). Formula library seeded (§7 #12). **No blocking questions remain. Q4, Q6, Q7 ride as known-open — none block building.**
> **v4.1 (2026-09-01):** clarified "one surface" → "one platform" in §0 and §6 (it was misread as single-page); added §12 Q8, the app's page structure.
> **v4.2 (2026-09-01):** §7 #9 clarified and §7 #9a added — a root `AGENTS.md` router exists and is distinct from the team-mode collaboration file #9 rejected.
> **v4.3 (2026-09-04):** §7 #17 added and §12 Q8 resolved — dashboard-first app shape, settled before the first UI screen (spec 0003).
> Source of truth. Every other file references this; none restate it. If any file disagrees with this one, this one wins.
> Codename `FINBUDDY` is a placeholder until the name is locked — find-and-replace when it is.

**Status key:** ✅ locked/built · 🕗 TBD (decide later) · ⬜ planned · 🟡 in progress · **[LOCKED]** settled decision · ⏳ external lead time

---

## §0 Build constraints

The forcing function. Every scope argument resolves here first.

| Constraint | Value |
|---|---|
| Team | **Solo.** One person, no collaborators. |
| Time | **5–15 hrs/week.** Steady side project, not full-time. |
| Budget | **~$1–3/month.** Free tiers everywhere except the LLM provider (§7 #11). |
| Skills | TypeScript / React (fluent), Python (fluent). |
| Stage | **Day zero.** No code, no design, no repo. |

**Implications — not negotiable without revisiting this section:**

- **One platform only.** A responsive web app: no native mobile app, no browser extension, no email digest. *This constrains how many surfaces get built and maintained; the app's shape within it is dashboard-first (§7 #17).*
- **No always-on infrastructure.** Anything needing a background worker, cron job, or warm server is deferred by default. This constrains what "proactive" means in v1 (§6).
- **Depth over breadth.** One flow done excellently beats five half-built ones. At 10 hrs/week, breadth is how this dies.
- **Solo system shape.** One `progress-log.md` with inline entries. No collaboration layer — no `COLLAB.md`, no CI progress guard (§7 #9). *(A thin root `AGENTS.md` router does exist — §7 #9a; different file, different job.)*

---

## §1 What it is

**One-liner:** A conversational companion that reads your real investment accounts and translates what you already own into your own dollars.

FINBUDDY is not a budgeting app and not a portfolio tracker. Budgeting tools (Mint, YNAB, Monarch) assume your problem is spending. Brokerage dashboards assume you already understand what you're looking at. Neither serves the person in between: **someone who already owns things they don't understand.**

**The wedge — the confused holder.** The user has accounts *because of employment and impulse*, not because of a plan: a 401k they were auto-enrolled in, a brokerage account where they bought something once. They are not under-served by information — there is infinite finance content — they are under-served by *information about their own specific accounts*.

**The core loop, stated in the user's own words** (these are the product spec):

> *"What does buying this actually mean?"*
> *"In 3 months would I even gain remotely an extra dollar?"*
> *"Do my earnings compound in this account?"*

Every one is the same shape: **take a thing I own, and explain it in my dollars.** That loop is the product. The employer match (§6 F3) is the highest-value *instance* of it, not a separate feature.

**Why this can win:** being useful here requires being **correct, specific, and trusted** rather than clever. That is an engineering problem, and it is the kind a careful solo builder can win.

---

## §2 Who it's for

**v1 user: the founder.** One real person with:
- a **FedEx Corporation Retirement Savings Plan II** account on Vanguard's recordkeeping platform, receiving **weekly** payroll contributions — so FedEx is a **current** employer, not a former one *(corrected in v4; v1–v3 mis-read this as an orphaned plan and built F4 on that assumption — see §6 F4)*
- a SoFi brokerage account containing a position they don't fully understand
- **an active, unresolved instance of the exact problem the product exists to solve:** *"I currently don't match and I don't know how to, exactly."*

**The audience it generalizes to:** low-to-middle-income earners, roughly 20s–40s, who acquired investment accounts through employment or a single act of initiative and never got a map. Financially *motivated* but not financially *literate*. The guiding phrase from the interview: **"even someone with a single dollar can do something."**

What defines them is not income — it is that **nobody has ever explained their own statement to them.**

---

## §3 Success & stage

**Type:** Tool-for-self first, architected to open up. Not a business today; not foreclosed from becoming one.
**Stage:** Day zero. This foundation precedes all code.

**v1 success is a single concrete bar:**

> You understand what is in your SoFi account, and **the tool has walked you from "I don't know how to match" to a changed contribution rate.**

That second clause replaces v1–v3's vaguer "one true, actionable thing." The founder's own unresolved problem (§2) is the sharpest possible success test: it is real, it is unsolved today, and it is worth real money.

Deliberately small, personal, and falsifiable. Not "users," "retention," or "launch." If it cannot be met for the one user who cares most, no amount of scale fixes it.

---

## §4 Guiding principles

1. **The model never does arithmetic.** Every number is computed in deterministic code; the LLM only explains numbers handed to it. *Why: one wrong dollar figure destroys the trust the product runs on, and LLMs are confidently wrong at math.*
2. **Explain, don't prescribe.** Teach the concept and show the user's own figures. Never recommend a security to buy or sell. *Why: this is the line between education and regulated investment advice — and it is what actually builds literacy.*
3. **Every number is traceable.** Any figure shown can be drilled to its source. *Why: a beginner has no basis to trust the tool; "trust me" is the opposite of the product.*
4. **Inference is a question, never a claim.** Anything derived by pattern-matching is surfaced for confirmation, never asserted (§7 #13). *Why: preserves #1 and #3 while still letting the system be smart.*
5. **Boring beats clever.** Prefer the well-established move. *Why: the highest-ROI actions for this audience are boring, and clever is where both bugs and liability live.*
6. **Never send the user to a plan document.** If an answer requires the user to go research their own paperwork, the design has failed (§7 #12). *Why: that friction is exactly where this audience abandons, and it sits in front of the best feature.*
7. **Show what you can't see.** When an account cannot support a feature, say so plainly and say why — never render a blank, a zero, or a guess. *Why: capability varies by provider (§7 #15) and a silent gap reads as a broken product or, worse, as a real zero.*
8. **Assume 10 hrs/week and near-zero budget.** When two designs are close, take the one needing no paid tier and no always-on process. *Why: §0 is the forcing function.*

---

## §5 Core model

```
User ──┬── Account ──── Holding
       │      │
       │      ├──── ContributionEvent   (employer accounts)
       │      └──── PlanFacts           (employer accounts)
       │
       └── Insight   (derived, never stored as truth)
```

- **Account** — one financial account, always `linked` via aggregator (§7 #4). Carries a type (`401k`, `roth_ira`, `traditional_ira`, `taxable_brokerage`, `hsa`…) **and a `capabilities` set** — which of `balance` / `holdings` / `transactions` this specific connection actually returns. Capabilities are discovered at link time and stored, not assumed (§7 #15).
- **Holding** — a position: symbol, quantity, value, and where available expense ratio. The unit the core loop (§1) operates on.
- **ContributionEvent** — a dated deposit into an employer account, with amount and (where the provider exposes it) source: employee deferral vs employer match. **The raw material for match inference.**
- **PlanFacts** — match formula, contribution rate, gross pay. Not available from any API (§11). Acquired by inference and recognition, never document lookup (§7 #12).
- **Insight** — a derived, typed observation. **Always computed, never stored as truth** — recomputed from current inputs so it can never go stale silently.

### Match inference — the method

Employer contributions typically appear as **paired deposits on the same date**: the employee deferral and the employer match. Where both are visible, the ratio between them is the match rate, observable without the user supplying anything.

The ratio alone answers the important question *without knowing salary*. Under a 50%-on-the-first-6% formula:

| User contributes | Employer matches | Observed ratio | Meaning |
|---|---|---|---|
| 4% of pay | 2% | **0.5** | At or under the cap — **may be leaving money unclaimed** |
| 6% of pay | 3% | **0.5** | At the cap |
| 10% of pay | 3% (capped) | **0.3** | Above the cap — capturing the full match |

A ratio *at* the headline rate means money may be unclaimed. A ratio that has *dropped below* it means the match is fully captured. Converting that to a dollar figure needs one more input — gross pay — which the user knows from memory.

### Why a single deposit is not evidence of "no match"

**This is the core correctness trap of the whole feature.** Seeing only one deposit per pay period has at least five distinct causes, and they call for opposite responses:

| Observed | Possible cause | Right response |
|---|---|---|
| One deposit, employee only | **Not yet eligible** — match commonly begins after 90 days to 1 year of service | Explain the waiting period; nothing is being lost |
| One deposit, employee only | **Match paid annually as a lump sum**, not per paycheck | Widen the window to ≥13 months before concluding anything |
| One deposit, blended | Provider reports deferral + match as **one line**, unitemized | Ratio is unavailable; fall back to recognition (§7 #12 tier 2) |
| One deposit, employee only | Contribution rate is **below the match threshold** | The real finding — F3/F8 |
| One deposit, employee only | **Plan genuinely has no match** | Nothing to capture; say so |

A separate wrinkle: **true-up** payments. Some plans reconcile the annual match after year-end, so a late anomalous deposit is a correction rather than a new pattern, and per-paycheck matching can under-pay anyone who front-loads contributions.

**Consequence:** the engine emits a *ranked differential with a question* (§7 #13, §7 #16), never a verdict. Detecting a match is high-confidence; detecting the *absence* of one is not, and the system must never confuse the two.

**Confirmed available:** the FedEx/Vanguard plan returns dated transactions (§11 — Q3b, resolved; weekly cadence), so this method has real input even though holdings do not (§11).

## §6 Core flows & surfaces

**Platform:** a responsive web app, and nothing else in v1 (§0). **The app's shape is dashboard-first (§7 #17):** you land on your money, Fin is a panel you open. `architecture.md` §3 assumes multiple routes; the shape is a design decision, not an architectural one.

| # | Flow | Note |
|---|---|---|
| F1 | **Link an account** via aggregator | The only ingestion path (§7 #4) |
| F2 | **"What do I actually own?"** — plain-English explanation of each holding | Literacy core. **Requires `holdings`** (§7 #15) |
| F3 | **The match check** — am I capturing my full employer match? | Highest-value instance of F6. **Requires `transactions` only** — survives on accounts with no holdings data |
| F4 | **The orphaned 401k** — options for a plan at a former employer | Explains options; does not pick one (§4 #2). **Deprioritized in v4** — built on a mis-read; FedEx is a current employer (§2). Kept in scope for the general audience, not for user #1 |
| F5 | **Ask anything** — conversational Q&A grounded in real account data | The "buddy" |
| F6 | **"What does this mean for my dollars?"** | **The core loop (§1).** Translates any holding into the user's own money: what it is, whether it compounds here, what it costs in fees. **Requires `holdings`** |
| F7 | **"What can't you see, and why?"** | Every account states its capability tier plainly (§4 #7, §7 #15). An unreadable account is explained, never blank |
| F8 | **"How do I turn the match on?"** — the walkthrough from *not matching* to a changed contribution rate | **Highest-priority flow (§3).** Names the plan's formula, states the dollar consequence (§7 #2a), and gives navigational steps — where in the provider's portal the contribution rate is set. **Never sets it for the user**, and never picks the rate |

**On "proactive" — an honest narrowing.** The interview asked for proactive advice. Under §0 (no always-on infrastructure), v1 proactivity is **in-session**: when you open the app, it surfaces what it noticed, unprompted, before you ask. It does **not** push or email. Push proactivity is deferred (§8), not abandoned — but calling it "proactive" without this caveat would be the first lie the system tells itself.

---

## §7 Locked decisions

Other files cite these by number (`foundation.md §7 #5`).

| # | Decision | Reasoning | Rejected alternative |
|---|---|---|---|
| 1 | **[LOCKED]** Tool-for-self v1, architected to open up | Strongest forcing function for scope; carries no one else's financial data while the idea is unproven; founder is the ideal test user | Multi-user from day one — front-loads auth, compliance, support before the idea is validated |
| 2 | **[LOCKED — revised in v3]** Education + your-own-numbers, **plus the employer match stated as a dollar consequence**. See §7 #2a for the exact line | The match is uniquely uncontroversial: it is the employer's money, already offered, going unclaimed. Stating it in dollars is arithmetic and benefits literacy, not security selection — and it is what the user explicitly asked for | Pure education with no actionable framing (v2's position — refuses to answer the question the user is actually asking); full personalized recommendations (likely needs legal review/registration) |
| 2a | **[LOCKED]** The advice line, drawn precisely. **Allowed:** the mechanical dollar consequence of a benefit election — *"contributing 3% more would capture ~$1,240/yr of employer money you are not currently receiving."* **Not allowed:** which fund to hold, allocation, rebalancing, Roth vs traditional for your situation, whether to max an IRA, anything market-timed | One winner per question, named in advance. The allowed side is arithmetic over a published plan rule; the disallowed side is situational judgement about securities — the point where "education" stops being an honest label | A vaguer standard resolved case-by-case — guarantees drift toward the disallowed side |
| 3 | **[LOCKED]** Aggregator-first for account data, via **Plaid** | Defensible at n=1: own data, own tokens, and the free Trial (10 Production Items, teams created on/after 2026-04-15) makes it $0 at this scale | Manual-only v1; SnapTrade — stronger brokerage OAuth coverage but trading-oriented, and this product is read-only by design |
| 4 | **[LOCKED — user decision, reversing the v1 recommendation]** **No manual entry** of accounts or holdings. Aggregator is the sole ingestion path | Onboarding stays one click; typing in holdings is the friction that kills this audience. **Risk explicitly accepted:** if a recordkeeper revokes access (§10), that account goes dark with no fallback | Manual entry as a required parallel path — recommended during Phase 1, declined |
| 4a | **[LOCKED]** #4 governs *accounts and holdings only*. Asking the user a question about themselves (gross pay, "does this look like your match?") is **onboarding, not manual entry**, and remains permitted | The match feature (§5) is impossible otherwise, and one remembered number is not the friction #4 exists to prevent | Treating all user input as manual entry — would delete the highest-value feature |
| 5 | **[LOCKED]** TypeScript end-to-end (Next.js). Python not used as a second service | One language, no service boundary, no second deploy target; Plaid's Node SDK is first-class; strongest AI-agent support. At 5–15 hrs/week, fewest moving parts wins | Python backend + React frontend — justified only by heavy numerical work, which this does not have |
| 6 | **[LOCKED]** Postgres via **Supabase** | Free tier fits; **auth + row-level security give the open-up path (#1) for free** — multi-user becomes a config change, not a migration | Neon (runner-up: better idle economics and faster resume, but no bundled auth/RLS — the deciding factor) |
| 7 | **[LOCKED]** Deterministic insight engine, strictly separate from the LLM layer | Pure functions over (accounts, holdings, contributions, plan facts) → typed `Insight`s. Enforces §4 #1 architecturally rather than by discipline | Letting the model compute figures from context — the fastest way to destroy trust |
| 8 | **[LOCKED]** Aggregator sits behind an adapter interface | Plaid must not be load-bearing; recordkeeper access is revocable and outside our control (§10). Doubly important given #4 removed the fallback | Direct Plaid SDK calls throughout the codebase |
| 9 | **[LOCKED — clarified v4.2]** Solo system shape: **no collaboration layer** — one inline `progress-log.md`, no `COLLAB.md`, no per-entry progress files, no CI progress guard | One person, no parallel agent sessions (§0) | Team mode (a collaboration-layer `AGENTS.md` + `COLLAB.md` + per-entry progress files) |
| 9a | **[LOCKED]** A root **`AGENTS.md` does exist** — as a *thin router* that points agents at `context/` and states the non-negotiables. It is **not** the team-mode collaboration file rejected in #9 | Different file, different job. #9 rejected branch discipline and parallel-session coordination, which a solo build does not need. The router is how `/architect`, `/develop`, and `/check` find the authority files at all — without it the toolchain reads no context | Relying on each skill to discover `context/` unaided — the drift this system exists to prevent |
| 10 | **[LOCKED]** `user_id` on every table, RLS enabled from day one despite being single-user | Retrofitting tenancy is the expensive migration; doing it now costs almost nothing and makes #1 real rather than aspirational | Single-user schema, add tenancy later |
| 11 | **[LOCKED]** **Paid LLM tier** with a contractual no-training guarantee (~$1–3/mo at this volume) | Free tiers reserve the right to train on submitted prompts; these prompts contain the user's balances and holdings. A privacy problem, not a cost problem. This is the *only* place §0's budget is broken | Free tier (trains on prompts); local Ollama (private and free, but weaker and tied to one machine) |
| 12 | **[LOCKED]** PlanFacts acquired by **inference → recognition → one remembered number**. Never by sending the user to a plan document | Directly attacks §11. Tier 1: infer from deposit pairing (zero effort). Tier 2: user *recognizes* their formula from a small library of common shapes. Tier 3: ask gross pay — one number known from memory. **Library seeded with the FedEx Corporation Retirement Savings Plan II as entry #1** (user #1's employer), plus the two most common shapes | "Enter your match formula and vesting schedule" — the friction this audience abandons at |
| 13 | **[LOCKED]** Inference is surfaced as a **question**, never asserted as fact | "I see two deposits every two weeks in a 2:1 ratio — does that look like a 50% match?" Keeps §4 #1 and #3 intact and converts a guess into a better question | Asserting inferred figures — one wrong number costs the trust the product runs on |
| 14 | **[LOCKED]** Forward projections allowed **only as clearly-labeled illustrative hypotheticals** — *"if this returned 7% a year, which is not a prediction, $100 becomes $101.75 in 3 months"* | The user's own question ("in 3 months would I gain a dollar?") is a projection; refusing to answer it is its own failure. Labeling keeps it an illustration rather than a forecast | Silent projections (imply prediction); refusing projections entirely (leaves the real question unanswered) |
| 15 | **[LOCKED]** **Per-account capability tiers.** Each linked account stores which of `balance` / `holdings` / `transactions` it actually returns, discovered at link time. Features are gated on capabilities, and missing capability is surfaced honestly (§4 #7) | Forced by evidence: the FedEx/Vanguard 401k returns balance but not holdings (§11 — Q3, resolved). Provider depth varies and is outside our control — modelling it explicitly is the only honest option | Assuming uniform data depth — produces blank screens, false zeros, and features that silently do nothing |
| 16 | **[LOCKED]** **Never infer a negative from missing data.** Detecting a match is high-confidence; detecting its *absence* is not. Any "you are not being matched" conclusion must be surfaced as a ranked differential with a question (§5), never as a finding | Research established at least five distinct causes for a single unpaired deposit — including not-yet-eligible and annual lump-sum timing — with opposite correct responses. Asserting "no match" wrongly is the single most damaging error the product can make: it would tell a user to act on a problem they do not have | Treating absence of a paired deposit as evidence of no match — the naive implementation, and wrong |
| 17 | **[LOCKED — v4.3, resolves §12 Q8]** **Dashboard-first app shape.** The signed-in product opens on the user's money (balance, what they own, what was noticed); Fin is a panel/composer the user opens to ask, not the front door | A beginner who does not yet know the questions to ask (§2) bounces off a blank chat prompt; leading with what the tool noticed serves F6/F7/F8 (proactive surfacing) and matches the design export's own UI kit | Chat-first (Fin as the app — intimidating for this audience); hybrid home (more to build for no clear first-screen gain) |

---

## §8 Scope

### In (v1)
- Link accounts via aggregator
- Holdings view — what you own, per account
- **F6: translate any holding into your own dollars** (the core loop)
- Plain-English explainer for any holding
- Employer-match inference and check, including the unclaimed amount in dollars (§7 #2a)
- Per-account capability disclosure — what the tool can and cannot see, and why (F7, §7 #15)
- **F8: the walkthrough from "not matching" to a changed contribution rate** — the highest-priority flow (§3)
- Orphaned-401k options explainer
- Conversational Q&A grounded in real account data
- In-session proactive surfacing

### Out / cut (the forcing function)
Not "later" — **deliberately cut**. Re-opening one requires revisiting §0.

- Manual entry of accounts or holdings (§7 #4)
- Budgeting, spending tracking, cash-flow, net-worth-over-time
- Any buy/sell recommendation, allocation advice, or rebalancing guidance (§7 #2)
- Trade execution of any kind
- Goal planning, retirement projections, tax optimization
- Native mobile app; browser extension
- Multi-user operation, social features, sharing
- Push notifications and email digests

### Deferred (wanted, not now)
- Multi-user + auth hardening (schema is ready — §7 #10)
- Push/scheduled proactivity (needs always-on infra)
- More account types: HSA, 529, pensions
- Debt and interest-rate awareness
- Expanding the plan-formula library beyond the common shapes

---

## §9 Architecture keystones

Detail lives in `architecture.md`; the decisions and reasoning live here.

- **Tenancy/isolation.** Single-user in practice, multi-tenant in structure from the first migration: every table carries `user_id`, RLS on from day one (§7 #10). An unscoped query is a bug, not a style issue.
- **The keystone unlock: the deterministic insight engine** (§7 #7). Pure functions `(accounts, holdings, contributions, planFacts) → Insight[]`. Once it exists, everything else *renders* insights — chat, UI, any future surface. Adding an insight becomes one pure function plus one test, with no LLM involvement and no UI change. Build this before anything that consumes it.
- **Explicit over magic.** The aggregator behind an adapter (§7 #8). No hidden sync. No LLM-computed figures. Every displayed number traceable to its inputs (§4 #3).

---

## §10 Known scale seams

| Seam | Breaks when | Replacement |
|---|---|---|
| Vercel Hobby hosting | It becomes commercial — Hobby forbids commercial use | Paid tier; forced by §7 #1 opening up, not by load |
| Supabase free tier | ~1 week of inactivity pauses the project (cold start); 500 MB cap | Paid tier, or Neon if idle economics dominate |
| Plaid free Trial (10 Production Items) | ~3 users, not ~10 — real users hold multiple accounts | Paid Plaid tier; Investments bills per active Item per month |
| **Aggregator revocation** | A recordkeeper cuts third-party access (Principal did exactly this in 2025, going dark for Mint/YNAB/Monarch) | **No fallback exists** — §7 #4 removed it by decision. The account simply disappears from the product |
| No background jobs | Push proactivity is wanted | A scheduled worker; requires more infra spend |

---

## §11 The deepest risk

**Confirmed and contained: the employer 401k returns transactions but not holdings.**

*(v1 named the plan-facts gap here; §7 #12–13 defused it. v2 named holdings-depth; v3 recorded that test failing. v4 records the second test passing — the risk is now bounded and the product is shaped around it.)*

Evidence, 2026-09-01 — Credit Karma, **FedEx Corporation Retirement Savings Plan II** on Vanguard's recordkeeping platform:

| Data product | Result |
|---|---|
| Balance | ✅ available (30-day chart, +$69) |
| **Holdings** | ❌ *"Insufficient data — we don't currently have investment holdings for this account."* |
| **Transactions** | ✅ available — dated contribution deposits, **weekly** cadence |

**Why this is survivable.** Holdings and transactions are separate data products, and the two most valuable flows need different ones. F3 and F8 — the match layer, and the highest-value thing this product does for its first user — need **only transactions**, which are present. F2 and F6 need holdings, and run on the retail brokerage instead. The product splits by account type (§7 #15) rather than degrading everywhere.

**What the risk became.** Not data availability any more, but **inference correctness**. The system must now reason about a match from transaction patterns alone, and §5 establishes that the naive reading — *no paired deposit means no match* — is wrong in at least four of five cases. A confidently wrong "you're not being matched" told to someone in their eligibility waiting period, or on an annual-lump-sum plan, is the trust-destroying failure (§4 #1, §7 #16).

**The bet, restated:** that a differential-with-a-question is more useful to a beginner than a verdict would be. Given user #1 is currently living the unresolved problem (§2), that is testable immediately.

## §12 Open questions

None blocking. The foundation is converged; these ride alongside the build.

**Q4 — Does SoFi return holdings via Plaid Investments?** The only remaining data unknown. With the 401k confirmed holdings-blind (§11), SoFi is the sole home for F2 and F6. Architecture does not change either way — capability tiers (§7 #15) absorb the answer — but if it also fails, §1's core loop has nowhere to run and the product becomes match-only. Resolve at first link.

**Q4b — Does Plaid match Credit Karma's depth on the FedEx plan?** Different aggregation stacks; §11's evidence is first-party but from a different aggregator. Also worth re-checking holdings in ~1 week — *"check back later"* may be a pending state rather than a refusal.

**Q5b — Is FedEx confirmed as a current employer?** Inferred in v4 from weekly ongoing contributions (§2), correcting v1–v3. If wrong, F4 returns to priority and F8's premise changes. **Cheap to confirm; assumed until contradicted.**

**Q6 — Retention.** Literacy tools have a one-time-use problem: you learn the thing, you leave. F8 sharpens the question rather than answering it — once the match is turned on, what brings someone back? Not blocking (§3's bar is a one-time outcome), but it decides whether §7 #1 is ever worth acting on.

**Q7 — The real product name.** `FINBUDDY` is a placeholder. Locking it later is a find-and-replace; leaving it ambiguous in code is not.

*(v1 Q1 → §7 #11. v1 Q2 → §7 #4. v1 Q5 → §7 #12. v2 Q3 → §11 + §7 #15. v2 Q5 → §7 #14. v3 Q3b → resolved positive, §5 + §11. Q8 → §7 #17, dashboard-first.)*

## Appendix — research grounding

Checked **2026-09-01**. This guidance goes stale; re-check before acting on it.

| Source | Used for |
|---|---|
| **Direct observation — Credit Karma, FedEx Corporation Retirement Savings Plan II (Vanguard), 2026-09-01** | **Holdings unavailable; balance and dated weekly transactions available. Resolves Q3 (negative) and Q3b (positive) — both closed; see §11. Drives §11, §5, §7 #15.** First-party evidence, outranks vendor documentation |
| [Beagle — FedEx 401k match & vesting](https://meetbeagle.com/resources/articles/2025-fedex-401k-match-vesting-schedule-8-percent-employer-contribution) · [MyPlanIQ — FedEx Retirement Savings Plan II](https://www.myplaniq.com/invest/plancontribution-match/fedex-corporation-retirement-savings-plan-ii/) | Formula-library seed entry #1; eligibility service period (§7 #12, §5). **Third-party summaries — verify against plan documents before the product asserts them** |
| [SHRM — 401(k) true-up payments](https://www.shrm.org/topics-tools/news/benefits-compensation/consider-401k-true-payments-employer-matching-contributions) · [Newfront — annual match true-up](https://www.newfront.com/blog/401kology-annual-match-true-up) | Per-paycheck vs annual lump-sum match timing; true-up wrinkle (§5, §7 #16) |
| [Plaid — Investments API docs](https://plaid.com/docs/api/products/investments/) | Investments product capabilities (§7 #3) |
| [Plaid — Investments product overview](https://plaid.com/products/investments/) | ~20 account types incl. retirement plan providers (§11 — Q3, resolved) |
| [Plaid — Vanguard institution coverage](https://plaid.com/institutions/vanguard/) | Products listed: Assets, Balance, Transactions (§11 — Q3, resolved) |
| [Plaid — Pricing](https://plaid.com/pricing/) | Free Trial: 10 Production Items; Investments billed per active Item/month (§7 #3, §10) |
| [Beagle — Principal 401k aggregation changes](https://meetbeagle.com/resources/articles/connecting-principal-401k-mint-ynab-monarch-finicity-changes-2025) | Precedent: recordkeeper revoked third-party 401k sync (§7 #4, §7 #8, §10, §11) |
| [RIABiz — Vanguard joins recordkeeper data detente](https://riabiz.com/a/2021/9/24/vanguard-group-becomes-second-domino-to-fall-in-401k-recordkeeper-detente-on-plan-portability-and-the-push-is-on-to-cajole-fidelity-the-dc-king-to-follow-suit) | Vanguard opened plan-data access; Fidelity a holdout (§11 — Q3, resolved) |
| [Credit Karma — Net Worth launch](https://www.creditkarma.com/about/releases/credit-karma-net-worth) | Net-worth aggregation = balances; investment insights a later iteration (§11 — Q3, resolved) |
| [Human Interest — 401k employer match types](https://humaninterest.com/learn/articles/looking-in-depth-at-the-401k-employer-match/) | Most common Vanguard-plan formula 50% on first 6%; runner-up 100% on first 3% + 50% on next 2% (§5, §7 #12) |
| [Free LLM API tiers, 2026](https://wetheflywheel.com/en/ai-model-access/free-llm-api-tiers-2026/) | Free-tier prompt-training caveat (§7 #11) |
| [Database free tier comparison, 2026](https://agentdeals.dev/database-free-tier-comparison-2026) | Supabase vs Neon free-tier limits and pausing (§7 #6, §10) |
