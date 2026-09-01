# FINBUDDY — Library Docs

> Codename `FINBUDDY` is a placeholder until the name is locked (`foundation.md` header).
> **Governs:** the stack as used *in this project* — why each piece is here, how it is used, and its traps. **Not** general library documentation; links go outward for that.
> **For *why* the stack was chosen** → `foundation.md` §7. **For how the pieces fit** → `architecture.md`. **For how code is written** → `code-standards.md`. **For token and key handling** → `security.md` (authority).
> **Authority:** when this file and `foundation.md` disagree, **`foundation.md` wins.**

**Status key:** ✅ locked · 🕗 TBD · ⬜ planned (not yet installed)

> **On versions:** an entry reads 🕗 **pin at install** until the package is actually installed, then it carries the real version. Versions guessed from memory are how a context system starts lying. **When you install a package, record the exact version here in the same session**, alongside anything surprising you hit.
>
> **Installed 2026-09-01** during spec `0001` (the Plaid read spike): Next.js 16.3.4, React 19.2.8, TypeScript 5.9.3, ESLint 9.39.5, `plaid` 46.0.0, `react-plaid-link` 5.0.0, `server-only` 0.0.1.

---

## Next.js — ✅ 16.3.4 (React 19.2.8, TypeScript 5.9.3)

**Why:** `foundation.md` §7 #5 — TypeScript end-to-end, one language, no service boundary, no second deploy target. Strongest AI-coding-agent support of the realistic options, which matters at 5–15 hrs/week (§0).

**How it's used here:** App Router only. Server Components render insights; `'use client'` is pushed as far down the tree as possible. Server Actions handle UI-originated mutations; Route Handlers exist only for Plaid webhooks (`architecture.md` §2, `code-standards.md` §4).

**Gotchas:**
- **Pages Router is maintenance-only** — new features land in App Router. Do not mix routers.
- **A Server Action is a public endpoint.** It validates input and re-checks authorization every time, regardless of which component called it (`code-standards.md` §4). This is the most commonly missed thing in the framework.
- Server Actions are the wrong tool for anything externally callable or needing specific HTTP status codes — that is a Route Handler.
- `useEffect` for initial page data causes an empty-content flash and a wasted round trip. Initial data comes from the server.
- **`create-next-app` refuses to run in a directory that already holds `context/` or `docs/`.** Scaffold into a temp directory and move the config in, which is what was done here.
- **Next.js 16 generates route types** (e.g. `LayoutProps<"/">`) into `.next/types`, so a bare `tsc --noEmit` on a clean checkout fails until a build has run. The layout here uses an explicit prop type instead, so typechecking works from a cold clone.

---

## Supabase (Postgres + Auth) — ⬜ not yet installed

**Why:** `foundation.md` §7 #6 — the free tier fits, and bundled auth + RLS make the open-up path (§7 #1) a config change rather than a migration. Neon was the runner-up on idle economics; auth + RLS decided it.

**How it's used here:** Postgres for all persistence. RLS on every table in `public`, `user_id` on every row, policies keyed on `auth.uid()` (`architecture.md` §5). Migrations are files in `supabase/migrations/`. **Supabase Vault** stores the Plaid `access_token` encrypted (`security.md` §3).

**Gotchas:**
- **Key naming changed.** The current format is `sb_publishable_` (client, RLS-bound) and `sb_secret_` (server, bypasses RLS), superseding anon / service_role. Same boundary, new names — older tutorials will use the old ones.
- **The secret key bypasses RLS entirely.** It must never carry `NEXT_PUBLIC_`. Authority: `security.md` §2.
- **A table without RLS is public** to anyone holding the publishable key — which is a public value by design. Enabling RLS is not optional hardening; it is the only thing standing there.
- **RLS policies need impersonation testing.** Untested policies are assumptions (`security.md` §4).
- **`pgsodium` is pending deprecation** — use Vault, which is self-contained and does not depend on it.
- **Free tier pauses after ~1 week of inactivity** (`foundation.md` §10). Expect a cold start; do not mistake it for a bug.

---

## Plaid (Investments) — ✅ `plaid` 46.0.0, `react-plaid-link` 5.0.0

**Why:** `foundation.md` §7 #3 — read-only investment data; the free Trial covers single-user scale. SnapTrade was rejected as trading-oriented for a product that is read-only by design (§7 #2).

**How it's used here:** **Only inside `lib/aggregator/plaid/`** (§7 #8). Nothing outside that directory knows Plaid exists. It fills `accounts`, `holdings`, and `contribution_events`, and records each connection's capability tier (§7 #15).

**Gotchas — the ones this project already hit:**
- **Holdings and transactions are separate data products, and coverage differs per institution.** Confirmed first-party: the FedEx/Vanguard workplace plan returns balance and transactions but **not** holdings (`foundation.md` §11). Never assume uniform depth — store what each connection actually returned.
- **Employer plans ≠ retail accounts.** A workplace 401k sits on a recordkeeping platform, separate from the provider's retail brokerage. Coverage for one says nothing about the other.
- **Access can be revoked by the institution.** Principal did exactly this in 2025, breaking 401k sync for Mint, YNAB, and Monarch. There is no manual fallback (§7 #4) — handle it as an expected state (`code-standards.md` §6).
- **`public_token` is single-use.** Exchange it server-side immediately, then discard. Never persist it.
- **`access_token` is long-lived and server-side only** — never the browser, never a log, never an analytics event. Authority: `security.md` §3.
- **Investments bills as a monthly subscription per active Item**, not per call — cost tracks connected accounts (`foundation.md` §10).
- ⏳ Some institutions (notably Fidelity) require a higher plan tier and have lead time before production access is effective.
- **`react-plaid-link` types `public_token` as `string | null` in `onSuccess`.** Handle the null rather than asserting it away; it means Link finished without a token.
- **Both investments endpoints return every account in the Item at once.** Call them once per Item and split the result per account, not once per account.
- `PlaidEnvironments` is a plain object keyed by environment name, so an unknown `PLAID_ENV` yields `undefined` rather than throwing. Validate it explicitly.

---

## LLM provider — ⬜ 🕗 provider and version TBD

**Why:** `foundation.md` §7 #11 — a paid tier with a contractual no-training guarantee. The only place the $0 budget is deliberately broken, and for a privacy reason rather than a quality one.

**How it's used here:** **Only inside `lib/llm/`**, which receives finished `Insight` objects and renders prose. It never computes a figure and cannot import `db/` or `aggregator/` (`architecture.md` §4, `security.md` §5).

**Gotchas:**
- **Free tiers may train on submitted prompts.** Prohibited here for any prompt containing account data — a security control, not a cost preference (`security.md` §5).
- **The prompt is an outbound data transfer.** Everything sent has left your control. Send the narrowest context that answers the question.
- **Never ask the model to do arithmetic** (`foundation.md` §4 #1). If a number appears in output that did not arrive as an `Insight` field, that is a bug in the calling code, not a prompt to tune.

---

## Approved dependencies

| Package | Purpose | Status |
|---|---|---|
| `next` | Framework | ✅ 16.3.4 |
| `react`, `react-dom` | UI runtime | ✅ 19.2.8 |
| `typescript`, `@types/node`, `@types/react` | Types | ✅ 5.9.3 / 20.19.43 / 19.2.18 |
| `eslint`, `eslint-config-next` | Lint | ✅ 9.39.5 / 16.3.4 |
| `plaid` (official Node SDK) | Aggregator — `lib/aggregator/plaid/` only | ✅ 46.0.0 |
| `react-plaid-link` | Plaid Link in the browser — the one client side Plaid package | ✅ 5.0.0 |
| `server-only` | Build time guard: makes a server module fail loudly if it is ever imported into client code. Enforces the "access token never reaches the browser" rule structurally rather than by discipline (`security.md` §3) | ✅ 0.0.1 |
| `@supabase/supabase-js`, `@supabase/ssr` | DB + auth client | ⬜ not yet needed |
| LLM provider SDK | `lib/llm/` only | ⬜ 🕗 TBD with provider |
| A schema validator (e.g. `zod`) | Boundary parsing (`code-standards.md` §2) | ⬜ 🕗 pin at install |
| A test runner | `lib/insights/` coverage (`code-standards.md` §8) | ⬜ 🕗 TBD |

**The rule: do not install anything outside this list without adding it here first** — with its purpose and why an existing dependency could not do the job. A dependency added silently is a dependency nobody maintains.

**Especially: no financial-calculation library** without a decision entry. The insight engine is deliberately hand-written and tested (`foundation.md` §7 #7) because being correct about dollars is the product.

---

## References

Checked **2026-09-01**. Re-verify at install; that is when the versions above get filled in.

| Source | Used for |
|---|---|
| [Next.js App Router patterns, 2026](https://pristren.com/blog/nextjs-app-router-patterns-2026/) · [Server Actions guide](https://nextjsreactjs.com/latest-article/nextjs-server-actions/) | Router choice, Server Actions vs Route Handlers |
| [Supabase security best practices, 2026](https://supaexplorer.com/guides/supabase-security-best-practices) · [service-role key guidance](https://securie.ai/guides/supabase-service-role-key) | Key format, RLS, impersonation testing |
| [Supabase Vault](https://supabase.com/blog/supabase-vault) · [pgsodium deprecation](https://supabase.com/docs/guides/database/extensions/pgsodium) | Token-at-rest storage |
| [Plaid — Investments](https://plaid.com/docs/investments/) · [Security best practices](https://plaid.com/core-exchange/docs/security/) · [Pricing](https://plaid.com/pricing/) | Products, token handling, billing model |
| [Beagle — Principal 401k aggregation changes](https://meetbeagle.com/resources/articles/connecting-principal-401k-mint-ynab-monarch-finicity-changes-2025) | Institution revocation precedent |
