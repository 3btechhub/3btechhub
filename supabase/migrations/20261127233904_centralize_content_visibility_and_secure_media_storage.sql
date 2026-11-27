create or replace function public.replace_content_visibility(p_entity_type text,p_entity_id uuid,p_role_ids uuid[],p_region_ids uuid[])
returns void language plpgsql security invoker set search_path='' as $$
begin
 if not private.has_permission('content.visibility','Update') then raise exception 'Not authorized to change content visibility.';end if;
 if not private.validate_entity_reference(p_entity_type,p_entity_id) then raise exception 'Content record does not exist.';end if;
 delete from public.content_role_visibility where entity_type=p_entity_type and entity_id=p_entity_id;
 delete from public.content_region_visibility where entity_type=p_entity_type and entity_id=p_entity_id;
 insert into public.content_role_visibility(entity_type,entity_id,role_id) select p_entity_type,p_entity_id,x from unnest(coalesce(p_role_ids,'{}'::uuid[])) x;
 insert into public.content_region_visibility(entity_type,entity_id,region_id) select p_entity_type,p_entity_id,x from unnest(coalesce(p_region_ids,'{}'::uuid[])) x;
end$$;
grant execute on function public.replace_content_visibility(text,uuid,uuid[],uuid[]) to authenticated;
revoke execute on function public.replace_content_visibility(text,uuid,uuid[],uuid[]) from public,anon;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('media','media',false,10485760,array['image/jpeg','image/png','image/webp','image/svg+xml','application/pdf']) on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/svg+xml','application/pdf'];
create policy media_objects_read on storage.objects for select to anon,authenticated using(bucket_id='media' and exists(select 1 from public.media m where m.file_path=storage.objects.name and private.can_view_content('media',m.id)));
drop policy if exists media_objects_insert on storage.objects;drop policy if exists media_objects_update on storage.objects;drop policy if exists media_objects_delete on storage.objects;