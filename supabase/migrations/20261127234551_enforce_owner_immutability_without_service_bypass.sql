create or replace function private.guard_profile_changes()
returns trigger language plpgsql security definer set search_path=''
as $$
declare v_owner_id uuid; v_owner_role uuid; v_current_role text; v_new_role text;
begin
 select nullif(value,'')::uuid into v_owner_id from private.system_config where key='owner_auth_user_id';
 if old.id=v_owner_id then raise exception 'The permanent Owner profile is immutable.'; end if;
 if current_setting('app.owner_bootstrap',true)='on' then return new; end if;
 select id into v_owner_role from public.roles where name='Owner';
 if new.role_id=v_owner_role and old.role_id<>v_owner_role then raise exception 'Owner role cannot be assigned or transferred.'; end if;
 if new.email is distinct from old.email then raise exception 'Change account email through the authenticated account flow.'; end if;
 if auth.role()='service_role' then return new; end if;
 v_current_role:=private.effective_role_name();
 select name into v_new_role from public.roles where id=new.role_id;
 if auth.uid()=old.id then
  if new.role_id is distinct from old.role_id or new.status is distinct from old.status or new.region_id is distinct from old.region_id then raise exception 'Users may update only their own permitted profile fields.'; end if;
 elsif v_current_role='Admin' then
  if new.role_id is distinct from old.role_id and v_new_role<>'Member' then raise exception 'Admin may assign Member role only.'; end if;
 elsif v_current_role<>'Owner' then raise exception 'Not authorized to update this profile.';
 end if;
 return new;
end $$;
create or replace function private.promote_verified_owner(p_user_id uuid,p_email text,p_confirmed_at timestamptz)
returns void language plpgsql security definer set search_path=''
as $$
declare v_owner_email text; v_owner_id uuid; v_owner_role uuid;
begin
 select lower(value) into v_owner_email from private.system_config where key='owner_email';
 select nullif(value,'')::uuid into v_owner_id from private.system_config where key='owner_auth_user_id';
 if p_confirmed_at is null or lower(coalesce(p_email,''))<>v_owner_email or v_owner_id is not null then return; end if;
 select id into v_owner_role from public.roles where name='Owner';
 perform set_config('app.owner_bootstrap','on',true);
 update public.profiles set role_id=v_owner_role,status='active',updated_at=now() where id=p_user_id;
 perform set_config('app.owner_bootstrap','off',true);
 update private.system_config set value=p_user_id::text where key='owner_auth_user_id';
end $$;