export function initSitePreferences(supabase){
 const defaults={direction:"ltr",language:"en"};
 const labels={en:"English",bn:"বাংলা",ar:"العربية"};
 function apply(values){
  const direction=values.direction==="rtl"?"rtl":"ltr";
  const language=["en","bn","ar"].includes(values.language)?values.language:"en";
  const root=document.documentElement;
  root.setAttribute("dir",direction);
  root.setAttribute("lang",language);
  root.dataset.direction=direction;
  root.dataset.language=language;
  window.dispatchEvent(new CustomEvent("3b:preferences-applied",{detail:{direction,language}}));
 }
 async function refresh(){
  const {data,error}=await supabase.from("site_preferences").select("preference_key,preference_value");
  if(error){console.warn("Site preferences unavailable:",error.message);apply(defaults);return}
  const values={...defaults};
  (data||[]).forEach(row=>{values[row.preference_key]=row.preference_value});
  apply(values);
  return values;
 }
 const channel=supabase.channel("site-preferences-global").on("postgres_changes",{event:"*",schema:"public",table:"site_preferences"},()=>refresh()).subscribe();
 const api={refresh,apply};
 window.sitePreferences=api;
 refresh();
 return api;
}
