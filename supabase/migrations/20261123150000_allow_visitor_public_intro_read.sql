grant select on public.intro_content to anon;

create or replace function private.is_visitor_content_visible(p_visible_role_ids uuid[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select (select auth.uid()) is null
    and exists (
      select 1
      from public.roles r
      where r.slug = 'visitor'
        and r.is_active = true
        and r.id = any (p_visible_role_ids)
    );
$function$;

revoke all on function private.is_visitor_content_visible(uuid[]) from public;
grant execute on function private.is_visitor_content_visible(uuid[]) to anon;

drop policy if exists "intro_read_visitor_public" on public.intro_content;
create policy "intro_read_visitor_public"
on public.intro_content
for select
to anon
using ((select private.is_visitor_content_visible(visible_role_ids)));