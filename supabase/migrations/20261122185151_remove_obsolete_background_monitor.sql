do $$
declare
  job_id bigint;
begin
  for job_id in
    select jobid
    from cron.job
    where jobname = 'site-skeleton-structure-scan'
  loop
    perform cron.unschedule(job_id);
  end loop;
end;
$$;

drop function if exists private.refresh_site_skeleton_cache();
drop table if exists public.site_skeleton_cache;
drop extension if exists http;
