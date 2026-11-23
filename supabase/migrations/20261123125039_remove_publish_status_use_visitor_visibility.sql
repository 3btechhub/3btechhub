-- Draft/Publish is replaced by role visibility. Selecting Visitor makes content public.
drop policy if exists "our_services_read_visitor" on public.our_services;
drop policy if exists "our_services_read_roles" on public.our_services;
drop index if exists public.our_services_public_order_idx;
alter table public.our_services drop column if exists status;
create index if not exists our_services_public_order_idx
  on public.our_services (sort_order, created_at);

create policy "our_services_read_visitor" on public.our_services
for select to anon
using ((select private.is_visitor_content_visible(visible_role_ids)));

create policy "our_services_read_roles" on public.our_services
for select to authenticated
using (
  exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id and r.is_active = true
    where ur.user_id = (select auth.uid())
      and ur.role_id = any (visible_role_ids)
  )
  or (select private.has_permission('module.our_services.manage'))
);

update public.permissions
set description = 'Allows creating, editing, controlling role visibility and deleting Our Services entries.'
where slug = 'module.our_services.manage';

drop policy if exists "related_products_read_visitor" on public.related_products;
drop policy if exists "related_products_read_roles" on public.related_products;
drop index if exists public.related_products_public_order_idx;
alter table public.related_products drop column if exists status;
create index if not exists related_products_public_order_idx
  on public.related_products (sort_order, created_at);

create policy "related_products_read_visitor" on public.related_products
for select to anon
using ((select private.is_visitor_content_visible(visible_role_ids)));

create policy "related_products_read_roles" on public.related_products
for select to authenticated
using (
  exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id and r.is_active = true
    where ur.user_id = (select auth.uid())
      and ur.role_id = any (visible_role_ids)
  )
  or (select private.has_permission('module.related_products.manage'))
);

update public.permissions
set description = 'Allows creating, editing, controlling role visibility and deleting Related Products entries.'
where slug = 'module.related_products.manage';
