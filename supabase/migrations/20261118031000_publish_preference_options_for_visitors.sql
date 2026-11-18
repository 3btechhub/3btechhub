drop policy if exists settings_public_read on public."Settings";
create policy settings_public_read on public."Settings"
for select to anon, authenticated
using (
  setting_key = any(array[
    'runtime_config',
    'site_profile',
    'home_intro',
    'home_modules',
    'website_information',
    'navigation_menu',
    'preference_options'
  ])
  and (
    setting_key='runtime_config'
    or private.user_can_view_visibility(visibility_roles)
  )
);
