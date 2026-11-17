(() => {
  "use strict";
  const button=document.querySelector(".menu-trigger"),menu=document.querySelector("#site-menu");
  if(!button||!menu)return;
  const originalIcon=button.querySelector(".menu-icon")?.cloneNode(true);
  let logoUrl="",logoTitle="3B TECH HUB",swapSeconds=5,transitionMs=1400,idleTimer=null,cycleTimer=null,showingLogo=false;
  const clearTimers=()=>{if(idleTimer)clearTimeout(idleTimer);if(cycleTimer)clearInterval(cycleTimer);idleTimer=null;cycleTimer=null;};
  function render(kind){
    if(menu.hidden===false&&kind==="logo")return;
    showingLogo=kind==="logo";button.classList.toggle("is-showing-logo",showingLogo);
    button.style.setProperty("--menu-icon-transition",transitionMs+"ms");
    const next=showingLogo?document.createElement("span"):originalIcon?.cloneNode(true);
    if(showingLogo){
      next.className="menu-logo";
      if(logoUrl&&/^https?:\/\//i.test(logoUrl)){const img=document.createElement("img");img.src=logoUrl;img.alt=logoTitle;next.append(img);}
      else{const mark=document.createElement("span");mark.className="brand-mark";mark.textContent="3B";next.append(mark);}
    }
    if(!next)return;
    button.classList.add("is-fading-icon");
    window.setTimeout(()=>{button.replaceChildren(next);button.classList.remove("is-fading-icon");},Math.min(transitionMs,500));
  }
  function scheduleIdle(){
    clearTimers();if(!menu.hidden)return;
    idleTimer=window.setTimeout(()=>{
      if(!menu.hidden)return;render("logo");
      cycleTimer=window.setInterval(()=>{if(!menu.hidden){clearTimers();render("icon");return;}render(showingLogo?"icon":"logo");},swapSeconds*1000);
    },swapSeconds*1000);
  }
  function closeMenu(){menu.hidden=true;button.classList.remove("is-open");button.setAttribute("aria-expanded","false");button.setAttribute("aria-label","Open menu");scheduleIdle();}
  button.addEventListener("click",event=>{
    event.stopPropagation();clearTimers();const opening=menu.hidden;menu.hidden=!opening;button.classList.toggle("is-open",opening);button.setAttribute("aria-expanded",String(opening));button.setAttribute("aria-label",opening?"Close menu":"Open menu");render("icon");if(!opening)scheduleIdle();
  });
  menu.addEventListener("click",event=>event.stopPropagation());
  document.addEventListener("click",closeMenu);
  document.addEventListener("keydown",event=>{if(event.key==="Escape")closeMenu();});
  window.addEventListener("site-brand-settings-updated",event=>{
    const data=event.detail||{};logoUrl=typeof data.logoUrl==="string"?data.logoUrl:"";logoTitle=typeof data.title==="string"?data.title:"3B TECH HUB";const settings=data.navigationMenu||{};
    swapSeconds=Math.max(5,Math.min(60,Number(settings.logo_swap_interval_seconds)||5));transitionMs=Math.max(300,Math.min(5000,Number(settings.icon_transition_speed_ms)||1400));scheduleIdle();
  });
  scheduleIdle();
})();