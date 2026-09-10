-- 0001_init.sql — spec 0004 persistence layer.
-- The domain schema (foundation.md §5). Money is bigint integer minor units
-- (cents); share quantity is numeric (not money); rates are integer basis points.
-- Every table carries user_id (RLS key, added with policies in 0002_rls.sql).
-- There is NO insights table: insights are computed, never stored (foundation §5, §7 #7).
-- gen_random_uuid() is core Postgres (>= PG13) on Supabase; no extension needed.

create extension if not exists supabase_vault;

-- Closed domain unions as Postgres enums, so the DB rejects an off-list value.
create type account_type as enum (
  '401k', 'roth_ira', 'traditional_ira', 'taxable_brokerage', 'hsa', 'other'
);
create type security_type as enum (
  'mutual fund', 'etf', 'equity', 'fixed income', 'cash', 'cryptocurrency', 'derivative', 'other'
);
create type contribution_source as enum ('deferral', 'match', 'unknown');
create type capability as enum ('balance', 'holdings', 'transactions');

-- A linked Plaid Item. The access token itself lives in Vault; this row holds
-- only the Vault secret's id (security.md §3). No plaintext token column.
create table plaid_items (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null,
  plaid_item_id    text not null,
  institution_name text,
  token_secret_id  uuid not null,
  linked_at        timestamptz not null default now(),
  unique (user_id, plaid_item_id)
);

create table accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null,
  item_id          uuid not null references plaid_items(id) on delete cascade,
  plaid_account_id text not null,
  name             text not null,
  type             account_type not null,
  subtype          text,
  balance_minor    bigint,                       -- integer minor units; null when no balance
  currency         text,
  capabilities     capability[] not null default '{}',
  unique (user_id, plaid_account_id)
);

create table holdings (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null,
  account_id         uuid not null references accounts(id) on delete cascade,
  security_id        text not null,
  security_name      text not null,
  ticker             text,
  security_type      security_type not null,
  is_cash_equivalent boolean not null default false,
  quantity           numeric not null,           -- a count of shares, NOT money (may be fractional)
  value_minor        bigint not null,            -- integer minor units
  cost_basis_minor   bigint,                     -- integer minor units; null when none
  currency           text
);

-- Defined now, populated when the match feature lands (foundation §5). Not
-- written by this slice; do not delete as unused.
create table contribution_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null,
  account_id   uuid not null references accounts(id) on delete cascade,
  date         date not null,
  amount_minor bigint not null,
  currency     text,
  source       contribution_source not null default 'unknown',
  raw_name     text not null
);

create table plan_facts (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null,
  account_id            uuid not null references accounts(id) on delete cascade,
  employer              text,
  match_formula         text,
  contribution_rate_bps integer,                 -- integer basis points
  gross_pay_minor       bigint,                  -- integer minor units
  unique (user_id, account_id)
);

-- Tenancy + join/cascade indexes.
create index plaid_items_user_id_idx        on plaid_items (user_id);
create index accounts_user_id_idx           on accounts (user_id);
create index accounts_item_id_idx           on accounts (item_id);
create index holdings_user_id_idx           on holdings (user_id);
create index holdings_account_id_idx        on holdings (account_id);
create index contribution_events_user_id_idx on contribution_events (user_id);
create index contribution_events_account_id_idx on contribution_events (account_id);
create index plan_facts_user_id_idx         on plan_facts (user_id);
create index plan_facts_account_id_idx      on plan_facts (account_id);
