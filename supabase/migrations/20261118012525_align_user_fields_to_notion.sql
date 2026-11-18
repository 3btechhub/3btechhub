-- Add the fields specified for the User module while retaining Supabase Auth identity fields.
alter table public."Users" add column if not exists slug text;
alter table public."Users" add column if not exists type text not null default 'member';
alter table public."Users" add column if not exists description text not null default '';
alter table public."Users" add column if not exists visibility text not null default 'show';
alter table public."Users" drop constraint if exists users_visibility_check;
alter table public."Users" add constraint users_visibility_check check (visibility in ('show','hide'));
create unique index if not exists users_slug_unique_idx on public."Users"(slug) where slug is not null;
update public."Users" u
set slug=coalesce(nullif(u.slug,''),regexp_replace(lower(trim(u.full_name)),'[^a-z0-9]+','-','g')||'-'||left(u.auth_user_id::text,8)),
    type=coalesce((select ur.role from public.user_roles ur where ur.user_id=u.auth_user_id order by case ur.role when 'owner' then 0 when 'admin' then 1 when 'member' then 2 else 3 end limit 1),'member'),
    visibility=case when u.status='active' then 'show' else 'hide' end;
