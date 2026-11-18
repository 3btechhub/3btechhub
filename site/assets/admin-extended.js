
function el(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
function say(id,message,kind=""){const node=document.getElementById(id);if(node){node.textContent=message;node.dataset.kind=kind;}}
function slug(value){return String(value||"").normalize("NFKD").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"item";}
function tap(host,label,fn){const row=el("article","admin-list-row module-record-row module-record-row--tap-edit");row.tabIndex=0;row.setAttribute("role","button");row.setAttribute("aria-label","Edit "+label);row.append(el("strong","",label||"Untitled"));row.addEventListener("click",fn);row.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();fn();}});host.append(row);}
function reset(form,titleId,title,after){form.reset();form.dataset.editId="";document.getElementById(titleId).textContent=title;after?.();}
function checks(host,items,selected=[]){if(!host)return;host.replaceChildren();const chosen=new Set(selected);if(!items.length){host.append(el("small","muted","No records available."));return;}for(const item of items){const label=el("label","module-related-option"),input=el("input");input.type="checkbox";input.value=item.value;input.checked=chosen.has(item.value);input.disabled=Boolean(item.disabled);label.append(input,el("span","",item.label));host.append(label);}}
function checked(host){return host?[...host.querySelectorAll('input[type="checkbox"]:checked')].map(input=>input.value):[];}
function messageFrom(error){return error?.message||"The request could not be completed.";}

export function initExtendedDashboard(supabase,role){
 if(!["owner","admin"].includes(role))return;
 let roles=[],permissions=[],users=[];
 async function ownerUsers(body){const {data,error}=await supabase.functions.invoke("owner-users",{body});if(error)throw new Error(error.message||"User administration request failed.");if(data?.error)throw new Error(data.error);return data;}
 async function loadLookups(){
  const [roleResult,permissionResult,userResult]=await Promise.all([
   supabase.from("Roles").select("*").order("name"),
   supabase.from("permissions").select("*").order("name"),
   ownerUsers({action:"list",page:1,perPage:50})
  ]);
  if(roleResult.error)throw roleResult.error;if(permissionResult.error)throw permissionResult.error;
  roles=roleResult.data||[];permissions=permissionResult.data||[];users=userResult.users||[];
 }
 const roleOptions=()=>roles.filter(item=>item.is_active&&item.slug!=="owner").map(item=>({value:item.slug,label:item.name}));
 const permissionOptions=()=>permissions.filter(item=>item.is_active).map(item=>({value:item.id,label:item.name}));
 const userOptions=()=>users.filter(item=>!((item.roles||[]).includes("owner"))).map(item=>({value:item.id,label:(item.full_name||item.email||"User")+" · "+item.email}));
 async function refreshAll(){await loadLookups();await Promise.all([loadUsers(),loadRoles(),loadPermissions()]);}

 // One shared CRUD adapter is used for the Role and Permission forms.
 function bindSharedCrud({form,list,formTitle,titleText,load,save,remove,edit,emptyText}){
  if(!form||!list)return;
  async function refresh(){list.replaceChildren();try{await load();}catch(error){list.append(el("p","muted",messageFrom(error)));}}
  function resetForm(){reset(form,formTitle,titleText,()=>{form.querySelectorAll("[data-cancel]").forEach(node=>node.hidden=true);form.querySelectorAll("[data-delete]").forEach(node=>node.hidden=true);});}
  form.addEventListener("submit",async event=>{event.preventDefault();const button=form.querySelector('[type="submit"]');button.disabled=true;try{await save(form);resetForm();say(form.dataset.messageId,"Saved successfully.","success");await refresh();}catch(error){say(form.dataset.messageId,messageFrom(error),"error");}finally{button.disabled=false;}});
  form.querySelector("[data-cancel]")?.addEventListener("click",resetForm);
  form.querySelector("[data-delete]")?.addEventListener("click",async()=>{const id=form.dataset.editId;if(!id||!confirm("Delete this record?"))return;const button=form.querySelector("[data-delete]");button.disabled=true;try{await remove(id);resetForm();say(form.dataset.messageId,"Deleted successfully.","success");await refresh();}catch(error){say(form.dataset.messageId,messageFrom(error),"error");}finally{button.disabled=false;}});
  form.querySelector("[data-refresh]")?.addEventListener("click",refresh);
  form.dataset.messageId=form.dataset.messageId||"";
  form._sharedRefresh=refresh;
  form._sharedEdit=(record)=>{edit(form,record);form.querySelector("[data-cancel]").hidden=false;form.querySelector("[data-delete]").hidden=false;document.getElementById(formTitle).textContent="Edit "+titleText.replace(/^Add /,"").toLowerCase();form.scrollIntoView({behavior:"smooth",block:"start"});};
  form._sharedList=list;
  form._sharedEmpty=emptyText;
  void refresh();
 }

 // Users: Title plus the email required by Supabase Auth, Roles and direct Permissions.
 const uf=document.getElementById("users-form"),ul=document.getElementById("users-list"),uro=document.getElementById("user-role-options"),upo=document.getElementById("user-permission-options");
 async function loadUsers(){
  if(!ul)return;
  await loadLookups();ul.replaceChildren();checks(uro,roleOptions());
  for(const user of users)tap(ul,(user.full_name||user.email)+" · "+user.email,()=>{
   if((user.roles||[]).includes("owner")){say("users-message","The Owner account is protected.");return;}
   uf.dataset.editId=user.id;uf.elements.title.value=user.full_name||"";uf.elements.slug.value=user.slug||slug(user.full_name||user.email);uf.elements.type.value=user.type||"member";uf.elements.description.value=user.description||"";uf.elements.email.value=user.email||"";uf.elements.email.readOnly=true;uf.elements.visibility.value=user.visibility||"show";
   const status=user.status||((user.banned_until&&new Date(user.banned_until)>new Date())?"blocked":"active");uf.elements.accountStatus.value=status;
   checks(uro,roleOptions(),user.roles||[]);checks(upo,permissionOptions(),user.permissions||[]);
   document.getElementById("users-form-title").textContent="Edit user";
   document.getElementById("users-cancel").hidden=false;
   ["users-active","users-deactive","users-block","users-delete"].forEach(id=>{const node=document.getElementById(id);if(node)node.hidden=false;});
   document.getElementById("users-active").disabled=status==="active";
   document.getElementById("users-deactive").disabled=status==="deactive";
   document.getElementById("users-block").disabled=status==="blocked";
   uf.scrollIntoView({behavior:"smooth",block:"start"});
  });
  if(!users.length)ul.append(el("p","muted","No records found."));
 }
 function resetUsers(){
  reset(uf,"users-form-title","Add user",()=>{
   uf.elements.email.readOnly=false;uf.elements.type.value="member";uf.elements.visibility.value="show";uf.elements.accountStatus.value="active";
   document.getElementById("users-cancel").hidden=true;
   ["users-active","users-deactive","users-block","users-delete"].forEach(id=>{const node=document.getElementById(id);if(node)node.hidden=true;});
   checks(uro,roleOptions());checks(upo,permissionOptions());
  });
 }
 if(uf){
  uf.elements.title.addEventListener("input",()=>{if(!uf.dataset.editId)uf.elements.slug.value=slug(uf.elements.title.value);});
 }
 async function changeUserStatus(status){
  const id=uf?.dataset.editId;if(!id)return;
  const buttons=["users-active","users-deactive","users-block","users-delete"].map(key=>document.getElementById(key)).filter(Boolean);
  buttons.forEach(button=>button.disabled=true);
  try{await ownerUsers({action:"set-status",userId:id,status});say("users-message","User status updated.","success");resetUsers();await loadUsers();}
  catch(error){say("users-message",messageFrom(error),"error");}
  finally{buttons.forEach(button=>button.disabled=false);}
 }
 document.getElementById("users-active")?.addEventListener("click",()=>void changeUserStatus("active"));
 document.getElementById("users-deactive")?.addEventListener("click",()=>void changeUserStatus("deactive"));
 document.getElementById("users-block")?.addEventListener("click",()=>void changeUserStatus("blocked"));
 document.getElementById("users-delete")?.addEventListener("click",async()=>{
  const id=uf?.dataset.editId;if(!id||!confirm("Delete this User permanently?"))return;
  const button=document.getElementById("users-delete");button.disabled=true;
  try{await ownerUsers({action:"delete-user",userId:id});say("users-message","User deleted.","success");resetUsers();await loadUsers();}
  catch(error){say("users-message",messageFrom(error),"error");}
  finally{button.disabled=false;}
 });
 uf?.addEventListener("submit",async event=>{
  event.preventDefault();const button=document.getElementById("users-submit");button.disabled=true;say("users-message","Saving…");
  try{
   const title=uf.elements.title.value.trim(),email=uf.elements.email.value.trim().toLowerCase(),userSlug=slug(uf.elements.slug.value||title),type=uf.elements.type.value.trim()||"member",description=uf.elements.description.value.trim(),visibility=uf.elements.visibility.value,selectedRoles=checked(uro),id=uf.dataset.editId,requestedStatus=uf.elements.accountStatus.value;
   if(!title||!email||!userSlug)throw new Error("Name and Email are required.");
   const rolesToSave=selectedRoles.length?selectedRoles:["member"];
   if(id){
    await ownerUsers({action:"set-profile",userId:id,name:title,phone:"",slug:userSlug,type,description,visibility});
    await ownerUsers({action:"set-roles",userId:id,roles:rolesToSave});
    await ownerUsers({action:"set-status",userId:id,status:requestedStatus});
    say("users-message","User updated.","success");
   }else{
    await ownerUsers({action:"invite",email,name:title,phone:"",slug:userSlug,type,description,visibility,roles:rolesToSave,permissions:[]});
    say("users-message","Invitation sent to "+email+".","success");
   }
   resetUsers();await loadUsers();
  }catch(error){say("users-message",messageFrom(error),"error");}
  finally{button.disabled=false;}
 });
 document.getElementById("users-cancel")?.addEventListener("click",resetUsers);document.getElementById("users-refresh")?.addEventListener("click",loadUsers);if(uf)void loadUsers();

 // Roles: Title, Users and Permissions.
 const rf=document.getElementById("roles-form"),rl=document.getElementById("roles-list"),rpo=document.getElementById("role-permission-options"),ruo=document.getElementById("role-user-options");
 rf?.elements.title.addEventListener("input",()=>{if(!rf.dataset.editId)rf.elements.slug.value=slug(rf.elements.title.value);});
 async function loadRoles(){if(!rl)return;await loadLookups();checks(rpo,permissionOptions());checks(ruo,userOptions());rl.replaceChildren();for(const item of roles)tap(rl,item.name,async()=>{rf.dataset.editId=item.id;rf.elements.title.value=item.name||"";rf.elements.slug.value=item.slug||"";rf.elements.type.value=item.is_system?"system":"custom";rf.elements.description.value=item.description||"";rf.elements.visibility.value=item.is_active?"show":"hide";rf.elements.slug.readOnly=Boolean(item.is_system);rf.elements.type.disabled=Boolean(item.is_system);rf.elements.visibility.disabled=item.slug==="owner";const [permissionResult,userRoleResult]=await Promise.all([supabase.from("role_permissions").select("permission_id").eq("role_id",item.id),supabase.from("user_roles").select("user_id").eq("role",item.slug)]);if(permissionResult.error)throw permissionResult.error;if(userRoleResult.error)throw userRoleResult.error;checks(rpo,permissionOptions(),(permissionResult.data||[]).map(row=>row.permission_id));checks(ruo,userOptions(),(userRoleResult.data||[]).map(row=>row.user_id));document.getElementById("roles-form-title").textContent="Edit role";document.getElementById("roles-cancel").hidden=false;document.getElementById("roles-delete").hidden=Boolean(item.is_system);document.getElementById("roles-submit").disabled=item.slug==="owner";rf.scrollIntoView({behavior:"smooth",block:"start"});});if(!roles.length)rl.append(el("p","muted","No records found."));}
 function resetRoles(){reset(rf,"roles-form-title","Add role",()=>{document.getElementById("roles-cancel").hidden=true;document.getElementById("roles-delete").hidden=true;document.getElementById("roles-submit").disabled=false;rf.elements.type.value="custom";rf.elements.visibility.value="show";rf.elements.slug.readOnly=false;rf.elements.type.disabled=false;rf.elements.visibility.disabled=false;checks(rpo,permissionOptions());checks(ruo,userOptions());});}
 rf?.addEventListener("submit",async event=>{event.preventDefault();const button=document.getElementById("roles-submit");button.disabled=true;say("roles-message","Saving…");try{const title=rf.elements.title.value.trim(),id=rf.dataset.editId,permissionIds=checked(rpo),selectedUsers=new Set(checked(ruo)),description=rf.elements.description.value.trim(),requestedSlug=slug(rf.elements.slug.value||title),visible=rf.elements.visibility.value==="show";if(!title)throw new Error("Name is required.");if(!requestedSlug)throw new Error("Slug is required.");let roleId=id,roleSlug;if(id){const existing=roles.find(item=>item.id===id);if(!existing)throw new Error("Role not found.");if(existing.is_system&&requestedSlug!==existing.slug)throw new Error("System role slugs are protected.");roleSlug=existing.slug;const payload={name:title,description,is_active:existing.slug==="owner"?existing.is_active:visible,slug:existing.is_system?existing.slug:requestedSlug};const {error}=await supabase.from("Roles").update(payload).eq("id",id);if(error)throw error;}else{if(rf.elements.type.value==="system")throw new Error("New roles must be Custom.");roleSlug=requestedSlug;const {data,error}=await supabase.from("Roles").insert({name:title,slug:roleSlug,description,is_active:visible,is_system:false}).select("id").single();if(error)throw error;roleId=data.id;}
 const {error:deletePermissions}=await supabase.from("role_permissions").delete().eq("role_id",roleId);if(deletePermissions)throw deletePermissions;if(permissionIds.length){const {error}=await supabase.from("role_permissions").insert(permissionIds.map(permission_id=>({role_id:roleId,permission_id})));if(error)throw error;}
 const currentUsers=users.filter(user=>!(user.roles||[]).includes("owner"));for(const user of currentUsers){const had=(user.roles||[]).includes(roleSlug),want=selectedUsers.has(user.id);if(had===want)continue;let next=(user.roles||[]).filter(value=>value!==roleSlug);if(want)next.push(roleSlug);if(!next.length)next=["member"];await ownerUsers({action:"set-roles",userId:user.id,roles:[...new Set(next)]});}
 resetRoles();say("roles-message",id?"Role updated.":"Role created.","success");await loadRoles();window.dispatchEvent(new Event("site-roles-updated"));}catch(error){say("roles-message",messageFrom(error),"error");}finally{button.disabled=false;}});
 document.getElementById("roles-cancel")?.addEventListener("click",resetRoles);document.getElementById("roles-refresh")?.addEventListener("click",loadRoles);
 document.getElementById("roles-delete")?.addEventListener("click",async()=>{const id=rf.dataset.editId,item=roles.find(role=>role.id===id);if(!id||item?.is_system||!confirm("Delete this Role?"))return;try{const {count,error:countError}=await supabase.from("user_roles").select("user_id",{count:"exact",head:true}).eq("role",item.slug);if(countError)throw countError;if(count)throw new Error("Remove this Role from all Users before deleting it.");const {error}=await supabase.from("Roles").delete().eq("id",id);if(error)throw error;resetRoles();say("roles-message","Role deleted.","success");await loadRoles();window.dispatchEvent(new Event("site-roles-updated"));}catch(error){say("roles-message",messageFrom(error),"error");}});
 if(rf)void loadRoles();

 // Permission: Title, Users and Roles.
 const pf=document.getElementById("permission-form"),pl=document.getElementById("permissions-list"),puo=document.getElementById("permission-user-options"),pro=document.getElementById("permission-role-options");
 pf?.elements.title.addEventListener("input",()=>{if(!pf.dataset.editId){const key=slug(pf.elements.title.value);pf.elements.slug.value=key;setPermissionType(key==="write"?"write":"read");}});
 function setPermissionType(action="read"){const select=pf?.elements.type;if(!select)return;const options=[["read","Read"],["write","Write"]];if(action&&!options.some(([value])=>value===action))options.push([action,String(action).charAt(0).toUpperCase()+String(action).slice(1)]);select.replaceChildren(...options.map(([value,label])=>new Option(label,value)));select.value=action||"read";}
async function loadPermissions(){if(!pl)return;await loadLookups();checks(puo,userOptions());checks(pro,roleOptions());pl.replaceChildren();for(const item of permissions)tap(pl,item.name,async()=>{pf.dataset.editId=item.id;pf.elements.title.value=item.name||"";pf.elements.slug.value=item.permission_key||"";setPermissionType(item.action||"read");pf.elements.description.value=item.description||"";pf.elements.visibility.value=item.is_active?"show":"hide";const [roleResult,userResult]=await Promise.all([supabase.from("role_permissions").select("role_id").eq("permission_id",item.id),supabase.from("user_permissions").select("user_id").eq("permission_id",item.id)]);if(roleResult.error)throw roleResult.error;if(userResult.error)throw userResult.error;const roleIds=new Set((roleResult.data||[]).map(row=>row.role_id));checks(pro,roles.filter(role=>role.slug!=="owner").map(role=>({value:role.id,label:role.name})),[...roleIds]);checks(puo,userOptions(),(userResult.data||[]).map(row=>row.user_id));document.getElementById("permission-form-title").textContent="Edit permission";document.getElementById("permission-cancel").hidden=false;document.getElementById("permission-delete").hidden=false;pf.scrollIntoView({behavior:"smooth",block:"start"});});if(!permissions.length)pl.append(el("p","muted","No records found."));}
 function resetPermission(){reset(pf,"permission-form-title","Add permission",()=>{document.getElementById("permission-cancel").hidden=true;document.getElementById("permission-delete").hidden=true;setPermissionType("read");pf.elements.visibility.value="show";checks(puo,userOptions());checks(pro,roleOptions());});}
 pf?.addEventListener("submit",async event=>{event.preventDefault();const button=document.getElementById("permission-submit");button.disabled=true;say("permission-message","Saving…");try{const title=pf.elements.title.value.trim(),id=pf.dataset.editId,selectedUsers=new Set(checked(puo)),selectedRoleIds=checked(pro),permissionKey=pf.elements.slug.value.trim(),action=pf.elements.type.value,description=pf.elements.description.value.trim(),isActive=pf.elements.visibility.value==="show";if(!title||!permissionKey)throw new Error("Name and Slug are required.");let permissionId=id;if(id){const existing=permissions.find(item=>item.id===id);if(!existing)throw new Error("Permission not found.");const {error}=await supabase.from("permissions").update({name:title,permission_key:permissionKey,action,description,is_active:isActive}).eq("id",id);if(error)throw error;}else{const {data,error}=await supabase.from("permissions").insert({name:title,permission_key:permissionKey,resource:"content",action,description,is_active:isActive}).select("id").single();if(error)throw error;permissionId=data.id;}
 const {error:deleteRoles}=await supabase.from("role_permissions").delete().eq("permission_id",permissionId);if(deleteRoles)throw deleteRoles;if(selectedRoleIds.length){const {error}=await supabase.from("role_permissions").insert(selectedRoleIds.map(role_id=>({role_id,permission_id:permissionId})));if(error)throw error;}
 const currentUsers=users.filter(user=>!(user.roles||[]).includes("owner"));for(const user of currentUsers){const had=(user.permissions||[]).includes(permissionId),want=selectedUsers.has(user.id);if(had===want)continue;const next=(user.permissions||[]).filter(value=>value!==permissionId);if(want)next.push(permissionId);await ownerUsers({action:"set-permissions",userId:user.id,permissions:[...new Set(next)]});}
 resetPermission();say("permission-message",id?"Permission updated.":"Permission created.","success");await loadPermissions();}catch(error){say("permission-message",messageFrom(error),"error");}finally{button.disabled=false;}});
 document.getElementById("permission-cancel")?.addEventListener("click",resetPermission);document.getElementById("permission-refresh")?.addEventListener("click",loadPermissions);
 document.getElementById("permission-delete")?.addEventListener("click",async()=>{const id=pf.dataset.editId;if(!id||!confirm("Delete this Permission? It will be removed from assigned Users and Roles."))return;try{const {error}=await supabase.from("permissions").delete().eq("id",id);if(error)throw error;resetPermission();say("permission-message","Permission deleted.","success");await loadPermissions();}catch(error){say("permission-message",messageFrom(error),"error");}});
 if(pf)void loadPermissions();
}
