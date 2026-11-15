-- Safe, atomic deletion for metadata-driven Content Modules only.
-- Deleting a module removes its own items and relation edges, while preserving
-- all records in other modules and removing only relation-field definitions
-- that point to the deleted module.

alter table public.content_items
  drop constraint if exists content_items_module_id_fkey;

alter table public.content_items
  add constraint content_items_module_id_fkey
  foreign key (module_id) references public.modules(id) on delete cascade;

create or replace function public.delete_content_module(p_module_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private, auth
as $function$
declare
  v_module public.modules%rowtype;
  v_item_count bigint := 0;
  v_relation_count bigint := 0;
  v_relation_field_count bigint := 0;
begin
  if auth.uid() is null or not private.is_site_admin() then
    raise exception 'Not authorized to delete Content Modules' using errcode = '42501';
  end if;

  select * into v_module from public.modules where id = p_module_id for update;
  if not found then
    raise exception 'Content Module not found' using errcode = 'P0002';
  end if;
  if v_module.is_system then
    raise exception 'System modules cannot be deleted' using errcode = '55000';
  end if;

  select count(*) into v_item_count from public.content_items where module_id = p_module_id;
  select count(*) into v_relation_count
  from public.relations r
  where r.item_a_id in (select id from public.content_items where module_id = p_module_id)
     or r.item_b_id in (select id from public.content_items where module_id = p_module_id);

  delete from public.module_fields f
  where f.module_id <> p_module_id
    and f.field_type = 'relation'
    and f.settings ->> 'target_module_id' = p_module_id::text;
  get diagnostics v_relation_field_count = row_count;

  update public."Settings" s
  set setting_value = case
    when s.setting_key = 'home_modules' then
      jsonb_set(
        coalesce(s.setting_value, '{}'::jsonb),
        '{modules}',
        coalesce((
          select jsonb_agg(entry)
          from jsonb_array_elements(
            case when jsonb_typeof(s.setting_value -> 'modules') = 'array'
              then s.setting_value -> 'modules'
              else '[]'::jsonb
            end
          ) as entry
          where entry ->> 'key' <> v_module.module_key
        ), '[]'::jsonb),
        true
      )
    when s.setting_key = 'module_slugs' then coalesce(s.setting_value, '{}'::jsonb) - v_module.module_key
    else s.setting_value
  end,
  updated_at = now()
  where s.setting_key in ('home_modules', 'module_slugs');

  delete from public.modules where id = p_module_id;

  return jsonb_build_object(
    'deleted_module_id', p_module_id,
    'deleted_module_key', v_module.module_key,
    'deleted_content_items', v_item_count,
    'deleted_relations', v_relation_count,
    'removed_relation_fields', v_relation_field_count
  );
end;
$function$;

revoke all on function public.delete_content_module(uuid) from public, anon;
grant execute on function public.delete_content_module(uuid) to authenticated;
