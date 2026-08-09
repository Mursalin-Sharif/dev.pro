-- =============================================================================
-- ADMIN_AUTH_FIX.sql — stop admin "logout" loop (profiles RLS recursion)
-- Safe to re-run.
-- =============================================================================

-- Non-recursive role helpers (security definer bypasses RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'superadmin')
  );
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'superadmin'
  );
$$;

-- Replace recursive superadmin policy
drop policy if exists "profiles_superadmin_all" on public.profiles;
create policy "profiles_superadmin_all"
  on public.profiles for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create or replace function public.ensure_my_profile()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  my_email text;
  my_role text;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select email into my_email from auth.users where id = uid;
  insert into public.profiles (id, email, role)
  values (uid, coalesce(my_email, ''), 'user')
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email);
  select role into my_role from public.profiles where id = uid;
  return my_role;
end;
$$;

create or replace function public.sync_admin_access()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  my_email text;
  my_role text;
  admin_count int;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select email into my_email from auth.users where id = uid;
  insert into public.profiles (id, email, role)
  values (uid, coalesce(my_email, ''), 'user')
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email);

  if my_email is not null and lower(my_email) = lower('mursalinsharif00@gmail.com') then
    update public.profiles set role = 'admin' where id = uid;
  end if;

  select count(*) into admin_count from public.profiles where role in ('admin', 'superadmin');
  if admin_count = 0 then
    update public.profiles set role = 'admin' where id = uid;
  end if;

  select role into my_role from public.profiles where id = uid;
  return my_role;
end;
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_superadmin() to anon, authenticated;
grant execute on function public.ensure_my_profile() to authenticated;
grant execute on function public.sync_admin_access() to authenticated;

notify pgrst, 'reload schema';
notify pgrst, 'reload config';
