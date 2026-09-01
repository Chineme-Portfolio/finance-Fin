# Verify: plaid-read-spike · spec 0001 · updated 2026-09-01

_Steps derived from spec 0001 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

**Scope note.** Tasks 1 to 8 run against Plaid **Sandbox**. AC-3 and AC-4 need the real FedEx and SoFi accounts and belong to task 9, which the engineer runs. Do not spend Production Items proving the pipeline.

## Commands

- [x] `npx tsc --noEmit` → exits 0, no errors → AC-8
- [x] `npx next build` → compiles successfully → AC-8
- [x] `npx eslint app lib` → exits 0 → AC-8
- [x] `git check-ignore -v .env.local` → reported as ignored by `.gitignore` → AC-8
- [x] `mkdir -p captures && touch captures/probe.json && git status --porcelain --ignored | grep captures` → shows `!!` (ignored), then delete the probe → AC-6, AC-8
- [x] `grep -rn "plaid" app lib --include=*.ts --include=*.tsx` → every hit is inside `lib/aggregator/plaid/`, except the single composition root import in `lib/aggregator/index.ts` → boundary invariant, foundation.md §7 #8
- [x] `grep -rn "NEXT_PUBLIC" app lib .env.example` → no Plaid variable carries the prefix → AC-1, security.md §2
- [x] `git log --oneline -- .gitignore` → the ignore rules were committed before any capture existed → AC-8

## UI / manual

Requires Plaid **Sandbox** credentials in `.env.local` (copy `.env.example`).

- [x] `npm run dev`, open `localhost:3000` → header reads `Plaid environment: sandbox` → AC-1
- [ ] Click *1. Get link token*, then *2. Open Link* → Plaid Link opens → AC-1
- [ ] Complete the Sandbox flow against an institution that supports investments → status reads `Linked. Item ...` → AC-1
- [x] Click *Fetch holdings and investment transactions* → a capability row renders per account, each reading `data` / `EMPTY` / `NOT READY` / `ERROR`, never a blank and never a bare `0` → AC-2, foundation.md §4 #7
- [x] The transactions table shows date, amount, name, type, subtype, ordered by date → AC-5
- [x] `ls captures/` → raw JSON present. `ls fixtures/` → fixture present. Page reports `Leak check PASSED` → AC-6, AC-9
- [x] Open a generated fixture → no real date, amount, account id, employer name, or ticker survives; enums such as `buy` and `USD` do → AC-9
- [x] `git status --short` → `captures/` does not appear, `fixtures/` does → AC-6, AC-8
- [x] Save any source file to trigger a hot reload → the connection survives, no relink needed → AC-1 (the `globalThis` anchor)
- [ ] Stop and restart the dev server → the page reports no live connections and does not throw → AC-1
- [x] Scan the dev server output → no access token, no balance, no contribution amount appears → AC-7

## Opportunistic

- [ ] If an investments call returns a not ready response, confirm it is retried with backoff and lands as `NOT READY`, never as `ERROR` or `EMPTY` → AC-10. Sandbox rarely reproduces this race; watch for it during the Production run instead.

## Acceptance-criteria coverage

- **AC-1** link, exchange, token never client side → covered by the Link steps, the restart step, and the `NEXT_PUBLIC` grep
- **AC-2** four outcome classification → covered by the capability table step
- **AC-3** FedEx capability record → **task 9 only**, real account required (pipeline proven in sandbox: an `investment/401k` account returned holdings and transactions as `data`, all non-investment accounts as `EMPTY`)
- **AC-4** SoFi capability record → **task 9 only**, real account required (pipeline proven in sandbox)
- **AC-5** transaction table readable for pairing → covered by the transactions table step
- **AC-6** raw gitignored, fixture committed → covered by the `ls` and `git status` steps
- **AC-7** nothing sensitive logged → covered by the dev server output scan
- **AC-8** gitignore committed first → covered by the `git check-ignore` and `git log` steps
- **AC-9** fixture leak check → covered by the fixture inspection step, and already proven directly against a synthetic payload during the build
- **AC-10** not ready is distinguishable → code path built; the sandbox race did not occur (data returned on attempt 1), so watch for it during the Production run
