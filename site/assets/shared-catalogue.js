import { createIcon, getModuleIcon, getItemFallbackIcon } from "./icon-utils.js";
const el=(tag,cls="",text="")=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
const ROUTES={what_we_do:"what-we-do",services:"services",products:"products",workshops:"workshops",technicians:"technicians",contacts:"contacts",countries:"countries",languages:"languages",media:"media"};
function moduleRoute(module){return module.slug||ROUTES[module.module_key]||module.module_key.replace(/_/g,"-");}
function value(item,key){return item?.field_values?.[key];}
function card(item,module){
 const a=el("a","home-content-card");const route=moduleRoute(module);
 if(item.slug)a.href="/3btechhub/"+encodeURIComponent(route)+"/"+encodeURIComponent(item.slug)+"/";
 const visual=el("div","home-content-visual");
 const photo=value(item,"photo_url")||(Array.isArray(value(item,"gallery_urls"))?value(item,"gallery_urls")[0]:"");
 visual.append(getItemFallbackIcon(item.title,module.module_key));
 if(photo){const img=el("img");img.src=photo;img.alt="";img.loading="lazy";img.addEventListener("error",()=>img.remove(),{once:true});visual.append(img);}
 const body=el("div","home-content-card-body");body.append(el("h3","",item.title));
 const desc=value(item,"short_info")||value(item,"description");if(desc)body.append(el("p","",String(desc).slice(0,180)));
 a.append(visual,body);return a;
}
function renderField(root,label,valueText){
 if(valueText===null||valueText===undefined||valueText==="")return;
 const row=el("div","catalogue-detail-field");row.append(el("strong","",label),el("span","",Array.isArray(valueText)?valueText.join(", "):String(valueText)));root.append(row);
}
export async function initSharedCataloguePage(supabase,moduleSlug,recordSlug){
 const root=document.getElementById("catalogue-root");if(!root)return;root.replaceChildren();
 const {data:module,error:moduleError}=await supabase.from("modules").select("*").eq("slug",moduleSlug).eq("status","published").maybeSingle();
 if(moduleError||!module){root.append(el("h1","catalogue-title","Page not found"));return;}
 const {data:fields}=await supabase.from("module_fields").select("*").eq("module_id",module.id).eq("is_active",true).order("sort_order");
 if(recordSlug){
  let query=supabase.from("content_items").select("*").eq("module_id",module.id).eq("slug",recordSlug).in("status",["active","published"]);
  let {data:item,error}=await query.maybeSingle();
  if(!item&&!error&&/^[0-9a-f-]{36}$/i.test(recordSlug)){const result=await supabase.from("content_items").select("*").eq("module_id",module.id).eq("id",recordSlug).maybeSingle();item=result.data;error=result.error;}
  if(error||!item){root.append(el("h1","catalogue-title","Content not found"));return;}
  root.append(el("h1","catalogue-title",item.title));
  const gallery=value(item,"gallery_urls");const photo=value(item,"photo_url")||(Array.isArray(gallery)?gallery[0]:"");
  if(photo){const img=el("img","catalogue-detail-image");img.src=photo;img.alt=item.title;root.append(img);}
  renderField(root,"Description",value(item,"description"));
  renderField(root,"Information",value(item,"short_info"));
  for(const f of fields||[]){
   if(["title","slug","relation","photo_url","gallery_urls","description","short_info","visibility_roles"].includes(f.field_key))continue;
   renderField(root,f.label,value(item,f.field_key));
  }
  if(Array.isArray(gallery)&&gallery.length>1){const grid=el("div","catalogue-gallery");gallery.forEach(url=>{const img=el("img");img.src=url;img.alt=item.title;img.loading="lazy";grid.append(img);});root.append(grid);}
  const {data:rels}=await supabase.from("relations").select("*").or("item_a_id.eq."+item.id+",item_b_id.eq."+item.id);
  const relatedIds=[...new Set((rels||[]).map(r=>r.item_a_id===item.id?r.item_b_id:r.item_a_id))];
  if(relatedIds.length){
   const {data:related}=await supabase.from("content_items").select("id,title,slug,module_id,field_values").in("id",relatedIds);
   const moduleIds=[...new Set((related||[]).map(x=>x.module_id))];
   const {data:relatedModules}=await supabase.from("modules").select("*").in("id",moduleIds);
   const moduleById=new Map((relatedModules||[]).map(m=>[m.id,m]));
   const grouped=new Map();
   for(const item of related||[]){const m=moduleById.get(item.module_id);if(!m)continue;if(!grouped.has(m.id))grouped.set(m,[]);grouped.get(m).push(item);}
   for(const [m,items] of grouped){const section=el("section","catalogue-related-section");section.append(el("h2","",m.name));const cards=el("div","home-card-grid");items.forEach(x=>cards.append(card(x,m)));section.append(cards);root.append(section);}
  }
  return;
 }
 root.classList.add("catalogue-listing-page");
 const heading=el("h1","catalogue-title",module.name);heading.prepend(createIcon(getModuleIcon(module.module_key)));root.append(heading);
 const {data:items,error}=await supabase.from("content_items").select("*").eq("module_id",module.id).in("status",["active","published"]).order("sort_order").order("created_at",{ascending:false});
 if(error){root.append(el("p","muted","Could not load "+module.name.toLowerCase()+"."));return;}
 const grid=el("div","home-card-grid catalogue-results-grid");
 if(!(items||[]).length)grid.append(el("p","home-empty","No "+module.name.toLowerCase()+" available yet."));
 else (items||[]).forEach(item=>grid.append(card(item,module)));
 root.append(grid);
}
