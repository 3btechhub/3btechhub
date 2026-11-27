create or replace function private.guard_auth_owner_identity()
returns trigger language plpgsql security definer set search_path=''
as $$
declare v_owner_email text; v_owner_id uuid;
begin
 select lower(value) into v_owner_email from private.system_config where key='owner_email';
 select nullif(value,'')::uuid into v_owner_id from private.system_config where key='owner_auth_user_id';
 if tg_op='DELETE' then
  if old.id=v_owner_id or lower(old.email)=v_owner_email then raise exception 'The permanent Owner identity cannot be deleted.'; end if;
  return old;
 end if;
 if (old.id=v_owner_id or lower(old.email)=v_owner_email) and lower(new.email)<>v_owner_email then
  raise exception 'The permanent Owner email cannot be changed.';
 end if;
 if v_owner_id is not null and new.id<>v_owner_id and lower(new.email)=v_owner_email then
  raise exception 'The permanent Owner email is reserved.';
 end if;
 return new;
end $$;