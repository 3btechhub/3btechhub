alter table public.our_services
  drop column if exists description,
  drop column if exists details;

alter table public.related_products
  drop column if exists description,
  drop column if exists details;
