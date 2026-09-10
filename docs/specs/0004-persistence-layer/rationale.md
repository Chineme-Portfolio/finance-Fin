# 0004. Persistence layer decision record

> The reasoning behind [`index.md`](index.md). Build steps do not read this file; it is here for a human, and for `/architect` if the decision is ever revisited.

## Context

Everything real the product does needs to hold state, and nothing does yet. The aggregator keeps linked connections and observations in memory (spec 0001), so a restart forgets them; the screen renders a committed fixture (spec 0003), not the user's data. To link a real account and have it persist, to store the Plaid token safely, and eventually to serve more than one person, the app needs a database. `foundation.md` §7 #6 already settled that database as Supabase Postgres, and §7 #10 already settled that tenancy (`user_id` plus row-level security) is built from the first migration, not retrofitted. So the stack question is closed; this slice is about doing it correctly.

Three forces shape it. First, the data is crown-jewel sensitive: `security.md` §1 rates the Plaid access token as critical (a leak is standing read access to a real account) and balances, holdings, and contribution history as high (they reveal a named person's finances, employer, and pay). So the token must be encrypted at rest and tenancy must be a real boundary, not a convention. Second, the builder is solo, at $0, and has just said to focus on functionality and data and defer UI, so a login screen now would be off-priority and a database that actually persists real data is exactly on-priority. Third, `foundation.md` §5 fixes the shape: the schema mirrors the domain model, insights are never stored, money is integer minor units.

The consequence of not building this now is that the app stays a fixture demo: it cannot remember a link, cannot safely hold a token, and cannot move toward live data or multiple users.

## The four design decisions

**Auth now, or defer the login.** Chosen: defer. RLS policies reference `auth.uid()`, which needs a login to be meaningful, but building a login is UI and session work the builder just deprioritized, and there is only one user. So the schema and RLS policies are written and impersonation-tested now (the expensive, foundational part), with a fixed development user id standing in for `auth.uid()` server-side. The tenancy structure is real and correct; the live gate arrives with auth, a clean follow-up. The honest cost, recorded in Consequences, is that RLS is not yet actually enforcing isolation against a real login, so this is not "multi-user ready" yet. Rejected: real auth now (drags in the login UI the builder set aside) and anonymous auth (a per-device session that is awkward to promote to a real account later).

**Where the database runs.** Chosen: a hosted Supabase free-tier project. Zero infra to set up (no Docker), the connected Supabase MCP can manage it, and the data actually persists so the builder can see it, which matches the stated wish to watch real functionality. The cost is the free tier pausing after about a week idle (a cold first request) and the project being a real remote. Rejected for now: the local CLI stack (cleaner and never-pausing, but needs Docker and is local-only) and running both (two environments, more overhead than a solo first pass warrants). The local stack is noted as a follow-up if pausing becomes friction.

**How far the slice goes.** Chosen: the foundation plus a round-trip proof, not the full write path. The slice builds the schema, RLS, the client, the Vault token storage, and the typed `lib/db/` access layer, and proves them by writing and reading back a token and an item/account/holding. It does not yet replace the aggregator's in-memory stores; wiring a real link end to end is a bigger change that reaches into the spike's link flow, and it is the next slice. This keeps the slice focused and reviewable while still proving the layer genuinely works, not just compiles.

**Token storage.** Chosen: Supabase Vault, as `security.md` §3 (the authority on data handling) directs. Each access token is stored as a Vault secret; the `plaid_items` row holds only the secret's id. A database dump then yields no usable token. The considered alternative, application-layer encryption in a `bytea` column, needs its own key-management story (where the encryption key lives, how it rotates); Vault handles the key internally with a per-project root key held outside SQL, which is simpler and is what the authority file already specifies. The one real cost is indirection: a token lives in Vault behind an id, so a delete has to revoke the secret as well as the row, or a dangling secret is left behind. The cascade delete accounts for that.

## Options considered

### Option 1: schema + RLS + client only, token in a plain column, no Vault, no proof

The minimum: tables, policies, a client, the token stored directly.

**Pros**:
- Least code; fastest to a database that exists.

**Cons**:
- A plaintext token column is exactly the crown-jewel leak `security.md` §3 forbids; a DB dump hands over live account access. Disqualifying.
- No round-trip proof means "it compiles" is mistaken for "it works."

### Option 2: full schema + RLS + Vault now, login deferred, round-trip proof, aggregator rewrite deferred (chosen)

The foundation done correctly, proven, with the two heaviest follow-on pieces (real auth, the write path) deliberately deferred.

**Pros**:
- Tenancy and token encryption correct from the first migration, the cheapest moment.
- Proven by round-trip and impersonation, not assumed.
- Focused and reviewable; matches the builder's data-first, defer-UI priority.

**Cons**:
- RLS is structurally present but not yet a live gate (fixed dev user id); not multi-user ready until auth lands.
- The aggregator still does not persist a real link after this slice.

### Option 3: everything at once (schema + RLS + Vault + real auth + full aggregator write path)

Build the whole persistent, authenticated, live-data system in one slice.

**Pros**:
- One slice yields a fully persistent, logged-in, live-data app.

**Cons**:
- Far too large for a solo 10-hour-week pass; auth UI, session wiring, the aggregator rewrite, and the schema all at once is unreviewable and error-prone.
- Front-loads the login UI the builder explicitly deprioritized.

## Rationale

Option 2 is chosen because it gets the two things that are expensive to retrofit, tenancy and token encryption, correct from the first migration, and proves them, while deferring the two things that are genuinely separable, a real login and the aggregator write path. Option 1 is disqualified by the plaintext token alone. Option 3 is the right destination but the wrong slice size for a solo build and it drags in the UI the builder set aside. The deferrals are honest and recorded: RLS is real structure but not yet a live gate, and a real link is not persisted until the next slice. That is the correct order for "perfect the system": lay the data foundation correctly, prove it, then wire real data and real auth onto a foundation already known to be sound.

## References

None. This slice rests on recorded project decisions (`foundation.md` §0, §5, §7 #1, §7 #6, §7 #7, §7 #10, §7 #15; `security.md` §1, §2, §3, §4, §7, §8; `architecture.md` §5, §8; `code-standards.md` §2, §5) and the Supabase guidance already captured and dated in `library-docs.md` and `security.md` References. No new external sources were needed.
