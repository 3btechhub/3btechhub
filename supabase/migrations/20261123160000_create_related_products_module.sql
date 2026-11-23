-- Related Products module: catalogue, role visibility and manager controls.
create table if not exists public.related_products (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(btrim(name)) between 1 and 180),
 slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 icon text not null default '' check (length(icon) <= 80),
 image_path text, description text not null default '', details text not null default '',
 visible_role_ids uuid[] not null default '{}',
 status text not null default 'draft' check (status in ('draft','published')),
 sort_order integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 created_by uuid references auth.users(id) on delete set null,
 updated_by uuid references auth.users(id) on delete set null
);
create unique index if not exists related_products_slug_uidx on public.related_products (lower(slug));
create index if not exists related_products_public_order_idx on public.related_products (sort_order,created_at) where status='published';
alter table public.related_products enable row level security;
revoke all on public.related_products from anon,authenticated;
grant select on public.related_products to anon,authenticated;
grant insert,update,delete on public.related_products to authenticated;
insert into public.permissions(slug,name,description) values
('module.related_products.manage','Manage Related Products','Allows creating, editing, publishing and deleting Related Products entries.')
on conflict(slug) do update set name=excluded.name,description=excluded.description;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.slug='module.related_products.manage'
where r.slug='admin' and r.is_active=true on conflict(role_id,permission_id) do nothing;
drop policy if exists "related_products_read_visitor" on public.related_products;
create policy "related_products_read_visitor" on public.related_products for select to anon
using(status='published' and (select private.is_visitor_content_visible(visible_role_ids)));
drop policy if exists "related_products_read_roles" on public.related_products;
create policy "related_products_read_roles" on public.related_products for select to authenticated using(
(status='published' and exists(select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id and r.is_active=true
where ur.user_id=(select auth.uid()) and ur.role_id=any(visible_role_ids)))
or (select private.has_permission('module.related_products.manage')));
drop policy if exists "related_products_manager_insert" on public.related_products;
create policy "related_products_manager_insert" on public.related_products for insert to authenticated
with check((select private.has_permission('module.related_products.manage')));
drop policy if exists "related_products_manager_update" on public.related_products;
create policy "related_products_manager_update" on public.related_products for update to authenticated
using((select private.has_permission('module.related_products.manage')))
with check((select private.has_permission('module.related_products.manage')));
drop policy if exists "related_products_manager_delete" on public.related_products;
create policy "related_products_manager_delete" on public.related_products for delete to authenticated
using((select private.has_permission('module.related_products.manage')));
create or replace function public.set_related_products_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now(); new.updated_by=auth.uid(); return new; end; $$;
revoke all on function public.set_related_products_updated_at() from public;
grant execute on function public.set_related_products_updated_at() to authenticated;
drop trigger if exists related_products_updated_at on public.related_products;
create trigger related_products_updated_at before update on public.related_products for each row execute function public.set_related_products_updated_at();
drop policy if exists "related_products_media_insert" on storage.objects;
create policy "related_products_media_insert" on storage.objects for insert to authenticated
with check(bucket_id='site-media' and (storage.foldername(name))[1]='related-products' and (select private.has_permission('module.related_products.manage')));
drop policy if exists "related_products_media_delete" on storage.objects;
create policy "related_products_media_delete" on storage.objects for delete to authenticated
using(bucket_id='site-media' and (storage.foldername(name))[1]='related-products' and (select private.has_permission('module.related_products.manage')));
