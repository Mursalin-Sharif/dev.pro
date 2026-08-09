-- App calls sync_admin_access() after login to ensure a profiles row exists
-- and to bootstrap the first admin / allowlisted admin email.

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

  if my_email is not null
     and lower(my_email) = lower('mursalinsharif00@gmail.com') then
    update public.profiles set role = 'admin' where id = uid;
  end if;

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
