-- Link legacy image assets to their migrated Info records and expose only visible media.
update public."Media" m
set visibility_roles=i.visibility_roles,updated_at=now()
from public."Info" i
where i.data->>'photo_url' like '%'||m.image_path;
insert into public."Relation"(id,source_type,source_id,target_type,target_id,sort_order,created_at)
select gen_random_uuid(),'Info',i.id,'Media',m.id,0,now()
from public."Info" i join public."Media" m on i.data->>'photo_url' like '%'||m.image_path
where not exists(select 1 from public."Relation" r where (r.source_type='Info' and r.source_id=i.id and r.target_type='Media' and r.target_id=m.id) or (r.source_type='Media' and r.source_id=m.id and r.target_type='Info' and r.target_id=i.id));
