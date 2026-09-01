# 0001. Plaid read spike: observe real account data before building the insight engine

**Date**: 2026-09-01
**Status**: In Progress

## Summary

This slice links two real investment accounts through Plaid and looks at exactly what comes back. It exists to answer three questions with evidence instead of assumption: does SoFi return the list of things you own, does the FedEx retirement plan return anything beyond a balance, and are employer and employee contributions two separate deposits or one merged line. The last one matters most, because the whole match detection design rests on it. Nothing is stored in a database, nothing is styled, and most of the display code is meant to be thrown away.

## Requirements

**User stories**

- As the builder, I want to see exactly what Plaid returns for my own two accounts, so that the insight engine is written against real data shapes instead of guesses.
- As the builder, I want to know per account and per product whether data came back, came back empty, or failed, so that a later empty screen is never mistaken for a real zero.
- As the builder, I want my raw financial data to stay off the internet and out of version control, so that a spike does not become a permanent leak.

**Acceptance criteria**

- **AC-1**: A Plaid Link flow completes against the Production environment and returns a usable connection. The `public_token` is exchanged server side and then discarded. The `access_token` never appears in the browser, in any log, or on disk.
- **AC-2**: For every linked Item, the holdings call and the investment transactions call are each attempted once (both endpoints return all of an Item's accounts together, so they are not called per account), and each result is recorded as exactly one outcome per account: returned data, succeeded but empty, not ready yet, or failed with a Plaid error code. Empty, not ready, and failed are never merged.
- **AC-3**: A capability record exists and is readable for the FedEx Corporation Retirement Savings Plan II connection, stating its outcome for holdings and for investment transactions.
- **AC-4**: A capability record exists and is readable for the SoFi connection, stating in particular whether holdings returned data.
- **AC-5**: Investment transactions for the employer plan are displayed as a plain table with date, amount, description, and type, ordered by date, so that deposit pairing and cadence can be read by eye.
- **AC-6**: Raw responses are written to a gitignored capture directory. A committed fixture is generated from each capture by **synthetic substitution, never by literal copying**: dates shifted by one random offset per capture (preserving weekday and cadence), amounts scaled by one random factor per capture (preserving the ratio between paired deposits), and every identifier, institution name, security name, and ticker replaced outright. The fixture preserves the *patterns* the engine must be tested against and carries no real value.
- **AC-9**: An automated check compares every leaf value in a generated fixture against the raw capture it came from and fails if any real number or string survives. A fixture that fails this check is never committed.
- **AC-10**: A `PRODUCT_NOT_READY` style response (Plaid populates investments data asynchronously after a link) is retried with backoff and, if still unavailable, recorded as `not_ready` rather than as an error or as empty.
- **AC-7**: No secret and no account value reaches application logs. Values are shown in the browser on localhost only.
- **AC-8**: A `.gitignore` covering the environment file and the capture directory is committed **before** the first Plaid call is made, so no capture can ever be added by an untargeted commit.

## Decision

**Chosen option**: Option 1: Next.js app with Plaid Link, in memory token, capture to disk.

Build the real scaffold and the aggregator boundary, run Plaid Link in the browser against Production, keep the access token in server memory only, and write raw captures to a gitignored directory with redacted copies committed as future engine fixtures.

## Rationale

Reasoning, the problem context, and the options weighed: see [`rationale.md`](rationale.md).
Verification steps: see [`verify.md`](verify.md).

## Feature design

**Data model sketch**

No database in this slice, so this describes in memory and on disk shapes rather than tables.

| Shape | Fields | Notes |
|---|---|---|
| `PlaidConnection` | `itemId` (string, required), `accessToken` (string, required), `institutionName` (string, required), `linkedAt` (timestamp) | Server memory only, anchored on `globalThis` so a dev mode hot reload does not silently drop it (the same reason database clients are pinned there in Next.js). Never serialised, never logged. Lost on a real restart by design |
| `ProductOutcome` | `status`: one of `data` \| `empty` \| `not_ready` \| `error`; `errorCode` (string, optional); `recordCount` (integer, optional); `attempts` (integer) | The four way classification. `empty`, `not_ready`, and `error` must stay distinct. `not_ready` exists because Plaid populates investments data asynchronously, and treating that race as an error would answer this slice's whole question wrongly |
| `AccountCapability` | `accountId` (string, required), `accountName` (string), `accountType` (string), `holdings` (`ProductOutcome`), `investmentTransactions` (`ProductOutcome`), `observedAt` (timestamp) | One per account. The primary output of the slice |
| Capture file | Raw provider response, unmodified | Written to `captures/`, gitignored, never committed |
| Fixture file | Same structure, values replaced | Written to `fixtures/`, committed. Becomes the engine's test input later |

Money the application computes or displays uses integer minor units (`code-standards.md` §2). This does **not** apply to the raw capture, which is stored exactly as the provider sent it (Plaid encodes money as JSON floats on the wire) because AC-6 requires it unmodified. Conversion to minor units happens when a value is read into application code, not before.

**State transitions**

`unlinked` → `linking` (Link open in browser) → `linked` (token in server memory) → `fetching` → `fetched` (capability records produced). A `fetching` state may loop on backoff while Plaid finishes populating investments data (AC-10).

A real dev server restart returns every connection to `unlinked`. That is expected behaviour, not a fault, and the page should say so rather than erroring. A **hot reload is not a restart** and must not drop the connection, which is why the store is anchored on `globalThis`. Losing a token to a stray file save costs a Production Item to recover, and there are only ten.

**API surface**

Server Actions, not HTTP route handlers. `architecture.md` §2 reserves route handlers for external callers and webhooks, and this slice has neither.

| Action | Kind | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `createLinkToken` | Server Action | none | `link_token` (string) | none, local only | Plaid credential failure, network failure |
| `exchangePublicToken` | Server Action | `publicToken` (string, required) | `itemId`, institution name | none, local only | invalid or already used token |
| `fetchAccountData` | Server Action | `itemId` (string, required) | `AccountCapability[]`, holdings payload, transactions payload | none, local only | item requires reauthentication, product not supported, rate limit |

**Key invariants**

1. The `access_token` exists only in server memory. It is never returned from a Server Action, never rendered, never logged, never written to disk.
2. The `public_token` is used exactly once and then dropped.
3. Every product call produces exactly one `ProductOutcome`. There is no fifth state and no null.
4. `empty`, `not_ready`, and `error` are never collapsed into one another, at any layer, for any reason.
4a. No fixture is committed until the AC-9 leak check passes against its raw capture.
5. Every string containing `plaid` outside `lib/aggregator/plaid/` is a boundary violation (`foundation.md` §7 #8).
6. `.gitignore` covers the environment file and the capture directory before any Plaid call is ever made.

**Security model**

Who can read what: one user, on localhost, with no authentication layer. This is only acceptable because the slice is never deployed. Deployment of this slice to any public URL is prohibited, and that constraint should be repeated in the progress log entry so it is not forgotten when later slices do gain auth.

`security.md` is the authority for everything in this section and wins on any disagreement. Applied here:

- Secrets live in environment variables only. No Plaid value carries a `NEXT_PUBLIC_` prefix. This slice needs no client readable keys at all, since Supabase is not present, which makes the rule easy to hold.
- The access token is treated as standing read access to financial accounts, not as a snapshot (`security.md` §3), which is why it stays in memory.
- Nothing sensitive is logged: no token, no balance, no holding, no contribution amount (`security.md` §6). Values reach the browser on localhost and stop there.
- Only the investments products are requested. Identity and banking transactions are deliberately not requested, per data minimisation (`security.md` §7).
- Captures are gitignored, with a pattern robust to nested paths, so a write from an unexpected working directory is still ignored.
- Committed fixtures are **synthetically generated, not redacted copies**. Copying a real value and blanking some fields around it is the failure mode named in Consequences: it looks safe and is not. Every date is shifted, every amount scaled, every name and identifier replaced, and AC-9 proves it before anything is committed.

**Configuration required**

- `PLAID_CLIENT_ID`: the Plaid client identifier. Server side only.
- `PLAID_SECRET`: the Plaid secret for the Production environment. Server side only.
- `PLAID_ENV`: `sandbox` while the pipeline is being built, `production` for the observation runs. Named explicitly so which environment a run used is never ambiguous.
- `PLAID_REDIRECT_URI`: required if either institution routes through Plaid's OAuth flow, which SoFi and Vanguard likely do. The URI must be registered in the Plaid dashboard before the first Production link attempt, and OAuth flows can behave differently over local `http` than over `https`.

A `.env.example` with empty values is committed. The real `.env.local` is gitignored and never committed. **Prerequisites before the Production runs:** a Plaid account exists, Production access is available under the free Trial (confirm whether it is granted instantly or has approval lead time), and any OAuth redirect URI is registered in the dashboard. The builder creates the account and fills in these values themselves.

**Critical test scenarios**

- Happy path: Link completes for the SoFi account, holdings and investment transactions both return data, and two capability records render. Verifies **AC-1**, **AC-2**, **AC-4**.
- Expected empty: the FedEx plan returns a successful but empty holdings response, and it is displayed as "returned nothing" rather than as an error or a zero. Verifies **AC-2**, **AC-3**.
- Failure case: a product call fails with a Plaid error code, and the code is surfaced verbatim rather than being swallowed or shown as empty. Verifies **AC-2**.
- Not ready race: an investments call returns a not ready style response immediately after linking, is retried with backoff, and is recorded as `not_ready` rather than as an error or as empty. Verifies **AC-10**.
- OAuth institution: linking an institution that routes through Plaid's OAuth flow completes and returns to the app, rather than dead ending at an unregistered redirect. Verifies **AC-1**.
- Fixture leak check: a generated fixture is compared against its raw capture and the check fails loudly if any real value survives. Verifies **AC-9**.
- Restart behaviour: after a real dev server restart the page reports the connection is gone and offers to relink, rather than throwing. After a hot reload it does **not** lose the connection. Verifies **AC-1**.
- Leak check: application logs contain no token and no account value after a full run. Verifies **AC-7**.

## Build plan

Ordered as a Tracer Bullet, since no build approach was on record and end to end slices are the sensible default. Task 5 is the thin thread through every layer; everything after thickens it.

**Build status (2026-09-01).** Tasks 1 to 8 built and verified against Plaid **Sandbox**: typecheck, build, and lint pass; the exchange, fetch, four way classification, capture, and leak check all ran end to end on real sandbox responses; the leak check was independently confirmed to let zero real values through. Tasks 9 to 11 (the observation run against the real FedEx and SoFi accounts, and writing up the findings) remain, and are the engineer's to run.

**The environment split matters.** Tasks 1 to 8 run against Plaid **Sandbox**, which is free and unlimited. Only task 9 switches to **Production**. The observation still needs real accounts (Sandbox data would answer nothing), but debugging the wiring against Production would burn Items from an allocation of ten with no budget for more. Build the pipeline on free data; spend the real Items on a pipeline that already works.

**Permanent** marks work that outlives the slice. **Disposable** marks work meant to be deleted (see the premise note).

1. **Permanent.** Initialise git. Write and commit `.gitignore` covering `.env.local`, `**/captures/`, and `node_modules/`, **before any credential or capture exists**. The nested pattern matters in case anything writes from an unexpected working directory. Satisfies **AC-8**.
2. **Permanent.** Scaffold Next.js with the App Router and strict TypeScript, in the layout from `architecture.md` §3. Commit `.env.example` with empty Plaid variables. Record installed versions in `library-docs.md` in the same session. Satisfies **AC-8**.
3. **Permanent.** Define the `Aggregator` interface and the `ProductOutcome` and `AccountCapability` shapes in `lib/aggregator/`. No Plaid types leak past this boundary. Satisfies **AC-2**.
4. **Permanent.** Implement `createLinkToken` and `exchangePublicToken` as Server Actions inside `lib/aggregator/plaid/`, requesting the investments products only. Anchor the connection store on `globalThis` so a hot reload does not drop it. Satisfies **AC-1**.
5. **Thin end to end thread, against Sandbox.** A page with a Link button that completes one Sandbox connection and prints the returned account list. Nothing else. Satisfies **AC-1**.
6. **Permanent, against Sandbox.** Fetch holdings and investment transactions per Item, retry with backoff on a not ready response, then classify each result into one of the four outcomes and build the `AccountCapability` records. Satisfies **AC-2**, **AC-10**.
7. **Disposable.** Render the results: JSON blocks for holdings and capability records, and a plain table for investment transactions with date, amount, description, and type, ordered by date. No styling. Satisfies **AC-5**.
8. **Permanent discipline, disposable output.** Write raw responses to `captures/`. Generate fixtures by synthetic substitution (shift dates by one random offset, scale amounts by one random factor, replace every name and identifier), then run the leak check that diffs fixture leaves against the capture and refuses to pass if a real value survives. Satisfies **AC-6**, **AC-9**.
9. **The observation run. Switch `PLAID_ENV` to `production`.** Register the OAuth redirect URI first if either institution needs it. Link the SoFi account and the FedEx Corporation Retirement Savings Plan II, once each, and capture. Read the transaction table for deposit pairing and cadence. Satisfies **AC-3**, **AC-4**.
10. **Permanent.** Confirm no token and no account value appears in application logs across a full run. Satisfies **AC-7**.
11. **Permanent.** Record the findings: resolve `foundation.md` §12 Q4 and Q4b with what was observed, and add the progress log entry. Makes the output of **AC-3** and **AC-4** durable.

## Consequences

**Positive**

- The insight engine's fixtures come from observed responses instead of assumptions, which removes the sequencing tension named in `build-graph.md` and protects the project's most correctness sensitive code.
- Two open questions in `foundation.md` §12 close with evidence.
- Layer 0 advances genuinely: scaffold, secrets handling, and the aggregator boundary are all permanent and all built once.
- The aggregator boundary is set before any provider specific code exists, which is the cheapest possible moment to establish it.
- Building against Sandbox first means the scarce Production Items are spent on a pipeline that already works, rather than on debugging.

**Negative and tradeoffs**

- Relinking after every dev server restart is a real irritation across a long session, and it is the direct price of keeping the token off disk.
- Some of this slice is thrown away. The display page and the capture wiring exist to be read once and deleted.
- Answering the question later than the absolute minimum. A hosted Link plus script route would have produced a first answer sooner.
- **The answer may be bad, and there is no fallback in scope.** If the FedEx plan returns no usable transaction detail, the match feature loses its data source, and `foundation.md` §7 #4 has already removed manual entry as a path. That is a real exposure this slice surfaces rather than solves.
- Production Items are consumed from a free allocation of ten, and there is no budget for more. The Sandbox first split and the `globalThis` anchored store both exist to protect that allocation, but a careless relink still costs one.
- The synthetic fixture generator is real work, and more than a redaction pass would have been. It is the price of committing fixtures at all; the alternative was committing nothing and hand writing them later from memory.
- Sandbox data will not match Production shapes exactly, so a small amount of task 6 may need adjusting once real responses arrive.

**Neutral**

- Domain types are deliberately not defined here. Build graph item 0.3 comes after this slice, so it can be written against real shapes.
- The redaction step is new work with no prior pattern in the repo, and it needs care: a partial redaction is worse than none, because it looks safe.
- The `PLAID_ENV` variable is set explicitly rather than defaulted, so a sandbox run is visible at a glance.

## Follow-up

- [ ] If the FedEx plan returns no usable transaction detail, reopen `foundation.md` §7 #4 (no manual entry). The decision was made when the match feature was assumed to have a data source, and that assumption would no longer hold.
- [ ] Record the installed package versions in `library-docs.md` during the build, not afterwards. Every entry is currently marked as unpinned on purpose.
- [ ] Confirm the free Trial applies to this Plaid account before relying on ten Production Items. Fall back to Limited Production and its 200 call cap if it does not.
- [ ] Re check whether the FedEx plan's holdings become available later. The Credit Karma message said "check back later", which reads like a pending state rather than a refusal.
- [ ] Decide where the fixture generator and its leak check eventually live. Both are written here as spike support, and both are genuinely useful for any future fixture work.
- [ ] If `not_ready` turns out to be common rather than transient, revisit whether this product needs webhook handling sooner than `architecture.md` §2 assumes.
