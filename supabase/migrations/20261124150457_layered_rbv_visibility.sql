alter table public.rbv_visibility
  drop constraint if exists rbv_visibility_target_type_check;

alter table public.rbv_visibility
  add constraint rbv_visibility_target_type_check
  check (target_type = any (array[
    'editor'::text,
    'component'::text,
    'module'::text,
    'page'::text,
    'navigation'::text,
    'form'::text
  ]));

with visibility_config(target_type, target_key, role_slugs) as (
  values
    ('page', 'root', array['visitor','member','owner','admin']::text[]),
    ('page', 'home', array['visitor','member','owner','admin']::text[]),
    ('page', 'account', array['member','owner','admin']::text[]),
    ('page', 'login', array['visitor']::text[]),
    ('page', 'dashboard', array['owner','admin']::text[]),
    ('navigation', 'home', array['visitor','member','owner','admin']::text[]),
    ('navigation', 'account', array['member','owner','admin']::text[]),
    ('navigation', 'dashboard', array['owner','admin']::text[]),
    ('form', 'login-form', array['visitor']::text[]),
    ('form', 'account-form', array['member','owner','admin']::text[]),
    ('editor', 'intro-editor-card', array['owner','admin']::text[])
),
resolved as (
  select
    c.target_type,
    c.target_key,
    array(
      select r.id
      from public.roles r
      where r.is_active and r.slug = any(c.role_slugs)
      order by r.slug
    ) as role_ids
  from visibility_config c
)
insert into public.rbv_visibility(target_type, target_key, visible_role_ids)
select target_type, target_key, role_ids
from resolved
on conflict (target_type, target_key)
do update set
  visible_role_ids = excluded.visible_role_ids,
  updated_at = now();
