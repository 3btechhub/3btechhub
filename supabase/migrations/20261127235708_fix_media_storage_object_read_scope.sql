drop policy if exists media_objects_read on storage.objects;
create policy media_objects_read on storage.objects for select to anon,authenticated
using (
 bucket_id='media'
 and exists(
  select 1 from public.media m
  where m.file_path=storage.objects.name
    and private.can_view_content('media',m.id)
 )
);