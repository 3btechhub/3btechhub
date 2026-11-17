alter table public.relations
  add column if not exists sort_order integer not null default 0;

create index if not exists relations_sort_order_created_at_idx
  on public.relations (sort_order, created_at desc);
