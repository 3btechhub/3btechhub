-- New Info, Media and Relation records are created by the dashboard without caller-supplied IDs.
alter table public."Info" alter column id set default gen_random_uuid();
alter table public."Media" alter column id set default gen_random_uuid();
alter table public."Relation" alter column id set default gen_random_uuid();
