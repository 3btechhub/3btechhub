(()=>{const script=document.currentScript;const base=new URL(".",script.src);const menu=document.createElement("nav");menu.className="floating-navigation";menu.setAttribute("aria-label","Main navigation");menu.innerHTML=`
<ul class="floating-navigation__list" id="page-navigation">
<li><a href="${base.href}">Index</a></li>
<li><a href="${new URL("home/",base).href}">Home</a></li>
<li><a href="${new URL("account/",base).href}">Account</a></li>
<li><a href="${new URL("dashboard/",base).href}">Dashboard</a></li>
</ul>
<button class="floating-navigation__toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="page-navigation">
<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
</button>`;
document.body.appendChild(menu);
const toggle=menu.querySelector(".floating-navigation__toggle");const icon=toggle.querySelector("svg");
const open=()=>{menu.classList.add("is-open");toggle.setAttribute("aria-expanded","true");toggle.setAttribute("aria-label","Close navigation menu");icon.innerHTML='<path d="M6 6l12 12M18 6L6 18"/>'};
const close=()=>{menu.classList.remove("is-open");toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-label","Open navigation menu");icon.innerHTML='<path d="M4 6h16M4 12h16M4 18h16"/>'};
toggle.addEventListener("click",()=>menu.classList.contains("is-open")?close():open());
document.addEventListener("click",e=>{if(!menu.contains(e.target))close()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
menu.querySelectorAll("a").forEach(link=>link.addEventListener("click",close));
})();