
update public.module_fields f
set field_type='file', label='File Path', updated_at=now()
from public.modules m
where f.module_id=m.id and m.module_key='media' and f.field_key='file_path';
