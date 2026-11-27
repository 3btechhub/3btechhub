insert into public.regions(name,slug)
values ('Global','global'),('Bangladesh','bangladesh'),('Saudi Arabia','saudi-arabia')
on conflict(name) do update set slug=excluded.slug;