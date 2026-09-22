# 0007 Plan formula library, rationale

Decision record for [`index.md`](index.md). `/develop` skips this file.

## Context

The employer match is FINBUDDY's highest value feature (foundation §5, §6 F3 and F8): tell the user, in dollars, whether they are capturing their full employer 401k match. It is the same "explain a thing I own in my dollars" loop as the rest of the product, applied to the one case foundation treats as uniquely worth stating as a dollar figure (§7 #2, §7 #2a): the employer's own money, already offered, going unclaimed.

Computing that needs two halves. The employee half is what the user contributes, now persisted as contribution events (spec 0006). The employer half is the plan's match formula: what the employer adds for a given employee contribution. Foundation §11 established that the formula is not available from any API, so it comes by inference, recognition, or one remembered number (§7 #12), never a document lookup. That recognition step needs a small library of common formula shapes to show the user, and the whole feature needs the formula as computable data, not the free text that `PlanFacts.matchFormula` holds today.

Two forces shape this slice. First, purity: the match math must be exactly right (a wrong dollar figure costs the trust the product runs on, §7 #13), and the cheapest place to get it right is a pure, total, exhaustively tested library with no I/O, mirroring `lib/insights/`. Second, honesty: foundation §7 #12 seeds the catalog with the user's own employer plan (the Northwind Retirement Savings Plan) as entry #1, but its real formula is unverified against any plan document (the build graph names this a soft dependency). A seeded number that looks authoritative but is a guess would be exactly the kind of asserted inference §7 #13 and §7 #16 forbid.

## Options considered

### Option 1: Free text formula plus a parser

Keep `PlanFacts.matchFormula` as the human string and write a parser that turns "100% up to 3%, then 50% up to 5%" into a computation at read time.

**Pros**
- No new type; the stored shape does not change.
- The catalog is just strings.

**Cons**
- A natural language parser for money rules is a bug farm: every phrasing variation ("dollar for dollar", "50 cents on the dollar", "first 3%") is a new case, and a misparse silently produces a wrong dollar figure, the one error the product cannot afford (§7 #13).
- The computation is not testable in isolation from the parser; the two failure modes tangle.

### Option 2: Tiered percentage of pay model plus pure compute (chosen)

Model the formula as an ordered list of tiers `{ matchRateBps, uptoContributionBps }` and compute over it with pure functions. Seed a tiny catalog of typed shapes.

**Pros**
- The three common shapes (simple, tiered, flat cap) are all expressible with the same small structure; the terminal tier is the cap, so no special case.
- The computation is a pure, total function of integers, exhaustively testable with worked dollar examples, no parser and no I/O.
- The catalog carries typed formulas the recognition step can show and F3 can compute against directly.

**Cons**
- A new type to define, and `PlanFacts` will eventually need wiring to it (deferred to F3).
- Percentage of pay tiers do not express annual dollar caps or the IRS 402(g) limit (deferred; noted).

### Option 3: A full plan model now (dollar caps, 402(g), vesting, true up)

Model everything a real plan can carry up front.

**Pros**
- Nothing to add later; any plan is expressible.

**Cons**
- Most of it is not needed by the three shapes this slice must cover, and much of it (the 402(g) limit, true up timing, eligibility, vesting) is F3's temporal and situational concern applied at compute time, not a property of the employer formula.
- More surface, more to test, more to get wrong, for a v1 whose only consumer is a match check that needs the percentage shapes.

## Rationale

Option 2, because the two forces in Context point the same way. Purity and exactness argue against Option 1's parser: a tiered integer model is a pure total function whose every case is a worked example, so the money math can be proven right before F3 trusts it, while a free text parser hides misparses that surface as wrong dollars. Scope discipline argues against Option 3: the formula shapes foundation actually names (§7 #12: the Northwind plan plus the two most common shapes) are all percentage of pay tiers, and the extras (dollar caps, 402(g), vesting, true up) are either genuinely F3's compute time and temporal concerns (§5) or not yet needed, so pulling them in now buys surface and risk for no current consumer. The tiered model expresses a flat cap as one tier and a tiered match as several, so the terminal tier is the cap with no special case, which keeps the compute small.

On where the code lives, the locked module rule decides it, not preference: `architecture.md` §7 says a calculation lives in `lib/insights/` "always" ("if a number is computed anywhere other than `lib/insights/`, that is the bug"), while a known employer match formula lives in `lib/plans/`, which §4 defines as "static data plus pure lookups". So this slice splits along that line: the formula types, the seeded catalog, and field reads (the last tier's ceiling) are static data and lookups in `lib/plans/`, while the match arithmetic (functions that multiply money and round) is a calculation and lives in a `match` module in `lib/insights/`, importing the types. This is the same rule that keeps the whole match differential in `lib/insights/` where the test discipline is non negotiable (`code-standards.md` §8); the match dollar math is the highest consequence calculation and belongs there, not in a data module.

On the honesty tension, the engineer chose to seed the Northwind entry with a provisional formula flagged `verified: false` and a note, over leaving it a numberless placeholder. That honors §7 #12 (the plan is entry #1 and the recognition step has something concrete to show) while keeping the guess contained: the flag and note mark it as unconfirmed, and the downstream duty to surface it as a question and never a claim lives in §7 #13 and §7 #16, which F3 and F8 enforce. The library's own duty is narrower and it meets it: compute figures only, never assert, and never hide the unverified flag.

## The real data tension

The build graph flags the plan formula library as softly dependent on the Northwind plan facts being verified against plan documents, which has not happened (the user's manual observation, spec 0001 task 9, is deferred, and so is any plan document check). This slice proceeds with a provisional, flagged Northwind formula for a deliberate reason: the library is pure math over a formula it is given, and it makes no claim about which formula is real. The seeded Northwind numbers are marked unverified; the recognition and confirmation flow (§7 #12 tier 2, §7 #13) is where a real number gets locked in, either by the user recognizing their formula or by tier 1 inference from their own paired deposits. Building the math now and confirming the specific numbers later is the safe split, the same split used for the contribution filter in spec 0006.

## References

Grounded in the project's own context: `foundation.md` §5 (the match differential and its cases), §6 (F3 the match check, F8 the walkthrough), §7 #2 and #2a (the advice line and the exact allowed dollar consequence line), §7 #12 (plan facts by inference, recognition, one number; the seeded catalog with the Northwind plan as entry #1), §7 #13 (inference surfaced as a question, never asserted), §7 #16 (never infer a negative from missing data, LOCKED), §11 (the formula is not available from any API); `architecture.md` §4 and §7 (the module boundaries: a calculation in `lib/insights/`, static data plus pure lookups in `lib/plans/`); `code-standards.md` §3 and §8 (the same calculation rule and the non negotiable test discipline for `lib/insights/`); spec 0002 (the `lib/insights/` purity and units precedent this mirrors); spec 0006 (the contribution events that are the employee half of the same math).
