create or replace function private.guard_owner_role_permissions()
returns trigger language plpgsql set search_path=''
as $$
declare v_owner_role uuid;
begin
 select id into v_owner_role from public.roles where name='Owner';
 if old.role_id=v_owner_role and current_setting('app.permission_catalog_delete',true)<>'on' then
  raise exception 'The permanent Owner permission grants cannot be removed or changed.';
 end if;
 return old;
end $$;
create trigger role_permissions_owner_guard before delete or update on public.role_permissions
for each row execute function private.guard_owner_role_permissions();

create or replace function private.grant_new_permission_to_owner()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
 insert into public.role_permissions(role_id,permission_id)
 select r.id,new.id from public.roles r where r.name='Owner'
 on conflict do nothing;
 return new;
end $$;
create trigger permissions_auto_grant_owner after insert on public.permissions
for each row execute function private.grant_new_permission_to_owner();

create or replace function private.remove_owner_grant_before_permission_delete()
returns trigger language plpgsql security definer set search_path=''
as $$
declare v_owner_role uuid;
begin
 select id into v_owner_role from public.roles where name='Owner';
 perform set_config('app.permission_catalog_delete','on',true);
 delete from public.role_permissions where role_id=v_owner_role and permission_id=old.id;
 perform set_config('app.permission_catalog_delete','off',true);
 return old;
end $$;
create trigger permissions_remove_owner_grant before delete on public.permissions
for each row execute function private.remove_owner_grant_before_permission_delete();

revoke execute on function private.guard_owner_role_permissions() from public,anon,authenticated;
revoke execute on function private.grant_new_permission_to_owner() from public,anon,authenticated;
revoke execute on function private.remove_owner_grant_before_permission_delete() from public,anon,authenticated;
