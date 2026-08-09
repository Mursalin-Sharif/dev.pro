-- ============================================================================
-- Hopeland — run this ONE file in Supabase SQL Editor (Run once)
-- Fixes: profiles, roles, admin bootstrap, player registration access
-- ============================================================================

-- 1) Profiles
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

drop policy if exists "profiles_superadmin_all" on public.profiles;
create policy "profiles_superadmin_all"
  on public.profiles for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

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

-- 2) Player can read own championship registration
drop policy if exists "registrations_select_own" on public.registrations;
create policy "registrations_select_own"
  on public.registrations for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create or replace function public.get_my_registration()
returns setof public.registrations
language sql
security definer
set search_path = public
stable
as $$
  select *
  from public.registrations
  where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  order by created_at desc
  limit 1;
$$;

-- 3) Grants
grant usage on schema public to anon, authenticated;
grant select on table public.profiles to anon, authenticated;
grant select on table public.registrations to authenticated;
grant execute on function public.ensure_my_profile() to authenticated;
grant execute on function public.sync_admin_access() to authenticated;
grant execute on function public.get_my_registration() to authenticated;

-- 4) Backfill profiles for existing Auth users
insert into public.profiles (id, email, role)
select id, coalesce(email, ''), 'user'
from auth.users
on conflict (id) do update
set email = coalesce(excluded.email, public.profiles.email);

-- 5) Promote your admin
update public.profiles
set role = 'admin'
where id in (
  select id from auth.users where lower(email) = lower('mursalinsharif00@gmail.com')
);

-- 6) Media storage buckets (admin video / sponsor / blog uploads)
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('videos', 'videos', true, 5242880),
  ('sponsor-logos', 'sponsor-logos', true, 5242880),
  ('blog-covers', 'blog-covers', true, 5242880)
on conflict (id) do update set public = excluded.public;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  using (bucket_id in ('videos', 'sponsor-logos', 'blog-covers'));

drop policy if exists "media_admin_write" on storage.objects;
create policy "media_admin_write"
  on storage.objects for insert
  with check (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers')
    and public.is_admin()
  );

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update"
  on storage.objects for update
  using (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers')
    and public.is_admin()
  );

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete"
  on storage.objects for delete
  using (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers')
    and public.is_admin()
  );

-- 7) Verify (registrations rows appear only after real Stripe payment success)
select 'profiles' as kind, email, role::text as info from public.profiles
union all
select 'registration', email, status from public.registrations
order by 1, 2;
