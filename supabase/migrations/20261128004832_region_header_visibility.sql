create or replace function private.can_view_content(p_entity_type text, p_entity_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_role text := private.effective_role_name();
  v_region uuid;
  v_region_slug text;
  v_role_ok boolean;
  v_region_rules boolean;
  v_region_ok boolean;
begin
  if v_role in ('Owner','Admin') then return true; end if;
  if not private.has_permission('content.' || p_entity_type, 'View') then return false; end if;
  select region_id into v_region from public.profiles where id = auth.uid() and status = 'active';
  if v_region is null then
    begin
      v_region_slug := lower(coalesce((nullif(current_setting('request.headers', true), '')::jsonb)->>'x-region-slug', 'global'));
    exception when others then v_region_slug := 'global';
    end;
    select id into v_region from public.regions where slug = v_region_slug limit 1;
  end if;
  select exists(select 1 from public.content_role_visibility v join public.roles r on r.id = v.role_id where v.entity_type = p_entity_type and v.entity_id = p_entity_id and r.name = v_role) into v_role_ok;
  if not v_role_ok then return false; end if;
  select exists(select 1 from public.content_region_visibility v where v.entity_type = p_entity_type and v.entity_id = p_entity_id) into v_region_rules;
  if not v_region_rules then return true; end if;
  select exists(select 1 from public.content_region_visibility v join public.regions g on g.id = v.region_id where v.entity_type = p_entity_type and v.entity_id = p_entity_id and (g.slug = 'global' or (v_region is not null and v.region_id = v_region))) into v_region_ok;
  return v_region_ok;
end
$function$;
