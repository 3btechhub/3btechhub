-- Enable the explicit Admin dashboard role alongside Owner.
-- Admin receives the same dashboard/RLS management access while Owner account protections remain in place.

create or replace function private.is_site_owner()
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

create or replace function private.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select private.is_site_owner();
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
