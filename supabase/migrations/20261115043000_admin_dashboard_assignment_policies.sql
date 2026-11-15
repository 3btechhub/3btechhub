-- Allow Admin dashboard users to inspect and manage non-Owner role assignments.
-- The Owner role assignment remains protected from Admin changes.

create policy user_roles_admin_read
on public.user_roles
for select
to authenticated
using (private.is_site_admin());

create policy user_roles_admin_manage_non_owner
on public.user_roles
for all
to authenticated
using (private.is_site_admin() and role <> 'owner')
with check (private.is_site_admin() and role <> 'owner');

create policy user_permissions_admin_manage
on public.user_permissions
for all
to authenticated
using (private.is_site_admin())
with check (private.is_site_admin());

create policy users_admin_read
on public."Users"
for select
to authenticated
using (private.is_site_admin());
