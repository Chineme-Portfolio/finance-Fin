-- 0002_rls.sql — spec 0004. Row-level security on every table (foundation §7 #10,
-- security.md §4). A row is visible/writable only when user_id = (select auth.uid()). Child
-- tables ALSO require the referenced parent account to belong to the same user:
-- Postgres foreign-key validation runs elevated and bypasses RLS on the parent, so
-- without this a user could reference another user's account by id.
--
-- Note: real auth is deferred (spec 0004). These policies are enabled and proven by
-- SQL impersonation now; the app is not yet gated by them at runtime (server code
-- uses the secret key with a fixed dev user id). The runtime gate arrives with auth.
--
-- Best practices applied (supabase-postgres-best-practices, security-rls-performance):
-- auth.uid() is wrapped as (select auth.uid()) so the planner evaluates it once per
-- query (an initPlan) instead of once per row; every policy targets `to authenticated`
-- so it is never evaluated for the anon role; user_id and account_id are indexed (0001).

alter table plaid_items         enable row level security;
alter table accounts            enable row level security;
alter table holdings            enable row level security;
alter table contribution_events enable row level security;
alter table plan_facts          enable row level security;

-- plaid_items: own rows only.
create policy plaid_items_select on plaid_items for select to authenticated using (user_id = (select auth.uid()));
create policy plaid_items_insert on plaid_items for insert to authenticated with check (user_id = (select auth.uid()));
create policy plaid_items_update on plaid_items for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy plaid_items_delete on plaid_items for delete to authenticated using (user_id = (select auth.uid()));

-- accounts: own rows only.
create policy accounts_select on accounts for select to authenticated using (user_id = (select auth.uid()));
create policy accounts_insert on accounts for insert to authenticated with check (user_id = (select auth.uid()));
create policy accounts_update on accounts for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy accounts_delete on accounts for delete to authenticated using (user_id = (select auth.uid()));

-- holdings: own rows AND the parent account must be the same user's.
create policy holdings_select on holdings for select to authenticated using (user_id = (select auth.uid()));
create policy holdings_insert on holdings for insert to authenticated with check (
  user_id = (select auth.uid())
  and exists (select 1 from accounts a where a.id = holdings.account_id and a.user_id = (select auth.uid()))
);
create policy holdings_update on holdings for update to authenticated using (user_id = (select auth.uid())) with check (
  user_id = (select auth.uid())
  and exists (select 1 from accounts a where a.id = holdings.account_id and a.user_id = (select auth.uid()))
);
create policy holdings_delete on holdings for delete to authenticated using (user_id = (select auth.uid()));

-- contribution_events: same parent-ownership rule.
create policy contribution_events_select on contribution_events for select to authenticated using (user_id = (select auth.uid()));
create policy contribution_events_insert on contribution_events for insert to authenticated with check (
  user_id = (select auth.uid())
  and exists (select 1 from accounts a where a.id = contribution_events.account_id and a.user_id = (select auth.uid()))
);
create policy contribution_events_update on contribution_events for update to authenticated using (user_id = (select auth.uid())) with check (
  user_id = (select auth.uid())
  and exists (select 1 from accounts a where a.id = contribution_events.account_id and a.user_id = (select auth.uid()))
);
create policy contribution_events_delete on contribution_events for delete to authenticated using (user_id = (select auth.uid()));

-- plan_facts: same parent-ownership rule.
create policy plan_facts_select on plan_facts for select to authenticated using (user_id = (select auth.uid()));
create policy plan_facts_insert on plan_facts for insert to authenticated with check (
  user_id = (select auth.uid())
  and exists (select 1 from accounts a where a.id = plan_facts.account_id and a.user_id = (select auth.uid()))
);
create policy plan_facts_update on plan_facts for update to authenticated using (user_id = (select auth.uid())) with check (
  user_id = (select auth.uid())
  and exists (select 1 from accounts a where a.id = plan_facts.account_id and a.user_id = (select auth.uid()))
);
create policy plan_facts_delete on plan_facts for delete to authenticated using (user_id = (select auth.uid()));
