export function initSiteIcons(supabase){
 if(window.__3bSiteIcons){window.__3bSiteIcons.refresh();return window.__3bSiteIcons}
 const cache=new Map();let refreshPromise=null;
 const allowedTags=new Set(["svg","g","path","circle","rect","line","polyline","polygon","ellipse"]);
 const allowedAttrs=new Set(["viewBox","xmlns","fill","stroke","stroke-width","stroke-linecap","stroke-linejoin","d","cx","cy","r","x","y","width","height","points","rx","ry","fill-rule","clip-rule","transform"]);
 const iconNames=[
  [/^(home|homepage)$/,"nav.home"],[/^(account|profile|user)$/,"nav.account"],[/^(dashboard|overview)$/,"nav.dashboard"],
  [/^(services?|service type)$/,"module.services"],[/^(products?|product type)$/,"module.products"],[/^(providers?|technicians?|mechanics?)$/,"module.providers"],
  [/^(hubs?|service hubs?|workshops?)$/,"module.hubs"],[/^(contacts?|contact information)$/,"module.contacts"],
  [/^(images?|photos?)$/,"module.images"],[/^(videos?)$/,"module.videos"],
  [/^(settings?|customization)$/,"dashboard.settings"],[/^(administration|users?|roles?|permissions?)$/,"dashboard.administration"],
  [/^(relations?|relationships?)$/,"dashboard.content"],[/^(region|location|address)$/,"field.location"],
  [/^(language|languages?)$/,"field.name"],[/^(theme|dark mode|light mode)$/,"theme.dark"],
  [/^(email|e-mail)$/,"field.email"],[/^(password)$/,"field.password"],[/^(name|title)$/,"field.name"],
  [/^(visibility|visible|status)$/,"field.visibility"],[/^(image|photo|upload)$/,"field.image"],
  [/^(create|add|new)$/,"action.create"],[/^(edit|update)$/,"action.edit"],[/^(delete|remove)$/,"action.delete"],
  [/^(save|submit)$/,"action.save"],[/^(cancel|close|hide)$/,"action.cancel"],[/^(logout|sign out)$/,"action.logout"],
  [/^(search|view all|see all)$/,"action.search"],[/^(login|sign in)$/,"layout.login"]
 ];
 function keyForName(value){
  const name=String(value||"").replace(/\\s+/g," ").replace(/[：:：]+$/,"").trim().toLowerCase();
  if(!name)return "status.info";
  return iconNames.find(([pattern])=>pattern.test(name))?.[1]||"status.info";
 }
 const namedSelector="h1,h2,h3,h4,h5,h6,button,a,label,.dashboard__item > span:first-child,.content__field";
 function decorate(scope=document){
  const candidates=[];
  if(scope.matches?.(namedSelector))candidates.push(scope);
  scope.querySelectorAll?.(namedSelector).forEach(node=>candidates.push(node));
  candidates.forEach(target=>{
   if(target.closest("[data-site-icon]")||target.querySelector("[data-site-icon],svg,img, input,select,textarea"))return;
   if(target.querySelector(namedSelector))return;
   const text=(target.innerText||target.textContent||"").replace(/\\s+/g," ").trim();
   if(!text||target.dataset.iconDecorated==="true")return;
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
  const clean=node=>{[...node.attributes].forEach(a=>{if(!allowedAttrs.has(a.name))node.removeAttribute(a.name)});[...node.children].forEach(child=>{if(!allowedTags.has(child.tagName.toLowerCase()))child.remove();else clean(child)})};
  clean(root);root.setAttribute("aria-hidden","true");root.setAttribute("focusable","false");return document.importNode(root,true);
 }
 function apply(scope=document){
  decorate(scope);
  const targets=[];if(scope.matches?.("[data-site-icon]"))targets.push(scope);scope.querySelectorAll?.("[data-site-icon]").forEach(n=>targets.push(n));
  targets.forEach(target=>{const code=cache.get((target.dataset.siteIcon||"").trim());if(!code)return;const svg=cleanSvg(code);if(!svg)return;target.replaceChildren(svg);target.classList.add("site-icon")});
 }
 async function refresh(){
  if(refreshPromise)return refreshPromise;
  refreshPromise=(async()=>{const {data,error}=await supabase.from("site_svg_icons").select("icon_key,svg_code").eq("is_active",true);if(error){console.warn("SVG icon library unavailable:",error.message);return false}cache.clear();(data||[]).forEach(x=>cache.set(x.icon_key,x.svg_code));apply(document);window.dispatchEvent(new CustomEvent("3b:icons-updated"));return true})().finally(()=>{refreshPromise=null});
  return refreshPromise;
 }
 const observer=new MutationObserver(records=>records.forEach(record=>{
  if(record.type==="characterData"){const parent=record.target.parentElement;if(parent)apply(parent)}
  record.addedNodes.forEach(node=>{if(node.nodeType===1)apply(node);else if(node.nodeType===3&&node.parentElement)apply(node.parentElement)});
  if(record.type==="attributes"&&record.target.matches?.("[data-site-icon]"))apply(record.target);
 }));
 observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["data-site-icon"],characterData:true});
 window.addEventListener("3b:global-update",refresh);
 const controller={refresh,apply};window.__3bSiteIcons=controller;window.siteIcons=controller;refresh();return controller;
}
