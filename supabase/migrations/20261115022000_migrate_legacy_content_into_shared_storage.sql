
-- Copy legacy catalogue/reference rows into shared content_items without
-- deleting or altering the source tables. Source UUIDs are preserved.
-- The inspected source UUID sets are disjoint.

insert into public.content_items
(id,module_id,title,slug,status,visibility_roles,sort_order,field_values,legacy_source,legacy_id,created_by,updated_by,created_at,updated_at)
select s.id,m.id,s.name,s.slug,s.status,s.visibility_roles,s.sort_order,s.field_values,'services',s.id,s.created_by,s.updated_by,s.created_at,s.updated_at
from (
 select id,name,slug,coalesce(status,'draft') status,
   case when jsonb_typeof(to_jsonb(x)->'visibility_roles')='array'
     then array(select jsonb_array_elements_text(to_jsonb(x)->'visibility_roles'))
     else array['owner']::text[] end visibility_roles,
   coalesce((to_jsonb(x)->>'sort_order')::integer,0) sort_order,
   to_jsonb(x)-array['id','created_at','updated_at','name','title','slug','status','visibility_roles','sort_order','created_by','updated_by'] field_values,
   nullif(to_jsonb(x)->>'created_by','')::uuid created_by,
   nullif(to_jsonb(x)->>'updated_by','')::uuid updated_by,
   coalesce((to_jsonb(x)->>'created_at')::timestamptz,now()) created_at,
   coalesce((to_jsonb(x)->>'updated_at')::timestamptz,now()) updated_at
 from public.services x
) s join public.modules m on m.module_key='services'
on conflict (id) do nothing;

insert into public.content_items
(id,module_id,title,slug,status,visibility_roles,sort_order,field_values,legacy_source,legacy_id,created_by,updated_by,created_at,updated_at)
select s.id,m.id,s.name,s.slug,s.status,s.visibility_roles,s.sort_order,s.field_values,'products',s.id,s.created_by,s.updated_by,s.created_at,s.updated_at
from (
 select id,name,slug,coalesce(status,'draft') status,
   case when jsonb_typeof(to_jsonb(x)->'visibility_roles')='array'
     then array(select jsonb_array_elements_text(to_jsonb(x)->'visibility_roles'))
     else array['owner']::text[] end visibility_roles,
   coalesce((to_jsonb(x)->>'sort_order')::integer,0) sort_order,
   to_jsonb(x)-array['id','created_at','updated_at','name','title','slug','status','visibility_roles','sort_order','created_by','updated_by'] field_values,
   nullif(to_jsonb(x)->>'created_by','')::uuid created_by,
   nullif(to_jsonb(x)->>'updated_by','')::uuid updated_by,
   coalesce((to_jsonb(x)->>'created_at')::timestamptz,now()) created_at,
   coalesce((to_jsonb(x)->>'updated_at')::timestamptz,now()) updated_at
 from public.products x
) s join public.modules m on m.module_key='products'
on conflict (id) do nothing;

insert into public.content_items
(id,module_id,title,slug,status,visibility_roles,sort_order,field_values,legacy_source,legacy_id,created_by,updated_by,created_at,updated_at)
select s.id,m.id,s.title,s.slug,s.status,s.visibility_roles,s.sort_order,s.field_values,'workshops',s.id,s.created_by,s.updated_by,s.created_at,s.updated_at
from (
 select id,title,slug,coalesce(status,'draft') status,
   case when jsonb_typeof(to_jsonb(x)->'visibility_roles')='array'
     then array(select jsonb_array_elements_text(to_jsonb(x)->'visibility_roles'))
     else array['owner']::text[] end visibility_roles,
   coalesce((to_jsonb(x)->>'sort_order')::integer,0) sort_order,
   to_jsonb(x)-array['id','created_at','updated_at','title','name','slug','status','visibility_roles','sort_order','created_by','updated_by'] field_values,
   nullif(to_jsonb(x)->>'created_by','')::uuid created_by,
   nullif(to_jsonb(x)->>'updated_by','')::uuid updated_by,
   coalesce((to_jsonb(x)->>'created_at')::timestamptz,now()) created_at,
   coalesce((to_jsonb(x)->>'updated_at')::timestamptz,now()) updated_at
 from public.workshops x
) s join public.modules m on m.module_key='workshops'
on conflict (id) do nothing;

insert into public.content_items
(id,module_id,title,slug,status,visibility_roles,sort_order,field_values,legacy_source,legacy_id,created_by,updated_by,created_at,updated_at)
select s.id,m.id,s.name,s.slug,s.status,s.visibility_roles,s.sort_order,s.field_values,'technicians',s.id,s.created_by,s.updated_by,s.created_at,s.updated_at
from (
 select id,name,slug,
   case when coalesce((to_jsonb(x)->>'is_published')::boolean,false) then 'published' else 'draft' end status,
   case when jsonb_typeof(to_jsonb(x)->'visibility_roles')='array'
     then array(select jsonb_array_elements_text(to_jsonb(x)->'visibility_roles'))
     else array['owner']::text[] end visibility_roles,
   coalesce((to_jsonb(x)->>'sort_order')::integer,0) sort_order,
   to_jsonb(x)-array['id','created_at','updated_at','name','title','slug','status','visibility_roles','sort_order','created_by','updated_by'] field_values,
   nullif(to_jsonb(x)->>'created_by','')::uuid created_by,
   nullif(to_jsonb(x)->>'updated_by','')::uuid updated_by,
   coalesce((to_jsonb(x)->>'created_at')::timestamptz,now()) created_at,
   coalesce((to_jsonb(x)->>'updated_at')::timestamptz,now()) updated_at
 from public.technicians x
) s join public.modules m on m.module_key='technicians'
on conflict (id) do nothing;

insert into public.content_items
(id,module_id,title,slug,status,visibility_roles,sort_order,field_values,legacy_source,legacy_id,created_at,updated_at)
select x.id,m.id,x.name,
  coalesce(nullif(regexp_replace(lower(trim(x.name)),'[^a-z0-9]+','-','g'),''),'country') slug,
  coalesce(to_jsonb(x)->>'status','active'),
  case when jsonb_typeof(to_jsonb(x)->'visibility_roles')='array' then array(select jsonb_array_elements_text(to_jsonb(x)->'visibility_roles')) else array['owner']::text[] end,0,
  to_jsonb(x)-array['id','created_at','updated_at','name','title','slug','status','visibility_roles'],
  'countries',x.id,coalesce(x.created_at,now()),coalesce(x.updated_at,now())
from public.countries x join public.modules m on m.module_key='countries'
on conflict (id) do nothing;

insert into public.content_items
(id,module_id,title,slug,status,visibility_roles,sort_order,field_values,legacy_source,legacy_id,created_at,updated_at)
select x.id,m.id,x.title,x.slug,
  coalesce(to_jsonb(x)->>'status','active'),
  case when jsonb_typeof(to_jsonb(x)->'visibility_roles')='array'
    then array(select jsonb_array_elements_text(to_jsonb(x)->'visibility_roles'))
    else array['owner']::text[] end,
  coalesce((to_jsonb(x)->>'sort_order')::integer,0),
  to_jsonb(x)-array['id','created_at','updated_at','title','name','slug','status','visibility_roles','sort_order'],
  'languages',x.id,x.created_at,x.updated_at
from public.languages x join public.modules m on m.module_key='languages'
on conflict (id) do nothing;

insert into public.content_items
(id,module_id,title,slug,status,visibility_roles,sort_order,field_values,legacy_source,legacy_id,created_at,updated_at)
select x.id,m.id,x.name,
  coalesce(nullif(x.slug,''),regexp_replace(lower(trim(x.name)),'[^a-z0-9]+','-','g')||'-'||left(x.id::text,8)),
  'active',
  coalesce(x.visibility_roles,array['owner']::text[]),0,
  to_jsonb(x)-array['id','created_at','updated_at','name','slug','visibility_roles'],
  'contacts',x.id,x.created_at,x.updated_at
from public.contacts x join public.modules m on m.module_key='contacts'
on conflict (id) do nothing;

insert into public.content_items
(id,module_id,title,slug,status,visibility_roles,sort_order,field_values,legacy_source,legacy_id,created_at,updated_at)
select x.id,m.id,coalesce(nullif(x.label,''),initcap(x.contact_type)),
  x.contact_type||'-'||left(x.id::text,8),'active',array['owner']::text[],0,
  to_jsonb(x)-array['id','created_at','updated_at','label'],
  'contact_points',x.id,x.created_at,x.updated_at
from public.contact_points x join public.modules m on m.module_key='contacts'
on conflict (id) do nothing;

insert into public.content_items
(id,module_id,title,slug,status,visibility_roles,sort_order,field_values,legacy_source,legacy_id,created_at,updated_at)
select x.id,m.id,x.name,
  coalesce(nullif(regexp_replace(lower(x.name),'[^a-z0-9]+','-','g'),''),'asset')||'-'||left(x.id::text,8),
  'active',array['owner']::text[],0,
  (to_jsonb(x)-array['id','created_at','updated_at','name']) || jsonb_build_object(
    'file_path',x.name,'mime_type',x.metadata->>'mimetype',
    'size_bytes',case when (x.metadata->>'size') ~ '^[0-9]+
  coalesce(x.created_at,now()),coalesce(x.updated_at,now())
from storage.objects x join public.modules m on m.module_key='media'
where x.bucket_id='site-media'
on conflict (id) do nothing;

-- Import only approved Content-to-Content relationships. Legacy Service Type
-- and Device Type links remain intact in their original tables and are not
-- silently reclassified as What We Do.

with legacy_pairs(item_a_id,item_b_id) as (
 select service_id,product_id from public.service_products
 union all select service_id,workshop_id from public.service_workshops
 union all select service_id,technician_id from public.service_technicians
 union all select product_id,workshop_id from public.product_workshops
 union all select product_id,technician_id from public.product_technicians
 union all select workshop_id,technician_id from public.workshop_technicians
 union all select service_id,country_id from public.service_countries
 union all select product_id,country_id from public.product_countries
 union all select workshop_id,country_id from public.workshop_countries
 union all select technician_id,country_id from public.technician_countries
 union all select language_id,country_id from public.language_countries
 union all select language_id,service_id from public.language_services
 union all select language_id,product_id from public.language_products
 union all select language_id,workshop_id from public.language_workshops
 union all select language_id,technician_id from public.language_technicians
 union all select service_id,contact_id from public.service_contacts
 union all select product_id,contact_id from public.product_contacts
 union all select workshop_id,contact_id from public.workshop_contacts
 union all select technician_id,contact_id from public.technician_contacts
)
insert into public.relations(item_a_id,item_b_id)
select least(p.item_a_id,p.item_b_id),greatest(p.item_a_id,p.item_b_id)
from legacy_pairs p
join public.content_items a on a.id=p.item_a_id
join public.content_items b on b.id=p.item_b_id
where p.item_a_id<>p.item_b_id
on conflict (item_a_id,item_b_id) do nothing;
 then (x.metadata->>'size')::bigint else null end
  ),
  'storage.objects:site-media',x.id,
  coalesce(x.created_at,now()),coalesce(x.updated_at,now())
from storage.objects x join public.modules m on m.module_key='media'
where x.bucket_id='site-media'
on conflict (id) do nothing;

-- Import only approved Content-to-Content relationships. Legacy Service Type
-- and Device Type links remain intact in their original tables and are not
-- silently reclassified as What We Do.

with legacy_pairs(item_a_id,item_b_id) as (
 select service_id,product_id from public.service_products
 union all select service_id,workshop_id from public.service_workshops
 union all select service_id,technician_id from public.service_technicians
 union all select product_id,workshop_id from public.product_workshops
 union all select product_id,technician_id from public.product_technicians
 union all select workshop_id,technician_id from public.workshop_technicians
 union all select service_id,country_id from public.service_countries
 union all select product_id,country_id from public.product_countries
 union all select workshop_id,country_id from public.workshop_countries
 union all select technician_id,country_id from public.technician_countries
 union all select language_id,country_id from public.language_countries
 union all select language_id,service_id from public.language_services
 union all select language_id,product_id from public.language_products
 union all select language_id,workshop_id from public.language_workshops
 union all select language_id,technician_id from public.language_technicians
 union all select service_id,contact_id from public.service_contacts
 union all select product_id,contact_id from public.product_contacts
 union all select workshop_id,contact_id from public.workshop_contacts
 union all select technician_id,contact_id from public.technician_contacts
)
insert into public.relations(item_a_id,item_b_id)
select least(p.item_a_id,p.item_b_id),greatest(p.item_a_id,p.item_b_id)
from legacy_pairs p
join public.content_items a on a.id=p.item_a_id
join public.content_items b on b.id=p.item_b_id
where p.item_a_id<>p.item_b_id
on conflict (item_a_id,item_b_id) do nothing;
