import { initExtendedDashboard } from "./admin-extended.js";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const el=(tag,cls="",text="")=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
const slugify=v=>String(v||"").normalize("NFKD").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const labelize=v=>String(v||"").replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());
const HOME_DEFAULT=[];

function fieldControl(field,value,options=[]){
 const wrap=el("label","module-form-field"),caption=el("span","",field.label||labelize(field.field_key));
 let input;
 if(["textarea","richtext","multi_text","gallery","json"].includes(field.field_type)){
  input=el("textarea");input.rows=field.field_type==="json"?5:3;
  input.value=field.field_type==="json"?(value==null?"":JSON.stringify(value,null,2)):
   (["gallery","multi_text"].includes(field.field_type)&&Array.isArray(value)?value.join("\n"):(value??""));
 }else if(field.field_type==="boolean"){
  input=el("input");input.type="checkbox";input.checked=Boolean(value);wrap.classList.add("module-checkbox-field");
 }else if(["select","radio"].includes(field.field_type)){
  input=el("select");input.append(new Option("Select…",""));options.forEach(o=>input.append(new Option(o.label,o.value)));input.value=value??"";
 }else if(field.field_type==="checkboxes"){
  input=el("div","module-related-options");const selected=new Set(Array.isArray(value)?value:[]);
  options.forEach(o=>{const l=el("label","module-related-option"),c=el("input");c.type="checkbox";c.value=o.value;c.checked=selected.has(o.value);l.append(c,el("span","",o.label));input.append(l);});
 }else{
  input=el("input");input.type=["email","url","date","time"].includes(field.field_type)?field.field_type:
   ["number","integer","decimal"].includes(field.field_type)?"number":"text";
  if(input.type==="number")input.step=field.field_type==="integer"?"1":"any";
  input.value=value??"";
 }
 input.dataset.fieldKey=field.field_key;input.dataset.fieldType=field.field_type;
 if(field.is_required)input.required=true;
 if(field.field_type==="boolean")wrap.append(input,caption);else wrap.append(caption,input);
 return wrap;
}
function readField(field,input){
 const t=field.field_type;
 if(t==="boolean")return input.checked;
 if(t==="checkboxes")return $$('input[type="checkbox"]:checked',input).map(x=>x.value);
 if(["number","integer","decimal"].includes(t)){if(!input.value.trim())return null;const n=Number(input.value);if(!Number.isFinite(n))throw new Error(field.label+" must be a number.");return n;}
 if(t==="json"){if(!input.value.trim())return null;try{return JSON.parse(input.value);}catch{throw new Error(field.label+" must be valid JSON.");}}
 if(["gallery","multi_text"].includes(t))return input.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 return input.value.trim()===""?null:input.value.trim();
}
async function uploadMedia(supabase,moduleKey,files){
 const urls=[];
 for(const file of files){
  const name=file.name.replace(/[^a-zA-Z0-9._-]+/g,"-");
  const path=moduleKey+"/"+Date.now()+"-"+crypto.randomUUID()+"-"+name;
  const {error}=await supabase.storage.from("site-media").upload(path,file,{upsert:false,contentType:file.type||undefined});
  if(error)throw error;
  urls.push({path,url:supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl,mime_type:file.type||null,size_bytes:file.size});
 }
 return urls;
}

async function listModuleStorageFiles(supabase,moduleKey){
 const bucket=supabase.storage.from("site-media"),paths=[];
 async function walk(prefix){
  let offset=0;
  for(;;){
   const {data,error}=await bucket.list(prefix,{limit:100,offset});
   if(error)throw error;
   const entries=data||[];
   for(const entry of entries){
    const path=prefix+"/"+entry.name;
    if(entry.id||entry.metadata)paths.push(path);
    else await walk(path);
   }
   if(entries.length<100)break;
   offset+=entries.length;
  }
 }
 await walk(moduleKey);
 return paths;
}
async function removeModuleStorageFiles(supabase,paths){
 const bucket=supabase.storage.from("site-media");
 for(let i=0;i<paths.length;i+=100){
  const {error}=await bucket.remove(paths.slice(i,i+100));
  if(error)throw error;
 }
}

export async function initDynamicDashboard(supabase,root,user){
 root.innerHTML='<div class="dashboard-workspace"><header class="dashboard-workspace-header"><div><h1>Dashboard</h1><p id="dashboard-owner-email"></p></div><span>Dashboard workspace</span></header><nav id="dashboard-dynamic-tabs" class="dashboard-module-nav" aria-label="Dashboard module tabs" role="tablist"></nav><div class="dashboard-workspace-layout"><button id="dashboard-sidebar-backdrop" class="dashboard-sidebar-backdrop" type="button" aria-label="Close dashboard sidebar" hidden></button><aside class="dashboard-workspace-sidebar" id="dashboard-workspace-sidebar" aria-hidden="true"><nav id="dashboard-dynamic-nav" aria-label="Dashboard sidebar"></nav></aside><section class="dashboard-workspace-main" id="dashboard-dynamic-panel" aria-live="polite"></section></div><div id="dashboard-hidden-admin" hidden></div></div>';
 $("#dashboard-owner-email",root).textContent=user?.email||"";
 const originalBrandLogo=document.querySelector(".brand-logo")?.cloneNode(true)||null;
 function setSidebarOpen(isOpen){
  workspace.classList.toggle("is-sidebar-open",isOpen);sidebar.setAttribute("aria-hidden",String(!isOpen));backdrop.hidden=!isOpen;
  const logo=document.querySelector(".brand-logo");
  if(logo){logo.replaceChildren();if(isOpen){const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("width","24");svg.setAttribute("height","24");svg.setAttribute("aria-hidden","true");svg.classList.add("dashboard-sidebar-close-icon");const path=document.createElementNS("http://www.w3.org/2000/svg","path");path.setAttribute("d","M18 6 6 18M6 6l12 12");path.setAttribute("fill","none");path.setAttribute("stroke","currentColor");path.setAttribute("stroke-width","2");path.setAttribute("stroke-linecap","round");svg.append(path);logo.append(svg);}else if(originalBrandLogo){[...originalBrandLogo.childNodes].forEach(node=>logo.append(node.cloneNode(true)));}logo.setAttribute("aria-label",isOpen?"Close dashboard sidebar":"Open dashboard sidebar");logo.setAttribute("aria-expanded",String(isOpen));}
 }
 const nav=$("#dashboard-dynamic-nav",root),tabs=$("#dashboard-dynamic-tabs",root),panel=$("#dashboard-dynamic-panel",root),workspace=$(".dashboard-workspace",root),sidebar=$("#dashboard-workspace-sidebar",root),backdrop=$("#dashboard-sidebar-backdrop",root);
 window.__dashboardSidebarToggle=()=>setSidebarOpen(!workspace.classList.contains("is-sidebar-open"));
 window.__dashboardSidebarClose=()=>setSidebarOpen(false);
 backdrop.addEventListener("click",()=>setSidebarOpen(false));
 setSidebarOpen(false);
 let modules=[],fields=[],roles=[],adminPanels={};
 async function registry(){
  const [m,f,r]=await Promise.all([
   supabase.from("modules").select("*").order("sort_order"),
   supabase.from("module_fields").select("*").eq("is_active",true).order("sort_order"),
   supabase.from("Roles").select("id,name,slug,is_active").order("name")
  ]);
  if(m.error)throw m.error;if(f.error)throw f.error;if(r.error)throw r.error;
  modules=m.data||[];fields=f.data||[];roles=r.data||[];
 }
 await registry();

 const hidden=$("#dashboard-hidden-admin",root);
 const adminMarkup={
 users:'<section id="dashboard-admin-users"><div class="admin-list"><form id="users-form" class="content-editor-form"><h3 id="users-form-title">Add user</h3><div class="module-form-grid"><label class="module-form-field"><span>Name</span><input name="title" maxlength="160" required></label><label class="module-form-field"><span>Email (account invitation)</span><input name="email" type="email" maxlength="254" required></label><div class="module-form-field module-related-field"><span>Roles</span><div id="user-role-options" class="module-related-options"></div></div><div class="module-form-field module-related-field"><span>Permissions</span><div id="user-permission-options" class="module-related-options"></div></div></div><div class="editor-actions"><button type="submit" id="users-submit">Save</button><button class="secondary-button" id="users-cancel" type="button" hidden>Cancel</button></div><p id="users-message" class="editor-message" role="status"></p></form><div id="users-list" class="admin-list" aria-live="polite"></div></div></section>',
 roles:'<section id="dashboard-admin-roles"><div class="admin-list"><form id="roles-form" class="content-editor-form"><h3 id="roles-form-title">Add role</h3><div class="module-form-grid"><label class="module-form-field"><span>Name</span><input name="title" maxlength="80" required></label><label class="module-form-field"><span>Slug</span><input name="slug" maxlength="100" required></label><label class="module-form-field"><span>Type</span><select name="type"><option value="custom">Custom</option><option value="system">System</option></select></label><label class="module-form-field"><span>Description</span><textarea name="description" rows="3"></textarea></label><label class="module-form-field"><span>Visibility</span><select name="visibility"><option value="show">Show</option><option value="hide">Hide</option></select></label><div class="module-form-field module-related-field"><span>Users</span><div id="role-user-options" class="module-related-options"></div></div><div class="module-form-field module-related-field"><span>Permissions</span><div id="role-permission-options" class="module-related-options"></div></div></div><div class="editor-actions"><button type="submit" id="roles-submit">Save</button><button class="secondary-button" id="roles-cancel" type="button" hidden>Cancel</button><button class="secondary-button" id="roles-delete" type="button" hidden>Delete</button></div><p id="roles-message" class="editor-message" role="status"></p></form><div id="roles-list" class="admin-list" aria-live="polite"></div></div></section>',
 permissions:'<section id="dashboard-admin-permissions"><div class="admin-list"><form id="permission-form" class="content-editor-form"><h3 id="permission-form-title">Add permission</h3><div class="module-form-grid"><label class="module-form-field"><span>Name</span><input name="title" maxlength="100" required></label><label class="module-form-field"><span>Slug</span><input name="slug" maxlength="140" required></label><label class="module-form-field"><span>Type</span><select name="type"><option value="read">Read</option><option value="write">Write</option><option value="manage">Manage</option><option value="view">View</option></select></label><label class="module-form-field"><span>Description</span><textarea name="description" rows="3"></textarea></label><label class="module-form-field"><span>Visibility</span><select name="visibility"><option value="show">Show</option><option value="hide">Hide</option></select></label><div class="module-form-field module-related-field"><span>Users</span><div id="permission-user-options" class="module-related-options"></div></div><div class="module-form-field module-related-field"><span>Roles</span><div id="permission-role-options" class="module-related-options"></div></div></div><div class="editor-actions"><button type="submit" id="permission-submit">Save</button><button class="secondary-button" id="permission-cancel" type="button" hidden>Cancel</button><button class="secondary-button" id="permission-delete" type="button" hidden>Delete</button></div><p id="permission-message" class="editor-message" role="status"></p></form><div id="permissions-list" class="admin-list" aria-live="polite"></div></div></section>'
 };
 Object.entries(adminMarkup).forEach(([key,html])=>{const holder=el("div");holder.innerHTML=html;adminPanels[key]=holder.firstElementChild;hidden.append(adminPanels[key]);});
 try{initExtendedDashboard(supabase,user?.role||"owner");}catch(error){console.error("Dashboard administration panels failed to initialize.",error);const notice=el("p","editor-message","Administration panels could not initialize: "+(error?.message||"Unknown error"));notice.setAttribute("role","alert");panel.append(notice);}

 const general=[["overview","Overview"],["relations","Relations"],["builder","Content Module Builder"],["customization","Customizations"],["settings","Settings"]];
 function navGroup(name,items){
  const group=el("section","dashboard-nav-group");group.append(el("h2","",name));
  const list=el("div","dashboard-nav-items");
  items.forEach(([key,title])=>{const b=el("button","dashboard-nav-item",title);b.type="button";b.dataset.panelKey=key;b.addEventListener("click",()=>void open(key));list.append(b);});
  group.append(list);nav.append(group);
 }
 function drawTabs(){
  tabs.replaceChildren();
  const all=[...general,...modules.filter(m=>m.status==="published").map(m=>["module:"+m.id,m.name]),["users","Users"],["roles","Roles"],["permissions","Permissions"]];
  all.forEach(([key,title])=>{const b=el("button","dashboard-module-tab",title);b.type="button";b.role="tab";b.dataset.panelKey=key;b.addEventListener("click",()=>void open(key));tabs.append(b);});
 }
 function drawNav(){
  nav.replaceChildren();navGroup("GENERAL",general);
  navGroup("CONTENT",modules.filter(m=>m.status==="published").map(m=>["module:"+m.id,m.name]));
  navGroup("ADMINISTRATION",[["users","Users"],["roles","Roles"],["permissions","Permissions"]]);
  drawTabs();
 }
 drawNav();

 async function open(key){
  $$(".dashboard-nav-item",nav).forEach(b=>b.classList.toggle("is-active",b.dataset.panelKey===key));
  $$(".dashboard-module-tab",tabs).forEach(b=>{const active=b.dataset.panelKey===key;b.classList.toggle("is-active",active);b.setAttribute("aria-selected",String(active));});
  panel.replaceChildren();
  if(key==="overview")return overview();
  if(key==="relations")return relationsPage();
  if(key==="builder")return builderPage();
  if(key==="customization")return customizationPage();
  if(key==="settings")return settingsPage();
  if(adminPanels[key]){panel.append(adminPanels[key]);return;}
  if(key.startsWith("module:")){const m=modules.find(x=>x.id===key.slice(7));if(m)return contentPage(m);}
 }
 async function overview(){
  const page=el("div","dashboard-page");page.append(el("h2","","Overview"),el("p","muted","Content summary and verified system status."));
  const mediaModule=modules.find(item=>item.module_key==="media");
  const [dataCount,mediaCount,userCount,roleCount,permissionCount]=await Promise.all([
   supabase.from("content_items").select("id",{count:"exact",head:true}),
   mediaModule?supabase.from("content_items").select("id",{count:"exact",head:true}).eq("module_id",mediaModule.id):Promise.resolve({count:0,error:null}),
   supabase.from("Users").select("id",{count:"exact",head:true}),
   supabase.from("Roles").select("id",{count:"exact",head:true}),
   supabase.from("permissions").select("id",{count:"exact",head:true})
  ]);
  const summary=el("div","dashboard-overview-grid");
  for(const [label,result] of [["Data",dataCount],["Media",mediaCount],["User",userCount],["Role",roleCount],["Permission",permissionCount]]){
   const card=el("div","dashboard-overview-card");card.append(el("span","",label),el("strong","",result.error?"—":result.count??0));summary.append(card);
  }
  page.append(summary);
  page.append(el("h3","","Content Modules"));
  const moduleGrid=el("div","dashboard-overview-grid");
  for(const m of modules.filter(x=>x.status==="published")){
   const {count,error}=await supabase.from("content_items").select("id",{count:"exact",head:true}).eq("module_id",m.id);
   const card=el("button","dashboard-overview-card");card.type="button";card.append(el("span","",m.name),el("strong","",error?"—":count??0));card.addEventListener("click",()=>void open("module:"+m.id));moduleGrid.append(card);
  }
  page.append(moduleGrid);
  const activity=el("section","dashboard-activity-panel");activity.append(el("h3","","Activities List"));
  const [itemsResult,usersResult,rolesResult,permissionsResult,modulesResult]=await Promise.all([
   supabase.from("content_items").select("title,updated_at,module_id").order("updated_at",{ascending:false}).limit(8),
   supabase.from("Users").select("full_name,updated_at").order("updated_at",{ascending:false}).limit(4),
   supabase.from("Roles").select("name,updated_at").order("updated_at",{ascending:false}).limit(4),
   supabase.from("permissions").select("name,updated_at").order("updated_at",{ascending:false}).limit(4),
   supabase.from("modules").select("name,updated_at").order("updated_at",{ascending:false}).limit(4)
  ]);
  const moduleNames=new Map(modules.map(item=>[item.id,item.name])),events=[];
  for(const row of itemsResult.data||[])events.push({label:row.title||"Content Item",detail:"Content · "+(moduleNames.get(row.module_id)||"Module"),date:row.updated_at});
  for(const row of usersResult.data||[])events.push({label:row.full_name||"User",detail:"User updated",date:row.updated_at});
  for(const row of rolesResult.data||[])events.push({label:row.name||"Role",detail:"Role updated",date:row.updated_at});
  for(const row of permissionsResult.data||[])events.push({label:row.name||"Permission",detail:"Permission updated",date:row.updated_at});
  for(const row of modulesResult.data||[])events.push({label:row.name||"Module",detail:"Content Module updated",date:row.updated_at});
  events.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
  if(!events.length)activity.append(el("p","muted","No recent activity."));
  else for(const event of events.slice(0,12)){const row=el("article","dashboard-activity-row");row.append(el("strong","",event.label),el("span","muted",event.detail),el("time","",event.date?new Date(event.date).toLocaleString():""));activity.append(row);}
  const activityErrors=[itemsResult,usersResult,rolesResult,permissionsResult,modulesResult].filter(result=>result.error);
  if(activityErrors.length)activity.append(el("p","muted","Some activity sources could not be loaded."));
  page.append(activity);
  const health=el("section","dashboard-health-panel");health.append(el("h3","","Health Status"));
  const tests=[["Database",()=>supabase.from("modules").select("id",{head:true,count:"exact"}).limit(1)],["Authentication",()=>supabase.auth.getUser()],["Storage",()=>supabase.storage.from("site-media").list("",{limit:1})]];
  for(const [name,run] of tests){const row=el("div","dashboard-health-row");row.append(el("span","",name));try{const result=await run();const failed=Boolean(result.error);row.append(el("strong",failed?"health-error":"health-ok",failed?"Unavailable":"Connected"));}catch{row.append(el("strong","health-error","Unavailable"));}health.append(row);}
  page.append(health);panel.append(page);
 }
 async function relationsPage(){
  const page=el("div","dashboard-page");page.append(el("h2","","Relations"),el("p","muted","Create and manage links between existing Content Items. Relationships are bidirectional; Items are never created here."));
  const form=el("form","content-editor-form");
  form.innerHTML='<h3 data-relation-form-title>Create Relation</h3><div class="module-form-grid"><label class="module-form-field"><span>Source Type</span><select name="sourceType" required></select></label><label class="module-form-field"><span>Source Name</span><select name="sourceName" required><option value="">Select Item</option></select></label><label class="module-form-field"><span>Target Type</span><select name="targetType" required></select></label><label class="module-form-field"><span>Target Name</span><select name="targetName" required><option value="">Select Item</option></select></label></div><div class="editor-actions"><button type="submit">Save Relation</button><button type="button" class="secondary-button" data-relation-cancel hidden>Cancel</button></div><p class="editor-message" role="status"></p>';
  const sourceType=form.elements.sourceType,sourceName=form.elements.sourceName,targetType=form.elements.targetType,targetName=form.elements.targetName;
  for(const select of [sourceType,targetType]){select.append(new Option("Select Type",""));modules.forEach(m=>select.append(new Option(m.name,m.id)));}
  let editingRelationId=null;
  async function fillItems(typeSelect,itemSelect,selectedId=""){
   const moduleId=typeSelect.value;itemSelect.replaceChildren(new Option("Select Item",""));if(!moduleId)return;
   const role=String(user?.role||"owner").toLowerCase();
   let query=supabase.from("content_items").select("id,title,status,visibility_roles").eq("module_id",moduleId).in("status",["active","published"]).contains("visibility_roles",[role]).order("title").limit(200);
   const {data,error}=await query;if(error)throw error;
   const rows=[...(data||[])];
   if(selectedId&&!rows.some(row=>row.id===selectedId)){
    const {data:existing,error:existingError}=await supabase.from("content_items").select("id,title,status,visibility_roles").eq("id",selectedId).maybeSingle();
    if(existingError)throw existingError;
    if(existing)rows.push(existing);
   }
   rows.forEach(item=>itemSelect.append(new Option(item.title,item.id)));
   itemSelect.value=selectedId||"";
  }
  sourceType.addEventListener("change",()=>void fillItems(sourceType,sourceName).catch(error=>{form.querySelector(".editor-message").textContent=error.message;form.querySelector(".editor-message").dataset.kind="error";}));
  targetType.addEventListener("change",()=>void fillItems(targetType,targetName).catch(error=>{form.querySelector(".editor-message").textContent=error.message;form.querySelector(".editor-message").dataset.kind="error";}));
  function resetRelationForm(){
   editingRelationId=null;form.reset();sourceName.replaceChildren(new Option("Select Item",""));targetName.replaceChildren(new Option("Select Item",""));
   form.querySelector("[data-relation-form-title]").textContent="Create Relation";form.querySelector('[data-relation-cancel]').hidden=true;form.querySelector(".editor-message").textContent="";
  }
  form.querySelector('[data-relation-cancel]').addEventListener("click",resetRelationForm);
  form.addEventListener("submit",async event=>{
   event.preventDefault();const button=form.querySelector('[type="submit"]'),message=form.querySelector(".editor-message");
   const a=sourceName.value,b=targetName.value;if(!a||!b){message.textContent="Select both existing Items.";message.dataset.kind="error";return;}
   if(a===b){message.textContent="An Item cannot be related to itself.";message.dataset.kind="error";return;}
   button.disabled=true;message.textContent="Saving…";
   try{
    const payload={item_a_id:a<b?a:b,item_b_id:a<b?b:a};
    let result;
    if(editingRelationId)result=await supabase.from("relations").update(payload).eq("id",editingRelationId);
    else{const {data:last,error:lastError}=await supabase.from("relations").select("sort_order").order("sort_order",{ascending:false}).limit(1).maybeSingle();if(lastError)throw lastError;result=await supabase.from("relations").insert({...payload,sort_order:(last?.sort_order||0)+10);}
    if(result.error)throw result.error;
    message.textContent="Relation saved.";message.dataset.kind="success";resetRelationForm();await load();
   }catch(error){message.textContent=error.message||"Could not save the relation.";message.dataset.kind="error";}
   finally{button.disabled=false;}
  });
  const filter=el("select");filter.append(new Option("All modules",""));modules.forEach(m=>filter.append(new Option(m.name,m.id)));
  const search=el("input");search.type="search";search.placeholder="Search related items…";search.setAttribute("aria-label","Search relationships");
  const toolbar=el("div","dashboard-toolbar");toolbar.append(el("label","","Filter by module"),filter,search);const list=el("div","dashboard-relation-list");page.append(form,toolbar,list);panel.append(page);
  async function load(){
   list.replaceChildren();const {data:rels,error}=await supabase.from("relations").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false}).limit(500);
   if(error){list.append(el("p","editor-message",error.message));return;}
   const ids=[...new Set((rels||[]).flatMap(r=>[r.item_a_id,r.item_b_id]))];if(!ids.length){list.append(el("p","muted","No relationships found."));return;}
   const {data:items,error:itemError}=await supabase.from("content_items").select("id,title,module_id").in("id",ids);
   if(itemError){list.append(el("p","editor-message",itemError.message));return;}
   const byId=new Map((items||[]).map(i=>[i.id,i])),byModule=new Map(modules.map(m=>[m.id,m]));
   const term=search.value.trim().toLocaleLowerCase();
   const visible=(rels||[]).filter(r=>{const a=byId.get(r.item_a_id),b=byId.get(r.item_b_id);if(!a||!b||(filter.value&&a.module_id!==filter.value&&b.module_id!==filter.value))return false;const ma=byModule.get(a.module_id)?.name||"",mb=byModule.get(b.module_id)?.name||"";return !term||[a.title,b.title,ma,mb].some(value=>String(value).toLocaleLowerCase().includes(term));});
   if(!visible.length){list.append(el("p","muted","No matching relationships."));return;}
   let draggedRelationId=null;
   const canReorder=!filter.value&&!term;
   visible.forEach(r=>{
    const a=byId.get(r.item_a_id),b=byId.get(r.item_b_id),row=el("article","dashboard-relation-row");row.draggable=canReorder;
    row.addEventListener("dragstart",event=>{draggedRelationId=r.id;row.classList.add("is-dragging");if(event.dataTransfer){event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/plain",r.id);}});
    row.addEventListener("dragend",()=>{draggedRelationId=null;list.querySelectorAll(".is-dragging,.is-drag-over").forEach(node=>node.classList.remove("is-dragging","is-drag-over"));});
    row.addEventListener("dragover",event=>{if(!canReorder||!draggedRelationId||draggedRelationId===r.id)return;event.preventDefault();row.classList.add("is-drag-over");});
    row.addEventListener("dragleave",()=>row.classList.remove("is-drag-over"));
    row.addEventListener("drop",async event=>{
     event.preventDefault();row.classList.remove("is-drag-over");
     const sourceId=draggedRelationId||event.dataTransfer?.getData("text/plain");draggedRelationId=null;
     if(!sourceId||sourceId===r.id)return;
     const ordered=[...visible],from=ordered.findIndex(item=>item.id===sourceId),to=ordered.findIndex(item=>item.id===r.id);
     if(from<0||to<0)return;
     const [moved]=ordered.splice(from,1);ordered.splice(to,0,moved);
     const updates=await Promise.all(ordered.map((item,index)=>supabase.from("relations").update({sort_order:(index+1)*10}).eq("id",item.id)));
     const failed=updates.find(result=>result.error);if(failed)alert("Relationship order could not be saved: "+failed.error.message);else await load();
    });
    const left=el("div");left.append(el("strong","",a.title),el("small","",byModule.get(a.module_id)?.name||""));
    const right=el("div");right.append(el("strong","",b.title),el("small","",byModule.get(b.module_id)?.name||""));
    const edit=el("button","secondary-button","Edit");edit.type="button";edit.addEventListener("click",async()=>{
     editingRelationId=r.id;sourceType.value=a.module_id;targetType.value=b.module_id;
     try{await fillItems(sourceType,sourceName,a.id);await fillItems(targetType,targetName,b.id);form.querySelector("[data-relation-form-title]").textContent="Edit Relation";form.querySelector('[data-relation-cancel]').hidden=false;form.scrollIntoView({behavior:"smooth",block:"start"});}
     catch(error){form.querySelector(".editor-message").textContent=error.message;form.querySelector(".editor-message").dataset.kind="error";}
    });
    const remove=el("button","secondary-button","Delete");remove.type="button";remove.addEventListener("click",async()=>{if(!confirm("Remove this relationship only? The Content Items will remain."))return;const {error}=await supabase.from("relations").delete().eq("id",r.id);if(error)alert(error.message);else await load();});
    row.append(left,el("span","dashboard-relation-arrow","↔"),right,edit,remove);list.append(row);
   });
  }
  filter.addEventListener("change",()=>void load());search.addEventListener("input",()=>void load());await load();
 }
 async function reloadRegistry(){await registry();drawNav();}
 async function builderPage(){
  const page=el("div","dashboard-page");page.append(el("h2","","Content Module Builder"),el("p","muted","Create dynamic modules using the shared Content storage."));
  const form=el("form","content-editor-form");
  form.innerHTML='<div class="module-form-grid"><label class="module-form-field"><span>Module Name</span><input name="name" required maxlength="80"></label><label class="module-form-field"><span>Module Slug</span><input name="slug" required maxlength="80"></label><label class="module-form-field"><span>Description</span><textarea name="description" rows="2"></textarea></label><label class="module-form-field"><span>Icon</span><input name="icon" maxlength="40"></label></div><h3>Custom Fields</h3><div data-builder-fields></div><button type="button" class="secondary-button" data-add-field>Add Field</button><div class="editor-actions"><button type="submit">Create Draft Module</button></div><p class="editor-message" role="status"></p>';
  const fieldHost=$("[data-builder-fields]",form);
  function addField(){
   const row=el("div","dashboard-builder-field-row");
   row.innerHTML='<input name="field_label" placeholder="Field label" required><input name="field_key" placeholder="field_key" required><select name="field_type"><option value="text">Text</option><option value="textarea">Textarea</option><option value="number">Number</option><option value="boolean">Boolean</option><option value="date">Date</option><option value="url">URL</option><option value="email">Email</option><option value="select">Select</option><option value="radio">Radio</option><option value="checkboxes">Checkboxes</option><option value="gallery">Gallery</option><option value="file">File</option><option value="json">JSON</option></select><input name="options" placeholder="Options (comma-separated)"><label><input type="checkbox" name="required"> Required</label><label><input type="checkbox" name="unique"> Unique</label><button type="button" class="secondary-button" data-remove>Remove</button>';
   row.querySelector('[name="field_label"]').addEventListener("input",e=>{const k=row.querySelector('[name="field_key"]');if(!k.dataset.edited)k.value=slugify(e.target.value).replace(/-/g,"_");});
   row.querySelector('[name="field_key"]').addEventListener("input",e=>e.target.dataset.edited="true");
   row.querySelector("[data-remove]").addEventListener("click",()=>row.remove());fieldHost.append(row);
  }
  $("[data-add-field]",form).addEventListener("click",addField);
  form.addEventListener("submit",async e=>{
   e.preventDefault();const submit=form.querySelector('[type="submit"]'),message=$(".editor-message",form);submit.disabled=true;
   try{
    const name=form.elements.name.value.trim(),slug=slugify(form.elements.slug.value),key=slug.replace(/-/g,"_");
    if(!name||!slug)throw new Error("Module name and slug are required.");
    if(modules.some(m=>m.module_key===key||m.slug===slug))throw new Error("This module name or slug already exists.");
    const order=Math.max(0,...modules.map(m=>Number(m.sort_order)||0))+10;
    const {data:m,error}=await supabase.from("modules").insert({module_key:key,name,slug,description:form.elements.description.value.trim(),icon:form.elements.icon.value.trim()||null,status:"draft",sort_order:order}).select("*").single();
    if(error)throw error;
    const defs=[{module_id:m.id,field_key:"title",label:"Title",field_type:"text",is_required:true,sort_order:10},{module_id:m.id,field_key:"slug",label:"Slug",field_type:"text",is_unique:true,sort_order:20}];
    for(const row of $$(".dashboard-builder-field-row",fieldHost)){
     const fieldKey=slugify(row.querySelector('[name="field_key"]').value).replace(/-/g,"_"),label=row.querySelector('[name="field_label"]').value.trim();
     if(!fieldKey||!label)throw new Error("Every field needs a valid key and label.");
     defs.push({module_id:m.id,field_key:fieldKey,label,field_type:row.querySelector('[name="field_type"]').value,is_required:row.querySelector('[name="required"]').checked,is_unique:row.querySelector('[name="unique"]').checked,sort_order:defs.length*10+10});
    }
    const {data:savedFields,error:fe}=await supabase.from("module_fields").insert(defs).select("id,field_key");if(fe)throw fe;
    const optionRows=[];
    for(const row of $(".dashboard-builder-field-row",fieldHost)){
     const type=row.querySelector('[name="field_type"]').value;
     if(!["select","radio","checkboxes"].includes(type))continue;
     const key=slugify(row.querySelector('[name="field_key"]').value).replace(/-/g,"_");
     const field=savedFields.find(x=>x.field_key===key);
     const values=row.querySelector('[name="options"]').value.split(",").map(x=>x.trim()).filter(Boolean);
     if(!field||!values.length)throw new Error("Add comma-separated options for "+key+".");
     values.forEach((v,i)=>optionRows.push({field_id:field.id,value:v,label:v,sort_order:(i+1)*10}));
    }
    if(optionRows.length){const {error:oe}=await supabase.from("module_field_options").insert(optionRows);if(oe)throw oe;}
    message.textContent="Draft created. Publish it below to add it to CONTENT.";message.dataset.kind="success";form.reset();await reloadRegistry();await builderPage();
   }catch(error){message.textContent=error.message||"Could not create module.";message.dataset.kind="error";}
   finally{submit.disabled=false;}
  });
  page.append(form,el("h3","","Existing Modules"));const list=el("div","dashboard-module-builder-list");
  modules.forEach(m=>{const row=el("article","dashboard-module-builder-row"),details=el("div");details.append(el("strong","",m.name),el("small","",m.slug+" · "+m.status));row.append(details);
   if(m.status!=="published"){const b=el("button","secondary-button","Publish");b.type="button";b.addEventListener("click",async()=>{const {error}=await supabase.from("modules").update({status:"published"}).eq("id",m.id);if(error)alert(error.message);else{await reloadRegistry();await builderPage();}});row.append(b);}
   const remove=el("button","secondary-button","Delete");remove.type="button";remove.disabled=Boolean(m.is_system);remove.title=m.is_system?"System modules cannot be deleted":"Permanently delete this Content Module";
   remove.addEventListener("click",async()=>{
    if(remove.disabled)return;
    remove.disabled=true;
    try{
     const {count,error:countError}=await supabase.from("content_items").select("id",{count:"exact",head:true}).eq("module_id",m.id);
     if(countError)throw countError;
     const confirmed=confirm("Permanently delete the Content Module \""+m.name+"\" and all "+(count??0)+" of its Content Items? Its own relations and files will also be deleted. Other modules and their content will remain; only references to this module will be removed. This cannot be undone.");
     if(!confirmed){remove.disabled=false;return;}
     const storagePaths=await listModuleStorageFiles(supabase,m.module_key);
     const {data:deleted,error}=await supabase.rpc("delete_content_module",{p_module_id:m.id});
     if(error)throw error;
     let storageWarning="";
     try{await removeModuleStorageFiles(supabase,storagePaths);}
     catch(storageError){storageWarning=" The database deletion succeeded, but some Storage files could not be removed: "+(storageError.message||"Unknown Storage error");}
     await reloadRegistry();
     await builderPage();
     if(storageWarning)alert("Module deleted."+storageWarning);
    }catch(error){alert(error.message||"Could not delete this Content Module.");remove.disabled=false;}
   });
   row.append(remove);list.append(row);
  });page.append(list);panel.append(page);
 }
 async function customizationPage(){
  const page=el("div","dashboard-page");page.append(el("h2","","Customization"),el("p","muted","Global visual settings and Home module visibility."));
  const [{data:setting,error},{data:runtimeRow,error:runtimeError}]=await Promise.all([
   supabase.from("Settings").select("setting_value").eq("setting_key","home_modules").maybeSingle(),
   supabase.from("Settings").select("setting_value").eq("setting_key","runtime_config").maybeSingle()
  ]);
  if(error||runtimeError){page.append(el("p","editor-message",(error||runtimeError).message));panel.append(page);return;}
  const runtime=runtimeRow?.setting_value&&typeof runtimeRow.setting_value==="object"?runtimeRow.setting_value:{schema_version:1};
  const globalForm=el("form","content-editor-form");
  globalForm.innerHTML='<h3>Global Style</h3><div class="module-form-grid"><label class="module-form-field"><span>Color</span><select name="palette"><option value="white">White</option><option value="black">Black</option><option value="neutral-gray">Neutral Gray</option></select></label><label class="module-form-field"><span>Size</span><select name="size"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></label><label class="module-form-field"><span>Direction</span><select name="direction"><option value="ltr">LTR</option><option value="rtl">RTL</option></select></label></div><div class="editor-actions"><button type="submit">Save Global Style</button></div><p class="editor-message" role="status"></p>';
  globalForm.elements.palette.value=runtime.palette||"white";globalForm.elements.size.value=runtime.size||"medium";globalForm.elements.direction.value=runtime.direction||"ltr";
  globalForm.addEventListener("submit",async event=>{event.preventDefault();const button=globalForm.querySelector('[type="submit"]'),msg=globalForm.querySelector(".editor-message");button.disabled=true;
   const next={...runtime,schema_version:1,palette:globalForm.elements.palette.value,size:globalForm.elements.size.value,direction:globalForm.elements.direction.value};
   const {error:saveError}=await supabase.from("Settings").upsert({setting_key:"runtime_config",setting_value:next,visibility_roles:["owner"],description:"Global style configuration"},{onConflict:"setting_key"});
   msg.textContent=saveError?saveError.message:"Global Style saved.";msg.dataset.kind=saveError?"error":"success";button.disabled=false;
   if(!saveError){window.dispatchEvent(new CustomEvent("runtime-config-updated",{detail:next}));}
  });
  page.append(globalForm);
  const current=setting?.setting_value?.modules||[],form=el("form","content-editor-form");
  modules.filter(m=>m.status==="published").forEach((m,i)=>{
   const c=current.find(x=>x.key===m.module_key),row=el("div","dashboard-home-module-row");row.dataset.key=m.module_key;
   const visible=el("input");visible.type="checkbox";visible.checked=c?c.visibility_roles?.includes("visitor"):true;
   const title=el("input");title.value=c?.title||m.name;title.maxLength=100;
   const order=el("input");order.type="number";order.min="1";order.value=String(c?.sort_order??(i+1)*10);
   row.append(visible,el("strong","",m.name),el("span","","Display title"),title,el("span","","Order"),order);form.append(row);
  });
  const save=el("button","","Save Customization");save.type="submit";form.append(save);const msg=el("p","editor-message");form.append(msg);
  form.addEventListener("submit",async e=>{e.preventDefault();save.disabled=true;
   const data=$$(".dashboard-home-module-row",form).map((r,i)=>({key:r.dataset.key,title:r.querySelectorAll("input")[1].value.trim()||r.querySelector("strong").textContent,sort_order:Number(r.querySelectorAll("input")[2].value)||((i+1)*10),visibility_roles:r.querySelectorAll("input")[0].checked?["owner","visitor"]:["owner"]}));
   const {error}=await supabase.from("Settings").upsert({setting_key:"home_modules",setting_value:{modules:data},visibility_roles:["owner","visitor"],description:"Homepage module visibility and ordering"},{onConflict:"setting_key"});
   msg.textContent=error?error.message:"Customization saved.";msg.dataset.kind=error?"error":"success";save.disabled=false;
  });
  page.append(form);panel.append(page);
 }
 async function settingsPage(){
  const page=el("div","dashboard-page");page.append(el("h2","","Settings"),el("p","muted","Website identity and configurable module slugs."));
  const {data:rows,error}=await supabase.from("Settings").select("*");
  if(error){page.append(el("p","editor-message",error.message));panel.append(page);return;}
  const map=new Map((rows||[]).map(r=>[r.setting_key,r])),websiteInfo=map.get("website_information")?.setting_value||{},profile=map.get("site_profile")?.setting_value||{},intro=map.get("home_intro")?.setting_value||{},moduleSlugMap=map.get("module_slugs")?.setting_value||{};
  const form=el("form","content-editor-form");
  form.innerHTML='<h3>Website Identity</h3><label class="module-form-field"><span>Website Title</span><input name="website_title" maxlength="100"></label><label class="module-form-field"><span>Logo URL</span><input name="logo_url" type="url"></label><label class="module-form-field"><span>Home Intro</span><textarea name="intro" rows="4"></textarea></label><h3>Dashboard Module Slugs</h3><div data-slugs></div><div class="editor-actions"><button type="submit">Save Settings</button></div><p class="editor-message" role="status"></p>';
  form.elements.website_title.value=profile.website_title||websiteInfo.title||"3B TECH HUB";form.elements.logo_url.value=profile.logo_url||websiteInfo.logo_url||"";form.elements.intro.value=intro.content||websiteInfo.intro||"";
  const slugHost=$("[data-slugs]",form);
  modules.forEach(m=>{const l=el("label","module-form-field");l.append(el("span","",m.name));const input=el("input");input.value=moduleSlugMap[m.module_key]||m.slug;input.required=true;input.dataset.moduleId=m.id;input.dataset.moduleKey=m.module_key;l.append(input);slugHost.append(l);});
  form.addEventListener("submit",async e=>{e.preventDefault();const button=form.querySelector('[type="submit"]'),msg=$(".editor-message",form);button.disabled=true;
   try{
    const websiteValue={...websiteInfo,title:form.elements.website_title.value.trim(),intro:form.elements.intro.value.trim(),logo_url:form.elements.logo_url.value.trim()};
    const settings=[
     {setting_key:"website_information",setting_value:websiteValue,visibility_roles:["owner","visitor"],description:"Website information"},
     {setting_key:"site_profile",setting_value:{...profile,website_title:websiteValue.title,logo_url:websiteValue.logo_url},visibility_roles:["owner","visitor"],description:"Website identity"},
     {setting_key:"home_intro",setting_value:{content:websiteValue.intro},visibility_roles:["owner","visitor"],description:"Homepage introduction"}
    ];
    const {error:se}=await supabase.from("Settings").upsert(settings,{onConflict:"setting_key"});if(se)throw se;
    const nextModuleSlugs={...moduleSlugMap};
    for(const input of $("[data-module-id]",slugHost)){const slug=slugify(input.value);if(!slug)throw new Error("Module slugs cannot be empty.");const {error:me}=await supabase.from("modules").update({slug}).eq("id",input.dataset.moduleId);if(me)throw me;nextModuleSlugs[input.dataset.moduleKey]=slug;}
    const {error:slugSettingError}=await supabase.from("Settings").upsert({setting_key:"module_slugs",setting_value:nextModuleSlugs,visibility_roles:["owner"],description:"Dashboard module slugs"},{onConflict:"setting_key"});
    if(slugSettingError)throw slugSettingError;
    msg.textContent="Settings saved.";msg.dataset.kind="success";await reloadRegistry();
   }catch(err){msg.textContent=err.message||"Could not save settings.";msg.dataset.kind="error";}
   finally{button.disabled=false;}
  });
  page.append(form);panel.append(page);
 }
 async function contentPage(module){
  const page=el("div","dashboard-page");page.append(el("h2","",module.name),el("p","muted","Create and edit records. Relationships are bidirectional and independent."));
  const form=el("form","content-editor-form"),moduleFields=fields.filter(f=>f.module_id===module.id),relationFields=moduleFields.filter(f=>f.field_type==="relation");
  const optionIds=moduleFields.filter(f=>["select","radio","checkboxes"].includes(f.field_type)).map(f=>f.id),optionsMap=new Map();
  if(optionIds.length){const {data}=await supabase.from("module_field_options").select("*").in("field_id",optionIds).eq("is_active",true).order("sort_order");(data||[]).forEach(o=>{if(!optionsMap.has(o.field_id))optionsMap.set(o.field_id,[]);optionsMap.get(o.field_id).push(o);});}
  form.innerHTML='<h3 data-form-title>Add Item</h3><div class="module-form-grid" data-core></div><div class="module-form-grid" data-fields></div><div class="module-form-field"><strong>Visibility</strong><div class="module-related-options" data-visibility></div></div><div class="module-form-grid"><label class="module-form-field"><span>Status</span><select name="status"><option value="draft">Draft</option><option value="active">Active</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label class="module-form-field"><span>Display Order</span><input name="sort_order" type="number" value="0"></label></div><div class="dashboard-item-relations"><h3>Related Items</h3><p class="muted">Choose related records from other Content Modules. The opposite form will show the same checked relationship.</p><div data-relations></div></div><div class="editor-actions"><button type="submit">Save Item</button><button type="button" class="secondary-button" data-cancel hidden>Cancel</button><button type="button" class="secondary-button" data-delete hidden>Delete Item</button></div><p class="editor-message" role="status"></p>';
  const core=$("[data-core]",form),dynamic=$("[data-fields]",form),visibility=$("[data-visibility]",form),relationHost=$("[data-relations]",form);
  const title=fieldControl({field_key:"title",label:"Title",field_type:"text",is_required:true},""),slugField=moduleFields.find(f=>f.field_key==="slug")||{field_key:"slug",label:"Slug",field_type:"text"};
  const slug=fieldControl(slugField,"");title.querySelector("input").name="core_title";slug.querySelector("input").name="core_slug";core.append(title,slug);
  const editable=moduleFields.filter(f=>!["title","slug"].includes(f.field_key)&&f.field_type!=="relation");
  for(const f of editable){
   const wrap=fieldControl(f,null,optionsMap.get(f.id)||[]),control=wrap.querySelector("[data-field-key]");
   if(["image","gallery","file"].includes(f.field_type)){
    const upload=el("input");upload.type="file";upload.accept=f.field_type==="file"?"*/*":"image/*";upload.multiple=f.field_type==="gallery";
    upload.addEventListener("change",async()=>{if(!upload.files?.length)return;try{const uploads=await uploadMedia(supabase,module.module_key,[...upload.files]);
     if(f.field_type==="image")control.value=uploads[0]?.url||"";
     else if(f.field_type==="file")control.value=uploads[0]?.path||"";
     else control.value=[control.value,...uploads.map(x=>x.url)].filter(Boolean).join("\n");
     if(module.module_key==="media"&&uploads[0]){
      const mime=$('[data-field-key="mime_type"]',form),size=$('[data-field-key="size_bytes"]',form),bucket=$('[data-field-key="bucket_id"]',form);
      if(mime)mime.value=uploads[0].mime_type||"";if(size)size.value=uploads[0].size_bytes;if(bucket)bucket.value="site-media";
     }}catch(err){const msg=$(".editor-message",form);msg.textContent=err.message;msg.dataset.kind="error";}});
    wrap.append(upload);
   }
   dynamic.append(wrap);
  }
  roles.filter(r=>r.is_active).forEach(r=>{const l=el("label","module-related-option"),c=el("input");c.type="checkbox";c.value=r.slug;c.checked=r.slug==="owner";c.disabled=r.slug==="owner";l.append(c,el("span","",r.name));visibility.append(l);});
  const relationPickers=[];
  for(const rf of relationFields){
   const target=modules.find(m=>m.id===rf.settings?.target_module_id);if(!target)continue;
   const group=el("fieldset","dashboard-relation-picker");group.append(el("legend","",target.name));
   const search=el("input");search.type="search";search.placeholder="Search "+target.name+"…";
   const list=el("div","module-related-options");group.append(search,list);relationHost.append(group);
   const picker={target,search,list,selectedIds:new Set(),timer:null};
   picker.load=async(term="")=>{
    const visibleRole=String(user?.role||"owner").toLowerCase();
    let query=supabase.from("content_items").select("id,title,slug,visibility_roles,status").eq("module_id",target.id).in("status",["active","published"]).contains("visibility_roles",[visibleRole]).order("title").limit(100);
    if(term)query=query.ilike("title","%"+term+"%");
    const {data,error}=await query;
    if(error){list.replaceChildren(el("small","muted",error.message));return;}
    const items=[...(data||[])];
    const missing=[...picker.selectedIds].filter(id=>!items.some(item=>item.id===id));
    if(missing.length){
     const {data:extra}=await supabase.from("content_items").select("id,title,slug,visibility_roles,status").in("id",missing);
     items.push(...(extra||[]).filter(item=>item.status==="active"||item.status==="published").filter(item=>(item.visibility_roles||[]).includes(visibleRole)));
    }
    list.replaceChildren();
    items.forEach(item=>{
     const label=el("label","module-related-option"),check=el("input");check.type="checkbox";check.value=item.id;check.checked=picker.selectedIds.has(item.id);
     check.addEventListener("change",()=>{if(check.checked)picker.selectedIds.add(item.id);else picker.selectedIds.delete(item.id);});
     label.append(check,el("span","",item.title+(item.slug?" · "+item.slug:"")));list.append(label);
    });
    if(!items.length)list.append(el("small","muted","No matching items."));
   };
   search.addEventListener("input",()=>{clearTimeout(picker.timer);picker.timer=setTimeout(()=>void picker.load(search.value.trim()),250);});
   relationPickers.push(picker);await picker.load("");
  }
  const searchBar=el("div","dashboard-toolbar"),searchLabel=el("label","","Search this module"),searchInput=el("input"),suggestions=el("datalist");
  searchInput.type="search";searchInput.placeholder="Search by text or number…";suggestions.id="module-search-"+module.id;searchInput.setAttribute("list",suggestions.id);searchLabel.append(searchInput);searchBar.append(searchLabel,suggestions);
  const records=el("div","dashboard-record-list");page.append(form,searchBar,el("h3","","Database"),records);panel.append(page);
  let loadedRecords=[],draggedRecordId=null;
  function renderRecords(){
   records.replaceChildren();const term=searchInput.value.trim().toLocaleLowerCase();
   const matches=loadedRecords.filter(item=>{
    if(!term)return true;
    const values=[item.title,item.slug,item.status,...Object.values(item.field_values||{}).flat(Infinity)];
    return values.some(value=>value!==null&&value!==undefined&&String(typeof value==="object"?JSON.stringify(value):value).toLocaleLowerCase().includes(term));
   });
   if(!matches.length){records.append(el("p","muted",loadedRecords.length?"No matching records.":"No records yet."));return;}
   matches.forEach(item=>{
    const b=el("button","dashboard-record-row");b.type="button";b.draggable=!term;
    b.append(el("strong","",item.title),el("small","",item.slug||item.status));
    b.addEventListener("click",()=>{if(!draggedRecordId)void editItem(item);});
    b.addEventListener("dragstart",event=>{draggedRecordId=item.id;b.classList.add("is-dragging");if(event.dataTransfer){event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/plain",item.id);}});
    b.addEventListener("dragend",()=>{draggedRecordId=null;records.querySelectorAll(".is-dragging,.is-drag-over").forEach(node=>node.classList.remove("is-dragging","is-drag-over"));});
    b.addEventListener("dragover",event=>{if(!draggedRecordId||term||draggedRecordId===item.id)return;event.preventDefault();b.classList.add("is-drag-over");});
    b.addEventListener("dragleave",()=>b.classList.remove("is-drag-over"));
    b.addEventListener("drop",async event=>{
     event.preventDefault();b.classList.remove("is-drag-over");
     const sourceId=draggedRecordId||event.dataTransfer?.getData("text/plain");draggedRecordId=null;
     if(!sourceId||sourceId===item.id)return;
     const ordered=[...loadedRecords],from=ordered.findIndex(row=>row.id===sourceId),to=ordered.findIndex(row=>row.id===item.id);
     if(from<0||to<0)return;
     const [moved]=ordered.splice(from,1);ordered.splice(to,0,moved);loadedRecords=ordered;renderRecords();
     const updates=await Promise.all(loadedRecords.map((row,index)=>supabase.from("content_items").update({sort_order:(index+1)*10}).eq("id",row.id)));
     const failed=updates.find(result=>result.error);
     const message=$(".editor-message",form);
     if(failed){message.textContent="Order could not be saved: "+failed.error.message;message.dataset.kind="error";await loadRecords();}
     else{message.textContent="Display order saved.";message.dataset.kind="success";}
    });
    records.append(b);
   });
  }
  searchInput.addEventListener("input",renderRecords);
  async function loadRecords(){
   records.replaceChildren();const {data,error}=await supabase.from("content_items").select("*").eq("module_id",module.id).order("sort_order").order("created_at",{ascending:false});
   if(error){records.append(el("p","editor-message",error.message));return;}
   loadedRecords=data||[];suggestions.replaceChildren();
   const values=new Set();for(const item of loadedRecords){if(item.title)values.add(String(item.title));if(item.slug)values.add(String(item.slug));for(const value of Object.values(item.field_values||{})){if(typeof value==="number")values.add(String(value));}}
   [...values].slice(0,100).forEach(value=>{const option=el("option");option.value=value;suggestions.append(option);});
   renderRecords();
  }
  async function editItem(item){
   form.dataset.editId=item.id;form.elements.core_title.value=item.title||"";form.elements.core_slug.value=item.slug||"";form.elements.status.value=item.status||"draft";form.elements.sort_order.value=item.sort_order??0;
   editable.forEach(f=>{const c=$('[data-field-key="'+f.field_key+'"]',form);if(!c)return;const v=item.field_values?.[f.field_key];if(f.field_type==="boolean")c.checked=Boolean(v);else if(f.field_type==="checkboxes")$$('input[type="checkbox"]',c).forEach(x=>x.checked=Array.isArray(v)&&v.includes(x.value));else if(f.field_type==="json")c.value=v==null?"":JSON.stringify(v,null,2);else if(["gallery","multi_text"].includes(f.field_type))c.value=Array.isArray(v)?v.join("\n"):(v||"");else c.value=v??"";});
   const chosen=new Set(item.visibility_roles||["owner"]);$$('input[type="checkbox"]',visibility).forEach(c=>c.checked=c.value==="owner"||chosen.has(c.value));
   const {data:rels}=await supabase.from("relations").select("*").or("item_a_id.eq."+item.id+",item_b_id.eq."+item.id);
   const relatedIds=[...new Set((rels||[]).map(r=>r.item_a_id===item.id?r.item_b_id:r.item_a_id))];
   const {data:relatedItems}=relatedIds.length?await supabase.from("content_items").select("id,module_id").in("id",relatedIds):{data:[]};
   for(const picker of relationPickers){picker.selectedIds.clear();(relatedItems||[]).filter(x=>x.module_id===picker.target.id).forEach(x=>picker.selectedIds.add(x.id));await picker.load(picker.search.value.trim());}
   $("[data-form-title]",form).textContent="Edit "+module.name+" Item";$("[data-cancel]",form).hidden=false;$("[data-delete]",form).hidden=false;form.scrollIntoView({behavior:"smooth",block:"start"});
  }
  function resetForm(){
   form.reset();delete form.dataset.editId;form.elements.status.value="draft";form.elements.sort_order.value="0";
   $$('input[type="checkbox"]',visibility).forEach(c=>c.checked=c.value==="owner");
   for(const picker of relationPickers){picker.selectedIds.clear();void picker.load(picker.search.value.trim());}
   $("[data-form-title]",form).textContent="Add "+module.name+" Item";$("[data-cancel]",form).hidden=true;$("[data-delete]",form).hidden=true;
  }
  form.addEventListener("submit",async e=>{
   e.preventDefault();const submit=form.querySelector('[type="submit"]'),msg=$(".editor-message",form);submit.disabled=true;
   try{
    const titleValue=form.elements.core_title.value.trim(),slugValue=form.elements.core_slug.value.trim();if(!titleValue)throw new Error("Title is required.");
    const values={};editable.forEach(f=>{const c=$('[data-field-key="'+f.field_key+'"]',form);if(c)values[f.field_key]=readField(f,c);});
    const visible=[...new Set(["owner",...$$('input[type="checkbox"]:checked',visibility).map(c=>c.value)])];
    const payload={module_id:module.id,title:titleValue,slug:slugValue||null,status:form.elements.status.value,visibility_roles:visible,sort_order:Number(form.elements.sort_order.value)||0,field_values:values,updated_by:user.id};
    let id=form.dataset.editId;
    if(id){const {error}=await supabase.from("content_items").update(payload).eq("id",id);if(error)throw error;}
    else{payload.created_by=user.id;const {data,error}=await supabase.from("content_items").insert(payload).select("id").single();if(error)throw error;id=data.id;}
    const related=[...new Set(relationPickers.flatMap(picker=>[...picker.selectedIds]))];
    const {data:existingRelations,error:relationReadError}=await supabase.from("relations").select("id,item_a_id,item_b_id").or("item_a_id.eq."+id+",item_b_id.eq."+id);
    if(relationReadError)throw relationReadError;
    const existingByOther=new Map((existingRelations||[]).map(row=>[row.item_a_id===id?row.item_b_id:row.item_a_id,row]));
    const wanted=new Set(related);
    const removeIds=[...existingByOther].filter(([other])=>!wanted.has(other)).map(([,row])=>row.id);
    if(removeIds.length){const {error:removeError}=await supabase.from("relations").delete().in("id",removeIds);if(removeError)throw removeError;}
    const addRows=related.filter(other=>!existingByOther.has(other)).map(other=>({item_a_id:id<other?id:other,item_b_id:id<other?other:id}));
    if(addRows.length){const {error:addError}=await supabase.from("relations").insert(addRows);if(addError)throw addError;}
    msg.textContent="Saved successfully.";msg.dataset.kind="success";resetForm();await loadRecords();
   }catch(err){msg.textContent=err.message||"Could not save the Item.";msg.dataset.kind="error";}
   finally{submit.disabled=false;}
  });
  $("[data-cancel]",form).addEventListener("click",resetForm);
  $("[data-delete]",form).addEventListener("click",async()=>{const id=form.dataset.editId;if(!id||!confirm("Delete this Content Item? Related links will be removed; other Items will remain."))return;const {error}=await supabase.from("content_items").delete().eq("id",id);if(error){$(".editor-message",form).textContent=error.message;return;}resetForm();await loadRecords();});
  await loadRecords();
 }
 try{await open("overview");}catch(error){console.error("Dashboard overview failed to load.",error);panel.replaceChildren(el("h2","","Dashboard"),el("p","editor-message","Dashboard overview could not load: "+(error?.message||"Unknown error")));}
}
