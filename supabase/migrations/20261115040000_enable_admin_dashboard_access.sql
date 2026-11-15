-- Enable the explicit Admin dashboard role without broadening Owner-only account assignment.
-- Admin gets dashboard/content/settings/role-management RLS access; direct user_roles and
-- user_permissions management remains Owner-only. The owner-users Edge Function separately
-- allows Admin to manage non-Owner accounts while protecting the primary Owner.

create or replace function private.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role in ('owner', 'admin')
  );
$$;

do $$
declare
  p record;
  using_expr text;
  check_expr text;
begin
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (
        coalesce(qual, '') like '%private.is_site_owner()%'
        or coalesce(with_check, '') like '%private.is_site_owner()%'
      )
      and tablename not in ('user_roles', 'user_permissions', 'Users')
  loop
    using_expr := case when p.qual is null then null
      else replace(p.qual, 'private.is_site_owner()', 'private.is_site_admin()') end;
    check_expr := case when p.with_check is null then null
      else replace(p.with_check, 'private.is_site_owner()', 'private.is_site_admin()') end;
    if using_expr is not null and check_expr is not null then
      execute format('alter policy %I on %I.%I using (%s) with check (%s)',
        p.policyname, p.schemaname, p.tablename, using_expr, check_expr);
    elsif using_expr is not null then
      execute format('alter policy %I on %I.%I using (%s)',
        p.policyname, p.schemaname, p.tablename, using_expr);
    elsif check_expr is not null then
      execute format('alter policy %I on %I.%I with check (%s)',
        p.policyname, p.schemaname, p.tablename, check_expr);
    end if;
  end loop;
end;
$$;

insert into public."Roles" (name, slug, description, is_active, is_system, status, sort_order)
values (
  'Admin',
  'admin',
  'Dashboard administrator with management access.',
  true,
  true,
  'active',
  (select coalesce(max(sort_order), 0) + 10 from public."Roles")
)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    is_active = true,
    is_system = true,
    status = 'active';
