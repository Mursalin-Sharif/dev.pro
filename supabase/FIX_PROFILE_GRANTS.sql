-- Run once if admin row exists but the app still rejects login.
grant usage on schema public to anon, authenticated;
grant select on table public.profiles to anon, authenticated;
grant execute on function public.sync_admin_access() to authenticated;
