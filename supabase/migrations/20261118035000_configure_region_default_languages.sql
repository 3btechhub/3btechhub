update public."Settings"
set setting_value = jsonb_set(
  setting_value,
  '{regions}',
  coalesce((
    select jsonb_agg(
      case
        when region ? 'default_language' then region
        else region || jsonb_build_object(
          'default_language',
          case region->>'value'
            when 'bangladesh' then 'bn'
            when 'saudi-arabia' then 'ar'
            else 'en'
          end
        )
      end
      order by ord
    )
    from jsonb_array_elements(setting_value->'regions') with ordinality as r(region,ord)
  ), '[]'::jsonb),
  true
)
where setting_key='preference_options';
