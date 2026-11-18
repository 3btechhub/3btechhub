-- Preserve Location-to-Info and Location-to-Country relationships in Relation.
insert into public."Relation"(id,source_type,source_id,target_type,target_id,sort_order,created_at)
select gen_random_uuid(),'Info',i.id,'Info',(i.data->>'location_id')::uuid,0,now()
from public."Info" i
where nullif(i.data->>'location_id','') is not null
and exists(select 1 from public."Info" loc where loc.id=(i.data->>'location_id')::uuid)
and not exists(select 1 from public."Relation" r where (r.source_type='Info' and r.source_id=i.id and r.target_type='Info' and r.target_id=(i.data->>'location_id')::uuid) or (r.source_type='Info' and r.source_id=(i.data->>'location_id')::uuid and r.target_type='Info' and r.target_id=i.id));
insert into public."Relation"(id,source_type,source_id,target_type,target_id,sort_order,created_at)
select gen_random_uuid(),'Info',i.id,'Info',(i.data->>'country_id')::uuid,0,now()
from public."Info" i
where i.type='Location' and nullif(i.data->>'country_id','') is not null
and exists(select 1 from public."Info" c where c.id=(i.data->>'country_id')::uuid)
and not exists(select 1 from public."Relation" r where (r.source_type='Info' and r.source_id=i.id and r.target_type='Info' and r.target_id=(i.data->>'country_id')::uuid) or (r.source_type='Info' and r.source_id=(i.data->>'country_id')::uuid and r.target_type='Info' and r.target_id=i.id));
