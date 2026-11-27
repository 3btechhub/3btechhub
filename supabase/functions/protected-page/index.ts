import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const origins=new Set(["https://3btechhub.github.io","http://localhost:5173"]);
const cors=(req:Request)=>{const origin=req.headers.get("Origin")||"";return {"Access-Control-Allow-Origin":origins.has(origin)?origin:"https://3btechhub.github.io","Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"GET, OPTIONS","Vary":"Origin"};};
const json=(req:Request,body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors(req),"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
function envKey(jsonName:string,legacyName:string){const raw=Deno.env.get(jsonName);if(raw){try{const parsed=JSON.parse(raw);if(parsed.default)return parsed.default;}catch{}}return Deno.env.get(legacyName)||"";}
const esc=(value:unknown)=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
 if(req.method!=="GET")return json(req,{error:"Method not allowed"},405);
 const authorization=req.headers.get("Authorization")||"",token=authorization.replace(/^Bearer\s+/i,"");if(!token)return json(req,{error:"Authentication required"},401);
 const url=Deno.env.get("SUPABASE_URL")||"",key=envKey("SUPABASE_PUBLISHABLE_KEYS","SUPABASE_ANON_KEY");if(!url||!key)return json(req,{error:"Server configuration error"},500);
 const client=createClient(url,key,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data:authData,error:authError}=await client.auth.getUser(token);if(authError||!authData.user)return json(req,{error:"Invalid or expired session"},401);
 const {data:profile,error:profileError}=await client.from("profiles").select("id,role_id,name,email,status,role:roles(name)").eq("id",authData.user.id).single();
 if(profileError||!profile||profile.status!=="active")return json(req,{error:"Active profile required"},403);
 const role=(profile.role as {name?:string}|null)?.name||"Visitor",page=new URL(req.url).searchParams.get("page");
 if(page==="visibility"){
  if(!["Owner","Admin"].includes(role))return json(req,{role,permissions:[]});
  const {data:grants,error}=await client.from("role_permissions").select("permission:permissions(name,action)").eq("role_id",profile.role_id);
  if(error)return json(req,{error:"Unable to verify access"},500);
  return json(req,{role,permissions:(grants||[]).map(x=>x.permission)});
 }
 if(page==="account"){
  const html=`<section class="ui-large-card ui-size-large ui-auth-section-card"><div class="ui-account-field"><span class="ui-account-field-label">Name</span><div class="ui-account-field-value">${esc(profile.name)}</div></div><div class="ui-account-field"><span class="ui-account-field-label">Email</span><div class="ui-account-field-value">${esc(profile.email)}</div></div><div class="ui-account-field"><span class="ui-account-field-label">Role</span><div class="ui-account-field-value">${esc(role)}</div></div><button class="ui-button ui-button-primary ui-button-block" id="logout-button" type="button">Logout</button><p class="ui-form-status" id="status" role="status" aria-live="polite"></p></section>`;
  return json(req,{html,role});
 }
 if(page==="dashboard"){
  if(!["Owner","Admin"].includes(role))return json(req,{error:"Dashboard access denied"},403);
  return json(req,{html:`<main id="dashboard-content" data-context="dashboard"></main>`,role});
 }
 return json(req,{error:"Page not allowed"},404);
});