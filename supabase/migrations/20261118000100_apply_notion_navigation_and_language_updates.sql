drop policy if exists settings_public_read on public."Settings";
create policy settings_public_read
on public."Settings"
for select
using (
  setting_key in ('runtime_config','site_profile','home_intro','home_modules','website_information','navigation_menu')
  and (
    setting_key = 'runtime_config'
    or private.user_can_view_visibility(visibility_roles)
  )
);
