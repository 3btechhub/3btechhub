insert into public.permissions (slug, name, description)
values
  ('page.account.view', 'View Account page', 'Allows a role to view the Account page and its navigation item.'),
  ('page.dashboard.view', 'View Dashboard page', 'Allows a role to view the Dashboard page and its navigation item.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p
  on p.slug in ('page.account.view', 'page.dashboard.view')
where r.slug = 'member'
  and r.is_active = true
on conflict (role_id, permission_id) do nothing;
