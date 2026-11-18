-- Convert legacy type records and relationship tables into Info and Relation.
insert into public."Info"(id,name,type,slug,description,visibility_roles,sort_order,data,status,created_at,updated_at)
select id,title,'Service Type',coalesce(nullif(slug,''), 'service-type-'||left(id::text,8)),coalesce(description,''),coalesce(visibility_roles,array['owner']::text[]),coalesce(sort_order,0),to_jsonb(x)-array['id','title','slug','description','visibility_roles','sort_order','created_at','updated_at'],coalesce(status,'active'),created_at,updated_at from public.service_types x
on conflict(id) do nothing;
insert into public."Info"(id,name,type,slug,description,visibility_roles,sort_order,data,status,created_at,updated_at)
select id,title,'Device Type',coalesce(nullif(slug,''), 'device-type-'||left(id::text,8)),coalesce(description,''),coalesce(visibility_roles,array['owner']::text[]),coalesce(sort_order,0),to_jsonb(x)-array['id','title','slug','description','visibility_roles','sort_order','created_at','updated_at'],coalesce(status,'active'),created_at,updated_at from public.device_types x
on conflict(id) do nothing;
insert into public."Info"(id,name,type,slug,description,visibility_roles,sort_order,data,status,created_at,updated_at)
select id,name,'Location','location-'||left(id::text,8),coalesce(address,''),coalesce(visibility_roles,array['owner']::text[]),0,to_jsonb(x)-array['id','name','address','visibility_roles','created_at','updated_at'],coalesce(status,'active'),created_at,updated_at from public.locations x
on conflict(id) do nothing;
with pairs(a,b,created_at) as (
 select service_type_id,service_id,created_at from public.service_type_services
 union all select device_type_id,service_id,created_at from public.device_type_services
 union all select device_type_id,product_id,created_at from public.device_type_products
 union all select service_type_id,product_id,created_at from public.service_type_products
 union all select service_type_id,technician_id,created_at from public.service_type_technicians
 union all select device_type_id,technician_id,created_at from public.device_type_technicians
 union all select service_type_id,workshop_id,created_at from public.service_type_workshops
 union all select device_type_id,workshop_id,created_at from public.device_type_workshops
 union all select service_type_id,country_id,created_at from public.service_type_countries
 union all select device_type_id,country_id,created_at from public.device_type_countries
 union all select service_type_id,device_type_id,created_at from public.service_type_device_types
 union all select product_id,country_id,created_at from public.product_countries
 union all select service_id,country_id,created_at from public.service_countries
 union all select workshop_id,country_id,created_at from public.workshop_countries
 union all select technician_id,country_id,created_at from public.technician_countries
 union all select language_id,country_id,created_at from public.language_countries
 union all select language_id,product_id,created_at from public.language_products
 union all select language_id,service_id,created_at from public.language_services
 union all select language_id,workshop_id,created_at from public.language_workshops
 union all select language_id,technician_id,created_at from public.language_technicians
 union all select language_id,service_type_id,created_at from public.language_service_types
 union all select language_id,product_type_id,created_at from public.language_product_types
 union all select service_id,workshop_id,created_at from public.service_workshops
 union all select technician_id,contact_id,created_at from public.technician_contacts
 union all select workshop_id,contact_id,created_at from public.workshop_contacts
 union all select product_id,contact_id,created_at from public.product_contacts
 union all select service_id,contact_id,created_at from public.service_contacts
 union all select product_id,technician_id,created_at from public.product_technicians
 union all select product_id,workshop_id,created_at from public.product_workshops
 union all select service_id,technician_id,created_at from public.service_technicians
 union all select technician_id,workshop_id,created_at from public.workshop_technicians
), valid as (
 select p.* from pairs p join public."Info" a on a.id=p.a join public."Info" b on b.id=p.b where p.a<>p.b
)
insert into public."Relation"(id,source_type,source_id,target_type,target_id,sort_order,created_at)
select gen_random_uuid(),'Info',a,'Info',b,row_number() over(order by a,b)*10,coalesce(created_at,now())
from valid p
where not exists(select 1 from public."Relation" r where (r.source_type='Info' and r.source_id=p.a and r.target_type='Info' and r.target_id=p.b) or (r.source_type='Info' and r.source_id=p.b and r.target_type='Info' and r.target_id=p.a))
on conflict do nothing;
