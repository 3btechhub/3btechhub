create table if not exists public.intro_content (
  id smallint primary key default 1 check (id = 1),
  heading text not null default '',
  sub_heading text not null default '',
  image_path text,
  visible_role_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.intro_content enable row level security;
revoke all on public.intro_content from anon, authenticated;
grant select, insert, update on public.intro_content to authenticated;

insert into public.permissions (slug, name, description)
values ('module.intro.manage', 'Manage Intro module', 'Allows managing the Home Intro component.')
on conflict (slug) do update set name = excluded.name, description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.slug = 'module.intro.manage'
where r.slug = 'member' and r.is_active = true
on conflict (role_id, permission_id) do nothing;

create policy "intro_read_visible_roles"
on public.intro_content for select
to authenticated
using (
  exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id and r.is_active
    where ur.user_id = (select auth.uid())
      and ur.role_id = any (visible_role_ids)
  )
  or (select private.has_permission('module.intro.manage'))
);

create policy "intro_insert_manager"
on public.intro_content for insert
to authenticated
with check ((select private.has_permission('module.intro.manage')));

create policy "intro_update_manager"
on public.intro_content for update
to authenticated
using ((select private.has_permission('module.intro.manage')))
with check ((select private.has_permission('module.intro.manage')));

create or replace function public.set_intro_content_updated_at()
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

revoke all on function public.set_intro_content_updated_at() from public;
grant execute on function public.set_intro_content_updated_at() to authenticated;

drop trigger if exists intro_content_updated_at on public.intro_content;
create trigger intro_content_updated_at
before update on public.intro_content
for each row execute function public.set_intro_content_updated_at();

drop policy if exists "intro_media_manager_insert" on storage.objects;
create policy "intro_media_manager_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'site-media'
  and (storage.foldername(name))[1] = 'intro'
  and (select private.has_permission('module.intro.manage'))
);

drop policy if exists "intro_media_manager_update" on storage.objects;
create policy "intro_media_manager_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'site-media'
  and (storage.foldername(name))[1] = 'intro'
  and (select private.has_permission('module.intro.manage'))
)
with check (
  bucket_id = 'site-media'
  and (storage.foldername(name))[1] = 'intro'
  and (select private.has_permission('module.intro.manage'))
);

drop policy if exists "intro_media_manager_delete" on storage.objects;
create policy "intro_media_manager_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'site-media'
  and (storage.foldername(name))[1] = 'intro'
  and (select private.has_permission('module.intro.manage'))
);
