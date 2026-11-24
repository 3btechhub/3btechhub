create or replace function public.can_see_target(
  p_target_type text,
  p_target_key text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.rbv_visibility v
    where v.target_type = p_target_type
      and v.target_key = p_target_key
      and cardinality(v.visible_role_ids) > 0
      and (
        (
          (select auth.uid()) is null
          and exists (
            select 1
            from public.roles r
            where r.slug = 'visitor'
              and r.is_active = true
              and r.id = any(v.visible_role_ids)
          )
        )
        or
        (
          (select auth.uid()) is not null
          and exists (
            select 1
            from public.user_roles ur
            join public.roles r on r.id = ur.role_id
            where ur.user_id = (select auth.uid())
              and r.is_active = true
              and ur.role_id = any(v.visible_role_ids)
          )
        )
      )
  );
$function$;

revoke all on function public.can_see_target(text, text) from public;
grant execute on function public.can_see_target(text, text) to anon, authenticated;
