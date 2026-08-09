-- Separate regular users from admins.
-- New auth users get role = 'user'. Only 'admin' / 'superadmin' pass is_admin().

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin', 'superadmin'));

alter table public.profiles alter column role set default 'user';

-- Existing auto-granted admins become regular users. Promote yourself afterward:
--   update public.profiles set role = 'admin' where email = 'you@example.com';
update public.profiles
set role = 'user'
where role in ('admin', 'superadmin');

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

drop function if exists public.handle_new_admin_user();

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
