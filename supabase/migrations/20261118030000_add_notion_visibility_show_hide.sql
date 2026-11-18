alter table public."Info"
  add column if not exists visibility text not null default 'show';
alter table public."Media"
  add column if not exists visibility text not null default 'show';

do $$
begin
  if not exists (select 1 from pg_constraint where conname='info_visibility_check' and conrelid='public."Info"'::regclass) then
    alter table public."Info" add constraint info_visibility_check check (visibility in ('show','hide'));
  end if;
  if not exists (select 1 from pg_constraint where conname='media_visibility_check' and conrelid='public."Media"'::regclass) then
    alter table public."Media" add constraint media_visibility_check check (visibility in ('show','hide'));
  end if;
end
$$;

create index if not exists info_visibility_status_idx on public."Info"(visibility,status);
create index if not exists media_visibility_status_idx on public."Media"(visibility,status);

drop policy if exists info_public_read on public."Info";
create policy info_public_read on public."Info"
for select to anon, authenticated
using (
  status in ('active','published')
  and visibility='show'
  and private.user_can_view_visibility(visibility_roles)
);

drop policy if exists media_public_read on public."Media";
create policy media_public_read on public."Media"
for select to anon, authenticated
using (
  status in ('active','published')
  and visibility='show'
  and private.user_can_view_visibility(visibility_roles)
);

drop policy if exists relation_public_read on public."Relation";
create policy relation_public_read on public."Relation"
for select to anon, authenticated
using (
  private.is_site_admin()
  or (
    (case
      when source_type='Info' then exists (
        select 1 from public."Info" i
        where i.id=source_id
          and i.status in ('active','published')
          and i.visibility='show'
          and private.user_can_view_visibility(i.visibility_roles)
      )
      else exists (
        select 1 from public."Media" m
        where m.id=source_id
          and m.status in ('active','published')
          and m.visibility='show'
          and private.user_can_view_visibility(m.visibility_roles)
      )
    end)
    and
    (case
      when target_type='Info' then exists (
        select 1 from public."Info" i
        where i.id=target_id
          and i.status in ('active','published')
          and i.visibility='show'
          and private.user_can_view_visibility(i.visibility_roles)
      )
      else exists (
        select 1 from public."Media" m
        where m.id=target_id
          and m.status in ('active','published')
          and m.visibility='show'
          and private.user_can_view_visibility(m.visibility_roles)
      )
    end)
  )
);