
-- Seed the first Content modules and their initial field metadata.
-- The module registry is dynamic; these are the existing approved content domains.

insert into public.modules(module_key,name,slug,description,icon,status,sort_order,is_system)
values
 ('what_we_do','What We Do','what-we-do','Business activities, solutions and service categories.','compass','published',10,false),
 ('services','Services','services','Services catalogue and related content.','wrench','published',20,false),
 ('products','Products','products','Products catalogue and related content.','package','published',30,false),
 ('workshops','Workshops','workshops','Workshop and event records.','building','published',40,false),
 ('technicians','Technicians','technicians','Technician profiles, skills and related content.','user-cog','published',50,false),
 ('contacts','Contacts','contacts','Reusable contact records and contact methods.','contact','published',60,false),
 ('countries','Countries','countries','Country reference records.','globe','published',70,false),
 ('languages','Languages','languages','Language reference records.','languages','published',80,false),
 ('media','Media','media','Uploaded media assets stored in Supabase Storage.','images','published',90,false)
on conflict (module_key) do nothing;

with seed(module_key,field_key,label,field_type,is_required,is_unique,sort_order,settings) as (
 values
 ('what_we_do','title','Title','text',true,false,10,'{}'::jsonb),
 ('what_we_do','description','Description','textarea',false,false,20,'{}'::jsonb),
 ('what_we_do','slug','Slug','text',true,true,30,'{}'::jsonb),
 ('what_we_do','photo_url','Photo','image',false,false,40,'{}'::jsonb),
 ('what_we_do','gallery_urls','Images','gallery',false,false,50,'{}'::jsonb),

 ('services','title','Title','text',true,false,10,'{}'::jsonb),
 ('services','description','Description','textarea',false,false,20,'{}'::jsonb),
 ('services','slug','Slug','text',true,true,30,'{}'::jsonb),
 ('services','photo_url','Photo','image',false,false,40,'{}'::jsonb),
 ('services','gallery_urls','Images','gallery',false,false,50,'{}'::jsonb),
 ('services','short_info','Short Info','textarea',false,false,60,'{}'::jsonb),
 ('services','service_information','Service Information','multi_text',false,false,70,'{}'::jsonb),
 ('services','category','Category','text',false,false,80,'{}'::jsonb),
 ('services','location','Location','text',false,false,90,'{}'::jsonb),
 ('services','map_url','Map URL','url',false,false,100,'{}'::jsonb),
 ('services','phone','Phone','phone',false,false,110,'{}'::jsonb),
 ('services','whatsapp','WhatsApp','phone',false,false,120,'{}'::jsonb),

 ('products','title','Title','text',true,false,10,'{}'::jsonb),
 ('products','description','Description','textarea',false,false,20,'{}'::jsonb),
 ('products','slug','Slug','text',true,true,30,'{}'::jsonb),
 ('products','photo_url','Photo','image',false,false,40,'{}'::jsonb),
 ('products','gallery_urls','Images','gallery',false,false,50,'{}'::jsonb),
 ('products','image_paths','Image Paths','gallery',false,false,55,'{}'::jsonb),
 ('products','sku','SKU','text',false,false,60,'{}'::jsonb),
 ('products','condition','Condition','text',false,false,70,'{}'::jsonb),
 ('products','price_minor','Price (Minor Units)','number',false,false,80,'{}'::jsonb),
 ('products','currency','Currency','text',false,false,90,'{}'::jsonb),
 ('products','stock_qty','Stock Quantity','number',false,false,100,'{}'::jsonb),
 ('products','category','Category','text',false,false,110,'{}'::jsonb),
 ('products','category_group','Category Group','text',false,false,120,'{}'::jsonb),
 ('products','short_info','Short Info','textarea',false,false,130,'{}'::jsonb),
 ('products','service_information','Service Information','multi_text',false,false,140,'{}'::jsonb),
 ('products','location','Location','text',false,false,150,'{}'::jsonb),
 ('products','map_url','Map URL','url',false,false,160,'{}'::jsonb),
 ('products','phone','Phone','phone',false,false,170,'{}'::jsonb),
 ('products','whatsapp','WhatsApp','phone',false,false,180,'{}'::jsonb),

 ('workshops','title','Title','text',true,false,10,'{}'::jsonb),
 ('workshops','description','Description','textarea',false,false,20,'{}'::jsonb),
 ('workshops','slug','Slug','text',true,true,30,'{}'::jsonb),
 ('workshops','photo_url','Photo','image',false,false,40,'{}'::jsonb),
 ('workshops','gallery_urls','Images','gallery',false,false,50,'{}'::jsonb),
 ('workshops','workshop_date','Workshop Date','date',false,false,60,'{}'::jsonb),
 ('workshops','workshop_time','Workshop Time','time',false,false,70,'{}'::jsonb),
 ('workshops','location','Location','text',false,false,80,'{}'::jsonb),
 ('workshops','address','Address','textarea',false,false,90,'{}'::jsonb),
 ('workshops','trainer','Trainer','text',false,false,100,'{}'::jsonb),
 ('workshops','category','Category','text',false,false,110,'{}'::jsonb),
 ('workshops','phone','Phone','phone',false,false,120,'{}'::jsonb),
 ('workshops','whatsapp','WhatsApp','phone',false,false,130,'{}'::jsonb),
 ('workshops','map_url','Map URL','url',false,false,140,'{}'::jsonb),
 ('workshops','short_info','Short Info','textarea',false,false,150,'{}'::jsonb),
 ('workshops','service_information','Service Information','multi_text',false,false,160,'{}'::jsonb),

 ('technicians','title','Title','text',true,false,10,'{}'::jsonb),
 ('technicians','description','Description','textarea',false,false,20,'{}'::jsonb),
 ('technicians','slug','Slug','text',true,true,30,'{}'::jsonb),
 ('technicians','photo_url','Photo','image',false,false,40,'{}'::jsonb),
 ('technicians','gallery_urls','Images','gallery',false,false,50,'{}'::jsonb),
 ('technicians','category','Category','text',false,false,60,'{}'::jsonb),
 ('technicians','skill','Skill','text',false,false,70,'{}'::jsonb),
 ('technicians','phone','Phone','phone',false,false,80,'{}'::jsonb),
 ('technicians','whatsapp','WhatsApp','phone',false,false,90,'{}'::jsonb),
 ('technicians','email','Email','email',false,false,100,'{}'::jsonb),
 ('technicians','link','Link','url',false,false,110,'{}'::jsonb),
 ('technicians','short_info','Short Info','textarea',false,false,120,'{}'::jsonb),
 ('technicians','service_information','Service Information','multi_text',false,false,130,'{}'::jsonb),
 ('technicians','location','Location','text',false,false,140,'{}'::jsonb),
 ('technicians','map_url','Map URL','url',false,false,150,'{}'::jsonb),

 ('contacts','title','Title','text',true,false,10,'{}'::jsonb),
 ('contacts','slug','Slug','text',false,true,20,'{}'::jsonb),
 ('contacts','value','Value','text',false,false,30,'{}'::jsonb),
 ('contacts','contact_type','Contact Type','text',false,false,40,'{}'::jsonb),
 ('contacts','label','Label','text',false,false,50,'{}'::jsonb),
 ('contacts','normalized_value','Normalized Value','text',false,false,60,'{}'::jsonb),

 ('countries','title','Title','text',true,false,10,'{}'::jsonb),
 ('countries','slug','Slug','text',true,true,20,'{}'::jsonb),
 ('countries','code','Country Code','text',false,true,30,'{}'::jsonb),
 ('countries','is_global','Global Country','boolean',false,false,40,'{}'::jsonb),

 ('languages','title','Title','text',true,false,10,'{}'::jsonb),
 ('languages','slug','Slug','text',true,true,20,'{}'::jsonb),
 ('languages','description','Description','textarea',false,false,30,'{}'::jsonb),
 ('languages','country','Country','text',false,false,40,'{}'::jsonb),
 ('languages','photo_url','Photo','image',false,false,50,'{}'::jsonb),
 ('languages','gallery_urls','Images','gallery',false,false,60,'{}'::jsonb),
 ('languages','is_default','Default Language','boolean',false,false,70,'{}'::jsonb),

 ('media','title','Title','text',true,false,10,'{}'::jsonb),
 ('media','slug','Slug','text',false,true,20,'{}'::jsonb),
 ('media','bucket_id','Storage Bucket','text',false,false,30,'{}'::jsonb),
 ('media','file_path','File Path','text',false,true,40,'{}'::jsonb),
 ('media','mime_type','MIME Type','text',false,false,50,'{}'::jsonb),
 ('media','size_bytes','Size in Bytes','number',false,false,60,'{}'::jsonb),
 ('media','metadata','File Metadata','json',false,false,70,'{}'::jsonb)
)
insert into public.module_fields(module_id,field_key,label,field_type,is_required,is_unique,sort_order,settings)
select m.id,s.field_key,s.label,s.field_type,s.is_required,s.is_unique,s.sort_order,s.settings
from seed s join public.modules m on m.module_key=s.module_key
on conflict (module_id,field_key) do nothing;
