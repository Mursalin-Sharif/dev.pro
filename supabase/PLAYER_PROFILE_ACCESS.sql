-- Run once in Supabase → SQL Editor → Run
-- Lets a logged-in player load their championship registration on /account.

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

grant execute on function public.get_my_registration() to authenticated;
