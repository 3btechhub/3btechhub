import { initExtendedDashboard } from "./admin-extended.js?v=notion-20261118-7";
const $=(s,r=document)=>r.querySelector(s), el=(t,c="",v)=>{const n=document.createElement(t);if(c)n.className=c;if(v!==undefined)n.textContent=String(v);return n;};
const slug=v=>String(v||"").normalize("NFKD").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const say=(n,t,k="")=>{n.textContent=t;n.dataset.kind=k;};
const roles=["owner","admin","member","visitor"];
export async function initDynamicDashboard(supabase,root,user){
 root.innerHTML='<div class="dashboard-workspace"><header class="dashboard-workspace-header"><h1>Dashboard</h1><span></span></header><nav id="notion-tabs" class="dashboard-module-nav" role="tablist" aria-label="Dashboard layouts"></nav><section id="notion-panel" class="dashboard-workspace-main" aria-live="polite"></section><div id="notion-admin" hidden></div></div>';
 root.querySelector("header span").textContent=user?.email||"";
 const tabs=$("#notion-tabs",root),panel=$("#notion-panel",root),hidden=$("#notion-admin",root);
 const order=[["overview","Overview"],["info","Info"],["media","Media"],["relation","Relation"],["users","User"],["roles","Role"],["permissions","Permission"],["preference","Preference"],["setting","Setting"]];
 const adminNodes={};
 const admin=[
 '<section id="dashboard-admin-users"><form id="users-form" class="content-editor-form"><h3 id="users-form-title">Add user</h3><div class="module-form-grid"><label class="module-form-field"><span>Name</span><input name="title" required></label><label class="module-form-field"><span>Email</span><input name="email" type="email" required></label><div class="module-form-field"><span>Role</span><div id="user-role-options" class="module-related-options"></div></div><input name="slug" type="hidden"><input name="type" type="hidden" value="member"><input name="description" type="hidden"><input name="visibility" type="hidden" value="show"><input name="accountStatus" type="hidden" value="active"><div id="user-permission-options" hidden></div></div><div class="editor-actions"><button type="submit" id="users-submit">Create/Update</button><button type="button" id="users-cancel" data-cancel hidden>Cancel</button><button type="button" id="users-active" hidden>Active</button><button type="button" id="users-deactive" hidden>Deactive</button><button type="button" id="users-block" hidden>Block</button><button type="button" id="users-delete" class="secondary-button" hidden>Delete</button></div><p id="users-message" class="editor-message"></p></form><div id="users-list" class="admin-list"></div></section>',
 '<section id="dashboard-admin-roles"><form id="roles-form" class="content-editor-form"><h3 id="roles-form-title">Add role</h3><div class="module-form-grid"><label class="module-form-field"><span>Name</span><input name="title" required></label><div class="module-form-field"><span>User</span><div id="role-user-options" class="module-related-options"></div></div><div class="module-form-field"><span>Permission</span><div id="role-permission-options" class="module-related-options"></div></div><label class="module-form-field"><span>Visibility</span><select name="visibility"><option value="show">Show</option><option value="hide">Hide</option></select></label><input name="slug" type="hidden"><input name="type" type="hidden" value="custom"><textarea name="description" hidden></textarea></div><div class="editor-actions"><button type="submit" id="roles-submit">Create/Update</button><button type="button" id="roles-cancel" data-cancel hidden>Cancel</button><button type="button" id="roles-delete" data-delete hidden>Delete</button></div><p id="roles-message" class="editor-message"></p></form><div id="roles-list" class="admin-list"></div></section>',
 '<section id="dashboard-admin-permissions"><form id="permission-form" class="content-editor-form"><h3 id="permission-form-title">Add permission</h3><div class="module-form-grid"><label class="module-form-field"><span>Name</span><input name="title" required></label><div class="module-form-field"><span>Role</span><div id="permission-role-options" class="module-related-options"></div></div><label class="module-form-field"><span>Visibility</span><select name="visibility"><option value="show">Show</option><option value="hide">Hide</option></select></label><input name="slug" type="hidden"><select name="type" hidden><option value="read">Read</option><option value="write">Write</option></select><textarea name="description" hidden></textarea><div id="permission-user-options" hidden></div></div><div class="editor-actions"><button type="submit" id="permission-submit">Create/Update</button><button type="button" id="permission-cancel" data-cancel hidden>Cancel</button><button type="button" id="permission-delete" data-delete hidden>Delete</button></div><p id="permission-message" class="editor-message"></p></form><div id="permissions-list" class="admin-list"></div></section>'
 ];
 admin.forEach((h,i)=>{const d=el("div");d.innerHTML=h;const node=d.firstElementChild;adminNodes[["users","roles","permissions"][i]]=node;hidden.append(node);});
 try{initExtendedDashboard(supabase,user?.role||"owner");}catch(e){console.error(e);}
 order.forEach(([key,label])=>{const b=el("button","dashboard-module-tab",label);b.type="button";b.role="tab";b.dataset.key=key;b.onclick=()=>void open(key);tabs.append(b);});
 function start(key,title){tabs.querySelectorAll("button").forEach(b=>{const on=b.dataset.key===key;b.classList.toggle("is-active",on);b.setAttribute("aria-selected",String(on));});panel.replaceChildren();const p=el("div","dashboard-page");p.append(el("h2","",title));panel.append(p);return p;}
 function input(host,label,name,type="text",value="",required=false){const l=el("label","module-form-field");l.append(el("span","",label));const x=type==="textarea"?el("textarea"):el("input");if(type!=="textarea")x.type=type;if(type==="textarea")x.rows=3;x.name=name;x.value=value||"";if(required)x.required=true;l.append(x);host.append(l);return x;}
 function visibilitySelect(host){const l=el("label","module-form-field");l.append(el("span","","Visibility"));const x=el("select");x.name="visibility";x.append(new Option("Show","show"),new Option("Hide","hide"));l.append(x);host.append(l);return x;}
 async function get(table){const {data,error}=await supabase.from(table).select("*").order("sort_order").limit(1000);if(error)throw error;return data||[];}
 function listRow(host,title,detail,fn){const b=el("button","dashboard-record-row");b.type="button";b.append(el("strong","",title),el("small","",detail||""));b.onclick=fn;host.append(b);return b;}
 function sortable(row,id,rows,table,render){let dragged=null;row.draggable=true;row.addEventListener("dragstart",()=>{dragged=id;row.classList.add("is-dragging");});row.addEventListener("dragend",()=>{dragged=null;row.classList.remove("is-dragging");});row.addEventListener("dragover",e=>{if(dragged&&dragged!==id)e.preventDefault();});row.addEventListener("drop",async e=>{e.preventDefault();if(!dragged||dragged===id)return;const from=rows.findIndex(x=>x.id===dragged),to=rows.findIndex(x=>x.id===id);if(from<0||to<0)return;const [moved]=rows.splice(from,1);rows.splice(to,0,moved);dragged=null;const results=await Promise.all(rows.map((x,i)=>supabase.from(table).update({sort_order:(i+1)*10}).eq("id",x.id)));const failed=results.find(x=>x.error);if(failed)alert(failed.error.message);render();});}
 async function info(){
  const p=start("info","Info"),f=el("form","content-editor-form");f.innerHTML='<h3>Add Info</h3><div class="module-form-grid"></div><div class="editor-actions"><button>Save</button><button type="button" class="secondary-button" data-cancel>Cancel</button><button type="button" class="secondary-button" data-delete hidden>Delete</button></div><p class="editor-message"></p>';const g=$(".module-form-grid",f),name=input(g,"Name","name","text","",true),type=input(g,"Type","type"),sl=input(g,"Slug","slug"),desc=input(g,"Description","description","textarea"),vis=visibilitySelect(g);name.oninput=()=>{if(!f.dataset.id)sl.value=slug(name.value);};const search=el("input");search.type="search";search.placeholder="Search by Name or Type";const toolbar=el("div","dashboard-toolbar");toolbar.append(search);const list=el("div","dashboard-record-list");p.append(f,toolbar,list);let rows=[];
  function reset(){f.reset();f.dataset.id="";vis.value="show";$("h3",f).textContent="Add Info";$("[data-delete]",f).hidden=true;}
  function edit(r){f.dataset.id=r.id;name.value=r.name;type.value=r.type||"";sl.value=r.slug||"";desc.value=r.description||"";vis.value=r.visibility||"show";$("h3",f).textContent="Edit Info";$("[data-delete]",f).hidden=false;f.scrollIntoView({behavior:"smooth",block:"start"});}
  function render(){list.replaceChildren();const term=search.value.toLowerCase();const arr=rows.filter(r=>!term||r.name.toLowerCase().includes(term)||(r.type||"").toLowerCase().includes(term));if(!arr.length)list.append(el("p","muted","No records found."));arr.forEach(r=>{const row=listRow(list,r.name,(r.type||"")+(r.visibility==="hide"?" · Hidden":""),()=>edit(r));sortable(row,r.id,rows,"Info",render);});}
  search.oninput=render;f.onsubmit=async e=>{e.preventDefault();const b=f.querySelector("button[type=submit]")||f.querySelector("button");b.disabled=true;try{const payload={name:name.value.trim(),type:type.value.trim(),slug:slug(sl.value),description:desc.value.trim(),visibility:vis.value};if(!payload.name||!payload.slug)throw Error("Name and Slug are required.");const r=f.dataset.id?await supabase.from("Info").update(payload).eq("id",f.dataset.id):await supabase.from("Info").insert({...payload,visibility_roles:["owner","admin","member","visitor"]});if(r.error)throw r.error;reset();say($(".editor-message",f),"Saved.","success");rows=await get("Info");render();}catch(e){say($(".editor-message",f),e.message,"error");}finally{b.disabled=false;}}; $("[data-cancel]",f).onclick=reset;$("[data-delete]",f).onclick=async()=>{if(!f.dataset.id||!confirm("Delete this Info?"))return;const id=f.dataset.id;const {error:relationError}=await supabase.from("Relation").delete().or("source_id.eq."+id+",target_id.eq."+id);if(relationError){say($(".editor-message",f),relationError.message,"error");return;}const {error}=await supabase.from("Info").delete().eq("id",id);if(error){say($(".editor-message",f),error.message,"error");return;}reset();rows=await get("Info");render();};rows=await get("Info");render();
 }
 async function media(){
  const p=start("media","Media"),f=el("form","content-editor-form");f.innerHTML='<h3>Add Media</h3><div class="module-form-grid"></div><div class="editor-actions"><button>Save</button><button type="button" class="secondary-button" data-cancel>Cancel</button><button type="button" class="secondary-button" data-delete hidden>Delete</button></div><p class="editor-message"></p>';const g=$(".module-form-grid",f),name=input(g,"Name","name","text","",true),type=input(g,"Type","type"),sl=input(g,"Slug","slug"),desc=input(g,"Description","description","textarea"),file=input(g,"Image Uploader","file"),vis=visibilitySelect(g);name.oninput=()=>{if(!f.dataset.id)sl.value=slug(name.value);};const search=el("input");search.type="search";search.placeholder="Search by Name or Type";const toolbar=el("div","dashboard-toolbar");toolbar.append(search);const list=el("div","dashboard-record-list");p.append(f,toolbar,list);let rows=[];
  function reset(){f.reset();f.dataset.id="";vis.value="show";$("h3",f).textContent="Add Media";$("[data-delete]",f).hidden=true;}
  function edit(r){f.dataset.id=r.id;name.value=r.name;type.value=r.type||"";sl.value=r.slug||"";desc.value=r.description||"";vis.value=r.visibility||"show";$("h3",f).textContent="Edit Media";$("[data-delete]",f).hidden=false;}
  function render(){list.replaceChildren();const term=search.value.toLowerCase();const arr=rows.filter(r=>!term||r.name.toLowerCase().includes(term)||(r.type||"").toLowerCase().includes(term));if(!arr.length)list.append(el("p","muted","No records found."));arr.forEach(r=>{const row=listRow(list,r.name,(r.type||"")+(r.visibility==="hide"?" · Hidden":""),()=>edit(r));sortable(row,r.id,rows,"Media",render);});}
  search.oninput=render;f.onsubmit=async e=>{e.preventDefault();try{let path=null,url=null;if(file.files[0]){const x=file.files[0];path="media/"+Date.now()+"-"+x.name.replace(/[^a-z0-9._-]/gi,"-");const {error}=await supabase.storage.from("site-media").upload(path,x,{upsert:false,contentType:x.type});if(error)throw error;url=supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;}const payload={name:name.value.trim(),type:type.value.trim(),slug:slug(sl.value),description:desc.value.trim(),visibility:vis.value};if(path){payload.image_path=path;payload.image_url=url;}const r=f.dataset.id?await supabase.from("Media").update(payload).eq("id",f.dataset.id):await supabase.from("Media").insert({...payload,visibility_roles:["owner","admin","member","visitor"]});if(r.error)throw r.error;reset();say($(".editor-message",f),"Saved.","success");rows=await get("Media");render();}catch(e){say($(".editor-message",f),e.message,"error");}};$("[data-cancel]",f).onclick=reset;$("[data-delete]",f).onclick=async()=>{if(!f.dataset.id||!confirm("Delete this Media?"))return;const id=f.dataset.id;const item=rows.find(x=>x.id===id);const {error:relationError}=await supabase.from("Relation").delete().or("source_id.eq."+id+",target_id.eq."+id);if(relationError){say($(".editor-message",f),relationError.message,"error");return;}if(item?.image_path){const {error:storageError}=await supabase.storage.from("site-media").remove([item.image_path]);if(storageError){say($(".editor-message",f),storageError.message,"error");return;}}const {error}=await supabase.from("Media").delete().eq("id",id);if(error){say($(".editor-message",f),error.message,"error");return;}reset();rows=await get("Media");render();};rows=await get("Media");render();
 }
 async function relation(){
  const p=start("relation","Relation"),f=el("form","content-editor-form");f.innerHTML='<h3>Create Relation</h3><div class="module-form-grid"><label class="module-form-field"><span>Source Type</span><select name="st"><option>Info</option><option>Media</option></select></label><label class="module-form-field"><span>Source Name</span><select name="si"></select></label><label class="module-form-field"><span>Target Type</span><select name="tt"><option>Info</option><option>Media</option></select></label><label class="module-form-field"><span>Target Name</span><select name="ti"></select></label></div><div class="editor-actions"><button type="submit">Save Relation</button><button type="button" class="secondary-button" data-cancel>Cancel</button></div><p class="editor-message"></p>';const st=f.elements.st,si=f.elements.si,tt=f.elements.tt,ti=f.elements.ti;async function fill(t,s){s.replaceChildren(new Option("Select Name",""));(await get(t.value)).filter(r=>r.visibility!=="hide").forEach(r=>s.append(new Option(r.name,r.id)));}st.onchange=()=>fill(st,si);tt.onchange=()=>fill(tt,ti);await Promise.all([fill(st,si),fill(tt,ti)]);const search=el("input");search.type="search";search.placeholder="Search existing relations";const toolbar=el("div","dashboard-toolbar");toolbar.append(search);const list=el("div","dashboard-relation-list");p.append(f,toolbar,list);let rows=[];async function load(){const {data,error}=await supabase.from("Relation").select("*").order("sort_order");if(error)throw error;rows=data||[];const ids=[...new Set(rows.flatMap(r=>[r.source_id,r.target_id]))];const [a,b]=await Promise.all([supabase.from("Info").select("id,name,type").in("id",ids),supabase.from("Media").select("id,name,type").in("id",ids)]);const map=new Map([...(a.data||[]),...(b.data||[])].map(r=>[r.id,r]));list.replaceChildren();const term=search.value.toLowerCase();rows.filter(r=>[map.get(r.source_id)?.name,map.get(r.target_id)?.name,map.get(r.source_id)?.type,map.get(r.target_id)?.type].some(v=>String(v||"").toLowerCase().includes(term))).forEach(r=>{const row=el("div","dashboard-record-row");row.append(el("strong","",map.get(r.source_id)?.name||"Missing"),el("small","",r.source_type+" → "+r.target_type+" → "+(map.get(r.target_id)?.name||"Missing")));const d=el("button","secondary-button","Delete");d.onclick=async()=>{const {error}=await supabase.from("Relation").delete().eq("id",r.id);if(error)alert(error.message);else load();};row.append(d);row.addEventListener("click",async e=>{if(e.target===d)return;st.value=r.source_type;tt.value=r.target_type;await Promise.all([fill(st,si),fill(tt,ti)]);si.value=r.source_id;ti.value=r.target_id;f.dataset.id=r.id;$("h3",f).textContent="Edit Relation";f.querySelector("[type=submit]").textContent="Update Relation";});sortable(row,r.id,rows,"Relation",load);list.append(row);});if(!list.childElementCount)list.append(el("p","muted","No relations found."));}search.oninput=load;f.onsubmit=async e=>{e.preventDefault();if(!si.value||!ti.value||si.value===ti.value){say($(".editor-message",f),"Select two different existing items.","error");return;}const payload={source_type:st.value,source_id:si.value,target_type:tt.value,target_id:ti.value,sort_order:(rows.length+1)*10};const result=f.dataset.id?await supabase.from("Relation").update(payload).eq("id",f.dataset.id):await supabase.from("Relation").upsert(payload,{onConflict:"source_type,source_id,target_type,target_id"});const error=result.error;say($(".editor-message",f),error?.message||"Saved.",error?"error":"success");if(!error){f.reset();delete f.dataset.id;$("h3",f).textContent="Create Relation";f.querySelector("[type=submit]").textContent="Save Relation";load();}};f.querySelector("[data-cancel]").onclick=()=>{f.reset();delete f.dataset.id;$("h3",f).textContent="Create Relation";f.querySelector("[type=submit]").textContent="Save Relation";};await load();
 }
 async function overview(){
  const p=start("overview","Overview"),grid=el("div","dashboard-overview-grid");
  p.append(grid);
  const summary=[["Info","Info"],["Media","Media"],["User","Users"],["Role","Roles"],["Permission","permissions"]];
  const cards=summary.map(([label])=>{
   const card=el("div","dashboard-overview-card"),value=el("strong","skeleton dashboard-skeleton-value"," ");
   card.append(el("span","",label),value);grid.append(card);return value;
  });
  const counts=await Promise.all(summary.map(([,table])=>supabase.from(table).select("id",{count:"exact",head:true})));
  counts.forEach((result,index)=>{cards[index].classList.remove("skeleton","dashboard-skeleton-value");cards[index].textContent=result.error?"—":String(result.count??0);});
  const activity=el("section","dashboard-activity-panel");activity.append(el("h3","","Activities List"));
  const activitySkeleton=el("p","skeleton dashboard-skeleton-line"," ");activitySkeleton.setAttribute("aria-hidden","true");activity.append(activitySkeleton);p.append(activity);
  const health=el("section","dashboard-activity-panel");health.append(el("h3","","Health Status"));
  const healthSkeleton=el("p","skeleton dashboard-skeleton-line"," ");healthSkeleton.setAttribute("aria-hidden","true");health.append(healthSkeleton);p.append(health);
  const [a,b,db]=await Promise.all([
   supabase.from("Info").select("name,updated_at").order("updated_at",{ascending:false}).limit(5),
   supabase.from("Media").select("name,updated_at").order("updated_at",{ascending:false}).limit(5),
   supabase.from("Info").select("id",{head:true,count:"exact"})
  ]);
  activity.replaceChildren(el("h3","","Activities List"));
  const records=[...(a.data||[]).map(x=>({...x,t:"Info"})),...(b.data||[]).map(x=>({...x,t:"Media"}))]
   .sort((x,y)=>String(y.updated_at).localeCompare(String(x.updated_at))).slice(0,8);
  if(records.length)records.forEach(x=>activity.append(el("p","",x.t+" · "+x.name)));
  else activity.append(el("p","muted","No activity available."));
  health.replaceChildren(el("h3","","Health Status"));
  health.append(el("p",db.error?"health-error":"health-ok",db.error?"Database unavailable":"Database connected"));
 }
 async function preference(){
  const p=start("preference","Preference");
  const [{data:runtimeRow,error:runtimeError},{data:optionsRow,error:optionsError}]=await Promise.all([
   supabase.from("Settings").select("setting_value").eq("setting_key","runtime_config").maybeSingle(),
   supabase.from("Settings").select("setting_value").eq("setting_key","preference_options").maybeSingle()
  ]);
  if(runtimeError||optionsError){p.append(el("p","editor-message",(runtimeError||optionsError).message));return;}
  const cfg=runtimeRow?.setting_value||{schema_version:1};
  const saved=optionsRow?.setting_value||{};
  let regions=Array.isArray(saved.regions)&&saved.regions.length?saved.regions.map(x=>({...x})):[{label:"Global",value:"global"},{label:"Bangladesh",value:"bangladesh"},{label:"Saudi Arabia",value:"saudi-arabia"}];
  let languages=Array.isArray(saved.languages)&&saved.languages.length?saved.languages.map(x=>({...x})):[{label:"English",value:"en"},{label:"Bangla",value:"bn"},{label:"Arabic",value:"ar"}];
  let devices=Array.isArray(saved.devices)&&saved.devices.length?saved.devices.map(x=>({...x})):[{label:"Mobile",value:"mobile"},{label:"Tablet",value:"tablet"},{label:"Computer",value:"computer"}];
  let platforms=Array.isArray(saved.platforms)&&saved.platforms.length?saved.platforms.map(x=>({...x})):[{label:"Website",value:"website"},{label:"Android Application",value:"android-application"},{label:"iPhone Application",value:"iphone-application"},{label:"Computer Application",value:"computer-application"}];
  let themes=Array.isArray(saved.themes)&&saved.themes.length?saved.themes.map(x=>({...x})):[{label:"Classic",value:"classic"},{label:"Modern",value:"modern"},{label:"Future",value:"future"}];
  if(!themes.some(x=>x.value==="classic"))themes.unshift({label:"Classic",value:"classic"});
  const f=el("form","content-editor-form");
  f.innerHTML='<h3>Region</h3><div id="preference-regions" class="dashboard-record-list"></div><div class="module-form-grid"><label class="module-form-field"><span>New Region</span><input name="regionLabel" maxlength="80"></label><button type="button" data-add-region>Add Region</button></div><h3>Language</h3><div id="preference-languages" class="dashboard-record-list"></div><div class="module-form-grid"><label class="module-form-field"><span>New Language</span><input name="languageLabel" maxlength="80"></label><label class="module-form-field"><span>Language Code</span><input name="languageCode" maxlength="12" placeholder="en"></label><button type="button" data-add-language>Add Language</button></div><h3>Device</h3><div id="preference-devices" class="dashboard-record-list"></div><div class="module-form-grid"><label class="module-form-field"><span>New Device</span><input name="deviceLabel" maxlength="80"></label><button type="button" data-add-device>Add Device</button></div><h3>Platform</h3><div id="preference-platforms" class="dashboard-record-list"></div><div class="module-form-grid"><label class="module-form-field"><span>New Platform</span><input name="platformLabel" maxlength="80"></label><button type="button" data-add-platform>Add Platform</button></div><h3>Themes</h3><div id="preference-themes" class="dashboard-record-list"></div><div class="module-form-grid"><label class="module-form-field"><span>New Theme</span><input name="themeLabel" maxlength="40"></label><button type="button" data-add-theme>Add Theme</button></div><div class="module-form-grid"><label class="module-form-field"><span>Preset</span><select name="variant"></select></label><label class="module-form-field"><span>Mode</span><select name="mode"><option value="light">Light</option><option value="dark">Dark</option></select></label><label class="module-form-field"><span>Color</span><select name="palette"><option value="white">White</option><option value="black">Black</option><option value="neutral-gray">Neutral Gray</option></select></label><label class="module-form-field"><span>Size</span><select name="size"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></label></div><div class="editor-actions"><button type="submit">Save Preference</button></div><p class="editor-message"></p>';
  const regionHost=$("#preference-regions",f),languageHost=$("#preference-languages",f),deviceHost=$("#preference-devices",f),platformHost=$("#preference-platforms",f),themeHost=$("#preference-themes",f),variantSelect=f.elements.variant;
  function drawOptions(host,items,kind){
   host.replaceChildren();
   items.forEach((item,index)=>{
    const row=el("div","dashboard-record-row");
    const label=el("input");label.value=item.label;label.maxLength=80;label.setAttribute("aria-label",kind+" name");label.addEventListener("change",()=>{item.label=label.value.trim();});
    const value=el("input");value.value=item.value;value.maxLength=kind==="Language"?12:80;value.setAttribute("aria-label",kind+" code");value.addEventListener("change",()=>{item.value=kind==="Language"?value.value.trim().toLowerCase():slug(value.value);});
    const remove=el("button","secondary-button","Delete");remove.type="button";remove.addEventListener("click",()=>{items.splice(index,1);drawOptions(host,items,kind);});
    row.append(label,value,remove);host.append(row);
   });
   if(!items.length)host.append(el("p","muted","No records found."));
  }
  function drawThemes(){
   themeHost.replaceChildren();
   themes.forEach((item,index)=>{
    const row=el("div","dashboard-record-row");
    const label=el("input");label.value=item.label;label.maxLength=40;label.setAttribute("aria-label","Theme name");label.addEventListener("change",()=>{item.label=label.value.trim()||item.value;variantSelect.replaceChildren(...themes.map(theme=>new Option(theme.label,theme.value)));variantSelect.value=item.value;});
    const key=el("small","",item.value);
    const remove=el("button","secondary-button","Delete");remove.type="button";remove.disabled=item.value==="classic"||themes.length===1;
    remove.addEventListener("click",()=>{if(item.value==="classic"||themes.length===1)return;themes.splice(index,1);if(variantSelect.value===item.value)variantSelect.value="classic";drawThemes();});
    row.append(label,key,remove);themeHost.append(row);
   });
   variantSelect.replaceChildren(...themes.map(item=>new Option(item.label,item.value)));
   if(!themes.some(item=>item.value===variantSelect.value))variantSelect.value=themes.some(item=>item.value==="classic")?"classic":themes[0]?.value||"classic";
  }
  drawOptions(regionHost,regions,"Region");drawOptions(languageHost,languages,"Language");drawOptions(deviceHost,devices,"Device");drawOptions(platformHost,platforms,"Platform");drawThemes();
  const savedVariant=localStorage.getItem("3b-theme-variant")||"classic";
  variantSelect.value=themes.some(item=>item.value===savedVariant)?savedVariant:"classic";
  f.elements.mode.value=document.documentElement.dataset.theme||"light";
  f.elements.palette.value=cfg.palette||"white";f.elements.size.value=cfg.size||"medium";
  f.querySelector("[data-add-region]").onclick=()=>{
   const label=f.elements.regionLabel.value.trim(),value=slug(label);
   if(!label||!value||regions.some(x=>x.value===value)){say($(".editor-message",f),"Enter a unique Region name.","error");return;}
   regions.push({label,value});f.elements.regionLabel.value="";drawOptions(regionHost,regions,"Region");
  };
  f.querySelector("[data-add-language]").onclick=()=>{
   const label=f.elements.languageLabel.value.trim(),value=f.elements.languageCode.value.trim().toLowerCase();
   if(!label||! /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(value)||languages.some(x=>x.value===value)){say($(".editor-message",f),"Enter a unique language name and valid language code.","error");return;}
   languages.push({label,value});f.elements.languageLabel.value="";f.elements.languageCode.value="";drawOptions(languageHost,languages,"Language");
  };
  f.querySelector("[data-add-device]").onclick=()=>{
   const label=f.elements.deviceLabel.value.trim(),value=slug(label);
   if(!label||!value||devices.some(x=>x.value===value)){say($(".editor-message",f),"Enter a unique Device name.","error");return;}
   devices.push({label,value});f.elements.deviceLabel.value="";drawOptions(deviceHost,devices,"Device");
  };
  f.querySelector("[data-add-platform]").onclick=()=>{
   const label=f.elements.platformLabel.value.trim(),value=slug(label);
   if(!label||!value||platforms.some(x=>x.value===value)){say($(".editor-message",f),"Enter a unique Platform name.","error");return;}
   platforms.push({label,value});f.elements.platformLabel.value="";drawOptions(platformHost,platforms,"Platform");
  };
  f.querySelector("[data-add-theme]").onclick=()=>{
   const label=f.elements.themeLabel.value.trim(),value=slug(label);
   if(!label||!value||themes.some(x=>x.value===value)){say($(".editor-message",f),"Enter a unique Theme name.","error");return;}
   themes.push({label,value});f.elements.themeLabel.value="";drawThemes();variantSelect.value=value;
  };
  f.onsubmit=async e=>{
   e.preventDefault();
   const cleanRegions=regions.filter(x=>x.label?.trim()&&x.value?.trim());
   const cleanLanguages=languages.filter(x=>x.label?.trim()&&/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(x.value||""));
   const cleanDevices=devices.filter(x=>x.label?.trim()&&x.value?.trim());
   const cleanPlatforms=platforms.filter(x=>x.label?.trim()&&x.value?.trim());
   const cleanThemes=themes.filter(x=>x.label?.trim()&&/^[a-z0-9][a-z0-9-]{0,39}$/.test(x.value||""));
   if(!cleanRegions.length||!cleanLanguages.length||!cleanDevices.length||!cleanPlatforms.length||!cleanThemes.some(x=>x.value==="classic")){say($(".editor-message",f),"Keep at least one Region, Language and the default Classic Theme.","error");return;}
   const themePresets={...(cfg.theme_presets||{})};
   for(const key of Object.keys(themePresets))if(!cleanThemes.some(item=>item.value===key))delete themePresets[key];
   for(const item of cleanThemes)if(!themePresets[item.value])themePresets[item.value]={light:{palette:cfg.palette||"white",size:cfg.size||"medium"},dark:{palette:cfg.palette||"white",size:cfg.size||"medium"}};
   const selectedVariant=cleanThemes.some(item=>item.value===variantSelect.value)?variantSelect.value:"classic";
   themePresets[selectedVariant]={...(themePresets[selectedVariant]||{}),[f.elements.mode.value]:{palette:f.elements.palette.value,size:f.elements.size.value}};
   const next={...cfg,schema_version:1,palette:f.elements.palette.value,size:f.elements.size.value,theme_presets:themePresets};
   const [optionSave,themeSave]=await Promise.all([
    supabase.from("Settings").upsert({setting_key:"preference_options",setting_value:{regions:cleanRegions,languages:cleanLanguages,devices:cleanDevices,platforms:cleanPlatforms,themes:cleanThemes},visibility_roles:["owner","visitor"],description:"Website region, language and theme options"},{onConflict:"setting_key"}),
    supabase.from("Settings").upsert({setting_key:"runtime_config",setting_value:next,visibility_roles:["owner"],description:"Theme preferences"},{onConflict:"setting_key"})
   ]);
   const error=optionSave.error||themeSave.error;say($(".editor-message",f),error?.message||"Preferences saved.",error?"error":"success");
   if(!error){
    localStorage.setItem("3b-theme-variant",selectedVariant);
    document.documentElement.dataset.themeVariant=selectedVariant;
    window.dispatchEvent(new CustomEvent("runtime-config-updated",{detail:next}));
    window.dispatchEvent(new Event("site-preferences-updated"));
    window.dispatchEvent(new CustomEvent("site-theme-changed",{detail:{theme:selectedVariant}}));
   }
  };
  p.append(f);
 }
 async function setting(){
  const p=start("setting","Setting"),{data,error}=await supabase.from("Settings").select("*");
  if(error){p.append(el("p","editor-message",error.message));return;}
  const m=new Map((data||[]).map(r=>[r.setting_key,r.setting_value||{}])),profile=m.get("site_profile")||{},web=m.get("website_information")||{},intro=m.get("home_intro")||{},nav=m.get("navigation_menu")||{};
  const f=el("form","content-editor-form");
  f.innerHTML='<h3>Website Identity</h3><div class="module-form-grid"><label class="module-form-field"><span>Website Title</span><input name="title" maxlength="100"></label><label class="module-form-field"><span>Logo URL</span><input name="logo" type="url"></label><label class="module-form-field"><span>Upload Website Logo</span><input name="logo_file" type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif"></label><label class="module-form-field"><span>Upload Website Favicon</span><input name="favicon_file" type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif"></label><label class="module-form-field"><span>Home Intro</span><textarea name="intro" rows="4"></textarea></label><label class="module-form-field"><span>Logo Swap Interval (seconds)</span><input name="interval" type="number" min="5" max="60"></label><label class="module-form-field"><span>Icon Transition Speed (milliseconds)</span><input name="speed" type="number" min="300" max="5000"></label></div><div class="editor-actions"><button type="submit">Save Setting</button></div><p class="editor-message"></p>';
  f.elements.title.value=profile.website_title||web.title||"3B TECH HUB";f.elements.logo.value=profile.logo_url||web.logo_url||"";f.elements.intro.value=intro.content||web.intro||"";f.elements.interval.value=nav.logo_swap_interval_seconds||5;f.elements.speed.value=nav.icon_transition_speed_ms||1400;
  async function upload(file,kind){if(!file)return null;if(!/^image\/(png|jpeg|webp|avif|gif)$/.test(file.type)||file.size>10*1024*1024)throw Error("Choose a supported image under 10 MB.");const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/avif":"avif","image/gif":"gif"}[file.type]||"png",path="site/brand/"+kind+"-"+Date.now()+"."+ext;const {error}=await supabase.storage.from("site-media").upload(path,file,{upsert:true,contentType:file.type});if(error)throw error;return supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;}
  f.onsubmit=async e=>{e.preventDefault();const button=f.querySelector('[type="submit"]');button.disabled=true;try{
   const title=f.elements.title.value.trim()||"3B TECH HUB",logoUpload=await upload(f.elements.logo_file.files[0],"logo"),faviconUpload=await upload(f.elements.favicon_file.files[0],"favicon"),logo=logoUpload||f.elements.logo.value.trim()||profile.logo_url||web.logo_url||null,favicon=faviconUpload||profile.favicon_url||web.favicon_url||null,text=f.elements.intro.value.trim(),navigation={...nav,logo_swap_interval_seconds:Number(f.elements.interval.value)||5,icon_transition_speed_ms:Number(f.elements.speed.value)||1400};
   const nextProfile={...profile,website_title:title,logo_url:logo,favicon_url:favicon,favicon_type:f.elements.favicon_file.files[0]?.type||profile.favicon_type||web.favicon_type||null},nextWeb={...web,title,logo_url:logo,favicon_url:favicon,favicon_type:nextProfile.favicon_type,intro:text};
   const rows=[{setting_key:"site_profile",setting_value:nextProfile,visibility_roles:["owner","visitor"],description:"Website identity"},{setting_key:"website_information",setting_value:nextWeb,visibility_roles:["owner","visitor"],description:"Website information"},{setting_key:"home_intro",setting_value:{content:text},visibility_roles:["owner","visitor"],description:"Website introduction"},{setting_key:"navigation_menu",setting_value:navigation,visibility_roles:["owner","visitor"],description:"Navigation menu preferences"}];
   const {error:saveError}=await supabase.from("Settings").upsert(rows,{onConflict:"setting_key"});if(saveError)throw saveError;say($(".editor-message",f),"Saved.","success");window.dispatchEvent(new CustomEvent("site-settings-updated"));
  }catch(err){say($(".editor-message",f),err.message||"Could not save settings.","error");}finally{button.disabled=false;}};
  p.append(f);
 }
 async function open(key){try{if(key==="overview")await overview();else if(key==="info")await info();else if(key==="media")await media();else if(key==="relation")await relation();else if(key==="preference")await preference();else if(key==="setting")await setting();else{const id=key==="users"?"#dashboard-admin-users":key==="roles"?"#dashboard-admin-roles":"#dashboard-admin-permissions";const node=adminNodes[key];const p=start(key,order.find(x=>x[0]===key)[1]);if(node)p.append(node);}}catch(e){panel.append(el("p","editor-message",e?.message||"Could not load layout."));}}
 await open("overview");
}