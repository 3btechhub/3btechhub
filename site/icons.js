export function initSiteIcons(supabase){
 if(window.__3bSiteIcons){window.__3bSiteIcons.refresh();return window.__3bSiteIcons}
 const cache=new Map();let refreshPromise=null;
 const allowedTags=new Set(["svg","g","path","circle","rect","line","polyline","polygon","ellipse"]);
 const allowedAttrs=new Set(["viewBox","xmlns","fill","stroke","stroke-width","stroke-linecap","stroke-linejoin","d","cx","cy","r","x","y","width","height","points","rx","ry","fill-rule","clip-rule","transform"]);
 const nameRules=[
  [/^(home|homepage)$/,"nav.home"],[/^(account|profile|user)$/,"nav.account"],[/^(dashboard|overview)$/,"nav.dashboard"],
  [/^(services?|service type|repair|repairs|maintenance|installation|setup)$/,"module.services"],
  [/^(products?|product type|sales|buy|sell)$/,"module.products"],
  [/^(providers?|technicians?|mechanics?|mechanicians?)$/,"module.providers"],
  [/^(hubs?|service hubs?|workshops?)$/,"module.hubs"],[/^(contacts?|contact information|phone|mobile)$/,"module.contacts"],
  [/^(images?|photos?|picture|pictures)$/,"module.images"],[/^(videos?|video)$/,"module.videos"],
  [/^(settings?|customization)$/,"dashboard.settings"],[/^(administration|users?|roles?|permissions?)$/,"dashboard.administration"],
  [/^(relations?|relationships?)$/,"dashboard.content"],[/^(region|location|address|country|countries)$/,"field.location"],
  [/^(language|languages?)$/,"field.name"],[/^(theme|dark mode)$/,"theme.dark"],[/^(light mode)$/,"theme.light"],
  [/^(email|e-mail)$/,"field.email"],[/^(password)$/,"field.password"],[/^(name|title)$/,"field.name"],
  [/^(visibility|visible|status)$/,"field.visibility"],[/^(image|photo|upload)$/,"field.image"],
  [/^(create|add|new|create form)$/,"action.create"],[/^(edit|update)$/,"action.edit"],[/^(delete|remove)$/,"action.delete"],
  [/^(save|submit|save relations)$/,"action.save"],[/^(cancel|close|hide)$/,"action.cancel"],[/^(logout|sign out)$/,"action.logout"],
  [/^(search|view all|see all|existed list)$/,"action.search"],[/^(login|sign in)$/,"layout.login"],
  [/^(direction|ltr|rtl)$/,"layout.home"],[/^(svg icons|media)$/,"media.photo"]
 ];
 const semanticRules=[
  [/\b(home|homepage)\b/,"nav.home"],[/\b(account|profile|user)\b/,"nav.account"],
  [/\b(dashboard|overview)\b/,"nav.dashboard"],[/\b(service|repair|repairs|maintenance|installation|setup)\b/,"module.services"],
  [/\b(product|products|sales|buy|sell)\b/,"module.products"],[/\b(provider|technician|mechanic|mechanician)\b/,"module.providers"],
  [/\b(hub|workshop|branch)\b/,"module.hubs"],[/\b(contact|phone|mobile|whatsapp)\b/,"module.contacts"],
  [/\b(video|videos)\b/,"module.videos"],[/\b(image|images|photo|photos|picture)\b/,"module.images"],
  [/\b(region|location|address|country|map)\b/,"field.location"],[/\b(email|e-mail)\b/,"field.email"],
  [/\b(password)\b/,"field.password"],[/\b(name|title)\b/,"field.name"],[/\b(visibility|visible|status|role|permission)\b/,"field.visibility"],
  [/\b(create|add|new)\b/,"action.create"],[/\b(edit|update)\b/,"action.edit"],[/\b(delete|remove)\b/,"action.delete"],
  [/\b(save|submit)\b/,"action.save"],[/\b(cancel|close|hide)\b/,"action.cancel"],[/\b(search|view all|see all|list)\b/,"action.search"],
  [/\b(setting|customization)\b/,"dashboard.settings"],[/\b(administration|users|roles|permissions)\b/,"dashboard.administration"],
  [/\b(relation|relationship)\b/,"dashboard.content"],[/\b(language|languages)\b/,"field.name"],[/\b(theme|dark mode)\b/,"theme.dark"]
 ];
 const namedSelector="h1,h2,h3,h4,h5,h6,button,a,label,[role='button'],.dashboard__item > span:first-child,.content__field,.content__field > strong,.home__image-caption,.content__title,.content__item,.content__external,.content__back,.content__home,.home__view-all-card,.home__map-link,.dashboard__empty,.dashboard__hint,.dashboard__status,.home__status,.content__empty";
 const leafSelector="span,p,strong,small,li,dt,dd,th,td,legend,summary,output";
 function visibleText(target){
  const direct=[...target.childNodes].filter(n=>n.nodeType===3).map(n=>n.nodeValue||"").join(" ").trim();
  return (direct||target.innerText||target.textContent||"").replace(/\s+/g," ").trim();
 }
 function keyForName(value){
  const name=String(value||"").replace(/\s+/g," ").replace(/[：:]+$/,"").trim().toLowerCase();
  if(!name)return "status.info";
  const exact=nameRules.find(([pattern])=>pattern.test(name));
  if(exact)return exact[1];
  return semanticRules.find(([pattern])=>pattern.test(name))?.[1]||"status.info";
 }
 function decorate(scope=document){
  const candidates=[];
  if(scope.matches?.(namedSelector)||scope.matches?.(leafSelector))candidates.push(scope);
  scope.querySelectorAll?.(namedSelector+","+leafSelector).forEach(node=>candidates.push(node));
  candidates.forEach(target=>{
   if(target.closest("[data-site-icon]")||target.querySelector("[data-site-icon],svg,img"))return;
   if(target.querySelector(namedSelector))return;
   const isNamed=target.matches(namedSelector);
   if(!isNamed&&target.parentElement?.closest(namedSelector))return;
   const text=visibleText(target);
   if(!text||text.length>72||text.split(/\s+/).length>7)return;
   if(!isNamed&&/[.!?;。！？]/.test(text))return;
   const existing=target.querySelector(":scope > [data-site-icon]");
   if(existing)return;
   const icon=document.createElement("span");
   icon.dataset.siteIcon=keyForName(text);
   icon.setAttribute("aria-hidden","true");
   icon.className="site-icon site-icon--automatic";
   target.append(icon);
   target.dataset.iconDecorated="true";
  });
 }
 function cleanSvg(source){
  const doc=new DOMParser().parseFromString(String(source||""),"image/svg+xml"),root=doc.documentElement;
  if(root.tagName.toLowerCase()!=="svg"||doc.querySelector("parsererror"))return null;
  const clean=node=>{
   [...node.attributes].forEach(a=>{if(!allowedAttrs.has(a.name))node.removeAttribute(a.name)});
   [...node.children].forEach(child=>{if(!allowedTags.has(child.tagName.toLowerCase()))child.remove();else clean(child)});
  };
  clean(root);root.setAttribute("aria-hidden","true");root.setAttribute("focusable","false");
  return document.importNode(root,true);
 }
 function apply(scope=document){
  decorate(scope);
  const targets=[];
  if(scope.matches?.("[data-site-icon]"))targets.push(scope);
  scope.querySelectorAll?.("[data-site-icon]").forEach(node=>targets.push(node));
  targets.forEach(target=>{
   const code=cache.get((target.dataset.siteIcon||"").trim());
   if(!code)return;
   const svg=cleanSvg(code);if(!svg)return;
   target.replaceChildren(svg);target.classList.add("site-icon");
  });
 }
 async function refresh(){
  if(refreshPromise)return refreshPromise;
  refreshPromise=(async()=>{
   const {data,error}=await supabase.from("site_svg_icons").select("icon_key,svg_code").eq("is_active",true);
   if(error){console.warn("SVG icon library unavailable:",error.message);return false}
   cache.clear();(data||[]).forEach(item=>cache.set(item.icon_key,item.svg_code));
   apply(document);window.dispatchEvent(new CustomEvent("3b:icons-updated"));return true;
  })().finally(()=>{refreshPromise=null});
  return refreshPromise;
 }
 const observer=new MutationObserver(records=>records.forEach(record=>{
  if(record.type==="characterData"&&record.target.parentElement)apply(record.target.parentElement);
  record.addedNodes.forEach(node=>{if(node.nodeType===1)apply(node);else if(node.nodeType===3&&node.parentElement)apply(node.parentElement)});
  if(record.type==="attributes"&&record.target.matches?.("[data-site-icon]"))apply(record.target);
 }));
 observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["data-site-icon"],characterData:true});
 window.addEventListener("3b:global-update",refresh);
 const controller={refresh,apply};window.__3bSiteIcons=controller;window.siteIcons=controller;refresh();return controller;
}
