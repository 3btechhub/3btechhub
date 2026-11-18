(() => {
  "use strict";
  const button=document.querySelector(".menu-trigger");
  const menu=document.querySelector("#site-menu");
  if(!button||!menu)return;
  const originalIcon=button.querySelector(".menu-icon")?.cloneNode(true);
  let logoUrl="",logoTitle="3B TECH HUB",swapSeconds=5,transitionMs=1400;
  let idleTimer=null,cycleTimer=null,renderTimer=null,showingLogo=false;
  const clearTimers=()=>{if(idleTimer)clearTimeout(idleTimer);if(cycleTimer)clearInterval(cycleTimer);idleTimer=null;cycleTimer=null;};
  function render(kind){
    if(!menu.hidden&&kind==="logo")return;
    const nextKind=kind==="logo";
    if(showingLogo===nextKind&&button.querySelector(nextKind?".menu-logo":".menu-icon"))return;
    showingLogo=nextKind;
    button.style.setProperty("--menu-icon-transition",transitionMs+"ms");
    button.classList.add("is-fading-icon");
    if(renderTimer)clearTimeout(renderTimer);
    renderTimer=setTimeout(()=>{
      let next;
      if(showingLogo){
        next=document.createElement("span");next.className="menu-logo";
        if(logoUrl&&/^https?:\/\//i.test(logoUrl)){
          const img=document.createElement("img");img.src=logoUrl;img.alt=logoTitle;img.loading="eager";next.append(img);
        }else{const mark=document.createElement("span");mark.className="brand-mark";mark.textContent="3B";next.append(mark);}
      }else next=originalIcon?.cloneNode(true);
      if(next)button.replaceChildren(next);
      requestAnimationFrame(()=>button.classList.remove("is-fading-icon"));
      renderTimer=null;
    },Math.max(120,Math.round(transitionMs/2)));
  }
  function scheduleIdle(){
    clearTimers();
    if(!menu.hidden||document.hidden)return;
    idleTimer=setTimeout(()=>{
      if(!menu.hidden||document.hidden)return;
      render("logo");
      cycleTimer=setInterval(()=>{
        if(!menu.hidden||document.hidden){clearTimers();return;}
        render(showingLogo?"icon":"logo");
      },swapSeconds*1000);
    },swapSeconds*1000);
  }
  function closeMenu(restoreFocus=false){
    if(menu.hidden){scheduleIdle();return;}
    menu.hidden=true;
    button.classList.remove("is-open");
    button.setAttribute("aria-expanded","false");
    button.setAttribute("aria-label","Open menu");
    if(restoreFocus)button.focus({preventScroll:true});
    scheduleIdle();
  }
  button.addEventListener("click",event=>{
    event.stopPropagation();
    clearTimers();
    const opening=menu.hidden;
    if(opening){
      menu.hidden=false;
      button.classList.add("is-open");
      button.setAttribute("aria-expanded","true");
      button.setAttribute("aria-label","Close menu");
      render("icon");
      requestAnimationFrame(()=>menu.querySelector("a:not([hidden]),button:not([hidden]),select")?.focus({preventScroll:true}));
    }else closeMenu(true);
  });
  menu.addEventListener("click",event=>{
    event.stopPropagation();
    if(event.target.closest("a.menu-link,button#logout-menu-link"))closeMenu();
  });
  document.addEventListener("click",event=>{
    if(!menu.hidden&&!menu.contains(event.target)&&!button.contains(event.target))closeMenu();
  });
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&!menu.hidden){event.preventDefault();closeMenu(true);}
    if(event.key==="Tab"&&!menu.hidden){
      const focusable=[...menu.querySelectorAll("a:not([hidden]),button:not([hidden]),select:not([disabled])")];
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  document.addEventListener("visibilitychange",scheduleIdle);
  window.addEventListener("site-brand-settings-updated",event=>{
    const data=event.detail||{};
    logoUrl=typeof data.logoUrl==="string"?data.logoUrl:"";
    logoTitle=typeof data.title==="string"&&data.title.trim()?data.title.trim():"3B TECH HUB";
    const settings=data.navigationMenu||{};
    swapSeconds=Math.max(5,Math.min(60,Number(settings.logo_swap_interval_seconds)||5));
    transitionMs=Math.max(300,Math.min(5000,Number(settings.icon_transition_speed_ms)||1400));
    button.style.setProperty("--menu-icon-transition",transitionMs+"ms");
    if(showingLogo&&!menu.hidden)render("icon");
    else if(showingLogo)render("logo");
    scheduleIdle();
  });
  scheduleIdle();
})();