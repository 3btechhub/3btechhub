insert into public.rbv_visibility(target_type,target_key,visible_role_ids)
select
  'component',
  'intro-view-card',
  array(
    select r.id from public.roles r
    where r.is_active and r.slug = any(array['visitor','member','owner','admin']::text[])
    order by r.slug
  )
on conflict (target_type,target_key)
do update set visible_role_ids=excluded.visible_role_ids, updated_at=now();