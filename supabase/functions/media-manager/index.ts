import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import createDOMPurify from "npm:dompurify@3.2.6";
import { JSDOM } from "npm:jsdom@26.1.0";

const origins = new Set(["https://3btechhub.github.io", "http://localhost:5173"]);
const cors = (req:Request) => { const origin=req.headers.get("Origin")||""; return {"Access-Control-Allow-Origin":origins.has(origin)?origin:"https://3btechhub.github.io","Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"}; };
const reply=(req:Request,body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors(req),"Content-Type":"application/json","Cache-Control":"no-store"}});
function envKey(jsonName:string,legacyName:string){const raw=Deno.env.get(jsonName);if(raw){try{const parsed=JSON.parse(raw);if(parsed.default)return parsed.default;}catch{}}return Deno.env.get(legacyName)||"";}
function slugify(value:string){return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)||crypto.randomUUID();}
function safeFilename(value:string){return value.replace(/[^a-zA-Z0-9._-]/g,"-").slice(0,120)||"upload";}
function sniff(bytes:Uint8Array,mime:string){
 if(mime==="image/jpeg")return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
 if(mime==="image/png")return bytes[0]===0x89&&new TextDecoder().decode(bytes.slice(1,4))==="PNG";
 if(mime==="image/webp")return new TextDecoder().decode(bytes.slice(0,4))==="RIFF"&&new TextDecoder().decode(bytes.slice(8,12))==="WEBP";
 if(mime==="application/pdf")return new TextDecoder().decode(bytes.slice(0,5))==="%PDF-";
 return true;
}
function sanitizeSvg(raw:string){
 const window=new JSDOM("").window;const purifier=createDOMPurify(window as unknown as Window);
 const clean=String(purifier.sanitize(raw,{USE_PROFILES:{svg:true,svgFilters:true},FORBID_TAGS:["script","foreignObject","iframe","object","embed","audio","video"],FORBID_ATTR:["onload","onclick","onerror"]}));
 if(!/<svg[\s>]/i.test(clean)||/(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|\/\/|data:|javascript:)/i.test(clean))throw new Error("SVG contains unsafe or invalid content.");
 return clean;
}

Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
 if(req.method!=="POST")return reply(req,{error:"Method not allowed"},405);
 const authorization=req.headers.get("Authorization")||"",token=authorization.replace(/^Bearer\s+/i,"");
 if(!token)return reply(req,{error:"Authentication required"},401);
 const url=Deno.env.get("SUPABASE_URL")||"",publishable=envKey("SUPABASE_PUBLISHABLE_KEYS","SUPABASE_ANON_KEY"),secret=envKey("SUPABASE_SECRET_KEYS","SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!publishable||!secret)return reply(req,{error:"Server configuration is incomplete"},500);
 const userClient=createClient(url,publishable,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
 const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:authData,error:authError}=await userClient.auth.getUser(token);
 if(authError||!authData.user)return reply(req,{error:"Invalid session"},401);
 const {data:profile,error:profileError}=await userClient.from("profiles").select("status,role:roles(name)").eq("id",authData.user.id).single();
 if(profileError||profile?.status!=="active")return reply(req,{error:"Active profile required"},403);
 const role=(profile.role as {name?:string}|null)?.name||"Visitor";
 if(!["Owner","Admin"].includes(role))return reply(req,{error:"Media management permission required"},403);

 if((req.headers.get("content-type")||"").includes("multipart/form-data")){
  const form=await req.formData(),file=form.get("file");
  if(!(file instanceof File))return reply(req,{error:"File is required"},400);
  const kind=String(form.get("file_type")||""),name=String(form.get("name")||file.name).trim(),description=String(form.get("description")||"");
  let roleIds:string[],regionIds:string[];try{roleIds=JSON.parse(String(form.get("role_ids")||"[]"));regionIds=JSON.parse(String(form.get("region_ids")||"[]"));}catch{return reply(req,{error:"Invalid visibility selection"},400);}
  if(!["Image","Icon","Document"].includes(kind))return reply(req,{error:"Unsupported media type"},400);
  if(!roleIds.length)return reply(req,{error:"Select at least one visible Role"},400);
  let bytes=new Uint8Array(await file.arrayBuffer()),mime=file.type||"",ext=file.name.split(".").pop()?.toLowerCase()||"";
  if(kind==="Image"){
   mime=({jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp"} as Record<string,string>)[ext]||mime;
   if(!["image/jpeg","image/png","image/webp"].includes(mime)||file.size>5*1024*1024)return reply(req,{error:"Images must be JPG, JPEG, PNG or WebP and no larger than 5 MB"},400);
  }else if(kind==="Icon"){
   mime=({svg:"image/svg+xml",png:"image/png",webp:"image/webp"} as Record<string,string>)[ext]||mime;
   if(!["image/svg+xml","image/png","image/webp"].includes(mime)||file.size>1*1024*1024)return reply(req,{error:"Icons must be SVG, PNG or WebP and no larger than 1 MB"},400);
   if(mime==="image/svg+xml"){try{bytes=new TextEncoder().encode(sanitizeSvg(new TextDecoder().decode(bytes)));}catch(err){return reply(req,{error:err instanceof Error?err.message:"SVG sanitization failed"},400);}}
  }else{
   mime=ext==="pdf"?"application/pdf":mime;
   if(mime!=="application/pdf"||file.size>10*1024*1024)return reply(req,{error:"Documents must be PDF and no larger than 10 MB"},400);
  }
  if(mime!=="image/svg+xml"&&!sniff(bytes,mime))return reply(req,{error:"File content does not match its declared type"},400);
  const folder=kind==="Icon"?"icons":kind==="Image"?"images":"documents";
  const path=folder+"/"+authData.user.id+"/"+crypto.randomUUID()+"-"+safeFilename(file.name);
  const {error:uploadError}=await admin.storage.from("media").upload(path,bytes,{contentType:mime,upsert:false});
  if(uploadError)return reply(req,{error:uploadError.message},400);
  const slug=slugify(String(form.get("slug")||name));
  const {data:media,error:insertError}=await userClient.from("media").insert({name,slug,description,file_type:kind,file_path:path,original_filename:file.name,mime_type:mime,file_size:bytes.byteLength}).select().single();
  if(insertError||!media){await admin.storage.from("media").remove([path]);return reply(req,{error:insertError?.message||"Media record could not be saved"},400);}
  const {error:visibilityError}=await userClient.rpc("replace_content_visibility",{p_entity_type:"media",p_entity_id:media.id,p_role_ids:roleIds,p_region_ids:regionIds});
  if(visibilityError){await userClient.from("media").delete().eq("id",media.id);await admin.storage.from("media").remove([path]);return reply(req,{error:visibilityError.message},400);}
  const {data:signed,error:signedError}=await admin.storage.from("media").createSignedUrl(path,3600);
  return reply(req,{media,signed_url:signed?.signedUrl||null,signed_url_error:signedError?.message||null},201);
 }

 let body:Record<string,unknown>;try{body=await req.json();}catch{return reply(req,{error:"Expected multipart upload or JSON action"},400);}
 if(body.action==="sign"){
  const mediaId=String(body.media_id||"");if(!mediaId)return reply(req,{error:"media_id is required"},400);
  const {data:media,error:mediaError}=await userClient.from("media").select("id,file_path").eq("id",mediaId).single();
  if(mediaError||!media)return reply(req,{error:"Media is not visible to this Role/Region"},404);
  const {data:signed,error:signedError}=await admin.storage.from("media").createSignedUrl(media.file_path,3600);
  if(signedError)return reply(req,{error:signedError.message},400);
  return reply(req,{signed_url:signed.signedUrl});
 }
 if(body.action==="delete"){
  const mediaId=String(body.media_id||"");if(!mediaId)return reply(req,{error:"media_id is required"},400);
  const {data:media,error:mediaError}=await userClient.from("media").select("id,file_path").eq("id",mediaId).single();
  if(mediaError||!media)return reply(req,{error:"Media record not found"},404);
  const [sourceLinks,targetLinks]=await Promise.all([
   userClient.from("relations").select("id").eq("source_type","media").eq("source_id",mediaId).limit(1),
   userClient.from("relations").select("id").eq("target_type","media").eq("target_id",mediaId).limit(1)
  ]);
  if(sourceLinks.error||targetLinks.error)return reply(req,{error:sourceLinks.error?.message||targetLinks.error?.message},400);
  if(sourceLinks.data?.length||targetLinks.data?.length)return reply(req,{error:"Remove linked Relations before deleting this media"},409);
  const {error:deleteError}=await userClient.from("media").delete().eq("id",mediaId);
  if(deleteError)return reply(req,{error:deleteError.message},400);
  const {error:storageError}=await admin.storage.from("media").remove([media.file_path]);
  if(storageError)return reply(req,{success:true,cleanup_pending:true,warning:storageError.message});
  return reply(req,{success:true});
 }
 return reply(req,{error:"Unsupported action"},400);
});