create or replace function private.guard_owner_role_permissions()
returns trigger language plpgsql set search_path=''
as $$
declare v_owner_role uuid;
begin
 select id into v_owner_role from public.roles where name='Owner';
 if old.role_id=v_owner_role and current_setting('app.permission_catalog_delete',true)<>'on' then
  raise exception 'The permanent Owner permission grants cannot be removed or changed.';
 end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end $$;