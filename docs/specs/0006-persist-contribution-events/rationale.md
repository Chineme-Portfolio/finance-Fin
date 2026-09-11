# 0006 Persist contribution events, rationale

Decision record for [`index.md`](index.md). `/develop` skips this file.

## Context

The match feature is FINBUDDY's headline: work out whether the user is getting their full employer 401k match, and if not, what to do about it (foundation §5, the match differential). That feature reasons over dated contribution deposits: the money paid into the retirement account over time, employee side and employer side. Right now none of that is persisted. Spec 0005 stood up the write path, but it saves accounts, holdings, and the token only. The aggregator already fetches a 24 month window of investment transactions on every link (spec 0001), and the `contribution_events` table and the `ContributionEvent` domain type have existed since spec 0004, defined and empty, explicitly as groundwork. The gap is the wiring: turn the fetched transactions into `contribution_events` rows.

Three forces shape how: the deposits must be stored as raw facts, not inferences, because deciding employee vs employer is exactly the high consequence judgment the match engine exists to make and must never be a stored guess (foundation §7 #7 insights never stored, §7 #16 LOCKED never store a negative or absence inference); the provider transaction semantics must stay behind the aggregator seam (foundation §7 #8); and the real 401k contribution shape has never been observed, because the user's manual Plaid observation (spec 0001 task 9) is still deferred, so any filter written now is against sandbox shapes and is provisional.

## The classification question (the crux)

A `contribution_events` row has a `source`: `deferral` (employee), `match` (employer), or `unknown`. The tempting move is to classify at persist time, from the transaction description or amount, and store the label. That is the wrong move here, and it is not a close call: classifying a deposit as an employer match IS the match detection, the product's single highest consequence inference (foundation §7 #16 calls the naive version the most damaging possible error). Storing it would freeze a guess into the database, mix an inference into what should be raw truth, and mean a re migration every time the classifier improves. The domain type's own author already wrote the answer into `lib/types/domain.ts`: `source = 'unknown'` is "the honest default until real data shows what deferral vs match actually looks like." So this slice stores `'unknown'` for every row and leaves all classification to the pure engine that reads them later.

## Options considered

### Option 1: Classify at persist time, store `deferral` / `match`

Read each transaction's description and amount, decide employee vs employer, store the label.

**Pros**
- The rows arrive pre labelled, so a later reader does no work.

**Cons**
- Stores the product's highest consequence inference as if it were a fact (foundation §7 #7, §7 #16), the exact error the match design exists to avoid.
- Freezes a guess: improving the classifier later means re migrating every stored row.
- Does the classification with no real data to validate it against (spec 0001 task 9 deferred), so the stored labels would be guesses on guesses.

### Option 2: Store raw with `source = 'unknown'`, classify in the engine later (chosen)

Persist the deposit facts (date, amount, currency, description) with `source = 'unknown'`. The match engine classifies at read time when it runs.

**Pros**
- Nothing stored is an inference; the table holds raw truth only (foundation §7 #7).
- The classifier can change freely; no stored labels to migrate.
- Matches the domain type's documented intent and the locked foundation constraints.

**Cons**
- A reader must classify every time it runs (cheap: pure function over a bounded window).
- The rows are less immediately meaningful on their own (acceptable: they are engine input, not a user surface).

### Option 3: Persist every transaction, filter in the engine

Store all observed transactions, let the engine pick out contributions.

**Pros**
- No filter decision to make now; nothing is lost.

**Cons**
- Stores buys, sells, dividends, and fees that are not contributions and that no feature reads (violates minimization, `security.md` §7).
- Bloats the table and blurs its meaning; `contribution_events` should hold contributions.

## Rationale

Option 2, because the strongest force in Context is the locked pair §7 #7 and §7 #16: the match judgment must never be stored as truth, and a deposit's `source` label IS that judgment. Option 1 fails this directly. Option 3 keeps the data raw but ignores minimization and turns a contributions table into a transactions dump. Option 2 stores exactly the raw contribution facts the engine needs and no inference, which is both the safe choice and the one the domain type was already designed for.

Storing only cash inflows (not every transaction) is the minimization side of the same call: the match feature reasons over money paid in, so that is what is kept, selected by the provider's own transaction type and subtype, which is an observed provider fact, not our inference. The account scope (any account whose transactions capability returned data, not just the 401k) is forward looking at no cost: an IRA's contributions may matter to a later reader, and the engine decides per account type what to do, so there is no reason to drop them at persist time.

The mapper lives in the Plaid adapter because deciding which provider type and subtype is a contribution is provider knowledge; putting it there keeps `lib/sync` and `lib/db` ignorant of Plaid shapes (foundation §7 #8), the same seam spec 0005 was careful to hold.

## The real data tension

The build graph flags this honestly: the match differential should be modelled on real 401k transaction shapes, but those are unobserved because spec 0001 task 9 is deferred. This slice proceeds anyway, on sandbox shapes, for a deliberate reason: `contribution_events` is groundwork, and nothing user facing asserts a match or its absence from it yet. The contribution filter written here is provisional; the deterministic proof of the mapping is a unit test over fixture transactions, not the sandbox (which may return few or no true contributions). When the real data is seen, the filter and the eventual classifier are revisited (a Follow up) before the match differential makes any claim to the user. Building the persistence now, and the classifier later against real data, is the safe split.

## References

Grounded in the project's own specs and context: spec 0004 (the `contribution_events` table and RLS), spec 0005 (the write path and the replace logic this extends), spec 0001 (the aggregator's transaction fetch and the deferred real observation), `foundation.md` §5 (the match differential), §7 #7 (insights never stored), §7 #16 (never store a negative inference, LOCKED), §7 #8 (the provider seam), and `security.md` §7 (minimization).
