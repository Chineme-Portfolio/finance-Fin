-- 0003_functions.sql — spec 0004. Server-side RPC functions for Vault token
-- storage and atomic item deletion. All are `security definer` (they touch the
-- vault schema). Each takes the acting user id and resolves it as
-- coalesce(auth.uid(), p_user_id): under a real session auth.uid() wins and the
-- parameter is ignored; under the deferred-auth path (secret key, auth.uid() is
-- null) the trusted server passes the dev user id. This is the one bridge that
-- makes the same functions work now and after real auth lands, without a footgun
-- (only the trusted server holds the secret key that can pass an arbitrary id).

-- Store a Plaid access token as a Vault secret; return its id (security.md §3).
create or replace function store_token(p_token text, p_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  return vault.create_secret(p_token, p_name, 'plaid access token');
end;
$$;

-- Read a token back from Vault by id. Server-only path; never exposed to clients.
create or replace function read_token(p_secret_id uuid)
returns text
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v text;
begin
  select decrypted_secret into v from vault.decrypted_secrets where id = p_secret_id;
  return v;
end;
$$;

-- Delete an item, its accounts and holdings (via cascade), and its Vault secret,
-- in one transaction, scoped to the acting user (spec 0004 AC-8). Deletes the
-- LOCAL token only; revoking at Plaid is a Follow-up.
create or replace function delete_item(p_item_id uuid, p_user_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  -- Not a privilege footgun: p_user_id is only honored when auth.uid() is null,
  -- which happens only on the deferred-auth path where the caller already holds
  -- the service role (full admin, RLS bypassed) and could delete any row anyway.
  -- Once real auth lands, auth.uid() is set and always wins, so an authenticated
  -- caller cannot pass someone else's id to reach their item.
  v_user uuid := coalesce(auth.uid(), p_user_id);
  v_secret_id uuid;
begin
  if v_user is null then
    raise exception 'delete_item: no acting user';
  end if;

  select token_secret_id into v_secret_id
  from plaid_items where id = p_item_id and user_id = v_user;

  if v_secret_id is null then
    return; -- not found for this user, or already gone
  end if;

  delete from plaid_items where id = p_item_id and user_id = v_user;
  delete from vault.secrets where id = v_secret_id;
end;
$$;

-- The deferred-auth path calls these with the secret key (the service role).
-- When real auth lands, the authenticated role calls them and auth.uid() governs.
revoke all on function store_token(text, text) from public;
revoke all on function read_token(uuid) from public;
revoke all on function delete_item(uuid, uuid) from public;
grant execute on function store_token(text, text) to service_role, authenticated;
grant execute on function read_token(uuid) to service_role;
grant execute on function delete_item(uuid, uuid) to service_role, authenticated;
