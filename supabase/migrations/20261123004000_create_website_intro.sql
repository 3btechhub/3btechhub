create table public.website_intro (
  id smallint primary key default 1 check (id = 1),
  intro_text text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.website_intro enable row level security;

revoke all on table public.website_intro from anon, authenticated;
grant select on table public.website_intro to anon, authenticated;
grant update (intro_text, updated_at) on table public.website_intro to authenticated;

create policy "Website intro is publicly readable"
on public.website_intro
for select
to anon, authenticated
using (true);

create policy "Only owner can update website intro"
on public.website_intro
for update
to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'Owner')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'Owner');

insert into public.website_intro (id, intro_text)
values (1, '')
on conflict (id) do nothing;
