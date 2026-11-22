create extension if not exists http with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;

create table if not exists public.site_skeleton_cache (
  page_path text primary key,
  page_url text not null,
  source_html text,
  source_hash text,
  scanned_at timestamptz,
  http_status integer,
  error_message text,
  constraint site_skeleton_cache_page_path_check check (page_path like '/%')
);

alter table public.site_skeleton_cache enable row level security;
revoke all on public.site_skeleton_cache from anon, authenticated;
grant select on public.site_skeleton_cache to anon, authenticated;
drop policy if exists "Public can read skeleton templates" on public.site_skeleton_cache;
create policy "Public can read skeleton templates"
on public.site_skeleton_cache
for select
to anon, authenticated
using (source_html is not null and http_status = 200);

create or replace function private.refresh_site_skeleton_cache()
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  item record;
  response_status integer;
  response_body text;
  response_error text;
  page_list constant jsonb := '[
    { "path": "/", "url": "https://3btechhub.github.io/3btechhub/" },
    { "path": "/home/", "url": "https://3btechhub.github.io/3btechhub/home/" },
    { "path": "/home/overview/", "url": "https://3btechhub.github.io/3btechhub/home/overview/" },
    { "path": "/account/", "url": "https://3btechhub.github.io/3btechhub/account/" },
    { "path": "/account/login/", "url": "https://3btechhub.github.io/3btechhub/account/login/" },
    { "path": "/account/profile/", "url": "https://3btechhub.github.io/3btechhub/account/profile/" },
    { "path": "/dashboard/", "url": "https://3btechhub.github.io/3btechhub/dashboard/" },
    { "path": "/dashboard/overview/", "url": "https://3btechhub.github.io/3btechhub/dashboard/overview/" }
  ]'::jsonb;
begin
  for item in select value->>'path' as page_path, value->>'url' as page_url from jsonb_array_elements(page_list)
  loop
    response_status := null;
    response_body := null;
    response_error := null;

    begin
      select result.status, result.content
        into response_status, response_body
      from extensions.http_get(item.page_url) as result;

      if response_status <> 200 or response_body is null then
        response_error := 'HTTP request did not return a successful page.';
      end if;
    exception when others then
      response_error := sqlstate || ': ' || sqlerrm;
    end;

    insert into public.site_skeleton_cache
      (page_path, page_url, source_html, source_hash, scanned_at, http_status, error_message)
    values
      (
        item.page_path,
        item.page_url,
        case when response_status = 200 then response_body else null end,
        case when response_status = 200 then encode(extensions.digest(convert_to(response_body, 'UTF8'), 'sha256'), 'hex') else null end,
        now(),
        response_status,
        response_error
      )
    on conflict (page_path) do update set
      page_url = excluded.page_url,
      source_html = coalesce(excluded.source_html, public.site_skeleton_cache.source_html),
      source_hash = coalesce(excluded.source_hash, public.site_skeleton_cache.source_hash),
      scanned_at = excluded.scanned_at,
      http_status = excluded.http_status,
      error_message = excluded.error_message;
  end loop;
end;
$function$;

revoke all on function private.refresh_site_skeleton_cache() from public, anon, authenticated;

do $block$
begin
  if exists (select 1 from cron.job where jobname = 'site-skeleton-structure-scan') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'site-skeleton-structure-scan';
  end if;
  perform cron.schedule(
    'site-skeleton-structure-scan',
    '* * * * *',
    'select private.refresh_site_skeleton_cache();'
  );
end;
$block$;
