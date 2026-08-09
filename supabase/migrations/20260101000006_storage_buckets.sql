-- Public read buckets for admin-uploaded media. Uploads are restricted to
-- authenticated admins; anyone can view the resulting public URLs (needed
-- since videos/sponsors/blog media are shown on the public site).

insert into storage.buckets (id, name, public)
values
  ('videos', 'videos', true),
  ('sponsor-logos', 'sponsor-logos', true),
  ('blog-covers', 'blog-covers', true)
on conflict (id) do nothing;

create policy "media_public_read"
  on storage.objects for select
  using (bucket_id in ('videos', 'sponsor-logos', 'blog-covers'));

create policy "media_admin_write"
  on storage.objects for insert
  with check (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers')
    and public.is_admin()
  );

create policy "media_admin_update"
  on storage.objects for update
  using (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers')
    and public.is_admin()
  );

create policy "media_admin_delete"
  on storage.objects for delete
  using (
    bucket_id in ('videos', 'sponsor-logos', 'blog-covers')
    and public.is_admin()
  );
