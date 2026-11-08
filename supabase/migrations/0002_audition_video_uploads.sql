-- Audition video uploads.
--
-- Run this BEFORE deploying the code that depends on it, otherwise audition
-- submissions with an uploaded video will fail against the old schema.
--
--   Supabase dashboard -> SQL Editor -> paste -> Run
--   (or: supabase db push, if the CLI is linked to this project)
--
-- Safe to re-run.

-- 1. New columns on auditions ------------------------------------------------
-- An audition now has an uploaded file (video_path) OR a link (video_link), or both.
alter table public.auditions add column if not exists video_path text;  -- object path in the 'auditions' bucket
alter table public.auditions add column if not exists video_name text;  -- original file name
alter table public.auditions add column if not exists video_size bigint; -- bytes

-- The link used to be the only way to submit a video; it is now optional.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'auditions'
      and column_name = 'video_link' and is_nullable = 'NO'
  ) then
    alter table public.auditions alter column video_link drop not null;
  end if;
end $$;

-- Every new audition must still include some video. NOT VALID = existing rows
-- are not re-checked, only new inserts/updates.
alter table public.auditions drop constraint if exists auditions_has_video;
alter table public.auditions
  add constraint auditions_has_video
  check (video_path is not null or nullif(video_link, '') is not null) not valid;

-- 2. Private storage bucket for the videos ----------------------------------
-- file_size_limit: 50 MB is the per-file maximum on Supabase's Free plan.
-- On Pro you can raise it (e.g. 524288000 = 500 MB) under Storage -> Settings,
-- then here, and in MAX_VIDEO_MB in src/components/Resources.tsx.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'auditions', 'auditions', false, 52428800,
  array['video/mp4','video/quicktime','video/webm','video/x-m4v','video/3gpp','video/x-msvideo','video/mpeg']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 3. Storage permissions ----------------------------------------------------
-- The public website can only UPLOAD new files: it cannot list, view,
-- overwrite or delete anything, so applicants never see each other's videos.
drop policy if exists "auditions_anon_upload" on storage.objects;
create policy "auditions_anon_upload" on storage.objects
  for insert to anon
  with check (bucket_id = 'auditions');

-- Signed-in admins can watch (via short-lived signed links) and delete videos.
drop policy if exists "auditions_admin_read" on storage.objects;
create policy "auditions_admin_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'auditions');

drop policy if exists "auditions_admin_delete" on storage.objects;
create policy "auditions_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'auditions');
