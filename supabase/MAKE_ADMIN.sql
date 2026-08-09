-- ============================================================================
-- Hopeland — ONE file to fix admin access
-- Supabase → SQL Editor → paste this whole file → Run
-- ============================================================================

-- 1) Profiles table (safe if it already exists)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin', 'superadmin')),
  created_at timestamptz not null default now()
);

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin', 'superadmin'));

alter table public.profiles alter column role set default 'user';
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_superadmin_all" on public.profiles;
create policy "profiles_superadmin_all"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'superadmin'
    )
  );

-- 2) Auto-create profile for every new Auth user (role = user)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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

-- 3) Called by the app after login: ensure profile + bootstrap admin
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
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select email into my_email from auth.users where id = uid;

  insert into public.profiles (id, email, role)
  values (uid, coalesce(my_email, ''), 'user')
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email);

  -- Your admin email (change if needed)
  if my_email is not null
     and lower(my_email) = lower('mursalinsharif00@gmail.com') then
    update public.profiles set role = 'admin' where id = uid;
  end if;

  -- If no admin exists yet, first successful login becomes admin
  select count(*) into admin_count
  from public.profiles
  where role in ('admin', 'superadmin');

  if admin_count = 0 then
    update public.profiles set role = 'admin' where id = uid;
  end if;

  select role into my_role from public.profiles where id = uid;
  return my_role;
end;
$$;

grant execute on function public.sync_admin_access() to authenticated;
grant usage on schema public to anon, authenticated;
grant select on table public.profiles to anon, authenticated;

-- Public user profile sync (never promotes to admin)
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
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select email into my_email from auth.users where id = uid;

  insert into public.profiles (id, email, role)
  values (uid, coalesce(my_email, ''), 'user')
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email);

  select role into my_role from public.profiles where id = uid;
  return my_role;
end;
$$;

grant execute on function public.ensure_my_profile() to authenticated;

-- 4) Backfill profiles for every existing Auth user
insert into public.profiles (id, email, role)
select id, coalesce(email, ''), 'user'
from auth.users
on conflict (id) do update
set email = coalesce(excluded.email, public.profiles.email);

-- 5) Force-promote your admin account now
update public.profiles
set role = 'admin'
where id in (
  select id from auth.users
  where lower(email) = lower('mursalinsharif00@gmail.com')
);

-- 6) Result — you should see role = admin
select u.email, p.role, p.id
from auth.users u
join public.profiles p on p.id = u.id
where lower(u.email) = lower('mursalinsharif00@gmail.com');
