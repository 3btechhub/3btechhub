-- Create the Notion database structure and migrate existing content records without data loss.
create table if not exists public."Info" (
  id uuid primary key,
  name text not null,
  type text not null default '',
  slug text unique,
  description text not null default '',
  visibility_roles text[] not null default array['owner']::text[],
  sort_order integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public."Media" (
  id uuid primary key,
  name text not null,
  type text not null default '',
  slug text unique,
  description text not null default '',
  image_path text,
  image_url text,
  visibility_roles text[] not null default array['owner']::text[],
  sort_order integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public."Relation" (
  id uuid primary key,
  source_type text not null,
  source_id uuid not null,
  target_type text not null,
  target_id uuid not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  constraint relation_no_self_link check (source_type <> target_type or source_id <> target_id),
  constraint relation_unique_pair unique(source_type,source_id,target_type,target_id)
);
insert into public."Info"(id,name,type,slug,description,visibility_roles,sort_order,data,status,created_at,updated_at)
select ci.id,ci.title,m.name,ci.slug,coalesce(ci.field_values->>'description',''),ci.visibility_roles,ci.sort_order,
       coalesce(ci.field_values,'{}'::jsonb) || jsonb_build_object('_legacy_source',ci.legacy_source,'_legacy_id',ci.legacy_id,'_module_key',m.module_key),
       ci.status,ci.created_at,ci.updated_at
from public.content_items ci join public.modules m on m.id=ci.module_id
where m.module_key <> 'media'
on conflict (id) do update set name=excluded.name,type=excluded.type,slug=excluded.slug,description=excluded.description,
 visibility_roles=excluded.visibility_roles,sort_order=excluded.sort_order,data=excluded.data,status=excluded.status,updated_at=excluded.updated_at;
insert into public."Media"(id,name,type,slug,description,image_path,image_url,visibility_roles,sort_order,data,status,created_at,updated_at)
select ci.id,coalesce(ci.field_values->>'file_path',ci.title),coalesce(ci.field_values->>'mime_type',''),ci.slug,
       coalesce(ci.field_values->>'description',''),ci.field_values->>'file_path',
       case when ci.field_values->>'file_path' is not null then 'https://sburxeuxkrilbfppxylm.supabase.co/storage/v1/object/public/site-media/' || (ci.field_values->>'file_path') else null end,
       ci.visibility_roles,ci.sort_order,coalesce(ci.field_values,'{}'::jsonb),ci.status,ci.created_at,ci.updated_at
from public.content_items ci join public.modules m on m.id=ci.module_id
where m.module_key='media'
on conflict (id) do update set name=excluded.name,type=excluded.type,slug=excluded.slug,description=excluded.description,
 image_path=excluded.image_path,image_url=excluded.image_url,visibility_roles=excluded.visibility_roles,
 sort_order=excluded.sort_order,data=excluded.data,status=excluded.status,updated_at=excluded.updated_at;
insert into public."Relation"(id,source_type,source_id,target_type,target_id,sort_order,created_at,created_by)
select r.id,case when ma.module_key='media' then 'Media' else 'Info' end,r.item_a_id,
       case when mb.module_key='media' then 'Media' else 'Info' end,r.item_b_id,r.sort_order,r.created_at,r.created_by
from public.relations r
join public.content_items a on a.id=r.item_a_id join public.modules ma on ma.id=a.module_id
join public.content_items b on b.id=r.item_b_id join public.modules mb on mb.id=b.module_id
on conflict (id) do nothing;
alter table public."Info" enable row level security;
alter table public."Media" enable row level security;
alter table public."Relation" enable row level security;
drop policy if exists info_admin_manage on public."Info";
create policy info_admin_manage on public."Info" for all to authenticated using (private.is_site_admin()) with check (private.is_site_admin());
drop policy if exists info_public_read on public."Info";
create policy info_public_read on public."Info" for select to anon,authenticated using (status in ('active','published') and private.user_can_view_visibility(visibility_roles));
drop policy if exists media_admin_manage on public."Media";
create policy media_admin_manage on public."Media" for all to authenticated using (private.is_site_admin()) with check (private.is_site_admin());
drop policy if exists media_public_read on public."Media";
create policy media_public_read on public."Media" for select to anon,authenticated using (status in ('active','published') and private.user_can_view_visibility(visibility_roles));
drop policy if exists relation_admin_manage on public."Relation";
create policy relation_admin_manage on public."Relation" for all to authenticated using (private.is_site_admin()) with check (private.is_site_admin());
drop policy if exists relation_public_read on public."Relation";
create policy relation_public_read on public."Relation" for select to anon,authenticated using (
 private.is_site_admin() or
 (case when source_type='Info' then exists(select 1 from public."Info" i where i.id=source_id and i.status in ('active','published') and private.user_can_view_visibility(i.visibility_roles))
       else exists(select 1 from public."Media" m where m.id=source_id and m.status in ('active','published') and private.user_can_view_visibility(m.visibility_roles)) end)
 and
 (case when target_type='Info' then exists(select 1 from public."Info" i where i.id=target_id and i.status in ('active','published') and private.user_can_view_visibility(i.visibility_roles))
       else exists(select 1 from public."Media" m where m.id=target_id and m.status in ('active','published') and private.user_can_view_visibility(m.visibility_roles)) end)
);
grant select on public."Info",public."Media",public."Relation" to anon,authenticated;
grant insert,update,delete on public."Info",public."Media",public."Relation" to authenticated;
