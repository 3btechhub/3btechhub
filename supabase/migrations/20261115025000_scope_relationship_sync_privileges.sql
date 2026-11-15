
create or replace function private.sync_content_item_relations(
  p_item_id uuid,
  p_related_item_ids uuid[] default '{}'::uuid[]
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $function$
declare
  related_ids uuid[] := coalesce(array(
    select distinct x
    from unnest(coalesce(p_related_item_ids, '{}'::uuid[])) x
    where x is not null
  ), '{}'::uuid[]);
begin
  if not private.is_site_owner() then
    raise exception 'Only the site Owner may manage Content relationships';
  end if;
  if not exists(select 1 from public.content_items where id=p_item_id) then
    raise exception 'Content Item does not exist';
  end if;
  if p_item_id = any(related_ids) then
    raise exception 'An Item cannot be related to itself';
  end if;
  if exists (
    select 1 from unnest(related_ids) r(id)
    where not exists(select 1 from public.content_items ci where ci.id=r.id)
  ) then
    raise exception 'One or more related Content Items do not exist';
  end if;

  delete from public.relations r
  where (r.item_a_id=p_item_id or r.item_b_id=p_item_id)
    and (case when r.item_a_id=p_item_id then r.item_b_id else r.item_a_id end)
        <> all(related_ids);

  insert into public.relations(item_a_id,item_b_id)
  select least(p_item_id,x.id),greatest(p_item_id,x.id)
  from (select distinct unnest(related_ids) id) x
  on conflict (item_a_id,item_b_id) do nothing;
end;
$function$;

revoke all on function private.sync_content_item_relations(uuid,uuid[]) from public, anon;
grant execute on function private.sync_content_item_relations(uuid,uuid[]) to authenticated;

create or replace function public.sync_content_item_relations(
  p_item_id uuid,
  p_related_item_ids uuid[] default '{}'::uuid[]
)
returns void
language sql
security invoker
set search_path = pg_catalog, public, private
as $function$
  select private.sync_content_item_relations(p_item_id,p_related_item_ids);
$function$;

revoke all on function public.sync_content_item_relations(uuid,uuid[]) from public, anon;
grant execute on function public.sync_content_item_relations(uuid,uuid[]) to authenticated;
