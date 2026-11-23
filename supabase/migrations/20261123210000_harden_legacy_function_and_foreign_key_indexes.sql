create or replace function private.sync_content_module_legacy()
returns trigger language plpgsql set search_path = ''
as $function$
begin
  if tg_op = 'UPDATE' and new.type is distinct from old.type and new.module is not distinct from old.module then
    new.module := case new.type when 'Providers' then 'Technician' when 'Hubs' then 'Workshop' else new.type end;
  elsif new.module is null then
    new.module := case new.type when 'Providers' then 'Technician' when 'Hubs' then 'Workshop' else new.type end;
  end if;
  new.type := case new.module when 'Technician' then 'Providers' when 'Workshop' then 'Hubs' when 'Gallery' then 'Images' when 'Location' then 'Contacts' else new.module end;
  return new;
end;
$function$;
create index if not exists related_products_created_by_idx on public.related_products (created_by);
create index if not exists related_products_updated_by_idx on public.related_products (updated_by);
create index if not exists user_roles_assigned_by_idx on public.user_roles (assigned_by);
