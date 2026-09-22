# 0001. Plaid read spike — decision record

> The reasoning behind [`index.md`](index.md). Build steps do not read this file; it is here for a human, and for `/architect` if the decision is ever revisited.

## Context

> ⚠️ Premise note: this slice mixes two kinds of work that deserve different care, and calling all of it a "spike" hides that. The project scaffold, the secrets handling, the `.gitignore`, and the aggregator boundary are **permanent** and will outlive this slice. The display page, the capture dump, and the transaction table are **disposable** and exist only to be read once. Treating the whole thing as throwaway risks a sloppy foundation; treating all of it as permanent risks polishing a page that gets deleted next week. The build plan below marks which is which, and the split should be respected rather than averaged.

The product's core loop reads a holding and explains it in the user's own money. Its highest value single feature works out whether the user is capturing their full employer match. Both depend on data arriving from an aggregator, and the depth of that data varies by institution in ways nobody controls.

One depth question is already answered by direct observation. an account aggregator displays the Northwind Retirement Savings Plan with a balance and a transaction history, and says plainly that it does not have investment holdings for the account. So the employer plan is known to be holdings blind through at least one aggregator, and the product is already shaped around that (`foundation.md` §11, §7 #15).

What is not known is whether Plaid does better or worse, whether the retail brokerage returns holdings at all, and, most importantly, what the employer plan's transaction rows actually look like. The match detection method assumes it can see an employee deferral and an employer match as two rows on the same date and take the ratio between them (`foundation.md` §5). If contributions instead arrive as one merged line, that method does not work as designed and the fallback path has to change.

The forces that shape this slice are: the build graph names this exact uncertainty as its one genuine sequencing tension, because the insight engine is pure and buildable immediately but its test fixtures are guesses until real responses are seen; the builder is solo at five to fifteen hours a week, so a slice that grows costs weeks not days; and financial data is involved, so anything captured has to be handled carefully even though the only person's data at stake is the builder's own.

**Compliance scope: none is triggered.** There is one user, who is the builder, and no other data subject. No customer data is processed. `security.md` §1 already records that this project is engineering practice rather than a compliance program, and that the picture must be reviewed by someone qualified before anyone else's data is held. That remains true and unchanged by this slice.

**Assumed prerequisites, all deliberate and all recorded.** No authentication, no database, and no domain type mapping exist yet. Each is intentionally out of this slice rather than an oversight, and each is recorded in `foundation.md` and `build-graph.md`. The one consequence worth stating explicitly: with no authentication, this slice must never be deployed to a public URL.

## Options considered

### Option 1: Next.js app with Plaid Link, in memory token, capture to disk

Scaffold the real application, put Plaid behind the aggregator interface it will keep, run Link in the browser, hold the token in server memory only, and write captures to disk.

**Pros**:
- The permanent parts (scaffold, secrets handling, aggregator boundary) are built once and kept, so this slice advances Layer 0 rather than only informing it.
- Plaid Link runs natively in a browser, which is its intended path and the least surprising to debug.
- The aggregator boundary is established before any Plaid specific code exists, which is when it is cheapest to get right.

**Cons**:
- Carries scaffold work that is not strictly needed to answer the questions, so the answer arrives later than the absolute minimum.
- Token in memory means relinking after every dev server restart, which is mildly annoying during a long session.

### Option 2: Plaid Hosted Link plus a standalone Node script

Use Plaid's hosted Link page to obtain a `public_token` without building any UI, then run a plain script that exchanges it and dumps the responses.

**Pros**:
- Fastest possible route to the answer. No framework, no page, no components.
- Nothing built is throwaway, because almost nothing is built.

**Cons**:
- Produces no reusable foundation. The scaffold, secrets handling, and aggregator boundary still have to be built afterwards, so total work is higher even though first answer is sooner.
- Reading a long transaction history for pairing patterns out of raw terminal JSON is genuinely hard, and pairing is the single most important thing this slice must observe.
- The token handling and capture discipline get written twice, once throwaway and once properly, which is where mistakes hide.

### Option 3: Build it properly with Supabase and auth from the start

Pull build graph items 0.2 and 0.4 forward, persist accounts and captures in Postgres with row level security, and store the token in Supabase Vault as designed.

**Pros**:
- Matches the eventual architecture exactly, with no rework and no temporary token path.
- Captures survive restarts and accumulate over time, which helps when a match arrives only annually.

**Cons**:
- Roughly doubles the slice, which at ten hours a week means the central uncertainty stays open for weeks longer.
- Designs the schema before the real data shapes are known, which is precisely the mistake this slice exists to prevent.

## Rationale

The deciding force is the sequencing tension named in `build-graph.md`: the insight engine is the highest value code in the project and the easiest to test, but every fixture it is tested against is an assumption until real responses are seen. This project has already had one such assumption proved wrong, when the employer plan turned out to return no holdings. Spending one slice converting the remaining assumptions into observations is cheap insurance against building a well tested engine on a fiction.

Option 3 fails on the same logic it is trying to serve. Designing a schema before the data shapes are known is the exact error being avoided, and at ten hours a week the extra scope keeps the central question open for weeks.

Option 2 is genuinely tempting and was close. It loses on two specific points. First, the most important observation in this slice is whether contribution deposits are paired, which means scanning a long transaction list for a repeating pattern; a plain table makes that readable in seconds and raw terminal JSON makes it a chore, and a chore performed once at the end of a session is where an observation gets missed. Second, the token handling and capture discipline are security sensitive and would have to be written twice, throwaway then properly, and the throwaway version is exactly where a credential ends up somewhere it should not.

On the token specifically: server memory was chosen over a local file because the inconvenience it trades against is small (relinking takes seconds) while the risk it removes is not (a long lived credential sitting in plaintext on disk, in a directory that also holds captures). `security.md` §3 treats a leaked access token as standing read access rather than a one time snapshot, and that framing makes the convenience trade an easy call.

