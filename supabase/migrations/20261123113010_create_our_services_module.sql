-- Our Services module: service categories, role visibility and manager controls.
create table if not exists public.our_services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 180),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  icon text not null default '' check (length(icon) <= 80),
  image_path text,
  description text not null default '',
  details text not null default '',
  visible_role_ids uuid[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create unique index if not exists our_services_slug_uidx on public.our_services (lower(slug));
create index if not exists our_services_public_order_idx on public.our_services (sort_order, created_at) where status = 'published';

alter table public.our_services enable row level security;
revoke all on public.our_services from anon, authenticated;
grant select on public.our_services to anon, authenticated;
grant insert, update, delete on public.our_services to authenticated;

insert into public.permissions (slug, name, description)
values ('module.our_services.manage', 'Manage Our Services', 'Allows creating, editing, publishing and deleting Our Services entries.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

-- Owner is implicitly authorized by private.has_permission(); its grants are system-controlled.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r
join public.permissions p on p.slug = 'module.our_services.manage'
where r.slug = 'admin' and r.is_active = true
on conflict (role_id, permission_id) do nothing;

drop policy if exists "our_services_read_visitor" on public.our_services;
create policy "our_services_read_visitor" on public.our_services for select to anon
using (status = 'published' and (select private.is_visitor_content_visible(visible_role_ids)));

drop policy if exists "our_services_read_roles" on public.our_services;
create policy "our_services_read_roles" on public.our_services for select to authenticated
using (
  (status = 'published' and exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id and r.is_active = true
    where ur.user_id = (select auth.uid()) and ur.role_id = any (visible_role_ids)
  ))
  or (select private.has_permission('module.our_services.manage'))
);

drop policy if exists "our_services_manager_insert" on public.our_services;
create policy "our_services_manager_insert" on public.our_services for insert to authenticated
with check ((select private.has_permission('module.our_services.manage')));

drop policy if exists "our_services_manager_update" on public.our_services;
create policy "our_services_manager_update" on public.our_services for update to authenticated
using ((select private.has_permission('module.our_services.manage')))
with check ((select private.has_permission('module.our_services.manage')));

drop policy if exists "our_services_manager_delete" on public.our_services;
create policy "our_services_manager_delete" on public.our_services for delete to authenticated
using ((select private.has_permission('module.our_services.manage')));

create or replace function public.set_our_services_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

revoke all on function public.set_our_services_updated_at() from public;
grant execute on function public.set_our_services_updated_at() to authenticated;

drop trigger if exists our_services_updated_at on public.our_services;
create trigger our_services_updated_at before update on public.our_services
for each row execute function public.set_our_services_updated_at();

drop policy if exists "our_services_media_insert" on storage.objects;
create policy "our_services_media_insert" on storage.objects for insert to authenticated
with check (
  bucket_id = 'site-media'
  and (storage.foldername(name))[1] = 'our-services'
  and (select private.has_permission('module.our_services.manage'))
);

drop policy if exists "our_services_media_delete" on storage.objects;
create policy "our_services_media_delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'site-media'
  and (storage.foldername(name))[1] = 'our-services'
  and (select private.has_permission('module.our_services.manage'))
);
