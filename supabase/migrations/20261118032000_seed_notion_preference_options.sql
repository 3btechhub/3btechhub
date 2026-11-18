insert into public."Settings"(setting_key,setting_value,visibility_roles,description)
values (
 'preference_options',
 '{
   "regions":[{"label":"Global","value":"global"},{"label":"Bangladesh","value":"bangladesh"},{"label":"Saudi Arabia","value":"saudi-arabia"}],
   "languages":[{"label":"English","value":"en"},{"label":"Bangla","value":"bn"},{"label":"Arabic","value":"ar"}],
   "devices":[{"label":"Mobile","value":"mobile"},{"label":"Tablet","value":"tablet"},{"label":"Computer","value":"computer"}],
   "platforms":[{"label":"Website","value":"website"},{"label":"Android Application","value":"android-application"},{"label":"iPhone Application","value":"iphone-application"},{"label":"Computer Application","value":"computer-application"}],
   "themes":[{"label":"Classic","value":"classic"},{"label":"Modern","value":"modern"},{"label":"Future","value":"future"}]
 }'::jsonb,
 array['owner','visitor']::text[],
 'Website preference options from Notion master specification'
)
on conflict(setting_key) do update set
 setting_value=excluded.setting_value,
 visibility_roles=excluded.visibility_roles,
 description=excluded.description;
