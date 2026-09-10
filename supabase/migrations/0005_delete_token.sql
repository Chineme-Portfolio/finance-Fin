-- 0005_delete_token.sql — spec 0004. A service-role-only function to remove a
-- Vault secret by id. Needed so saveLinkedItem can clean up an orphaned token if
-- the item insert fails after the token was stored (partial-save cleanup). Same
-- lockdown as the other token functions (security.md §3): server-only.
create or replace function delete_token(p_secret_id uuid)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
begin
  delete from vault.secrets where id = p_secret_id;
end;
$$;

revoke execute on function delete_token(uuid) from public, anon, authenticated;
grant execute on function delete_token(uuid) to service_role;
