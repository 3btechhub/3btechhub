import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const origins = new Set(["https://3btechhub.github.io", "http://localhost:5173"]);
const cors = (req:Request) => { const origin=req.headers.get("Origin")||""; return {"Access-Control-Allow-Origin":origins.has(origin)?origin:"https://3btechhub.github.io","Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}; };
const reply=(req:Request,body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors(req),"Content-Type":"application/json","Cache-Control":"no-store"}});
function envKey(jsonName:string,legacyName:string){const raw=Deno.env.get(jsonName);if(raw){try{const parsed=JSON.parse(raw);if(parsed.default)return parsed.default;}catch{}}return Deno.env.get(legacyName)||"";}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
 if(req.method!=="POST")return reply(req,{error:"Method not allowed"},405);
 const auth=req.headers.get("Authorization")||"";const token=auth.replace(/^Bearer\s+/i,"");if(!token)return reply(req,{error:"Authentication required"},401);
 const url=Deno.env.get("SUPABASE_URL")||"",pub=envKey("SUPABASE_PUBLISHABLE_KEYS","SUPABASE_ANON_KEY"),secret=envKey("SUPABASE_SECRET_KEYS","SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!pub||!secret)return reply(req,{error:"Server configuration is incomplete"},500);
 const caller=createClient(url,pub,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}});
 const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:authData,error:authError}=await caller.auth.getUser(token);if(authError||!authData.user)return reply(req,{error:"Invalid session"},401);
 const {data:profile,error:profileError}=await caller.from("profiles").select("id,email,status,role:roles(name)").eq("id",authData.user.id).single();
 if(profileError||!profile||profile.status!=="active")return reply(req,{error:"Active profile required"},403);
 const callerRole=(profile.role as {name?:string}|null)?.name||"Visitor";if(!["Owner","Admin"].includes(callerRole))return reply(req,{error:"Dashboard permission required"},403);
 let body:Record<string,unknown>;try{body=await req.json();}catch{return reply(req,{error:"Invalid JSON"},400);}
 const action=String(body.action||"");
 if(action==="create"){
  const email=String(body.email||"").trim().toLowerCase(),password=String(body.password||""),name=String(body.name||"").trim(),requestedRole=String(body.role||"Member");
  if(!email||!password||!name)return reply(req,{error:"Name, email and password are required"},400);
  if(!["Member","Admin"].includes(requestedRole))return reply(req,{error:"Only Member or Admin accounts can be created"},400);
  if(callerRole==="Admin"&&requestedRole!=="Member")return reply(req,{error:"Admin can create Member accounts only"},403);
  const {data:reserved,error:reservedError}=await admin.rpc("is_reserved_owner_email",{p_email:email});
  if(reservedError)return reply(req,{error:"Unable to verify reserved identity"},500);
  if(reserved)return reply(req,{error:"The permanent Owner email is reserved"},403);
  const {data:created,error:createError}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{name}});
  if(createError||!created.user)return reply(req,{error:createError?.message||"User creation failed"},400);
  if(requestedRole==="Admin"){
   const {data:roleRow,error:roleError}=await admin.from("roles").select("id").eq("name","Admin").single();
   if(roleError||!roleRow){await admin.auth.admin.deleteUser(created.user.id);return reply(req,{error:"Requested role is unavailable"},500);}
   const {error:updateError}=await admin.from("profiles").update({role_id:roleRow.id}).eq("id",created.user.id);
   if(updateError){await admin.auth.admin.deleteUser(created.user.id);return reply(req,{error:"Account created but role assignment failed"},500);}
  }
  await admin.from("audits").insert({actor_id:authData.user.id,action:"CREATE",resource_type:"profiles",resource_id:created.user.id,result:"success",summary:"Created "+requestedRole+" account"});
  return reply(req,{id:created.user.id,email,role:requestedRole},201);
 }
 const targetId=String(body.user_id||"");if(!targetId)return reply(req,{error:"user_id is required"},400);
 const {data:target,error:targetError}=await caller.from("profiles").select("id,email,status,role:roles(name)").eq("id",targetId).single();
 if(targetError||!target)return reply(req,{error:"User not found"},404);
 const targetRole=(target.role as {name?:string}|null)?.name||"Member";
 if(targetRole==="Owner")return reply(req,{error:"The permanent Owner account is immutable"},403);
 if(action==="assign-role"){
  const nextRole=String(body.role||"");if(!["Member","Admin"].includes(nextRole))return reply(req,{error:"Owner cannot be assigned"},403);
  if(callerRole==="Admin"&&nextRole!=="Member")return reply(req,{error:"Admin can assign Member only"},403);
  const {data:roleRow,error:roleError}=await admin.from("roles").select("id").eq("name",nextRole).single();
  if(roleError||!roleRow)return reply(req,{error:"Role not found"},404);
  const {error}=await admin.from("profiles").update({role_id:roleRow.id}).eq("id",targetId);if(error)return reply(req,{error:error.message},400);
  await admin.from("audits").insert({actor_id:authData.user.id,action:"ASSIGN_ROLE",resource_type:"profiles",resource_id:targetId,result:"success",summary:"Assigned "+nextRole});
  return reply(req,{success:true,role:nextRole});
 }
 if(action==="deactivate"||action==="activate"){
  const status=action==="deactivate"?"inactive":"active";
  const {error}=await admin.from("profiles").update({status}).eq("id",targetId);if(error)return reply(req,{error:error.message},400);
  await admin.from("audits").insert({actor_id:authData.user.id,action:action.toUpperCase(),resource_type:"profiles",resource_id:targetId,result:"success",summary:action+"d user"});
  return reply(req,{success:true,status});
 }
 if(action==="delete"){
  if(callerRole!=="Owner")return reply(req,{error:"Only Owner can delete user accounts"},403);
  const {error}=await admin.auth.admin.deleteUser(targetId);if(error)return reply(req,{error:error.message},400);
  await admin.from("audits").insert({actor_id:authData.user.id,action:"DELETE",resource_type:"profiles",resource_id:targetId,result:"success",summary:"Deleted non-owner account"});
  return reply(req,{success:true});
 }
 return reply(req,{error:"Unsupported action"},400);
});