export function initSiteIcons(supabase){
 const cache=new Map();
 const allowedTags=new Set(["svg","g","path","circle","rect","line","polyline","polygon","ellipse"]);
 const allowedAttrs=new Set(["viewBox","xmlns","fill","stroke","stroke-width","stroke-linecap","stroke-linejoin","d","cx","cy","r","x","y","width","height","points","rx","ry","fill-rule","clip-rule","transform"]);
 function cleanSvg(source){
  const doc=new DOMParser().parseFromString(source,"image/svg+xml"),root=doc.documentElement;
  if(root.tagName.toLowerCase()!=="svg"||doc.querySelector("parsererror"))return null;
  const clean=node=>{
   [...node.attributes].forEach(attr=>{if(!allowedAttrs.has(attr.name))node.removeAttribute(attr.name)});
   [...node.children].forEach(child=>{if(!allowedTags.has(child.tagName.toLowerCase()))child.remove();else clean(child)});
  };
  clean(root);root.setAttribute("aria-hidden","true");root.setAttribute("focusable","false");
  return document.importNode(root,true);
 }
 function apply(){
  document.querySelectorAll("[data-site-icon]").forEach(target=>{
   const key=target.dataset.siteIcon,code=cache.get(key);
   if(!code)return;
   const svg=cleanSvg(code);if(!svg)return;
   target.replaceChildren(svg);
   target.classList.add("site-icon");
  });
 }
 async function refresh(){
  const {data,error}=await supabase.from("site_svg_icons").select("icon_key,svg_code").eq("is_active",true);
  if(error){console.warn("SVG icon library unavailable:",error.message);return}
  cache.clear();(data||[]).forEach(item=>cache.set(item.icon_key,item.svg_code));apply();
  window.dispatchEvent(new CustomEvent("3b:icons-updated"));
 }
 window.addEventListener("3b:global-update",refresh);
 const controller={refresh,apply};
 window.siteIcons=controller;
 refresh();
 return controller;
}
