create policy user_roles_self_read
on public.user_roles
for select
to authenticated
using ((select auth.uid()) = user_id);
