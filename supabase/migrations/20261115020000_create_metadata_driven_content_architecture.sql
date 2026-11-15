
-- Additive architecture foundation for metadata-driven Content modules.
-- Existing tables and data are intentionally retained during the transition.

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  module_key text not null unique,
  name text not null,
  slug text not null unique,
  description text not null default '',
  icon text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  sort_order integer not null default 0,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint modules_key_format check (module_key ~ '^[a-z][a-z0-9_]*$'),
  constraint modules_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.module_fields (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  field_key text not null,
  label text not null,
  field_type text not null,
  is_required boolean not null default false,
  is_unique boolean not null default false,
  default_value jsonb,
  validation jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(module_id, field_key),
  constraint module_fields_key_format check (field_key ~ '^[a-z][a-z0-9_]*$'),
  constraint module_fields_json_objects check (jsonb_typeof(validation)='object' and jsonb_typeof(settings)='object')
);

create table if not exists public.module_field_options (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.module_fields(id) on delete cascade,
  value text not null,
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(field_id, value)
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete restrict,
  title text not null,
  slug text,
  status text not null default 'draft',
  visibility_roles text[] not null default array['owner']::text[],
  sort_order integer not null default 0,
  field_values jsonb not null default '{}'::jsonb,
  legacy_source text,
  legacy_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_items_title_nonempty check (char_length(btrim(title)) > 0),
  constraint content_items_field_values_object check (jsonb_typeof(field_values)='object'),
  constraint content_items_visibility_owner check ('owner'=any(visibility_roles)),
  constraint content_items_legacy_pair check ((legacy_source is null) = (legacy_id is null)),
  unique(legacy_source, legacy_id)
);

create unique index if not exists content_items_module_slug_uidx
  on public.content_items(module_id, lower(slug))
  where slug is not null and btrim(slug) <> '';
create index if not exists content_items_module_status_order_idx
  on public.content_items(module_id, status, sort_order, created_at desc);
create index if not exists content_items_visibility_gin_idx
  on public.content_items using gin(visibility_roles);
create index if not exists content_items_field_values_gin_idx
  on public.content_items using gin(field_values);

create table if not exists public.relations (
  id uuid primary key default gen_random_uuid(),
  item_a_id uuid not null references public.content_items(id) on delete cascade,
  item_b_id uuid not null references public.content_items(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint relations_canonical_pair check (item_a_id < item_b_id),
  constraint relations_no_self_link check (item_a_id <> item_b_id),
  unique(item_a_id, item_b_id)
);
create index if not exists relations_item_a_idx on public.relations(item_a_id);
create index if not exists relations_item_b_idx on public.relations(item_b_id);

create or replace function private.sync_module_relation_fields()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
begin
  insert into public.module_fields(module_id, field_key, label, field_type, settings, sort_order)
  select new.id, 'related_' || m.module_key, 'Related ' || m.name, 'relation',
         jsonb_build_object('target_module_id', m.id), 9000 + m.sort_order
  from public.modules m
  where m.id <> new.id
  on conflict (module_id, field_key) do nothing;

  insert into public.module_fields(module_id, field_key, label, field_type, settings, sort_order)
  select m.id, 'related_' || new.module_key, 'Related ' || new.name, 'relation',
         jsonb_build_object('target_module_id', new.id), 9000 + new.sort_order
  from public.modules m
  where m.id <> new.id
  on conflict (module_id, field_key) do nothing;

  return new;
end;
$function$;

drop trigger if exists modules_sync_relation_fields on public.modules;
create trigger modules_sync_relation_fields
after insert on public.modules
for each row execute function private.sync_module_relation_fields();

create or replace function private.validate_content_item_fields()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  f record;
  v jsonb;
  duplicate_found boolean;
  option_found boolean;
begin
  if new.field_values is null or jsonb_typeof(new.field_values) <> 'object' then
    raise exception 'field_values must be a JSON object';
  end if;

  for f in
    select field_key, field_type, is_required, is_unique
    from public.module_fields
    where module_id = new.module_id and is_active and field_type <> 'relation'
  loop
    v := case
      when f.field_key = 'title' then to_jsonb(new.title)
      when f.field_key = 'slug' then to_jsonb(new.slug)
      else new.field_values -> f.field_key
    end;

    if f.is_required and (v is null or v = 'null'::jsonb or
       (jsonb_typeof(v) = 'string' and btrim(v #>> '{}') = '')) then
      raise exception 'Required field "%" is missing', f.field_key;
    end if;

    if v is null or v = 'null'::jsonb then
      continue;
    end if;

    if f.field_type in ('text','textarea','richtext','url','email','phone','select','radio','date','time','datetime','image')
       and jsonb_typeof(v) <> 'string' then
      raise exception 'Field "%" must contain text', f.field_key;
    elsif f.field_type in ('number','integer','decimal')
       and jsonb_typeof(v) <> 'number' then
      raise exception 'Field "%" must contain a number', f.field_key;
    elsif f.field_type = 'boolean' and jsonb_typeof(v) <> 'boolean' then
      raise exception 'Field "%" must contain true or false', f.field_key;
    elsif f.field_type in ('gallery','checkboxes','multi_text')
       and jsonb_typeof(v) <> 'array' then
      raise exception 'Field "%" must contain an array', f.field_key;
    elsif f.field_type = 'json' and jsonb_typeof(v) not in ('object','array') then
      raise exception 'Field "%" must contain a JSON object or array', f.field_key;
    end if;

    if f.field_type in ('select','radio') then
      select exists (
        select 1 from public.module_field_options o
        join public.module_fields mf on mf.id=o.field_id
        where mf.module_id=new.module_id and mf.field_key=f.field_key
          and o.is_active and o.value = v #>> '{}'
      ) into option_found;
      if not option_found then
        raise exception 'Field "%" has an invalid option', f.field_key;
      end if;
    elsif f.field_type = 'checkboxes' then
      if exists (
        select 1 from jsonb_array_elements_text(v) chosen(value)
        where not exists (
          select 1 from public.module_field_options o
          join public.module_fields mf on mf.id=o.field_id
          where mf.module_id=new.module_id and mf.field_key=f.field_key
            and o.is_active and o.value=chosen.value
        )
      ) then
        raise exception 'Field "%" contains an invalid option', f.field_key;
      end if;
    end if;

    if f.is_unique then
      if f.field_key = 'title' then
        select exists(select 1 from public.content_items ci
          where ci.module_id=new.module_id and ci.id<>new.id and lower(ci.title)=lower(new.title))
        into duplicate_found;
      elsif f.field_key = 'slug' then
        select exists(select 1 from public.content_items ci
          where ci.module_id=new.module_id and ci.id<>new.id and lower(ci.slug)=lower(new.slug))
        into duplicate_found;
      else
        select exists(select 1 from public.content_items ci
          where ci.module_id=new.module_id and ci.id<>new.id
            and ci.field_values -> f.field_key = v)
        into duplicate_found;
      end if;
      if duplicate_found then
        raise exception 'Field "%" must be unique within this module', f.field_key;
      end if;
    end if;
  end loop;

  return new;
end;
$function$;

drop trigger if exists content_items_validate_fields on public.content_items;
create trigger content_items_validate_fields
before insert or update of module_id, title, slug, field_values on public.content_items
for each row execute function private.validate_content_item_fields();

drop trigger if exists content_items_visibility_roles_guard on public.content_items;
create trigger content_items_visibility_roles_guard
before insert or update of visibility_roles on public.content_items
for each row execute function private.enforce_visibility_roles();

drop trigger if exists modules_set_updated_at on public.modules;
create trigger modules_set_updated_at before update on public.modules
for each row execute function public.set_updated_at();
drop trigger if exists module_fields_set_updated_at on public.module_fields;
create trigger module_fields_set_updated_at before update on public.module_fields
for each row execute function public.set_updated_at();
drop trigger if exists content_items_set_updated_at on public.content_items;
create trigger content_items_set_updated_at before update on public.content_items
for each row execute function public.set_updated_at();

alter table public.modules enable row level security;
alter table public.module_fields enable row level security;
alter table public.module_field_options enable row level security;
alter table public.content_items enable row level security;
alter table public.relations enable row level security;

drop policy if exists modules_owner_manage on public.modules;
create policy modules_owner_manage on public.modules
for all to authenticated using (private.is_site_owner()) with check (private.is_site_owner());
drop policy if exists modules_public_read_published on public.modules;
create policy modules_public_read_published on public.modules
for select to anon, authenticated using (status='published' or private.is_site_owner());

drop policy if exists module_fields_owner_manage on public.module_fields;
create policy module_fields_owner_manage on public.module_fields
for all to authenticated using (private.is_site_owner()) with check (private.is_site_owner());
drop policy if exists module_fields_public_read_published on public.module_fields;
create policy module_fields_public_read_published on public.module_fields
for select to anon, authenticated using (
  exists(select 1 from public.modules m where m.id=module_fields.module_id and m.status='published')
  or private.is_site_owner()
);

drop policy if exists module_field_options_owner_manage on public.module_field_options;
create policy module_field_options_owner_manage on public.module_field_options
for all to authenticated using (private.is_site_owner()) with check (private.is_site_owner());
drop policy if exists module_field_options_public_read_published on public.module_field_options;
create policy module_field_options_public_read_published on public.module_field_options
for select to anon, authenticated using (
  exists(select 1 from public.module_fields f join public.modules m on m.id=f.module_id
         where f.id=module_field_options.field_id and f.is_active and m.status='published')
  or private.is_site_owner()
);

drop policy if exists content_items_owner_manage on public.content_items;
create policy content_items_owner_manage on public.content_items
for all to authenticated using (private.is_site_owner()) with check (private.is_site_owner());
drop policy if exists content_items_public_read_visible on public.content_items;
create policy content_items_public_read_visible on public.content_items
for select to anon, authenticated using (
  (status in ('active','published')
   and private.user_can_view_visibility(visibility_roles)
   and exists(select 1 from public.modules m where m.id=content_items.module_id and m.status='published'))
  or private.is_site_owner()
);

drop policy if exists relations_owner_manage on public.relations;
create policy relations_owner_manage on public.relations
for all to authenticated using (private.is_site_owner()) with check (private.is_site_owner());
drop policy if exists relations_public_read_visible on public.relations;
create policy relations_public_read_visible on public.relations
for select to anon, authenticated using (
  private.is_site_owner()
  or (
    exists(select 1 from public.content_items a join public.modules ma on ma.id=a.module_id
      where a.id=relations.item_a_id and a.status in ('active','published')
        and ma.status='published' and private.user_can_view_visibility(a.visibility_roles))
    and
    exists(select 1 from public.content_items b join public.modules mb on mb.id=b.module_id
      where b.id=relations.item_b_id and b.status in ('active','published')
        and mb.status='published' and private.user_can_view_visibility(b.visibility_roles))
  )
);

grant select on public.modules, public.module_fields, public.module_field_options, public.content_items, public.relations to anon, authenticated;
grant insert, update, delete on public.modules, public.module_fields, public.module_field_options, public.content_items, public.relations to authenticated;
