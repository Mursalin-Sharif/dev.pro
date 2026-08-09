-- Promote one Supabase Auth user to admin (run in SQL Editor).
-- Replace the email with your admin account.

update public.profiles
set role = 'admin'
where email = 'you@example.com';

-- Optional: confirm
-- select id, email, role from public.profiles order by created_at;
