(() => {
"use strict";
window.__3bComponents=window.__3bComponents||{};
window.__3bComponents.itemCard={
render({item,tag="a",href="",visibility=null,imageUrl="",icon="",iconUrl="",onClick=null,selected=false,size="medium"}){
const card=document.createElement(tag);const cardSize=["small","medium","large"].includes(size)?size:"medium";card.className="ui-item-card ui-size-"+cardSize+(selected?" is-selected":"");
if(tag==="a")card.href=href;if(tag==="button"){card.type="button";card.setAttribute("aria-pressed",String(selected));}
const content=document.createElement("div");content.className="ui-item-card-content";
const title=document.createElement("h2");title.className="ui-item-card-title";title.textContent=item.name||"";content.appendChild(title);
if(visibility!==null){const roles=document.createElement("div");roles.className="ui-item-card-visibility";roles.textContent=visibility;content.appendChild(roles);}
const media=document.createElement("div");media.className="ui-item-card-media";
if(imageUrl){const image=document.createElement("img");image.src=imageUrl;image.alt="";image.loading="lazy";media.appendChild(image);}
else if(icon){const glyph=document.createElement("span");glyph.textContent=icon;glyph.setAttribute("aria-hidden","true");media.appendChild(glyph);}
else if(iconUrl){const glyph=document.createElement("span");glyph.className="ui-tile-svg-icon";glyph.style.webkitMaskImage='url("'+iconUrl+'")';glyph.style.maskImage='url("'+iconUrl+'")';media.appendChild(glyph);}
card.append(content,media);if(typeof onClick==="function")card.addEventListener("click",onClick);return card;
}};
})();