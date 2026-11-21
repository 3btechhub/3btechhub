(()=>{
const base=location.hostname.endsWith('github.io')?'/3btechhub':'';
const path=p=>base+p;
window.SiteNavigationReady=(async()=>{
 const response=await fetch('../shared/navigation/navigation.html');
 if(!response.ok)throw new Error('Navigation component could not be loaded.');
 document.body.insertAdjacentHTML('beforeend',await response.text());
 const nav=document.getElementById('navigation'),toggle=document.querySelector('.menu-toggle');
 function setMenu(open){toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close menu':'Open menu');nav.hidden=!open}
 function update(section){const current=section==='authentication'?'account':section==='private'?'dashboard':'home';[['menu-root','home'],['menu-access','account'],['menu-private','dashboard']].forEach(([id,key])=>{const a=document.getElementById(id);a.href=path('/'+key);if(current===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
 toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
 document.addEventListener('pointerdown',e=>{if(toggle.getAttribute('aria-expanded')==='true'&&!nav.contains(e.target)&&!toggle.contains(e.target))setMenu(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
 window.SiteNavigation={setMenu,update};
})();
})();