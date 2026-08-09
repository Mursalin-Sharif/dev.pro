-- Safe profile sync for public users (never promotes to admin).

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
