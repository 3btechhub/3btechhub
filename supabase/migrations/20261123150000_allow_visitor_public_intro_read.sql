grant select on public.intro_content to anon;

drop policy if exists "intro_read_visitor_public" on public.intro_content;
create policy "intro_read_visitor_public"
on public.intro_content
for select
to anon
using (
  exists (
    select 1
    from public.roles r
    where r.slug = 'visitor'
      and r.is_active = true
      and r.id = any (visible_role_ids)
  )
);