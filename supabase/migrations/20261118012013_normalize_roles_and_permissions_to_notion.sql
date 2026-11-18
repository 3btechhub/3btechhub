-- Normalize the permission model to the two permission types defined in Notion.
create or replace function private.protect_owner_permissions()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin
  if exists(select 1 from public."Roles" where id=old.role_id and slug='owner') then
    if tg_op='DELETE' then raise exception 'Owner permissions cannot be removed'; end if;
    if new.role_id is distinct from old.role_id or new.permission_id is distinct from old.permission_id then raise exception 'Owner permissions cannot be reassigned'; end if;
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$function$;
delete from public.role_permissions where role_id in (select id from public."Roles" where slug<>'owner');
delete from public.user_permissions;
delete from public.permissions;
alter table public.permissions drop constraint if exists permissions_action_check;
alter table public.permissions add constraint permissions_action_check check (action = any(array['read'::text,'write'::text]));
insert into public.permissions(name,permission_key,description,resource,action,is_active)
values
 ('Read','read','Read website information and records','website','read',true),
 ('Write','write','Create, update and delete website information and records','website','write',true);
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public."Roles" r cross join public.permissions p
where (r.slug in ('owner','admin') and p.permission_key in ('read','write'))
   or (r.slug in ('member','visitor') and p.permission_key='read')
on conflict do nothing;
delete from public."Roles" where slug='legacy-role-review';
insert into public."Settings"(setting_key,setting_value,visibility_roles,description)
values ('runtime_config',
 jsonb_build_object(
  'schema_version',1,'palette','white','size','medium','direction','ltr',
  'theme_presets',jsonb_build_object(
   'classic',jsonb_build_object('light',jsonb_build_object('palette','white','size','medium'),'dark',jsonb_build_object('palette','white','size','medium')),
   'modern',jsonb_build_object('light',jsonb_build_object('palette','white','size','medium'),'dark',jsonb_build_object('palette','white','size','medium')),
   'future',jsonb_build_object('light',jsonb_build_object('palette','white','size','medium'),'dark',jsonb_build_object('palette','white','size','medium'))
  )
 ),array['owner']::text[],'Notion theme preference presets')
on conflict(setting_key) do nothing;
