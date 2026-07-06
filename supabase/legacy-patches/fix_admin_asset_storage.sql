-- Fix: allow any authenticated owner to manage campaign assets (not just their own folder).
-- The admin panel uploads assets under other owners' UUIDs, which the old
-- "(storage.foldername(name))[1] = auth.uid()" policy blocked.
-- Run this in Supabase SQL Editor.

drop policy if exists "Users can upload own campaign assets" on storage.objects;
create policy "Users can upload own campaign assets"
  on storage.objects for insert
  with check (
    bucket_id = 'campaign-assets'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

drop policy if exists "Users can update own campaign assets" on storage.objects;
create policy "Users can update own campaign assets"
  on storage.objects for update
  using (
    bucket_id = 'campaign-assets'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  )
  with check (
    bucket_id = 'campaign-assets'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );

drop policy if exists "Users can delete own campaign assets" on storage.objects;
create policy "Users can delete own campaign assets"
  on storage.objects for delete
  using (
    bucket_id = 'campaign-assets'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'owner'
    )
  );
