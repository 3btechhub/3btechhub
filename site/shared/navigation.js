(()=>{
const base=location.hostname.endsWith('github.io')?'/3btechhub':'';
const path=p=>base+p;
const style=document.createElement('style');
style.textContent='.menu-panel{position:fixed;right:20px;bottom:88px;z-index:9;display:grid;min-width:180px;gap:4px;padding:8px;border:1px solid #fff;border-radius:24px;background:radial-gradient(ellipse at 18% 0%,#fff,transparent 58%),linear-gradient(145deg,#fffffffA,#f2f2f2f5);box-shadow:var(--shadow),inset 0 1px #fff;backdrop-filter:blur(16px)}.menu-panel[hidden]{display:none}.menu-link{display:block;width:100%;padding:12px 14px;border:0;border-radius:14px;background:transparent;color:inherit;text-align:left;text-decoration:none}.menu-action{font:inherit;cursor:pointer}.menu-link:hover,.menu-link:focus-visible,.menu-link[aria-current=page]{background:var(--gray-100);outline:none}.menu-toggle{position:fixed;right:20px;bottom:20px;z-index:10;display:grid;width:58px;height:58px;place-items:center;padding:0;border:1px solid #ffffff77;border-radius:999px;background:radial-gradient(ellipse at 28% 10%,#ffffff5c,transparent 44%),linear-gradient(145deg,#333,#111 72%);color:#fff;box-shadow:var(--float),inset 0 1px 1px #ffffff47,inset 0 -2px 4px #0005;-webkit-tap-highlight-color:transparent}.menu-toggle svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}.close-icon{display:none}.menu-toggle[aria-expanded=true] .menu-icon{display:none}.menu-toggle[aria-expanded=true] .close-icon{display:block}';
document.head.append(style);
const nav=document.createElement('nav');nav.className='menu-panel';nav.id='navigation';nav.setAttribute('aria-label','Main navigation');nav.hidden=true;
nav.innerHTML='<a class="menu-link" id="menu-root" href="'+path('/home')+'">Home</a><a class="menu-link" id="menu-access" href="'+path('/account')+'">Account</a><a class="menu-link" id="menu-private" href="'+path('/dashboard')+'">Dashboard</a><button class="menu-link menu-action" id="menu-logout" type="button" hidden>Logout</button><span id="menu-maintenance" hidden></span>';
const toggle=document.createElement('button');toggle.className='menu-toggle';toggle.type='button';toggle.setAttribute('aria-label','Open menu');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','navigation');toggle.innerHTML='<svg class="menu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><svg class="close-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
document.body.append(nav,toggle);
function setMenu(open){toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close menu':'Open menu');nav.hidden=!open}
function update(section){const current=section==='authentication'?'account':section==='private'?'dashboard':'home';[['menu-root','home'],['menu-access','account'],['menu-private','dashboard']].forEach(([id,key])=>{const a=document.getElementById(id);a.href=path('/'+key);if(current===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('pointerdown',e=>{if(toggle.getAttribute('aria-expanded')==='true'&&!nav.contains(e.target)&&!toggle.contains(e.target))setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
window.SiteNavigation={setMenu,update};
})();
