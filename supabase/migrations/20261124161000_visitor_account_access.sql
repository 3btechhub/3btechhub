-- Allow Visitors to discover and enter the Account route.
-- Account navigation is the public entry point; the existing Auth Guard
-- redirects unauthenticated Visitors to the public Login route.
-- Account form data remains restricted to authenticated account roles.

with visitor_role as (
  select id
  from public.roles
  where slug = 'visitor'
    and is_active = true
)
update public.rbv_visibility v
set visible_role_ids = (
  select array_agg(distinct role_id)
  from unnest(
    v.visible_role_ids || (select array_agg(id) from visitor_role)
  ) as role_id
)
where (v.target_type = 'navigation' and v.target_key = 'account')
   or (v.target_type = 'page' and v.target_key = 'account');
