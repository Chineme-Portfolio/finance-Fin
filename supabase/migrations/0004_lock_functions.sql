-- 0004_lock_functions.sql — spec 0004. Lock the token/delete functions to the
-- service role only. lib/db is server-only and calls them with the secret key
-- (service_role); the client never calls them. Supabase grants anon/authenticated
-- execute directly (not via PUBLIC), so revoke from those roles explicitly, or the
-- crown-jewel read_token would be reachable at /rest/v1/rpc/ by a signed-in user
-- (security.md §3, caught by the Supabase security advisor after 0003).

revoke execute on function store_token(text, text) from public, anon, authenticated;
revoke execute on function read_token(uuid)         from public, anon, authenticated;
revoke execute on function delete_item(uuid, uuid)  from public, anon, authenticated;

grant execute on function store_token(text, text) to service_role;
grant execute on function read_token(uuid)         to service_role;
grant execute on function delete_item(uuid, uuid)  to service_role;
