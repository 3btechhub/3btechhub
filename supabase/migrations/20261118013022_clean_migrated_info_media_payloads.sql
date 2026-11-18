-- Remove legacy implementation metadata while preserving user-entered Info values.
update public."Info"
set data=data - '_legacy_id' - '_legacy_source' - '_module_key' - 'status' - 'sort_order' - 'location_id' - 'country_id',
    updated_at=now()
where data ?| array['_legacy_id','_legacy_source','_module_key','status','sort_order','location_id','country_id'];
update public."Media"
set name=regexp_replace(coalesce(image_path,name),'^.*/',''),
    data='{}'::jsonb,
    updated_at=now();
