create or replace function private.cleanup_relations_for_content_item()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  delete from public."Relation"
  where (source_type = tg_argv[0] and source_id = old.id)
     or (target_type = tg_argv[0] and target_id = old.id);
  return old;
end;
$$;

revoke all on function private.cleanup_relations_for_content_item() from public;

drop trigger if exists info_cleanup_relations on public."Info";
create trigger info_cleanup_relations
after delete on public."Info"
for each row execute function private.cleanup_relations_for_content_item('Info');

drop trigger if exists media_cleanup_relations on public."Media";
create trigger media_cleanup_relations
after delete on public."Media"
for each row execute function private.cleanup_relations_for_content_item('Media');
