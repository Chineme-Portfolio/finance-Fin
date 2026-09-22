# FINBUDDY — Security

> **Status:** v1 — Last updated 2026-09-01. First draft, grounded in current Plaid, Supabase, and OWASP guidance.
> Codename `FINBUDDY` is a placeholder until the name is locked (`foundation.md` header).
> **Governs — and is the authority on:** how sensitive data is stored, moved, logged, and exposed. **On any data-handling question, this file wins** — over `code-standards.md`, over `architecture.md`, over convenience. One winner per question, named in advance.
> **`foundation.md` still wins on product decisions** (what the product does, what's in scope). This file governs *how data is handled while doing it*.
> **For *why* the stack is what it is** → `foundation.md`. **For module boundaries** → `architecture.md`. **For general code rules** → `code-standards.md`.

**Status key:** ✅ enforced · ⬜ planned · 🕗 TBD

---

## §1 What is actually at risk here

Be precise about this rather than vaguely alarmed. The system holds:

| Asset | Sensitivity | Why it matters |
|---|---|---|
| **Plaid `access_token`** | 🔴 Critical | Long-lived. Unlocks account data on demand. A leak is not "some data exposed" — it is standing read access until revoked |
| Account balances and holdings | 🔴 High | Financial position of a named individual |
| Contribution history | 🔴 High | Reveals employer, pay cadence, and salary to close approximation |
| `sb_secret_` key | 🔴 Critical | Bypasses RLS entirely — effectively root on the database |
| Employer identity + plan | 🟠 Moderate | Identifying in combination with the above |

**Today the only subject is the founder** (`foundation.md` §7 #1). That lowers the blast radius, not the standard: the controls below are cheap now and non-negotiable later, and retrofitting them after opening up is how breaches happen.

**Explicitly out of scope:** this file is engineering practice, not a compliance program and not legal advice. If the product ever serves other people, the regulatory picture (and this file) needs review by someone qualified — flag it then, don't guess now.

---

## §2 Secrets and keys

✅ **Environment variables only.** No secret is ever committed, hardcoded, or written into a client component.

**The `NEXT_PUBLIC_` rule — the single highest-consequence mistake available in this stack:**

| Key | Prefix | Where it may appear |
|---|---|---|
| Supabase publishable key (`sb_publishable_`) | `NEXT_PUBLIC_` allowed | Client — **safe only because RLS is on and correct** (§4) |
| Supabase secret key (`sb_secret_`) | **never** `NEXT_PUBLIC_` | Server Actions and Route Handlers only |
| Plaid `client_id` / `secret` | **never** `NEXT_PUBLIC_` | Server only |
| LLM provider key | **never** `NEXT_PUBLIC_` | Server only |

*(Supabase's newer key format — `sb_publishable_` / `sb_secret_` — supersedes the older anon / service_role naming. Same boundary, new names.)*

⬜ **Rotate on any suspicion.** Keys are cheap to rotate and expensive to leak. A key that has ever appeared in a screenshot, a paste, or a log is burned — rotate it, don't reason about whether it was seen.

---

## §3 Plaid token handling

The `access_token` is the crown jewel (§1). Rules, from Plaid's own security guidance:

1. ✅ **Server-side only, always.** It must never reach the browser, `localStorage`, a client component, an analytics event, or a crash report.
2. ✅ **`public_token` is single-use and disposable.** Link returns it; exchange it server-side immediately; discard it. Never persist it.
3. ⬜ **Encrypt at rest, at the application layer.** Store the `access_token` in **Supabase Vault** (`vault.secrets`, AEAD-encrypted with a per-project root key held outside SQL), not as a plaintext column. *Note: `pgsodium` is pending deprecation — use Vault, which is self-contained and does not depend on it.*
4. ✅ **Never logged, in whole or in part.** See §6.
5. ⬜ **Revocation is a first-class action.** There must be a way to remove an Item and invalidate its token, not just delete the row locally.

**Why this is stricter than "it's only my own data":** a leaked token is not a snapshot, it is a subscription. That distinction is what justifies the encryption work at n=1.

---

## §4 Tenancy is a security boundary

Restating `architecture.md` §5 as **law** — this file is the authority:

- ✅ **RLS is enabled on every table in the `public` schema.** A table without RLS is readable by anyone holding the publishable key, which is by design a public value.
- ✅ **Policies key on `auth.uid()`.** Never on a user id supplied by the client, ever, under any framing.
- ✅ **An unscoped query is a security bug, not a style issue.** It is fixed with the priority of a vulnerability, not a cleanup task.
- ⬜ **RLS policies are tested by impersonation** — verify as `anon`, as `authenticated`, and as a different user. An untested policy is an assumption.
- ⬜ **The secret key bypasses RLS.** Every use of it is a deliberate, reviewed exception with a comment saying why RLS could not do the job. If that comment is hard to write, use the publishable key path instead.

**Being single-user does not exempt anything here.** RLS from day one is `foundation.md` §7 #10, and its whole value is that it is already correct when the second user arrives.

---

## §5 The LLM boundary — the domain-specific rule

This is the control most particular to this product, and it exists because of `foundation.md` §7 #11: the budget was deliberately broken to buy a **no-training guarantee**. That guarantee is worth only as much as the discipline behind it.

**Rules:**

1. ✅ **A paid tier with a contractual no-training commitment is mandatory.** Free tiers that may train on submitted prompts are prohibited for any prompt containing account data — this is a security control, not a cost preference.
2. ✅ **The LLM receives `Insight` objects and prose context — never raw account rows, never tokens.** Enforced structurally: `lib/llm/` cannot import `db/` or `aggregator/` (`architecture.md` §4).
3. ⬜ **Minimize what crosses.** Send the narrowest context that answers the question. The less identifying data crosses the boundary, the less any provider-side incident can cost. *(Open: `architecture.md` §9 — structured objects vs redacted summary.)*
4. ✅ **Never send:** access tokens, keys, account numbers, full transaction dumps, or anything from §6's never-log list.

**The framing that makes this stick:** the model provider is a third party. Every field sent to it has left your control. Treat the prompt as an outbound data transfer, because it is one.

---

## §6 Logging

Per OWASP guidance, the following are **never** written to logs, error messages, traces, analytics, or crash reports — in full, truncated, or hashed-but-guessable form:

| Never log | Instead |
|---|---|
| Plaid `access_token`, `public_token`, `link_token` | The Item id, or nothing |
| Supabase keys, LLM provider keys | Nothing. Ever |
| Account numbers | Last four, rest masked |
| Balances, holdings, contribution amounts | The account id and the operation — not the values |
| Session identifiers | A hash, or first-six-with-rest-redacted, only if genuinely needed for correlation |

⬜ **Log the actor, the record id, the access type — not the contents.** That is enough to debug and to audit, and it keeps the log itself from becoming a second copy of the crown jewels.

✅ **Error messages shown to the user carry no internal detail.** Context-prefixed messages go to the log; the user gets something safe and useful.

---

## §7 Data minimization and retention

- ⬜ **Don't store what you don't use.** Plaid returns more than this product needs; persist the fields the insight engine actually consumes (`foundation.md` §5) and drop the rest at the adapter boundary.
- ⬜ **Deletion means deletion.** Removing an account revokes the Plaid Item and deletes its rows — not a soft-delete flag that quietly retains financial history.
- ✅ **Insights are never persisted** (`foundation.md` §5). Beyond staleness, this means derived financial conclusions are not sitting in a second table waiting to leak.

---

## §8 What this file does not protect against

Stated honestly, so nobody mistakes this for more than it is (`foundation.md` §5 principle: honest gaps beat confident guesses).

- **A compromised developer machine.** Env files live on it. Full stop.
- **A Vercel, Supabase, Plaid, or LLM-provider breach.** Third-party risk is accepted, not mitigated, at this scale.
- **No monitoring or alerting.** Nothing detects anomalous access — there is no pipeline to host it on (`architecture.md` §8) and a solo project on free tiers cannot staff a response. Accepted for a single-user tool; **must be revisited before anyone else's data is held.**
- **No formal compliance posture.** See §1.

---

## References

Checked **2026-09-01**. Security guidance moves; re-check before acting on it.

| Source | Used for |
|---|---|
| [Plaid — Security best practices](https://plaid.com/core-exchange/docs/security/) | Tokens server-side only; `public_token` is disposable (§3) |
| [Plaid token storage best practices](https://www.fintegrationfs.com/post/plaid-token-storage-best-practices-us-compliance) | Application-layer encryption for stored tokens (§3) |
| [Supabase Vault](https://supabase.com/blog/supabase-vault) · [pgsodium deprecation notice](https://supabase.com/docs/guides/database/extensions/pgsodium) | Vault as the storage boundary; AEAD; pgsodium pending deprecation (§3) |
| [Supabase security best practices, 2026](https://supaexplorer.com/guides/supabase-security-best-practices) | RLS on every public table; `auth.uid()`; impersonation testing (§4) |
| [Supabase service-role key guidance](https://securie.ai/guides/supabase-service-role-key) | Secret key never `NEXT_PUBLIC_`; every use a reviewed exception (§2, §4) |
| [OWASP — Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) · [OWASP Top 10 2025 A09](https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures/) | The never-log list; log actor/id/access-type not contents (§6) |
