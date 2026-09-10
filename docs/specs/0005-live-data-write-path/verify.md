# Verify: live data write path · spec 0005 · updated 2026-09-10

_Steps derived from spec 0005 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones. The Plaid sandbox and the live Supabase project (`vnvfjxlojjjxhluoqyzc`) are the targets; `.env.local` holds the keys. Clean up any rows and Vault secrets the check creates._

## UI / manual

- [ ] Visit `/` with no account linked → the "No account linked yet" empty state shows, with a link to the link page. No blank, no crash, no fixture data. → AC-4
- [ ] On `/dev/plaid-spike` (sandbox), click "Link a sandbox investments account" → the item appears in the list. Visit `/` → real persisted accounts and holdings render (an allocation bar and holding rows), not the committed fixture. → AC-1, AC-3
- [ ] If a linked account returns no holdings (a real gap), its card shows the balance only "Balance only" state, driven by real capabilities (no demo strip). → AC-3
- [ ] Click "Refresh (re fetch and re persist)" on the linked item → the screen still renders its holdings (the re fetch used the token read back from Vault). → AC-5
- [ ] Click "Unlink" → `/` returns to the empty state. → AC-9

## Commands / database

- [ ] After a link, query the live DB: `plaid_items`, `accounts`, and `holdings` rows exist for the item (scoped to `DEV_USER_ID`), and exactly one matching `vault.secrets` row. → AC-1, AC-5
- [ ] Click "Refresh" twice → no duplicate `plaid_items` or `accounts` rows and no unique constraint error (the replace path deletes then re inserts). → AC-6
- [ ] After "Unlink", query the DB: the item's `plaid_items` / `accounts` / `holdings` rows and its `vault.secrets` row are all gone. → AC-9
- [ ] Confirm no transactions were written to any domain table and `contribution_events` is empty. → AC-7
- [ ] `npx tsc --noEmit` clean, `npx eslint` clean for the slice, `npx vitest run` green (the `lib/db` round trip still passes), `npx next build` succeeds. Proves the seam refactor compiles and nothing references the deleted `connection-store`. → AC-2
- [ ] Force a failure inside `lib/sync` (e.g. an invalid item) and confirm the returned action result and any server log carry only an item id or a message, never the access token. → AC-2

## Acceptance-criteria coverage

- AC-1 covered by the link UI step and the DB rows query.
- AC-2 covered by the build/typecheck step and the token containment step.
- AC-3 covered by the live render step and the balance only step.
- AC-4 covered by the empty state step.
- AC-5 covered by the refresh step and the DB rows query.
- AC-6 covered by the refresh twice step.
- AC-7 covered by the no transactions / empty contribution_events step.
- AC-8 covered structurally: `lib/sync` composes the aggregator and `lib/db`; neither imports the other (grep the imports). Verified by the build plus a read of the import graph.
- AC-9 covered by the link then refresh then unlink sequence and the DB emptiness check after unlink.
