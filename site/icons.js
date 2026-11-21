export function initSiteIcons(supabase){
 if(window.__3bSiteIcons){window.__3bSiteIcons.refresh();return window.__3bSiteIcons}
 const cache=new Map();let refreshPromise=null;
 const allowedTags=new Set(["svg","g","path","circle","rect","line","polyline","polygon","ellipse"]);
 const allowedAttrs=new Set(["viewBox","xmlns","fill","stroke","stroke-width","stroke-linecap","stroke-linejoin","d","cx","cy","r","x","y","width","height","points","rx","ry","fill-rule","clip-rule","transform"]);
 function cleanSvg(source){
  const doc=new DOMParser().parseFromString(String(source||""),"image/svg+xml"),root=doc.documentElement;
  if(root.tagName.toLowerCase()!=="svg"||doc.querySelector("parsererror"))return null;
  const clean=node=>{[...node.attributes].forEach(a=>{if(!allowedAttrs.has(a.name))node.removeAttribute(a.name)});[...node.children].forEach(child=>{if(!allowedTags.has(child.tagName.toLowerCase()))child.remove();else clean(child)})};
  clean(root);root.setAttribute("aria-hidden","true");root.setAttribute("focusable","false");return document.importNode(root,true);
 }
 function apply(scope=document){
  const targets=[];if(scope.matches?.("[data-site-icon]"))targets.push(scope);scope.querySelectorAll?.("[data-site-icon]").forEach(n=>targets.push(n));
  targets.forEach(target=>{const code=cache.get((target.dataset.siteIcon||"").trim());if(!code)return;const svg=cleanSvg(code);if(!svg)return;target.replaceChildren(svg);target.classList.add("site-icon")});
 }
 async function refresh(){
  if(refreshPromise)return refreshPromise;
  refreshPromise=(async()=>{const {data,error}=await supabase.from("site_svg_icons").select("icon_key,svg_code").eq("is_active",true);if(error){console.warn("SVG icon library unavailable:",error.message);return false}cache.clear();(data||[]).forEach(x=>cache.set(x.icon_key,x.svg_code));apply(document);window.dispatchEvent(new CustomEvent("3b:icons-updated"));return true})().finally(()=>{refreshPromise=null});
  return refreshPromise;
 }
 const observer=new MutationObserver(records=>records.forEach(record=>{record.addedNodes.forEach(node=>{if(node.nodeType===1)apply(node)});if(record.type==="attributes"&&record.target.matches?.("[data-site-icon]"))apply(record.target)}));
 observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["data-site-icon"]});
 window.addEventListener("3b:global-update",refresh);
 const controller={refresh,apply};window.__3bSiteIcons=controller;window.siteIcons=controller;refresh();return controller;
}
