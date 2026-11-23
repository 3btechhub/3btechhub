-- Keep public read behavior while avoiding overlapping permissive SELECT policies.
drop policy if exists "permissions_manage_authorized" on public.permissions;
drop policy if exists "permissions_manage_insert" on public.permissions;
drop policy if exists "permissions_manage_update" on public.permissions;
drop policy if exists "permissions_manage_delete" on public.permissions;
create policy "permissions_manage_insert" on public.permissions for insert to authenticated
with check ((select private.has_permission('permissions.manage')));
create policy "permissions_manage_update" on public.permissions for update to authenticated
using ((select private.has_permission('permissions.manage')))
with check ((select private.has_permission('permissions.manage')));
create policy "permissions_manage_delete" on public.permissions for delete to authenticated
using ((select private.has_permission('permissions.manage')));

drop policy if exists "role_permissions_manage_authorized" on public.role_permissions;
drop policy if exists "role_permissions_manage_insert" on public.role_permissions;
drop policy if exists "role_permissions_manage_update" on public.role_permissions;
drop policy if exists "role_permissions_manage_delete" on public.role_permissions;
create policy "role_permissions_manage_insert" on public.role_permissions for insert to authenticated
with check ((select private.has_permission('roles.manage')));
create policy "role_permissions_manage_update" on public.role_permissions for update to authenticated
using ((select private.has_permission('roles.manage')))
with check ((select private.has_permission('roles.manage')));
create policy "role_permissions_manage_delete" on public.role_permissions for delete to authenticated
using ((select private.has_permission('roles.manage')));

drop policy if exists "roles_manage_authorized" on public.roles;
drop policy if exists "roles_manage_insert" on public.roles;
drop policy if exists "roles_manage_update" on public.roles;
drop policy if exists "roles_manage_delete" on public.roles;
create policy "roles_manage_insert" on public.roles for insert to authenticated
with check ((select private.has_permission('roles.manage')));
create policy "roles_manage_update" on public.roles for update to authenticated
using ((select private.has_permission('roles.manage')))
with check ((select private.has_permission('roles.manage')));
create policy "roles_manage_delete" on public.roles for delete to authenticated
using ((select private.has_permission('roles.manage')));

drop policy if exists "user_roles_manage_authorized" on public.user_roles;
drop policy if exists "user_roles_read_self_or_admin" on public.user_roles;
drop policy if exists "user_roles_read_effective" on public.user_roles;
drop policy if exists "user_roles_manage_insert" on public.user_roles;
drop policy if exists "user_roles_manage_update" on public.user_roles;
drop policy if exists "user_roles_manage_delete" on public.user_roles;
create policy "user_roles_read_effective" on public.user_roles for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.has_permission('users.read'))
  or (select private.has_permission('users.manage'))
);
create policy "user_roles_manage_insert" on public.user_roles for insert to authenticated
with check ((select private.has_permission('users.manage')));
create policy "user_roles_manage_update" on public.user_roles for update to authenticated
using ((select private.has_permission('users.manage')))
with check ((select private.has_permission('users.manage')));
create policy "user_roles_manage_delete" on public.user_roles for delete to authenticated
using ((select private.has_permission('users.manage')));
