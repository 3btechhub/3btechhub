import { applyRuntimeConfig, loadRuntimeConfig } from "./runtime-config.js?v=notion-updates-20261118-2";
import { initExtendedDashboard } from "./admin-extended.js?v=notion-permission-read-write-20261118-2";
import { initDynamicDashboard } from "./content-dashboard.js?v=notion-alignment-20261118-1";
import { createContactIcon } from "./contact-utils.js";
import { createIcon, getModuleIcon, getItemFallbackIcon, loadSvgIconRegistry } from "./icon-utils.js";
const menuButton = document.querySelector(".menu-trigger");
const siteMenu = document.querySelector("#site-menu");
const accountMenuLink = document.querySelector("#login-menu-link");
const profileMenuLink = document.querySelector("#profile-menu-link");
const dashboardMenuLink = document.querySelector("#dashboard-menu-link");
const themeToggle = document.querySelector("#theme-toggle");
const savedTheme = localStorage.getItem("3b-theme");
document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
function renderSvgIconAttributes(root=document){
 root.querySelectorAll("[data-icon],[data-svg-icon]").forEach(element=>{
  const key=element.dataset.svgIcon||element.dataset.icon;
  if(!key)return;
  const existing=element.querySelector(":scope > svg[data-rendered-icon]");
  if(existing)existing.remove();
  const svg=createIcon(key);
  svg.dataset.renderedIcon="true";
  svg.setAttribute("aria-hidden","true");
  element.prepend(svg);
 });
}
function addTextElement(parent, tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value == null ? "" : String(value);
  parent.append(node);
  return node;
}

const translations = {
 en:{home:"Home",profile:"Profile",login:"Login",logout:"Logout",dashboard:"Dashboard",accountLogin:"Account login",dark:"Switch to dark mode",light:"Switch to light mode",services:"Services",products:"Products",workshops:"Workshops",technicians:"Technicians",contacts:"Contacts",user:"User",role:"Role",permission:"Permission",settings:"Settings",users:"Users",refresh:"Refresh",inviteUser:"Invite User",userType:"User Type",emailAddress:"Email Address",sendInvitation:"Send Invitation",refreshUsers:"Refresh Users",userList:"User List",roleAssignments:"Role Assignments",permissionMatrix:"Permission Matrix",websiteSettings:"Website Settings",websiteTitle:"Website Title",logoUrl:"Logo URL (optional)",saveSettings:"Save Settings",signIn:"Sign In",sendResetCode:"Send Reset Code",forgotPassword:"Forgot password?",createAccount:"Create account",verificationCode:"Verification Code",name:"Name",email:"Email",phoneNumber:"Phone Number",password:"Password",changePassword:"Change Password",edit:"Edit",currentPassword:"Current Password",newPassword:"New Password",confirmPassword:"Confirm New Password",updatePassword:"Update Password",verifyCodeReset:"Verify Code & Reset Password"},
 bn:{home:"হোম",profile:"প্রোফাইল",login:"লগইন",logout:"লগআউট",dashboard:"ড্যাশবোর্ড",accountLogin:"অ্যাকাউন্ট লগইন",dark:"ডার্ক মোড চালু করুন",light:"লাইট মোড চালু করুন",services:"সেবাসমূহ",products:"পণ্যসমূহ",workshops:"সার্ভিস সেন্টার",technicians:"টেকনিশিয়ান",contacts:"যোগাযোগ",user:"ব্যবহারকারী",role:"রোল",permission:"অনুমতি",settings:"সেটিংস",users:"ব্যবহারকারীগণ",refresh:"রিফ্রেশ",inviteUser:"ব্যবহারকারী আমন্ত্রণ",userType:"ব্যবহারকারীর ধরন",emailAddress:"ইমেইল ঠিকানা",sendInvitation:"আমন্ত্রণ পাঠান",refreshUsers:"ব্যবহারকারী রিফ্রেশ",userList:"ব্যবহারকারী তালিকা",roleAssignments:"রোল বরাদ্দ",permissionMatrix:"অনুমতি তালিকা",websiteSettings:"ওয়েবসাইট সেটিংস",websiteTitle:"ওয়েবসাইটের শিরোনাম",logoUrl:"লোগোর URL (ঐচ্ছিক)",saveSettings:"সেটিংস সংরক্ষণ",signIn:"সাইন ইন",sendResetCode:"রিসেট কোড পাঠান",forgotPassword:"পাসওয়ার্ড ভুলে গেছেন?",createAccount:"অ্যাকাউন্ট তৈরি",verificationCode:"যাচাইকরণ কোড",name:"নাম",email:"ইমেইল",phoneNumber:"ফোন নম্বর",password:"পাসওয়ার্ড",changePassword:"পাসওয়ার্ড পরিবর্তন",edit:"সম্পাদনা",currentPassword:"বর্তমান পাসওয়ার্ড",newPassword:"নতুন পাসওয়ার্ড",confirmPassword:"নতুন পাসওয়ার্ড নিশ্চিত করুন",updatePassword:"পাসওয়ার্ড আপডেট",verifyCodeReset:"কোড যাচাই ও পাসওয়ার্ড রিসেট"},
 ar:{home:"الرئيسية",profile:"الملف الشخصي",login:"تسجيل الدخول",logout:"تسجيل الخروج",dashboard:"لوحة التحكم",accountLogin:"تسجيل الدخول إلى الحساب",dark:"التبديل إلى الوضع الداكن",light:"التبديل إلى الوضع الفاتح",services:"الخدمات",products:"المنتجات",workshops:"مراكز الخدمة",technicians:"الفنيون",contacts:"جهات الاتصال",user:"المستخدم",role:"الدور",permission:"الصلاحية",settings:"الإعدادات",users:"المستخدمون",refresh:"تحديث",inviteUser:"دعوة مستخدم",userType:"نوع المستخدم",emailAddress:"عنوان البريد الإلكتروني",sendInvitation:"إرسال الدعوة",refreshUsers:"تحديث المستخدمين",userList:"قائمة المستخدمين",roleAssignments:"تعيينات الأدوار",permissionMatrix:"مصفوفة الصلاحيات",websiteSettings:"إعدادات الموقع",websiteTitle:"عنوان الموقع",logoUrl:"رابط الشعار (اختياري)",saveSettings:"حفظ الإعدادات",signIn:"تسجيل الدخول",sendResetCode:"إرسال رمز إعادة التعيين",forgotPassword:"هل نسيت كلمة المرور؟",createAccount:"إنشاء حساب",verificationCode:"رمز التحقق",name:"الاسم",email:"البريد الإلكتروني",phoneNumber:"رقم الهاتف",password:"كلمة المرور",changePassword:"تغيير كلمة المرور",edit:"تعديل",currentPassword:"كلمة المرور الحالية",newPassword:"كلمة المرور الجديدة",confirmPassword:"تأكيد كلمة المرور الجديدة",updatePassword:"تحديث كلمة المرور",verifyCodeReset:"التحقق من الرمز وإعادة تعيين كلمة المرور"}
};
const bnText={"Home":"হোম","Account":"অ্যাকাউন্ট","Profile":"প্রোফাইল","Dashboard":"ড্যাশবোর্ড","Logout":"লগআউট","Language":"ভাষা","Country":"দেশ","Theme":"থিম","Loading page…":"পৃষ্ঠা লোড হচ্ছে…","Loading…":"লোড হচ্ছে…","Save Settings":"সেটিংস সংরক্ষণ","Save Global Style":"গ্লোবাল স্টাইল সংরক্ষণ","Save Customization":"কাস্টমাইজেশন সংরক্ষণ","Website Identity":"ওয়েবসাইট পরিচিতি","Website Title":"ওয়েবসাইটের শিরোনাম","Logo URL":"লোগোর URL","Logo URL (optional)":"লোগোর URL (ঐচ্ছিক)","Upload Website Logo":"ওয়েবসাইট লোগো আপলোড","Upload Website Favicon":"ওয়েবসাইট ফেভিকন আপলোড","Home Intro":"হোম পরিচিতি","Navigation Menu":"নেভিগেশন মেনু","Logo Swap Interval (seconds)":"লোগো পরিবর্তনের বিরতি (সেকেন্ড)","Icon Transition Speed (milliseconds)":"আইকন পরিবর্তনের গতি (মিলিসেকেন্ড)","Save":"সংরক্ষণ","Cancel":"বাতিল","Delete":"মুছুন","Search":"অনুসন্ধান","Name":"নাম","Slug":"স্লাগ","Type":"ধরন","Description":"বিবরণ","Visibility":"দৃশ্যমানতা","Show":"দেখান","Hide":"লুকান","Add Item":"আইটেম যোগ করুন","Save Item":"আইটেম সংরক্ষণ","Delete Item":"আইটেম মুছুন","Related Items":"সম্পর্কিত আইটেম","No records found.":"কোনো তথ্য পাওয়া যায়নি।","No records available.":"কোনো তথ্য নেই।","Settings saved.":"সেটিংস সংরক্ষিত হয়েছে।","Customization saved.":"কাস্টমাইজেশন সংরক্ষিত হয়েছে।","Global Style saved.":"গ্লোবাল স্টাইল সংরক্ষিত হয়েছে।","Overview":"সংক্ষিপ্ত বিবরণ","Relations":"সম্পর্কসমূহ","Content Module Builder":"কনটেন্ট মডিউল নির্মাতা","Customization":"কাস্টমাইজেশন","Users":"ব্যবহারকারীগণ","Roles":"রোলসমূহ","Permissions":"অনুমতিসমূহ","Create Account":"অ্যাকাউন্ট তৈরি","Reset Password":"পাসওয়ার্ড রিসেট","Verify":"যাচাই","New Password":"নতুন পাসওয়ার্ড","Login":"লগইন","Email":"ইমেইল","Password":"পাসওয়ার্ড","Current Password":"বর্তমান পাসওয়ার্ড","Confirm New Password":"নতুন পাসওয়ার্ড নিশ্চিত করুন","Update Password":"পাসওয়ার্ড আপডেট","Edit Profile":"প্রোফাইল সম্পাদনা","Change Password":"পাসওয়ার্ড পরিবর্তন","Send Reset Code":"রিসেট কোড পাঠান","Verification Code":"যাচাইকরণ কোড","Save Profile":"প্রোফাইল সংরক্ষণ"};
const arText={"Home":"الرئيسية","Account":"الحساب","Profile":"الملف الشخصي","Dashboard":"لوحة التحكم","Logout":"تسجيل الخروج","Language":"اللغة","Country":"الدولة","Theme":"المظهر","Loading page…":"جارٍ تحميل الصفحة…","Loading…":"جارٍ التحميل…","Save Settings":"حفظ الإعدادات","Save Global Style":"حفظ النمط العام","Save Customization":"حفظ التخصيص","Website Identity":"هوية الموقع","Website Title":"عنوان الموقع","Logo URL":"رابط الشعار","Logo URL (optional)":"رابط الشعار (اختياري)","Upload Website Logo":"رفع شعار الموقع","Upload Website Favicon":"رفع أيقونة الموقع","Home Intro":"مقدمة الصفحة الرئيسية","Navigation Menu":"قائمة التنقل","Save":"حفظ","Cancel":"إلغاء","Delete":"حذف","Search":"بحث","Name":"الاسم","Slug":"المعرّف","Type":"النوع","Description":"الوصف","Visibility":"إمكانية الظهور","Show":"إظهار","Hide":"إخفاء","Add Item":"إضافة عنصر","Save Item":"حفظ العنصر","Delete Item":"حذف العنصر","Related Items":"العناصر المرتبطة","No records found.":"لم يتم العثور على سجلات.","No records available.":"لا توجد سجلات متاحة.","Settings saved.":"تم حفظ الإعدادات.","Customization saved.":"تم حفظ التخصيص.","Global Style saved.":"تم حفظ النمط العام.","Overview":"نظرة عامة","Relations":"العلاقات","Content Module Builder":"منشئ وحدات المحتوى","Customization":"التخصيص","Users":"المستخدمون","Roles":"الأدوار","Permissions":"الصلاحيات","Create Account":"إنشاء حساب","Reset Password":"إعادة تعيين كلمة المرور","Verify":"تحقق","New Password":"كلمة المرور الجديدة","Login":"تسجيل الدخول","Email":"البريد الإلكتروني","Password":"كلمة المرور","Current Password":"كلمة المرور الحالية","Confirm New Password":"تأكيد كلمة المرور الجديدة","Update Password":"تحديث كلمة المرور","Edit Profile":"تعديل الملف الشخصي","Change Password":"تغيير كلمة المرور","Send Reset Code":"إرسال رمز إعادة التعيين","Verification Code":"رمز التحقق","Save Profile":"حفظ الملف الشخصي","Services":"الخدمات","Products":"المنتجات","Workshops":"مراكز الخدمة","Technicians":"الفنيون","Contacts":"جهات الاتصال","Countries":"الدول","Languages":"اللغات","Media":"الوسائط","What We Do":"ما نقدمه","Content Modules":"وحدات المحتوى","Activities List":"قائمة الأنشطة","Health Status":"حالة النظام","Data":"البيانات","Role":"الدور","Permission":"الصلاحية","Save Relation":"حفظ العلاقة","Create Relation":"إنشاء علاقة","Source Type":"نوع المصدر","Source Name":"اسم المصدر","Target Type":"نوع الهدف","Target Name":"اسم الهدف","Select Type":"اختر النوع","Select Item":"اختر عنصرًا","View All":"عرض الكل","Back":"رجوع"};
const enText=Object.fromEntries(Object.entries(bnText).map(([english,bengali])=>[bengali,english]));
const translationOriginals=new WeakMap();
function applyLanguage(language=localStorage.getItem("3b-language")||"en"){
 const selected=Object.hasOwn(translations,language)?language:"en",labels=translations[selected],textMap=selected==="bn"?bnText:selected==="ar"?arText:enText;
 translationQueue=[];
 document.documentElement.lang=selected;
 document.querySelectorAll("[data-label]").forEach(element=>{const value=labels[element.dataset.label];if(!value)return;const textNode=[...element.childNodes].find(node=>node.nodeType===Node.TEXT_NODE);if(textNode)textNode.nodeValue=value;else element.append(document.createTextNode(value));});
 document.querySelectorAll("[placeholder]").forEach(element=>{const value=textMap[element.placeholder];if(value)element.placeholder=value;});
 document.querySelectorAll("[aria-label]").forEach(element=>{const value=textMap[element.getAttribute("aria-label")];if(value)element.setAttribute("aria-label",value);});
 const translateTree=root=>{if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){if(translationOriginals.has(node))node.nodeValue=translationOriginals.get(node);else translationOriginals.set(node,node.nodeValue||"");const raw=node.nodeValue||"",trimmed=raw.trim(),translated=textMap[trimmed];if(translated)node.nodeValue=raw.replace(trimmed,translated);}};
 translateTree(document.body);
 queueDynamicTranslations(document.body,selected);
}
function applyEnglishText(){applyLanguage(localStorage.getItem("3b-language")||"en");}
const translationCache=new Map();let translationQueue=[],translationWorkers=0;
function translationSource(text){if(/[\u0600-\u06FF]/.test(text))return "ar";if(/[\u0980-\u09FF]/.test(text))return "bn";return "en";}
function queueDynamicTranslations(root,target){
 if(!root||!["bn","ar"].includes(target))return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node,added=0;
 while((node=walker.nextNode())&&added<80){
  const raw=node.nodeValue||"",value=raw.trim(),parent=node.parentElement;
  if(!value||value.length<2||value.length>240||new TextEncoder().encode(value).length>450||/^([\d\W_]+)$/.test(value)||!parent||value==="3B TECH HUB")continue;
  if(parent.closest("script,style,textarea,input,select,option,code,pre,svg,[contenteditable='true']"))continue;
  const source=translationSource(value);if(source===target)continue;
  const map=target==="bn"?bnText:arText;if(map[value])continue;
  const key=target+"|"+source+"|"+value;if(translationCache.has(key))continue;
  const cached=localStorage.getItem("3b-translation:"+key);
  if(cached){translationCache.set(key,cached);node.nodeValue=raw.replace(value,cached);continue;}
  if(translationQueue.some(item=>item.key===key))continue;
  translationQueue.push({key,node,raw,value,source,target});added++;
 }
 runTranslationQueue();
}
async function runTranslationQueue(){
 if(translationWorkers>=2)return;translationWorkers++;
 try{
  while(translationQueue.length){
   const item=translationQueue.shift();if(item.target!==document.documentElement.lang||!item.node.isConnected||item.node.nodeValue!==item.raw)continue;
   try{
    const url="https://api.mymemory.translated.net/get?q="+encodeURIComponent(item.value)+"&langpair="+item.source+"|"+item.target;
    const response=await fetch(url,{headers:{Accept:"application/json"}});
    if(!response.ok)continue;
    const data=await response.json();if(data?.quotaFinished||Number(data?.responseStatus)!==200)continue;
    const translated=String(data?.responseData?.translatedText||"").trim();
    if(!translated||translated.toLowerCase()===item.value.toLowerCase())continue;
    const decoder=document.createElement("textarea");decoder.innerHTML=translated;const clean=decoder.value;
    translationCache.set(item.key,clean);try{localStorage.setItem("3b-translation:"+item.key,clean);}catch{}
    if(item.target===document.documentElement.lang&&item.node.isConnected&&item.node.nodeValue===item.raw){if(!translationOriginals.has(item.node))translationOriginals.set(item.node,item.raw);item.node.nodeValue=item.raw.replace(item.value,clean);}
   }catch(error){console.debug("Automatic translation unavailable.",error);}
  }
 }finally{translationWorkers--;if(translationQueue.length)runTranslationQueue();}
}
const languageObserver=new MutationObserver(records=>{
 const lang=document.documentElement.lang||"en",map=lang==="bn"?bnText:lang==="ar"?arText:enText;
 for(const record of records)for(const node of record.addedNodes){
  if(node.nodeType===Node.TEXT_NODE){if(!translationOriginals.has(node))translationOriginals.set(node,node.nodeValue||"");const raw=translationOriginals.get(node),trimmed=raw.trim(),translated=map[trimmed];node.nodeValue=translated?raw.replace(trimmed,translated):raw;queueDynamicTranslations(node.parentElement,lang);continue;}
  if(node.nodeType!==Node.ELEMENT_NODE)continue;
  const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);let textNode;
  while((textNode=walker.nextNode())){if(!translationOriginals.has(textNode))translationOriginals.set(textNode,textNode.nodeValue||"");const raw=translationOriginals.get(textNode),trimmed=raw.trim(),translated=map[trimmed];textNode.nodeValue=translated?raw.replace(trimmed,translated):raw;}
  queueDynamicTranslations(node,lang);
 }
});
languageObserver.observe(document.body,{childList:true,subtree:true});

function enhanceInlineDropdowns(root=document){
 const selects=root.matches?.("select")?[root]:[...(root.querySelectorAll?.("select")||[])];
 for(const select of selects){
  if(select.dataset.inlineDropdownReady==="true"){select._syncInlineDropdown?.();continue;}
  if(!select.parentNode)continue;
  select.dataset.inlineDropdownReady="true";
  const wrapper=document.createElement("div");wrapper.className="inline-dropdown";
  select.parentNode.insertBefore(wrapper,select);wrapper.append(select);
  const trigger=document.createElement("button");trigger.type="button";trigger.className="inline-dropdown-trigger";trigger.setAttribute("aria-haspopup","listbox");trigger.setAttribute("aria-expanded","false");
  const options=document.createElement("div");options.className="inline-dropdown-options";options.hidden=true;options.setAttribute("role","listbox");
  wrapper.append(trigger,options);select.classList.add("inline-dropdown-native");select.tabIndex=-1;select.setAttribute("aria-hidden","true");
  function close(){options.hidden=true;trigger.setAttribute("aria-expanded","false");}
  function sync(){
   const selected=select.options[select.selectedIndex];trigger.textContent=selected?.textContent?.trim()||"Select";trigger.disabled=select.disabled;
   options.replaceChildren();
   [...select.options].forEach(option=>{
    const item=document.createElement("button");item.type="button";item.className="inline-dropdown-option";item.setAttribute("role","option");item.setAttribute("aria-selected",String(option.selected));item.disabled=option.disabled;item.textContent=option.textContent;
    item.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();if(option.disabled)return;select.value=option.value;select.dispatchEvent(new Event("change",{bubbles:true}));close();trigger.focus();});
    options.append(item);
   });
  }
  trigger.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();const opening=options.hidden;document.querySelectorAll(".inline-dropdown-options:not([hidden])").forEach(list=>{if(list!==options){list.hidden=true;list.parentElement?.querySelector(".inline-dropdown-trigger")?.setAttribute("aria-expanded","false");}});options.hidden=!opening;trigger.setAttribute("aria-expanded",String(opening));});
  trigger.addEventListener("keydown",event=>{if(event.key==="Escape"){close();trigger.focus();}});
  select.addEventListener("change",sync);
  const nativeValue=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,"value");
  if(nativeValue?.get&&nativeValue?.set){try{Object.defineProperty(select,"value",{configurable:true,enumerable:true,get(){return nativeValue.get.call(this);},set(value){nativeValue.set.call(this,value);sync();}});}catch{}}
  const observer=new MutationObserver(sync);observer.observe(select,{childList:true,subtree:true,attributes:true,attributeFilter:["disabled","label","value"]});
  select._syncInlineDropdown=sync;sync();
 }
}
enhanceInlineDropdowns(document);
const inlineDropdownObserver=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType===Node.ELEMENT_NODE)enhanceInlineDropdowns(node);}});
inlineDropdownObserver.observe(document.body,{childList:true,subtree:true});
document.addEventListener("click",event=>{if(!event.target.closest(".inline-dropdown"))document.querySelectorAll(".inline-dropdown-options:not([hidden])").forEach(list=>{list.hidden=true;list.parentElement?.querySelector(".inline-dropdown-trigger")?.setAttribute("aria-expanded","false");});});
window.addEventListener("site-language-changed",()=>document.querySelectorAll("select").forEach(select=>select._syncInlineDropdown?.()));

let runtimeConfig = null;
window.addEventListener("runtime-config-updated", (event) => {
  if (!event.detail || typeof event.detail !== "object") return;
  runtimeConfig = event.detail;
  applyRuntimeConfig(runtimeConfig, document.documentElement.dataset.theme);
});

function applyTheme(theme) {
  const dark = theme === "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  applyRuntimeConfig(runtimeConfig, dark ? "dark" : "light");
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector(".theme-icon");
    if (themeIcon) { themeIcon.replaceChildren(createIcon(dark ? "sun" : "moon")); }
    themeToggle.setAttribute("aria-label", dark ? (translations[document.documentElement.lang]||translations.en).light : (translations[document.documentElement.lang]||translations.en).dark);
  }
  localStorage.setItem("3b-theme", dark ? "dark" : "light");
}
applyEnglishText();
applyTheme(savedTheme === "dark" ? "dark" : "light");
renderSvgIconAttributes(document);
if (themeToggle) themeToggle.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
const SUPABASE_URL = "https://sburxeuxkrilbfppxylm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_lqGGahZ0ST267jqsI3Zelg_477szacT";
let supabase;

const logoutMenuLink = document.querySelector("#logout-menu-link");

function closeSiteMenu() {
  if (!siteMenu || !menuButton) return;
  siteMenu.hidden = true;
  menuButton.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
}
async function setMenuSession(session) {
  if (accountMenuLink) { accountMenuLink.href=new URL("account/login/",ROOT_URL).href; accountMenuLink.hidden=Boolean(session); }
  let roles=[];
  if(session?.user?.id){
    const {data,error}=await supabase.from("user_roles").select("role").eq("user_id",session.user.id);
    if(!error)roles=(data||[]).map(row=>String(row.role||"").toLowerCase());
  }
  const registered=roles.some(role=>["owner","admin","member"].includes(role));
  if (profileMenuLink) profileMenuLink.href=new URL("account/profile/",ROOT_URL).href;
  if (profileMenuLink) profileMenuLink.hidden=!registered;
  if (logoutMenuLink) logoutMenuLink.hidden=!registered;
  if (dashboardMenuLink) dashboardMenuLink.hidden=!(roles.includes("owner")||roles.includes("admin"));
}
// Load authentication separately so a Supabase CDN issue cannot disable the menu.
const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
runtimeConfig = await loadRuntimeConfig(supabase);
await loadSvgIconRegistry(supabase);
renderSvgIconAttributes(document);
applyTheme(savedTheme === "dark" ? "dark" : "light");
applyRuntimeConfig(runtimeConfig, document.documentElement.dataset.theme);



const homeDetailStack=[];
let homeListState=null;
let homeInfoRows=[];
let homeMediaRows=[];
function hasValue(v){return v!==null&&v!==undefined&&v!==""&&(!Array.isArray(v)||v.length>0);}
function titleCase(v){return String(v||"").replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());}
function makeHomeCard(title,subtitle,onClick,imageUrl=""){
 const card=document.createElement("button");card.type="button";card.className="home-content-card";
 const visual=document.createElement("div");visual.className="home-content-visual";
 if(imageUrl){const img=document.createElement("img");img.src=imageUrl;img.alt="";img.loading="lazy";img.addEventListener("error",()=>img.remove(),{once:true});visual.append(img);}
 else visual.append(getItemFallbackIcon(title,"info"));
 const body=document.createElement("div");body.className="home-content-card-body";
 const h=document.createElement("h3");h.textContent=title;body.append(h);
 if(subtitle){const s=document.createElement("p");s.textContent=subtitle;body.append(s);}
 card.append(visual,body);card.addEventListener("click",onClick);return card;
}
function openHomeType(type){homeListState={type};homeDetailStack.length=0;void renderHomeList();}
function openHomeDetail(record){homeDetailStack.push(record);void renderHomeDetail();}
async function renderHomeList(){
 const area=document.getElementById("home-module-area");if(!area||!homeListState)return;
 const {type}=homeListState;area.replaceChildren();area.hidden=false;
 const view=document.createElement("section");view.className="home-list-view";
 const header=document.createElement("div");header.className="home-list-heading";
 const back=document.createElement("button");back.type="button";back.className="home-detail-back";back.textContent="← Back";back.addEventListener("click",()=>{homeListState=null;void loadHomeCatalog();});
 const h=document.createElement("h1");h.textContent=type;header.append(back,h);view.append(header);
 const grid=document.createElement("div");grid.className="home-list-grid";
 homeInfoRows.filter(r=>(r.type||"General")===type).forEach(r=>{
  const data=r.data||{},media=homeMediaRows.find(m=>m.id===r.id);
  const image=media?.image_url||data.photo_url||(Array.isArray(data.gallery_urls)?data.gallery_urls[0]:"");
  grid.append(makeHomeCard(r.name,r.description,()=>openHomeDetail(r),image));
 });
 if(!grid.childElementCount)grid.append(document.createTextNode("No items available."));
 view.append(grid);area.append(view);
}
async function renderHomeDetail(){
 const area=document.getElementById("home-module-area"),record=homeDetailStack[homeDetailStack.length-1];if(!area||!record)return;
 area.replaceChildren();area.hidden=false;
 const view=document.createElement("section");view.className="home-detail-view";
 const back=document.createElement("button");back.type="button";back.className="home-detail-back";back.textContent="← Back";back.addEventListener("click",()=>{homeDetailStack.pop();if(homeDetailStack.length)void renderHomeDetail();else if(homeListState)void renderHomeList();else void loadHomeCatalog();});view.append(back);
 const {data:links,error:linkError}=await supabase.from("Relation").select("*").or("source_id.eq."+record.id+",target_id.eq."+record.id);
 const related=(links||[]).map(x=>({type:x.source_id===record.id?x.target_type:x.source_type,id:x.source_id===record.id?x.target_id:x.source_id}));
 const mediaLinks=related.filter(x=>x.type==="Media"),relatedInfo=related.filter(x=>x.type==="Info");
 const mediaFromRelation=homeMediaRows.find(m=>mediaLinks.some(x=>x.id===m.id));
 const data=record.data||{},fallbackMedia=homeMediaRows.find(m=>m.id===record.id);
 const imageUrl=mediaFromRelation?.image_url||fallbackMedia?.image_url||data.photo_url||(Array.isArray(data.gallery_urls)?data.gallery_urls[0]:"");
 const visual=document.createElement("div");visual.className="home-detail-visual";
 if(imageUrl){const img=document.createElement("img");img.className="home-detail-image";img.src=imageUrl;img.alt=record.name||"";visual.append(img);}
 else visual.append(getItemFallbackIcon(record.name||record.type,"info"));
 view.append(visual);
 const heading=document.createElement("h1");heading.textContent=record.name||"Details";view.append(heading);
 if(record.description){const summary=document.createElement("p");summary.className="home-detail-description";summary.textContent=record.description;view.append(summary);}
 const fieldHost=document.createElement("div");fieldHost.className="home-detail-fields";
 const hiddenKeys=new Set(["description","photo_url","gallery_urls","image_url","image_path","visibility_roles","_legacy_source","_legacy_id","_module_key"]);
 for(const [key,value] of Object.entries(data)){
  if(hiddenKeys.has(key)||key.startsWith("_")||!hasValue(value))continue;
  if(typeof value==="string"&&/^https?:\/\//i.test(value)&&/\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(value))continue;
  const row=document.createElement("div");row.className="home-detail-field";
  const label=document.createElement("strong");label.textContent=titleCase(key);
  const content=document.createElement("span");content.textContent=Array.isArray(value)?value.join(", "):typeof value==="object"?JSON.stringify(value):String(value);
  row.append(label,content);fieldHost.append(row);
 }
 if(fieldHost.childElementCount)view.append(fieldHost);
 if(!linkError&&relatedInfo.length){
  const ids=relatedInfo.map(x=>x.id),relatedRows=homeInfoRows.filter(x=>ids.includes(x.id));
  const section=document.createElement("section");section.className="home-related-section";section.append(document.createElement("h2"));section.querySelector("h2").textContent="Related Information";
  const grid=document.createElement("div");grid.className="home-card-grid";
  relatedRows.forEach(r=>grid.append(makeHomeCard(r.name,r.type,()=>openHomeDetail(r),r.data?.photo_url||"")));
  section.append(grid);if(grid.childElementCount)view.append(section);
 }
 area.append(view);
}
async function loadHomeCatalog(){
 const area=document.getElementById("home-module-area");if(!area)return;
 homeDetailStack.length=0;homeListState=null;area.replaceChildren();area.hidden=true;
 const [infoResult,mediaResult]=await Promise.all([
  supabase.from("Info").select("id,name,type,slug,description,visibility_roles,sort_order,data,status").in("status",["active","published"]).order("sort_order").order("name").limit(1000),
  supabase.from("Media").select("id,name,type,slug,description,image_path,image_url,visibility_roles,sort_order,status").in("status",["active","published"]).order("sort_order").limit(1000)
 ]);
 if(infoResult.error||mediaResult.error){console.error("Could not load Notion Info/Media data.",infoResult.error||mediaResult.error);return;}
 homeInfoRows=(infoResult.data||[]).filter(r=>(r.visibility_roles||[]).includes("visitor")||currentUserRole==="owner"||currentUserRole==="admin");
 homeMediaRows=(mediaResult.data||[]).filter(r=>(r.visibility_roles||[]).includes("visitor")||currentUserRole==="owner"||currentUserRole==="admin");
 const grouped=new Map();
 for(const row of homeInfoRows){const type=String(row.type||"General").trim()||"General";if(!grouped.has(type))grouped.set(type,[]);grouped.get(type).push(row);}
 const grid=document.createElement("div");grid.className="home-card-grid";
 for(const [type,records] of grouped){grid.append(makeHomeCard(type,records.length+" items",()=>openHomeType(type)));}
 if(grid.childElementCount){const section=document.createElement("section");section.className="home-catalog-section";section.append(grid);area.append(section);area.hidden=false;}
}
async function applyPublicSiteSettings() {
  const [{data:profileData},{data:websiteData},{data:introData},{data:navigationData}] = await Promise.all([
    supabase.from("Settings").select("setting_value,visibility_roles").eq("setting_key","site_profile").maybeSingle(),
    supabase.from("Settings").select("setting_value,visibility_roles").eq("setting_key","website_information").maybeSingle(),
    supabase.from("Settings").select("setting_value,visibility_roles").eq("setting_key","home_intro").maybeSingle(),
    supabase.from("Settings").select("setting_value").eq("setting_key","navigation_menu").maybeSingle()
  ]);
  const profile=profileData?.setting_value&&typeof profileData.setting_value==="object"?profileData.setting_value:{};
  const website=websiteData?.setting_value&&typeof websiteData.setting_value==="object"?websiteData.setting_value:{};
  const settings={...website,...profile,
    website_title:profile.website_title||website.title,
    logo_url:profile.logo_url||website.logo_url,
    favicon_url:profile.favicon_url||website.favicon_url,
    favicon_type:profile.favicon_type||website.favicon_type,
    navigation_menu:navigationData?.setting_value||{}
  };
  const intro=typeof introData?.setting_value?.content==="string"&&introData.setting_value.content.trim()
    ?introData.setting_value.content.trim()
    :(typeof website.intro==="string"?website.intro.trim():"");
  const introRoles=introData?.visibility_roles||websiteData?.visibility_roles||[];
  const introSection=document.getElementById("home-intro-section");
  const introContent=document.getElementById("home-intro-content");
  if(introSection&&introContent){introContent.textContent=intro;introSection.hidden=!intro||!introRoles.includes("visitor");}
  const websiteTitle=typeof settings.website_title==="string"&&settings.website_title.trim()?settings.website_title.trim():"3B TECH HUB";
  document.querySelectorAll(".brand-title, .home-hero h1, .home-main h1").forEach(node=>{node.textContent=websiteTitle;});
  document.title=websiteTitle;
  const brandLogo=document.querySelector(".brand-logo");
  if(brandLogo){
    if(typeof settings.logo_url==="string"&&/^https?:\/\//i.test(settings.logo_url)){
      const logo=document.createElement("img");logo.src=settings.logo_url;logo.alt=websiteTitle;logo.className="brand-image";brandLogo.replaceChildren(logo);
    }else{
      const mark=document.createElement("span");mark.className="brand-mark";mark.textContent="3B";brandLogo.replaceChildren(mark);
    }
  }
  const menuBrandLogo=document.querySelector(".menu-brand-logo");
  if(menuBrandLogo&&brandLogo)menuBrandLogo.replaceChildren(...[...brandLogo.childNodes].map(node=>node.cloneNode(true)));
  const menuBrandTitle=document.querySelector(".menu-brand-title");
  if(menuBrandTitle)menuBrandTitle.textContent=websiteTitle;
  const favicon=document.getElementById("site-favicon");
  if(favicon&&typeof settings.favicon_url==="string"&&/^https?:\/\//i.test(settings.favicon_url)){favicon.href=settings.favicon_url;favicon.type=settings.favicon_type||({png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",webp:"image/webp",avif:"image/avif",gif:"image/gif",svg:"image/svg+xml"}[settings.favicon_url.split("?")[0].split(".").pop().toLowerCase()]||"image/png");}
  window.dispatchEvent(new CustomEvent("site-brand-settings-updated",{detail:{logoUrl:settings.logo_url||"",title:websiteTitle,navigationMenu:settings.navigation_menu||{}}}));
}

if (logoutMenuLink) logoutMenuLink.addEventListener("click", async () => {
  logoutMenuLink.disabled = true;
  const { error } = await supabase.auth.signOut();
  logoutMenuLink.disabled = false;
  if (!error) {
    setMenuSession(null);
    closeSiteMenu();
    window.navigateSiteRoute(new URL("home/", ROOT_URL).pathname);
  }
});
async function syncAccountMenu() {
  if (!accountMenuLink) return;
  const { data } = await supabase.auth.getSession();
  setMenuSession(data.session);
}
syncAccountMenu();
supabase.auth.onAuthStateChange((_event, session) => {
  setMenuSession(session);
});
const ROOT_URL = new URL("https://3btechhub.github.io/3btechhub/");
const languageSelect=document.getElementById("language-select");
const countrySelect=document.getElementById("country-select");
const themeSelect=document.getElementById("theme-select");
window.addEventListener("site-language-changed",event=>applyLanguage(event.detail?.language||"en"));
window.addEventListener("site-country-changed",event=>{document.documentElement.dataset.country=event.detail?.country||"global";});
window.addEventListener("site-theme-changed",event=>{document.documentElement.dataset.themeVariant=event.detail?.theme||"classic";applyRuntimeConfig(runtimeConfig,document.documentElement.dataset.theme||"light");});
if(themeSelect){
  const savedVariant=localStorage.getItem("3b-theme-variant")||"classic";
  themeSelect.value=["classic","modern","future"].includes(savedVariant)?savedVariant:"classic";
  document.documentElement.dataset.themeVariant=themeSelect.value;
  applyRuntimeConfig(runtimeConfig,document.documentElement.dataset.theme||"light");
  themeSelect.addEventListener("change",()=>{
    localStorage.setItem("3b-theme-variant",themeSelect.value);
    document.documentElement.dataset.themeVariant=themeSelect.value;
    window.dispatchEvent(new CustomEvent("site-theme-changed",{detail:{theme:themeSelect.value}}));
  });
}
async function loadMenuPreferences(){
  if(countrySelect){const rows=[["Global","global"],["Bangladesh","bangladesh"],["Saudi Arabia","saudi-arabia"]],saved=localStorage.getItem("3b-country")||"global";countrySelect.replaceChildren(...rows.map(([label,value])=>new Option(label,value)));countrySelect.value=rows.some(x=>x[1]===saved)?saved:"global";document.documentElement.dataset.country=countrySelect.value;}
  if(languageSelect){const rows=[["English","en"],["Bangla","bn"],["Arabic","ar"]],saved=localStorage.getItem("3b-language")||"en";languageSelect.replaceChildren(...rows.map(([label,value])=>new Option(label,value)));languageSelect.value=rows.some(x=>x[1]===saved)?saved:"en";document.documentElement.dataset.language=languageSelect.value;applyLanguage(languageSelect.value);}
}
countrySelect?.addEventListener("change",()=>{
  localStorage.setItem("3b-country",countrySelect.value);
  document.documentElement.dataset.country=countrySelect.value;
  window.dispatchEvent(new CustomEvent("site-country-changed",{detail:{country:countrySelect.value}}));
  void loadHomeCatalog();
});
languageSelect?.addEventListener("change",()=>{
  localStorage.setItem("3b-language",languageSelect.value);
  document.documentElement.dataset.language=languageSelect.value;
  applyLanguage(languageSelect.value);
  window.dispatchEvent(new CustomEvent("site-language-changed",{detail:{language:languageSelect.value}}));
});
void loadMenuPreferences();
const headerBrandLogo=document.querySelector(".brand-logo");
if(headerBrandLogo){
  headerBrandLogo.setAttribute("role","button");headerBrandLogo.tabIndex=0;headerBrandLogo.setAttribute("aria-label","Go to Home");
  const activateBrand=()=>{if(document.querySelector('#app-main[data-view="dashboard"]')&&typeof window.__dashboardSidebarToggle==="function"){window.__dashboardSidebarToggle();return;}window.navigateSiteRoute(new URL("home/",ROOT_URL).pathname);};
  headerBrandLogo.addEventListener("click",activateBrand);
  headerBrandLogo.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();activateBrand();}});
}

export async function resolveAuthRoute(requestedPath) {
  const url = new URL(requestedPath, window.location.origin);
  const basePath = ROOT_URL.pathname;
  if (!url.pathname.startsWith(basePath)) return url.pathname + url.search + url.hash;
  const parts = url.pathname.slice(basePath.length).split("/").filter(Boolean);
  const first = parts[0] || "";
  const legacyRoutes = {
    login:"login", "create-account":"create-account", "forgot-password":"reset-password",
    "reset-password":"reset-password", profile:"profile"
  };
  let accountRoute = first === "account" ? (parts[1] || "") : (legacyRoutes[first] || "");
  if (first !== "account" && !accountRoute) return url.pathname + url.search + url.hash;

  const { data, error } = await supabase.auth.getSession();
  const session = error ? null : (data?.session || null);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
  const recoveryCallback = accountRoute === "reset-password" &&
    (hashParams.get("type") === "recovery" || url.searchParams.get("recovery") === "1");

  let target = recoveryCallback ? "new-password" : (accountRoute || (session ? "profile" : "login"));
  if (!["login","create-account","reset-password","verify","new-password","profile"].includes(target)) target = session ? "profile" : "login";
  if (!session && ["profile","new-password"].includes(target)) target = "login";
  if (session && ["login","create-account"].includes(target)) target = "profile";
  if (session && target === "reset-password" && !recoveryCallback) target = "profile";

  const canonicalPath = new URL("account/" + target + "/", ROOT_URL).pathname;
  const canonical = first === "account" && parts.length === 2 && parts[1] === target && url.pathname === canonicalPath;
  return canonical ? (url.pathname + url.search + url.hash) : (canonicalPath + url.search + url.hash);
}

export async function initRoutePage() {
  if (typeof window.__dashboardSidebarClose === "function") window.__dashboardSidebarClose();
  window.__dashboardSidebarToggle = null;
  window.__dashboardSidebarClose = null;
  window.__routeAuthSubscriptions?.forEach((subscription) => subscription.unsubscribe());
  window.__routeAuthSubscriptions = [];
  applyEnglishText();
  renderSvgIconAttributes(document);
  // Visitor analytics are intentionally not collected.
  
  const accountMode = document.querySelector("#app-main")?.dataset.authMode || "login";
  const accountAuthLayout = document.querySelector("#account-auth-layout");
  const accountProfileLayout = document.querySelector("#profile-card");
  if (accountAuthLayout) accountAuthLayout.hidden = ["profile","edit-profile"].includes(accountMode);
  if (accountProfileLayout) accountProfileLayout.hidden = !["profile","edit-profile"].includes(accountMode);
  const form = document.querySelector("#auth-form");

if (form && !["profile","edit-profile"].includes(accountMode)) {
  const message = document.querySelector("#auth-message");
  const submit = document.querySelector("#auth-submit");
  const toggle = document.querySelector("#toggle-signup");
  const forgot = document.querySelector("#forgot-password");
  const emailInput = form.elements.email;
  const nameInput = form.elements.fullName;
  const passwordInput = form.elements.password;
  const otpInput = form.elements.otp;
  const confirmPasswordInput = form.elements.confirmPassword;
  const currentAuthUrl = new URL(window.location.href);
  const isPasswordRecoveryCallback = new URLSearchParams(currentAuthUrl.hash.replace(/^#/, "")).get("type") === "recovery" || currentAuthUrl.searchParams.get("recovery") === "1";
  let mode = isPasswordRecoveryCallback ? "recovery-new-password" : (document.querySelector("#app-main")?.dataset.authMode || "login");
  let recoveryEmail = currentAuthUrl.searchParams.get("email") || "";
  if (mode === "recovery-verify") emailInput.value = recoveryEmail;

  function showMessage(text, kind = "") {
    message.textContent = text;
    message.dataset.kind = kind;
  }

  function render() {
    const signup = mode === "signup";
    const recoveryStart = mode === "recovery-start";
    const recoveryVerify = mode === "recovery-verify" || mode === "recovery";
    const recoveryNewPassword = mode === "recovery-new-password";
    const recoveryFlow = recoveryVerify || recoveryNewPassword;

    submit.textContent = signup ? "Create Account"
      : recoveryStart ? "Send Code"
      : recoveryVerify ? "Verify"
      : recoveryNewPassword ? "Update Password"
      : "Login";

    forgot.textContent = recoveryStart ? "Login" : "Reset Password";
    toggle.textContent = signup || recoveryStart ? "Login" : "Create Account";
    if (recoveryStart) toggle.textContent = "Create Account";

    forgot.hidden = recoveryFlow;
    toggle.hidden = recoveryFlow;
    nameInput.hidden = !signup;
    nameInput.required = signup;
    emailInput.hidden = recoveryFlow;
    emailInput.required = !recoveryFlow;
    emailInput.readOnly = recoveryFlow;
    passwordInput.hidden = recoveryStart || recoveryVerify;
    passwordInput.required = !recoveryStart && !recoveryVerify;
    if (confirmPasswordInput) {
      confirmPasswordInput.hidden = !recoveryNewPassword;
      confirmPasswordInput.required = recoveryNewPassword;
      confirmPasswordInput.autocomplete = "new-password";
    }
    passwordInput.autocomplete = signup || recoveryNewPassword ? "new-password" : "current-password";
    passwordInput.placeholder = recoveryNewPassword ? "New Password" : "Password";
    passwordInput.setAttribute("aria-label", recoveryNewPassword ? "New Password" : "Password");
    otpInput.hidden = !recoveryVerify;
    otpInput.required = recoveryVerify;
    if (recoveryVerify) otpInput.focus();
  }

  toggle.addEventListener("click", () => {
    if (["recovery-verify","recovery","recovery-new-password"].includes(mode)) return;
    const target = mode === "signup" ? "account/login/" : "account/create-account/";
    window.navigateSiteRoute(new URL(target, ROOT_URL).pathname);
  });

  forgot.addEventListener("click", () => {
    if (["recovery-verify","recovery","recovery-new-password"].includes(mode)) return;
    const target = mode === "recovery-start" ? "account/login/" : "account/reset-password/";
    window.navigateSiteRoute(new URL(target, ROOT_URL).pathname);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const fullName = nameInput.value.trim();
    const password = passwordInput.value;
    const code = otpInput.value.trim();

    if (!email && !["recovery-verify", "recovery", "recovery-new-password"].includes(mode)) {
      emailInput.focus();
      return showMessage("Enter your email address.", "error");
    }
    if (mode === "signup" && !fullName) {
      nameInput.focus();
      return showMessage("Enter your name.", "error");
    }
    if (["login", "signup", "recovery-new-password"].includes(mode) && password.length < 8) {
      passwordInput.focus();
      return showMessage("Password must be at least 8 characters.", "error");
    }
    if (mode === "recovery-new-password" && password !== confirmPasswordInput?.value) {
      confirmPasswordInput?.focus();
      return showMessage("New passwords do not match.", "error");
    }
    if (["recovery-verify", "recovery"].includes(mode) && !/^\d{6,8}$/.test(code)) {
      otpInput.focus();
      return showMessage("Enter the verification code from your email.", "error");
    }

    submit.disabled = true;
    showMessage(mode === "recovery-start" ? "Sending verification code…"
       : ["recovery-verify", "recovery"].includes(mode) ? "Verifying code…"
      : mode === "recovery-new-password" ? "Updating password…"
      : mode === "signup" ? "Creating account…" : "Signing in…");
    try {
      if (mode === "recovery-start") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: new URL("account/reset-password/?recovery=1", ROOT_URL).href,
        });
        if (error) throw error;
        recoveryEmail = email;
        otpInput.value = "";
        window.navigateSiteRoute(new URL("account/verify/?email=" + encodeURIComponent(email), ROOT_URL).pathname + "?email=" + encodeURIComponent(email));
      } else if (mode === "recovery-verify" || mode === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          email: recoveryEmail,
          token: code,
          type: "recovery",
        });
        if (error) throw error;
        otpInput.value = "";
        window.navigateSiteRoute(new URL("account/new-password/", ROOT_URL).pathname);
      } else if (mode === "recovery-new-password") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        await supabase.auth.signOut();
        mode = "login";
        recoveryEmail = "";
        emailInput.readOnly = false;
        passwordInput.value = "";
        render();
        showMessage("Password updated successfully. You can now log in.", "success");
        window.navigateSiteRoute(new URL("account/login/", ROOT_URL).pathname, { replace:true });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: fullName, full_name: fullName }, emailRedirectTo: new URL("account/login/", ROOT_URL).href },
        });
        if (error) throw error;
        if (data.session) {
          showMessage("Account created successfully.", "success");
          window.navigateSiteRoute(new URL("account/profile/", ROOT_URL).pathname);
        } else {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
          if (!loginError && loginData.session) {
            showMessage("This email already has an account. You are now logged in to that account.", "success");
            window.navigateSiteRoute(new URL("account/profile/", ROOT_URL).pathname);
          } else if (loginError && /email not confirmed/i.test(loginError.message)) {
            showMessage("Check your inbox to confirm your new account before logging in.", "success");
          } else {
            showMessage("This email may already have an account. Use the correct password, or choose Login or Reset Password.", "error");
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showMessage("Signed in successfully.", "success");
        window.navigateSiteRoute(new URL("account/profile/", ROOT_URL).pathname);
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Authentication failed. Please try again.", "error");
    } finally {
      submit.disabled = false;
    }
  });

  render();
  const recoveryListener = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" && session) {
      mode = "recovery-new-password";
      recoveryEmail = session.user.email || "";
      emailInput.value = recoveryEmail;
      render();
      showMessage("Enter your new password to finish resetting your account.", "success");
    }
  });
  window.__routeAuthSubscriptions.push(recoveryListener.data.subscription);
}

const profile = document.querySelector("#profile-card");
if (profile && ["profile","edit-profile"].includes(accountMode)) {
  const status = document.querySelector("#profile-message");
  const form = document.querySelector("#profile-edit-form");
  const saveButton = document.querySelector("#profile-save");
  const fields = {
    name: document.querySelector("#profile-name"),
    email: document.querySelector("#profile-email"),
    phone: document.querySelector("#profile-phone"),
  };
  const roleField = document.querySelector("#profile-role");
  let currentUser = null;
  let currentPhone = "";
  Object.values(fields).forEach((field) => {
    field.addEventListener("input", () => {
      field.classList.toggle("is-placeholder", !field.textContent.trim());
    });
  });

  function profileMessage(text, kind = "") {
    status.textContent = text;
    status.dataset.kind = kind;
  }
  function setProfileValue(key, value, placeholder) {
    const field = fields[key];
    const normalized = String(value || "").trim();
    field.textContent = normalized;
    field.dataset.placeholderText = placeholder;
    field.classList.toggle("is-placeholder", !normalized);
  }
  function enableInlineEdit(button) {
    const key = button.dataset.editField;
    const field = fields[key];
    if (!field) return;
    const original = key === "name"
      ? (currentUser.user_metadata?.display_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "")
      : key === "email" ? (currentUser.email || "") : currentPhone;
    field.textContent = original;
    field.classList.toggle("is-placeholder", !String(original || "").trim());
    field.contentEditable = "true";
    field.classList.add("is-editing");
    button.dataset.saving = "true";
    button.textContent = "Save";
    field.focus();
    profileMessage("");
  }
  profile.querySelectorAll("[data-edit-field]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.saving === "true") {
        form.requestSubmit();
        return;
      }
      enableInlineEdit(button);
    });
  });
  document.querySelector("#profile-logout")?.addEventListener("click", async () => {
    const button=document.querySelector("#profile-logout");button.disabled=true;
    const {error}=await supabase.auth.signOut();button.disabled=false;
    if(error){profileMessage(error.message||"Could not log out.","error");return;}
    setMenuSession(null);window.navigateSiteRoute(new URL("home/",ROOT_URL).pathname,{replace:true});
  });
  document.querySelector("#profile-password-edit").addEventListener("click", (event) => {
    const fieldsBox = document.querySelector("#profile-password-fields");
    const button = event.currentTarget;
    if (button.dataset.saving === "true") {
      form.requestSubmit();
      return;
    }
    fieldsBox.hidden = false;
    button.dataset.saving = "true";
    button.textContent = "Save";
    form.elements.currentPassword.focus();
  });

  async function loadProfile() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      window.navigateSiteRoute(new URL("account/login/", ROOT_URL).pathname, { replace: true });
      return;
    }
    currentUser = data.user;
    const primaryOwner=currentUser.email?.toLowerCase()==="3btechhub@gmail.com";
    if(primaryOwner)profile.querySelectorAll('[data-edit-field="name"],[data-edit-field="email"]').forEach(button=>{button.hidden=true;button.disabled=true;});
    const name = currentUser.user_metadata?.display_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "";
    setProfileValue("name", name, "Name");
    setProfileValue("email", currentUser.email || "", "Email");
    const { data: profileData, error: profileError } = await supabase
      .from("Users").select("phone").eq("auth_user_id", currentUser.id).maybeSingle();
    if (profileError) {
      profileMessage("Could not load your phone number. Please refresh and try again.", "error");
    } else {
      currentPhone = profileData?.phone || "";
      setProfileValue("phone", currentPhone, "Phone Number");
      if (roleField) {
        const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", currentUser.id);
        roleField.textContent = (roleRows || []).map(row => row.role).join(", ");
        roleField.closest(".profile-row").hidden = !roleField.textContent;
      }
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    saveButton.disabled = true;
    profileMessage("Saving…");
    try {
      const data = new FormData(form);
      const name = fields.name.contentEditable === "true" ? fields.name.textContent.trim() : (currentUser.user_metadata?.display_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "");
      const email = fields.email.contentEditable === "true" ? fields.email.textContent.trim().toLowerCase() : (currentUser.email || "");
      const phone = fields.phone.contentEditable === "true" ? fields.phone.textContent.trim() : currentPhone;
      const currentPassword = String(data.get("currentPassword") || "");
      const newPassword = String(data.get("newPassword") || "");
      const confirmPassword = String(data.get("confirmPassword") || "");

      if (!email) throw new Error("Enter your email address.");
      if (phone && !/^\+?[0-9() .-]{7,24}$/.test(phone)) throw new Error("Enter a valid phone number.");
      if (newPassword) {
        if (newPassword.length < 8) throw new Error("New password must be at least 8 characters.");
        if (newPassword !== confirmPassword) throw new Error("New passwords do not match.");
        if (!currentPassword) throw new Error("Enter your current password to change it.");
        const { error: verifyError } = await supabase.auth.signInWithPassword({ email: currentUser.email, password: currentPassword });
        if (verifyError) throw new Error("Current password is incorrect.");
      } else if (confirmPassword || currentPassword) {
        throw new Error("To change password, enter current password, new password, and confirmation.");
      }

      const primaryOwner=currentUser.email?.toLowerCase()==="3btechhub@gmail.com";
      if(primaryOwner&&(name!==(currentUser.user_metadata?.display_name||currentUser.user_metadata?.full_name||currentUser.user_metadata?.name||"")||email!==currentUser.email))throw new Error("The primary Owner identity cannot be changed.");
      if(!primaryOwner){
        const { data: nameData, error: nameError } = await supabase.auth.updateUser({
          data: { ...(currentUser.user_metadata || {}), display_name: name || null },
        });
        if (nameError) throw nameError;
        currentUser = nameData.user;
      }

      const { error: phoneError } = await supabase.from("Users").update(
        { phone: phone || null },
      ).eq("auth_user_id", currentUser.id);
      if (phoneError) throw phoneError;
      currentPhone = phone;

      let emailPending = false;
      if (email !== currentUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        emailPending = true;
      }
      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
        if (passwordError) throw passwordError;
      }

      form.querySelectorAll("[data-profile-field]").forEach((field) => {
        field.contentEditable = "false";
        field.classList.remove("is-editing");
        const editButton = field.closest(".profile-row").querySelector("[data-edit-field]");
        if (editButton) {
          editButton.dataset.saving = "false";
          editButton.textContent = "Edit Name";
        }
      });
      document.querySelector("#profile-password-fields").hidden = true;
      const passwordEditButton = document.querySelector("#profile-password-edit");
      passwordEditButton.dataset.saving = "false";
      passwordEditButton.textContent = "Change Password";
      form.reset();
      await loadProfile();
      profileMessage(
        emailPending
          ? "Profile saved. A confirmation link has been sent to your new email address."
          : newPassword
            ? "Profile and password saved successfully."
            : "Profile saved successfully.",
        "success",
      );
    } catch (error) {
      profileMessage(error instanceof Error ? error.message : "Could not save changes. Please try again.", "error");
    } finally {
      saveButton.disabled = false;
    }
  });

  await loadProfile();
  if (accountMode === "edit-profile") profile.querySelectorAll("[data-edit-field]").forEach((button) => button.click());
  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) window.navigateSiteRoute(new URL("account/login/", ROOT_URL).pathname, { replace: true });
  });
  window.__routeAuthSubscriptions.push(authListener.subscription);
}


// Owner-only dashboard: the database role is checked again on the page itself.
let currentDashboardRole = null;
const ownerDashboard = document.querySelector("#app-main[data-view=\"dashboard\"]");
if (ownerDashboard) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    window.navigateSiteRoute(new URL("account/login/", ROOT_URL).pathname, { replace: true });
  } else {
    const { data: dashboardRole, error: roleError } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", authData.user.id).in("role", ["owner","admin"]).limit(1).maybeSingle();
    if (roleError || !["owner","admin"].includes(dashboardRole?.role)) {
      window.navigateSiteRoute(new URL("account/profile/", ROOT_URL).pathname, { replace: true });
    } else {
      currentDashboardRole = dashboardRole.role;
      const dashboardAuthListener = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) window.navigateSiteRoute(new URL("account/login/", ROOT_URL).pathname, { replace: true });
      });
      window.__routeAuthSubscriptions.push(dashboardAuthListener.data.subscription);
      await initDynamicDashboard(supabase, ownerDashboard, {...authData.user,role:currentDashboardRole});
      return;
      const ownerEmail = document.querySelector("#dashboard-owner-email");
      if (ownerEmail) ownerEmail.textContent = authData.user.email || "";
      const resources = [["Users","dashboard-users-count"],["services","dashboard-services-count"],["categories","dashboard-categories-count"],["products","dashboard-products-count"],["workshops","dashboard-workshops-count"],["technicians","dashboard-technicians-count"],["contacts","dashboard-contacts-count"],["Roles","dashboard-roles-count"],["permissions","dashboard-permissions-count"]];
      const health=document.getElementById("dashboard-health-status");
      if(health){health.replaceChildren();const checks=[["Website","Online",true],["Supabase / Database","Checking…",null],["Authentication","Checking…",null],["Storage","Checking…",null],["Backend services","Checking…",null]];
        const [databaseCheck,authCheck,storageCheck,backendCheck]=await Promise.all([
          supabase.from("Settings").select("setting_key").limit(1),
          supabase.auth.getUser(),
          supabase.storage.from("site-media").list("",{limit:1}),
          supabase.functions.invoke("owner-users",{body:{action:"health"}})
        ]);
        checks[1]=["Supabase / Database",databaseCheck.error?"Unavailable":"Connected",!databaseCheck.error];
        checks[2]=["Authentication",authCheck.error?"Unavailable":"Available",!authCheck.error];
        checks[3]=["Storage",storageCheck.error?"Unavailable":"Connected",!storageCheck.error];
        checks[4]=["Backend services",backendCheck.error?"Unavailable":"Available",!backendCheck.error];
        for(const [label,value,ok] of checks){const card=document.createElement("section");card.className="dashboard-card";addTextElement(card,"h3","",label);addTextElement(card,"p",ok===true?"health-ok":ok===false?"health-error":"muted",value);health.append(card);}
      }
      const results = await Promise.all(resources.map(async ([table, target]) => {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
        const element = document.getElementById(target);
        if (element) element.textContent = error ? "—" : String(count ?? 0);
        return !error;
      }));
    }
  }
  const dashboardAuthListener = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) window.navigateSiteRoute(new URL("account/login/", ROOT_URL).pathname, { replace: true });
  });
  window.__routeAuthSubscriptions.push(dashboardAuthListener.data.subscription);
}


// User administration is handled by the shared Users module in admin-extended.js.
// Owner-only website profile settings stored as a single public configuration record.
const siteSettingsForm = document.querySelector("#site-settings-form");
const siteSettingsMessage = document.querySelector("#site-settings-message");
const homeModulesSettingsHost=document.getElementById("home-modules-settings");
function renderHomeModulesSettings(settingValue){
  if(!homeModulesSettingsHost)return;
  homeModulesSettingsHost.replaceChildren();
  const modules=Array.isArray(settingValue?.modules)?settingValue.modules:[];
  modules.filter(item=>item&&typeof item.key==="string")
    .sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0))
    .forEach((item,index)=>{
      const row=document.createElement("div");row.className="module-form-grid";row.dataset.homeModuleKey=item.key;
      const titleField=document.createElement("label");titleField.className="module-form-field";
      const titleLabel=document.createElement("span");titleLabel.textContent="Module Title";
      const titleInput=document.createElement("input");titleInput.type="text";titleInput.maxLength=100;titleInput.value=typeof item.title==="string"?item.title:"";titleInput.dataset.homeModuleTitle="true";
      titleField.append(titleLabel,titleInput);
      const orderField=document.createElement("label");orderField.className="module-form-field";
      const orderLabel=document.createElement("span");orderLabel.textContent="Display Order";
      const orderInput=document.createElement("input");orderInput.type="number";orderInput.min="1";orderInput.max="999";orderInput.value=String(Number(item.sort_order)||((index+1)*10));orderInput.dataset.homeModuleOrder="true";
      orderField.append(orderLabel,orderInput);
      const visibilityField=document.createElement("label");visibilityField.className="module-related-option";
      const visibilityInput=document.createElement("input");visibilityInput.type="checkbox";visibilityInput.checked=Array.isArray(item.visibility_roles)&&item.visibility_roles.includes("visitor");visibilityInput.dataset.homeModuleVisitor="true";
      const visibilityText=document.createElement("span");visibilityText.textContent="Visitor Visibility";
      visibilityField.append(visibilityInput,visibilityText);
      row.append(titleField,orderField,visibilityField);homeModulesSettingsHost.append(row);
    });
}
function collectHomeModulesSettings(){
  if(!homeModulesSettingsHost)return [];
  return [...homeModulesSettingsHost.querySelectorAll("[data-home-module-key]")].map((row,index)=>{
    const title=row.querySelector("[data-home-module-title]")?.value.trim()||"";
    const order=Number(row.querySelector("[data-home-module-order]")?.value);
    const visible=Boolean(row.querySelector("[data-home-module-visitor]")?.checked);
    return {key:row.dataset.homeModuleKey,title,sort_order:Number.isFinite(order)&&order>0?order:(index+1)*10,visibility_roles:visible?["owner","visitor"]:["owner"]};
  });
}
const siteSettingsVisibilityHost=document.createElement("div");siteSettingsVisibilityHost.className="module-related-options";siteSettingsVisibilityHost.dataset.visibilityRoles="true";
const siteSettingsVisibilityField=document.createElement("div");siteSettingsVisibilityField.className="module-form-field module-related-field";addTextElement(siteSettingsVisibilityField,"span","","Visibility");siteSettingsVisibilityField.append(siteSettingsVisibilityHost);
siteSettingsForm?.querySelector(".editor-actions")?.before(siteSettingsVisibilityField);

async function loadSiteSettingsForm() {
  if (!siteSettingsForm || currentDashboardRole !== "owner") return;
  if (siteSettingsMessage) siteSettingsMessage.textContent = "Loading website settings…";
  const [{data,error},{data:introData}] = await Promise.all([
    supabase.from("Settings").select("setting_value,visibility_roles").eq("setting_key","site_profile").maybeSingle(),
    supabase.from("Settings").select("setting_value,visibility_roles").eq("setting_key","home_intro").maybeSingle()
  ]);
  if (error||homeModulesError) { if (siteSettingsMessage) siteSettingsMessage.textContent=(error||homeModulesError).message||"Could not load website settings."; return; }
  await loadVisibilityRoleOptions(siteSettingsForm,data?.visibility_roles||introData?.visibility_roles||["owner","visitor"]);
  const settings=data?.setting_value&&typeof data.setting_value==="object"?data.setting_value:{};
  const intro=introData?.setting_value&&typeof introData.setting_value.content==="string"?introData.setting_value.content:"";
  siteSettingsForm.elements.home_intro.value=intro;
  siteSettingsForm.elements.website_title.value=typeof settings.website_title==="string"?settings.website_title:"3B TECH HUB";
  siteSettingsForm.elements.logo_url.value=typeof settings.logo_url==="string"?settings.logo_url:"";
  const preview=document.getElementById("site-logo-preview");
  if(preview&&settings.logo_url){preview.src=settings.logo_url;preview.hidden=false;}
  renderHomeModulesSettings(homeModulesData?.setting_value);
  if(siteSettingsMessage)siteSettingsMessage.textContent="Website settings loaded.";
}
if(siteSettingsForm){
  document.getElementById("site-logo-remove")?.addEventListener("click",()=>{siteSettingsForm.dataset.removeLogo="true";siteSettingsForm.elements.logo_url.value="";siteSettingsForm.elements.logo_file.value="";const p=document.getElementById("site-logo-preview");if(p){p.removeAttribute("src");p.hidden=true;}});
  siteSettingsForm.elements.logo_file?.addEventListener("change",()=>{const file=siteSettingsForm.elements.logo_file.files?.[0];if(file){const p=document.getElementById("site-logo-preview");if(p){p.src=URL.createObjectURL(file);p.hidden=false;}siteSettingsForm.dataset.removeLogo="false";}});
  siteSettingsForm.addEventListener("submit",async(event)=>{
    event.preventDefault();
    if(currentDashboardRole!=="owner"){if(siteSettingsMessage)siteSettingsMessage.textContent="Owner permission required.";return;}
    const submit=document.getElementById("site-settings-save"),form=new FormData(siteSettingsForm);
    const websiteTitle=String(form.get("website_title")||"").trim()||"3B TECH HUB";
    let logoUrl=String(form.get("logo_url")||"").trim();
    const oldLogoUrl=logoUrl,file=siteSettingsForm.elements.logo_file.files?.[0];
    if(logoUrl){try{if(!["https:","http:"].includes(new URL(logoUrl).protocol))throw new Error("Invalid URL");}catch{if(siteSettingsMessage)siteSettingsMessage.textContent="Logo URL must be a valid HTTP(S) address.";return;}}
    if(submit)submit.disabled=true;if(siteSettingsMessage)siteSettingsMessage.textContent="Saving website settings…";
    try{
      const {data:authData,error:authError}=await supabase.auth.getUser();if(authError||!authData.user)throw new Error("Your session has expired. Sign in again.");
      if(file){if(!file.type.startsWith("image/")||file.size>5*1024*1024)throw new Error("Choose an image up to 5 MB.");const path="branding/"+crypto.randomUUID()+"-"+file.name.replace(/[^\w.-]+/g,"-");const {error:uploadError}=await supabase.storage.from("site-media").upload(path,file,{cacheControl:"3600",contentType:file.type});if(uploadError)throw uploadError;logoUrl=supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;}
      if(siteSettingsForm.dataset.removeLogo==="true")logoUrl="";
      const visibility_roles=[...new Set([...siteSettingsForm.querySelectorAll("[data-visibility-role]:checked")].map(box=>box.value).concat("owner"))];
      const {error}=await supabase.from("Settings").upsert({setting_key:"site_profile",setting_value:{website_title:websiteTitle,logo_url:logoUrl},visibility_roles,description:"Public website profile"},{onConflict:"setting_key"});if(error)throw error;
      const homeIntro=String(form.get("home_intro")||"").trim();
      const {error:introError}=await supabase.from("Settings").upsert({setting_key:"home_intro",setting_value:{content:homeIntro},visibility_roles,description:"Public homepage introduction"},{onConflict:"setting_key"});if(introError)throw introError;
      const homeModules=collectHomeModulesSettings();
      const {error:modulesError}=await supabase.from("Settings").upsert({setting_key:"home_modules",setting_value:{modules:homeModules},visibility_roles:["owner","visitor"],description:"Homepage module titles, order and visitor visibility"},{onConflict:"setting_key"});if(modulesError)throw modulesError;
      if(oldLogoUrl&&oldLogoUrl!==logoUrl){try{await removeStoredImage(oldLogoUrl);}catch(cleanupError){console.warn("Old logo cleanup failed.",cleanupError);}}
      siteSettingsForm.dataset.removeLogo="false";renderHomeModulesSettings({modules:homeModules});if(siteSettingsMessage)siteSettingsMessage.textContent="Website settings saved.";
    }catch(error){if(siteSettingsMessage)siteSettingsMessage.textContent=error.message||"Could not save website settings.";}
    finally{if(submit)submit.disabled=false;}
  });
}
if(siteSettingsForm)void loadSiteSettingsForm();


// Core content modules: each module uses its existing Supabase table and RLS policies.
const dashboardContentModules = {
  countries: { table:"countries", title:"Country", fields:[
    ["title","Country Name","text",true],["code","Country Code","text",false],
    ["is_global","Global Availability","checkbox",false],["visibility_roles","Visibility","role-visibility",false]
  ], columns:["code","visibility_roles"] },
  locations: { table:"locations", title:"Location", fields:[
    ["title","Location Name","text",true],["country_id","Country","select",false,[]],
    ["address","Address","textarea",false],["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country_id","visibility_roles"] },
  service_types: { table:"service_types", title:"Service Type", fields:[
    ["title","Title","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["device_types","Device Type","multiselect",false],["services","Services","multiselect",false],
    ["products","Products","multiselect",false],["workshops","Workshops","multiselect",false],
    ["technicians","Technicians","multiselect",false],["images","Images","files",false],
    ["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country","visibility_roles"] },
  device_types: { table:"device_types", title:"Device Type", fields:[
    ["title","Title","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["service_types","Service Type","multiselect",false],["services","Services","multiselect",false],
    ["products","Products","multiselect",false],["workshops","Workshops","multiselect",false],
    ["technicians","Technicians","multiselect",false],["images","Images","files",false],
    ["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country","visibility"] },
  services: { table:"services", title:"Service", fields:[
    ["title","Title","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["service_types","Service Type","multiselect",false],["device_types","Device Type","multiselect",false],
    ["products","Products","multiselect",false],["workshops","Workshops","multiselect",false],
    ["technicians","Technicians","multiselect",false],["images","Images","files",false],
    ["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country","visibility"] },
  products: { table:"products", title:"Product", fields:[
    ["title","Title","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["service_types","Service Type","multiselect",false],["device_types","Device Type","multiselect",false],
    ["services","Service","multiselect",false],["workshops","Workshops","multiselect",false],
    ["technicians","Technicians","multiselect",false],["images","Images","files",false],
    ["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country","visibility"] },
  workshops: { table:"workshops", title:"Workshop", fields:[
    ["title","Title","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["location_id","Location","select",false,[]],["service_types","Service Type","multiselect",false],
    ["device_types","Device Type","multiselect",false],["services","Service","multiselect",false],
    ["products","Products","multiselect",false],["technicians","Technicians","multiselect",false],
    ["images","Images","files",false],["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country","location","visibility_roles"] },
  technicians: { table:"technicians", title:"Technician", fields:[
    ["title","Title","text",true],["slug","Slug","text",true],["country","Countries","countries",false],
    ["location_id","Location","select",false,[]],["skill","Skill/Expertise","text",false],["phone","Phone Number","tel",false],
    ["whatsapp","Whatsapp Number","tel",false],["link","Link","url",false],["email","Email","email",false],
    ["service_types","Service Type","multiselect",false],["device_types","Device Type","multiselect",false],
    ["services","Service","multiselect",false],["products","Products","multiselect",false],
    ["workshops","Workshops","multiselect",false],["images","Images","files",false],
    ["visibility_roles","Visibility","role-visibility",false]
  ], columns:["country","skill","link","visibility_roles"] }
};
const moduleRelationships = {
  service_types: {
    device_types:{table:"service_type_device_types",parent:"service_type_id",child:"device_type_id",target:"device_types",label:"title"},
    services:{table:"service_type_services",parent:"service_type_id",child:"service_id",target:"services",label:"name"},
    products:{table:"service_type_products",parent:"service_type_id",child:"product_id",target:"products",label:"name"},
    workshops:{table:"service_type_workshops",parent:"service_type_id",child:"workshop_id",target:"workshops",label:"title"},
    technicians:{table:"service_type_technicians",parent:"service_type_id",child:"technician_id",target:"technicians",label:"name"}
  },
  device_types: {
    service_types:{table:"service_type_device_types",parent:"device_type_id",child:"service_type_id",target:"service_types",label:"title"},
    services:{table:"device_type_services",parent:"device_type_id",child:"service_id",target:"services",label:"name"},
    products:{table:"device_type_products",parent:"device_type_id",child:"product_id",target:"products",label:"name"},
    workshops:{table:"device_type_workshops",parent:"device_type_id",child:"workshop_id",target:"workshops",label:"title"},
    technicians:{table:"device_type_technicians",parent:"device_type_id",child:"technician_id",target:"technicians",label:"name"}
  },
  services: {
    service_types:{table:"service_type_services",parent:"service_id",child:"service_type_id",target:"service_types",label:"title"},
    device_types:{table:"device_type_services",parent:"service_id",child:"device_type_id",target:"device_types",label:"title"},
    products:{table:"service_products",parent:"service_id",child:"product_id",target:"products",label:"name"},
    workshops:{table:"service_workshops",parent:"service_id",child:"workshop_id",target:"workshops",label:"title"},
    technicians:{table:"service_technicians",parent:"service_id",child:"technician_id",target:"technicians",label:"name"}
  },
  products: {
    service_types:{table:"service_type_products",parent:"product_id",child:"service_type_id",target:"service_types",label:"title"},
    device_types:{table:"device_type_products",parent:"product_id",child:"device_type_id",target:"device_types",label:"title"},
    services:{table:"service_products",parent:"product_id",child:"service_id",target:"services",label:"name"},
    workshops:{table:"product_workshops",parent:"product_id",child:"workshop_id",target:"workshops",label:"title"},
    technicians:{table:"product_technicians",parent:"product_id",child:"technician_id",target:"technicians",label:"name"}
  },
  workshops: {
    service_types:{table:"service_type_workshops",parent:"workshop_id",child:"service_type_id",target:"service_types",label:"title"},
    device_types:{table:"device_type_workshops",parent:"workshop_id",child:"device_type_id",target:"device_types",label:"title"},
    services:{table:"service_workshops",parent:"workshop_id",child:"service_id",target:"services",label:"name"},
    products:{table:"product_workshops",parent:"workshop_id",child:"product_id",target:"products",label:"name"},
    technicians:{table:"workshop_technicians",parent:"workshop_id",child:"technician_id",target:"technicians",label:"name"}
  },
  technicians: {
    service_types:{table:"service_type_technicians",parent:"technician_id",child:"service_type_id",target:"service_types",label:"title"},
    device_types:{table:"device_type_technicians",parent:"technician_id",child:"device_type_id",target:"device_types",label:"title"},
    services:{table:"service_technicians",parent:"technician_id",child:"service_id",target:"services",label:"name"},
    products:{table:"product_technicians",parent:"technician_id",child:"product_id",target:"products",label:"name"},
    workshops:{table:"workshop_technicians",parent:"technician_id",child:"workshop_id",target:"workshops",label:"title"}
  }
};
const countryRelationConfig = {
  service_types:["service_type_countries","service_type_id"],
  device_types:["device_type_countries","device_type_id"],
  services:["service_countries","service_id"],
  products:["product_countries","product_id"],
  workshops:["workshop_countries","workshop_id"],
  technicians:["technician_countries","technician_id"]
};
for (const [moduleName,[table,parent]] of Object.entries(countryRelationConfig)) {
  moduleRelationships[moduleName].countries={table,parent,child:"country_id",target:"countries",label:"name"};
}
async function syncTechnicianContacts(technicianId,payload){
  const {error:deleteError}=await supabase.from("technician_contacts").delete().eq("technician_id",technicianId);
  if(deleteError)throw deleteError;
  const values=[["phone","Phone",payload.phone],["whatsapp","WhatsApp",payload.whatsapp],["email","Email",payload.email],["website","Website",payload.link]]
    .filter(([, ,value])=>typeof value==="string"&&value.trim());
  for(const [contact_type,label,value] of values){
    const normalized_value=value.trim().toLowerCase();
    const {data,error}=await supabase.from("contact_points").upsert(
      {contact_type,label,value:value.trim(),normalized_value},
      {onConflict:"contact_type,normalized_value"}
    ).select("id").single();
    if(error)throw error;
    const {error:linkError}=await supabase.from("technician_contacts").insert({technician_id:technicianId,contact_id:data.id});
    if(linkError)throw linkError;
  }
}
async function loadVisibilityRoleOptions(form,selectedRoles) {
  if(!form)return;
  const host=form.querySelector("[data-visibility-roles]");
  if(!host)return;
  const {data,error}=await supabase.from("Roles").select("name,slug").eq("is_active",true).order("name");
  host.replaceChildren();
  if(error){addTextElement(host,"small","muted","Could not load available roles.");throw error;}
  const roles=data||[];
  for(const role of roles){
    const label=document.createElement("label");label.className="module-related-option";
    const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.value=role.slug;checkbox.dataset.visibilityRole=role.slug;
    checkbox.checked=selectedRoles?selectedRoles.includes(role.slug):role.slug==="owner";
    checkbox.disabled=role.slug==="owner";
    label.append(checkbox,document.createTextNode(role.name));host.append(label);
  }
  if(!roles.some(role=>role.slug==="owner"))throw new Error("The protected Owner role is missing.");
}
function setVisibilityRoleSelection(form,selectedRoles) {
  const selected=new Set([...(selectedRoles||[]),"owner"]);
  form.querySelectorAll("[data-visibility-role]").forEach(input=>{input.checked=selected.has(input.value);});
}
window.addEventListener("site-roles-updated",()=>{
  document.querySelectorAll("[data-visibility-roles]").forEach(host=>{
    const form=host.matches("form")?host:host.closest("form");
    if(!form)return;
    const selected=[...form.querySelectorAll("[data-visibility-role]:checked")].map(input=>input.value);
    void loadVisibilityRoleOptions(form,selected);
  });
});
async function loadModuleRelationOptions(moduleName,form) {
  await loadVisibilityRoleOptions(form,["owner"]);
  const config=moduleRelationships[moduleName]||{};
  for(const [key,rel] of Object.entries(config)){
    const host=form.querySelector('[data-related-options="'+key+'"]');
    if(!host)continue;
    let query=supabase.from(rel.target).select("id,"+rel.label).order(rel.label);
    const {data,error}=await query;
    host.replaceChildren();
    if(error){addTextElement(host,"small","muted","Could not load options.");continue;}
    for(const record of data||[]){
      const label=document.createElement("label");label.className="module-related-option";
      const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.value=record.id;checkbox.dataset.relatedId=record.id;checkbox.dataset.relatedName=record[rel.label]||"";
      if(rel.target==="countries"&&record[rel.label]==="Global"){checkbox.checked=true;checkbox.defaultChecked=true;}
      label.append(checkbox,document.createTextNode(record[rel.label]||"Untitled"));host.append(label);
    }
    if(!host.childElementCount)addTextElement(host,"small","muted","No available records yet.");
  }
  const countrySelect=form.elements.namedItem("country_id");
  if(countrySelect){
    const {data,error}=await supabase.from("countries").select("id,name").order("name");
    countrySelect.replaceChildren(new Option("— Select —",""));
    if(!error)for(const item of data||[])countrySelect.append(new Option(item.name,item.id));
  }
  const locationSelect=form.elements.namedItem("location_id");
  if(locationSelect){
    const {data,error}=await supabase.from("locations").select("id,name").order("name");
    locationSelect.replaceChildren(new Option("— Select —",""));
    if(!error)for(const item of data||[])locationSelect.append(new Option(item.name,item.id));
  }
}
async function loadModuleRelationSelection(moduleName,recordId,form){
  const config=moduleRelationships[moduleName]||{};
  for(const [key,rel] of Object.entries(config)){
    let relationQuery=supabase.from(rel.table).select(rel.child).eq(rel.parent,recordId);if(rel.scope)relationQuery=relationQuery.eq(rel.scope,moduleName);const {data,error}=await relationQuery;
    if(error)throw error;
    const selected=new Set((data||[]).map(row=>row[rel.child]));
    form.querySelectorAll('[data-related-options="'+key+'"] input[data-related-id]').forEach(input=>{input.checked=selected.has(input.dataset.relatedId);});
  }
}
async function saveModuleRelationships(moduleName,recordId,form){
  const config=moduleRelationships[moduleName]||{};
  for(const [key,rel] of Object.entries(config)){
    const host=form.querySelector('[data-related-options="'+key+'"]');
    const ids=host?[...host.querySelectorAll('input[data-related-id]:checked')].map(input=>input.dataset.relatedId):[];
    let deleteQuery=supabase.from(rel.table).delete().eq(rel.parent,recordId);if(rel.scope)deleteQuery=deleteQuery.eq(rel.scope,moduleName);const {error:deleteError}=await deleteQuery;
    if(deleteError)throw deleteError;
    if(ids.length){
      const rows=ids.map(id=>({[rel.parent]:recordId,[rel.child]:id,...(rel.scope?{[rel.scope]:moduleName}:{})}));
      const {error}=await supabase.from(rel.table).insert(rows);
      if(error)throw error;
    }
  }
}
function moduleLabel(value) {
  if (typeof value === "boolean") return value ? "Visible" : "Hidden";
  if (value == null || value === "") return "—";
  return String(value);
}
function slugFromName(value) {
  return String(value || "").normalize("NFKC").trim().toLocaleLowerCase()
    .replace(/[^\w.-]+/gu, "-").replace(/^-+|-+$/g, "");
}
function moduleDatabaseKey(moduleName,key) {
  if (key === "title") return ["workshops","service_types","device_types"].includes(moduleName) ? "title" : "name";
  if (moduleName === "workshops" && key === "technician") return "trainer";
  if (moduleName === "products" && key === "price") return "price_minor";
  return key;
}
function storagePathFromUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const marker = "/storage/v1/object/public/site-media/";
    const index = parsed.pathname.indexOf(marker);
    return index < 0 ? "" : decodeURIComponent(parsed.pathname.slice(index + marker.length));
  } catch { return ""; }
}
async function removeStoredImage(url) {
  const path = storagePathFromUrl(url);
  if (!path) return;
  const { error } = await supabase.storage.from("site-media").remove([path]);
  if (error) throw error;
}
function updateImagePreview(form,url) {
  const preview = form.querySelector(".module-image-preview");
  const remove = form.querySelector("[data-image-remove]");
  if (preview) {
    if (url) { preview.src=url; preview.hidden=false; }
    else { preview.removeAttribute("src"); preview.hidden=true; }
  }
  if (remove) remove.hidden=!url;
}
function createModuleField(field) {
  const [name,label,type,required,options] = field;
  const wrapper = document.createElement("label");
  wrapper.className = "module-form-field";
  let control;
  if (type === "textarea") { control=document.createElement("textarea"); control.rows=3; }
  else if (type === "countries") {
    const host=document.createElement("div");host.className="module-related-options";host.dataset.relatedOptions="countries";
    wrapper.append(addTextElement(wrapper,"span","",label),host);
    return wrapper;
  }
  else if (type === "checklist") {
    const relatedWrapper=document.createElement("div");relatedWrapper.className="module-form-field module-related-field";addTextElement(relatedWrapper,"span","",label);
    const host=document.createElement("div");host.className="module-related-options";host.dataset.checklistOptions=name;
    for(const value of options||[]){const option=document.createElement("label");option.className="module-related-option";const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.value=value;checkbox.dataset.checklistValue=value;option.append(checkbox,document.createTextNode(value));host.append(option);}
    relatedWrapper.append(host);return relatedWrapper;
  }
  else if (type === "role-visibility") {
    const relatedWrapper=document.createElement("div");relatedWrapper.className="module-form-field module-related-field";
    addTextElement(relatedWrapper,"span","",label);
    const host=document.createElement("div");host.className="module-related-options";host.dataset.visibilityRoles="true";
    host.append(addTextElement(host,"small","muted","Loading available roles…"));
    relatedWrapper.append(host);return relatedWrapper;
  }
  else if (type === "multiselect") {
    const relatedWrapper=document.createElement("div");
    relatedWrapper.className="module-form-field module-related-field";
    addTextElement(relatedWrapper,"span","",label);
    const host=document.createElement("div");host.className="module-related-options";host.dataset.relatedOptions=name;
    host.append(addTextElement(host,"small","muted","Options load when this module opens."));
    relatedWrapper.append(host);
    return relatedWrapper;
  }
  else if (type === "select") {
    control=document.createElement("select");
    const blank=document.createElement("option"); blank.value=""; blank.textContent="— Select —"; control.append(blank);
    for (const value of options || []) {
      const option=document.createElement("option"); option.value=value; option.textContent=value==="visible"?"Visible":value==="hidden"?"Hidden":value; control.append(option);
    }
  } else {
    control=document.createElement("input"); control.type=type==="files"?"file":type;
    if (type==="file" || type==="files") control.accept="image/jpeg,image/png,image/webp,image/avif,image/gif";
    if (type==="files") control.multiple=true;
    if (type==="number") { control.min="0"; control.step=name==="price"?"0.01":"1"; }
    if (name==="currency") control.value="SAR";
  }
  control.name=name; control.required=Boolean(required);
  if (type === "files") {
    wrapper.append(addTextElement(wrapper,"span","",label),control,addTextElement(wrapper,"small","muted","Select multiple images. New uploads are added to the existing gallery."));
  } else if (type === "file") {
    wrapper.append(addTextElement(wrapper,"span","",label),control);
    const preview=document.createElement("img"); preview.className="module-image-preview"; preview.alt=label+" preview"; preview.hidden=true;
    const remove=document.createElement("button"); remove.type="button"; remove.className="secondary-button"; remove.textContent="Remove image"; remove.dataset.imageRemove="true"; remove.hidden=true;
    control.addEventListener("change",()=>{
      const form=wrapper.closest("form");
      const file=control.files?.[0];
      if (file) {
        preview.src=URL.createObjectURL(file); preview.hidden=false; remove.hidden=false;
        if (form) form.dataset.removePhoto="false";
      }
    });
    remove.addEventListener("click",()=>{
      control.value=""; const form=wrapper.closest("form");
      if (form) form.dataset.removePhoto="true";
      updateImagePreview(form || wrapper, "");
    });
    wrapper.append(preview,remove);
  } else if (type === "checkbox") {
    wrapper.classList.add("module-checkbox-field"); control.setAttribute("aria-label",label); wrapper.append(control);
    addTextElement(wrapper,"span","",label);
  } else {
    addTextElement(wrapper,"span","",label); wrapper.append(control);
  }
  return wrapper;
}
function setModuleMessage(moduleName,message,kind="") {
  const node=document.querySelector('[data-module-message="'+moduleName+'"]');
  if (node) { node.textContent=message; node.dataset.kind=kind; }
}
function resetModuleForm(moduleName) {
  const form=document.querySelector('[data-module-form="'+moduleName+'"]');
  if (!form) return;
  const deleteButton=form.querySelector("[data-inline-delete]");
  if(deleteButton)deleteButton.remove();
  if(form._moduleFormPlaceholder?.parentNode){
    form._moduleFormPlaceholder.parentNode.insertBefore(form,form._moduleFormPlaceholder);
  }
  form.reset(); setVisibilityRoleSelection(form,["owner"]); form.dataset.editId=""; form.dataset.currentPhotoUrl=""; form.dataset.currentGalleryUrls="[]"; form.dataset.removePhoto="false"; form.dataset.slugManual="false";
  updateImagePreview(form,"");
  const config=dashboardContentModules[moduleName];
  document.querySelector('[data-module-form-title="'+moduleName+'"]').textContent="Add "+config.title;
  document.querySelector('[data-module-submit="'+moduleName+'"]').textContent="Save "+config.title;
  document.querySelector('[data-module-cancel="'+moduleName+'"]').hidden=true;
}
function createModuleRecordVisual(moduleName,photoUrl,record) {
  const visual=document.createElement("span");
  visual.className="module-record-visual";
  const icon=getItemFallbackIcon(record?.name||record?.title||moduleName,moduleName);
  if(moduleName==="technicians")icon.classList.add("module-record-fallback--person");
  const image=document.createElement("img");
  image.className="module-record-image";
  image.alt="";
  image.loading="lazy";
  image.hidden=!photoUrl;
  icon.hidden=Boolean(photoUrl);
  image.addEventListener("error",()=>{image.hidden=true;icon.hidden=false;});
  if(photoUrl)image.src=photoUrl;
  visual.append(image,icon);
  return visual;
}
const moduleRecordCache = {};
async function renderModuleList(moduleName,records) {
  const config=dashboardContentModules[moduleName];
  const form=document.querySelector('[data-module-form="'+moduleName+'"]');
  if(form)await loadModuleRelationOptions(moduleName,form);
  const container=document.querySelector('[data-module-list="'+moduleName+'"]');
  if (!container) return;
  container.replaceChildren();
  if (!records.length) { addTextElement(container,"p","muted","No records found. Use the form above to add one."); return; }
  for (const record of records) {
    const row=document.createElement("article"); row.className="admin-list-row module-record-row";
    const primary=document.createElement("div");
    primary.className="module-record-primary";
    primary.append(createModuleRecordVisual(moduleName,record.photo_url,record));
    const textContent=document.createElement("div"); textContent.className="module-record-text";
    addTextElement(textContent,"strong","",record.name||record.title||record.slug||"Untitled");
    row.append(textContent);
    row.classList.add("module-record-row--tap-edit");
    row.tabIndex=0;
    row.setAttribute("role","button");
    row.setAttribute("aria-label","Edit "+(record.name||record.title||record.slug||config.title));
    const openInlineEditor=async()=>{
      const form=document.querySelector('[data-module-form="'+moduleName+'"]');
      if(form.dataset.editId===record.id)return;
      if(form.dataset.editId)resetModuleForm(moduleName);
      form.dataset.editId=record.id;
      form.dataset.currentPhotoUrl=record.photo_url||"";
      form.dataset.currentGalleryUrls=JSON.stringify([...new Set([record.photo_url,...(record.gallery_urls||[])].filter(Boolean))]);
      form.dataset.removePhoto="false";form.dataset.slugManual="false";
      for(const [key] of config.fields){
        const input=form.elements.namedItem(key);
        if(key==="visibility_roles"){setVisibilityRoleSelection(form,record.visibility_roles||["owner"]);continue;}
        if(!input&&key!=="country"&&key!=="type")continue;
        else if(key==="type"&&moduleName==="categories"){const selected=new Set(Array.isArray(record.type)?record.type:[]);form.querySelectorAll("[data-checklist-value]").forEach(box=>box.checked=selected.has(box.dataset.checklistValue));}
        else if(key==="price")input.value=record.price_minor==null?"":String(Number(record.price_minor)/100);
        else if(key==="title")input.value=record[moduleDatabaseKey(moduleName,key)]||"";
        else if(key==="technician")input.value=record.trainer||"";
        else if(key==="images")input.value="";
        else if(key==="country"){const selected=String(record.country||"").split(",").map(value=>value.trim());form.querySelectorAll('[data-related-options="countries"] input[data-related-id]').forEach(box=>{box.checked=selected.includes(box.dataset.relatedName);});}
        else if(input.type==="checkbox")input.checked=Boolean(record[moduleDatabaseKey(moduleName,key)]);
        else if(key==="service_information")input.value=Array.isArray(record.service_information)?record.service_information.join("\n"):"";
        else input.value=record[moduleDatabaseKey(moduleName,key)]==null?"":String(record[moduleDatabaseKey(moduleName,key)]);
      }
      updateImagePreview(form,record.photo_url||"");
      try{await loadModuleRelationSelection(moduleName,record.id,form);}
      catch(error){resetModuleForm(moduleName);setModuleMessage(moduleName,error.message||"Could not load related records.","error");return;}
      document.querySelector('[data-module-form-title="'+moduleName+'"]').textContent="Edit "+config.title;
      document.querySelector('[data-module-submit="'+moduleName+'"]').textContent="Save";
      document.querySelector('[data-module-cancel="'+moduleName+'"]').textContent="Cancel";
      document.querySelector('[data-module-cancel="'+moduleName+'"]').hidden=false;
      const actions=form.querySelector(".editor-actions");
      const deleteButton=document.createElement("button");
      deleteButton.type="button";deleteButton.className="secondary-button";deleteButton.textContent="Delete";deleteButton.dataset.inlineDelete="true";
      deleteButton.addEventListener("click",async()=>{
        const displayName=record.name||record.title||record.slug||"this record";
        if(!window.confirm('Delete "'+displayName+'"? This cannot be undone.'))return;
        deleteButton.disabled=true;
        try{
          const {error}=await supabase.from(config.table).delete().eq("id",record.id);
          if(error)throw error;
          for(const url of [...new Set([record.photo_url,...(record.gallery_urls||[])].filter(Boolean))]){
            try{await removeStoredImage(url);}catch(cleanupError){console.warn("Image cleanup failed.",cleanupError);}
          }
          resetModuleForm(moduleName);
          setModuleMessage(moduleName,config.title+" deleted.","success");
          await loadContentModule(moduleName);
        }catch(error){setModuleMessage(moduleName,error.message||"Could not delete this record.","error");deleteButton.disabled=false;}
      });
      actions.append(deleteButton);
      // Keep the shared create/update form in its original position above the list.
      // Selecting a record only loads its values into that form.
      setModuleMessage(moduleName,"");
      form.scrollIntoView({behavior:"smooth",block:"start"});
    };
    row.addEventListener("click",event=>{
      if(event.target.closest("form"))return;
      openInlineEditor();
    });
    row.addEventListener("keydown",event=>{
      if(event.target!==row)return;
      if(event.key==="Enter"||event.key===" "){event.preventDefault();openInlineEditor();}
    });
    container.append(row);
  }
}
async function loadContentModule(moduleName) {
  if (!ownerDashboard || currentDashboardRole !== "owner") return;
  const config=dashboardContentModules[moduleName];
  const container=document.querySelector('[data-module-list="'+moduleName+'"]');
  if (container) { container.replaceChildren(); addTextElement(container,"p","muted","Loading records…"); }
  const {data,error}=await supabase.from(config.table).select("*").order("created_at",{ascending:false});
  if (error) {
    if (container) { container.replaceChildren(); addTextElement(container,"p","muted",error.message||"Could not load records."); }
    return;
  }
  moduleRecordCache[moduleName]=data||[];
  const countNode=document.querySelector('[data-dashboard-count="'+moduleName+'"]');
  if(countNode)countNode.textContent=String(moduleRecordCache[moduleName].length);
  await renderModuleList(moduleName,moduleRecordCache[moduleName]);
}
for (const [moduleName,config] of Object.entries(dashboardContentModules)) {
  const fieldsHost=document.querySelector('[data-module-fields="'+moduleName+'"]');
  const form=document.querySelector('[data-module-form="'+moduleName+'"]');
  if (!fieldsHost||!form) continue;
  for (const field of config.fields) fieldsHost.append(createModuleField(field));
  if(!form._moduleFormPlaceholder){
    const marker=document.createComment("module-form-home");
    form.parentNode.insertBefore(marker,form);
    form._moduleFormPlaceholder=marker;
  }
  await loadModuleRelationOptions(moduleName,form);
  const titleInput=form.elements.namedItem("title");
  const slugInput=form.elements.namedItem("slug");
  if (titleInput&&slugInput) {
    titleInput.addEventListener("input",()=>{
      if (form.dataset.slugManual!=="true") slugInput.value=slugFromName(titleInput.value);
    });
    slugInput.addEventListener("input",()=>{ form.dataset.slugManual="true"; });
  }
  form.dataset.removePhoto="false"; form.dataset.slugManual="false";
  form.addEventListener("submit",async(event)=>{
    event.preventDefault();
    if (currentDashboardRole !== "owner") { setModuleMessage(moduleName,"Owner permission required.","error"); return; }
    const submit=document.querySelector('[data-module-submit="'+moduleName+'"]'); submit.disabled=true; setModuleMessage(moduleName,"Saving…");
    let uploadedUrls=[], saved=false, contactSyncWarning="";
    try {
      const payload={};
      for (const [key] of config.fields) {
        if(key==="type"&&moduleName==="categories"){payload.type=[...form.querySelectorAll("[data-checklist-value]:checked")].map(box=>box.dataset.checklistValue);continue;}
        const input=form.elements.namedItem(key); if ((!input && key!=="country") || key==="images" || key==="visibility_roles" || moduleRelationships[moduleName]?.[key]) continue;
        const dbKey=moduleDatabaseKey(moduleName,key);
        if(key==="country"){
          let selected=[...form.querySelectorAll('[data-related-options="countries"] input[data-related-id]:checked')];
          if(!selected.length){const global=form.querySelector('[data-related-options="countries"] input[data-related-name="Global"]');if(global){global.checked=true;selected=[global];}}
          payload[dbKey]=selected.map(box=>box.dataset.relatedName).filter(Boolean).join(", ")||"Global";
          continue;
        }
        if(key==="location_id"){
          payload.location_id=input.value||null;
          payload.location=input.value?input.selectedOptions[0]?.textContent||null:null;
        } else if(input.type==="checkbox")payload[dbKey]=input.checked;
        else if(key==="service_information") payload[dbKey]=input.value.split(/\r?\n/).map(value=>value.trim()).filter(Boolean);
        else if(key==="price") {
          const raw=input.value.trim();
          const value=raw===""?null:Number(raw);
          if(value!==null&&!Number.isFinite(value))throw new Error("Enter a valid product price.");
          payload[dbKey]=value===null?null:Math.round(value*100);
        } else if(key==="stock_qty") {
          const value=input.value.trim()===""?0:Number(input.value);
          if(!Number.isInteger(value)||value<0)throw new Error("Stock quantity must be a whole number of zero or more.");
          payload[dbKey]=value;
        } else if(key==="condition") payload[dbKey]=input.value.trim()||"new";
        else payload[dbKey]=input.value.trim()===""?(key==="currency"?"SAR":null):input.value.trim();
      }
      const titleValue=String(titleInput?.value||"").trim();
      if (!titleValue) throw new Error("Title is required.");
      payload[moduleDatabaseKey(moduleName,"title")]=titleValue;
      payload.visibility_roles=[...new Set([...form.querySelectorAll("[data-visibility-role]:checked")].map(box=>box.value).concat("owner"))];
      if (moduleName==="categories") {
        const selectedTypes=[...form.querySelectorAll("[data-checklist-value]:checked")].map(box=>box.dataset.checklistValue);
        if (!selectedTypes.length||selectedTypes.some(value=>!["Service","Device"].includes(value))) throw new Error("Select at least one valid Category Type.");
        payload.type=selectedTypes;
      } else {
        if(!["countries","locations"].includes(moduleName)){
          const slugValue=String(slugInput?.value||"").trim()||slugFromName(titleValue);
          if (!slugValue) throw new Error("Slug is required.");
          payload.slug=slugValue;
        }
        if (moduleName==="services"||moduleName==="products") payload.description=payload.description||"";
        if(!form.dataset.editId){
          if(moduleName==="technicians")payload.is_published=true;
          else payload.status=moduleName==="workshops"?"published":"active";
        }
      }
      if (!["categories","countries","locations"].includes(moduleName)) {
        const imagesInput=form.elements.namedItem("images");
        const imageUrls=JSON.parse(form.dataset.currentGalleryUrls||"[]");
        if(imagesInput?.files?.length){
          for(const file of Array.from(imagesInput.files)){
            if(!file.type.startsWith("image/")) throw new Error("Please select image files only.");
            if(file.size>10*1024*1024) throw new Error("Each image must be 10 MB or smaller.");
            const safeName=file.name.normalize("NFKD").replace(/[^\w.-]+/g,"-").replace(/^-+|-+$/g,"")||"image";
            const path="content/"+moduleName+"/gallery/"+crypto.randomUUID()+"-"+safeName;
            const {error:uploadError}=await supabase.storage.from("site-media").upload(path,file,{cacheControl:"3600",contentType:file.type,upsert:false});
            if(uploadError) throw uploadError;
            const publicUrl=supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;
            imageUrls.push(publicUrl);
            uploadedUrls.push(publicUrl);
          }
        }
        payload.gallery_urls=imageUrls;
        payload.photo_url=imageUrls[0]||null;
      }
      const editId=form.dataset.editId; let result;
      if (editId) result=await supabase.from(config.table).update(payload).eq("id",editId).select("id").single();
      else {
        const {data:authData}=await supabase.auth.getUser();
        if (moduleName==="workshops"&&authData?.user?.id) { payload.created_by=authData.user.id; payload.updated_by=authData.user.id; }
        result=await supabase.from(config.table).insert(payload).select("id").single();
      }
      if (result.error) throw result.error;
      await saveModuleRelationships(moduleName,result.data.id,form);
      saved=true;
      if(moduleName==="technicians"){
        try{await syncTechnicianContacts(result.data.id,payload);}
        catch(contactError){contactSyncWarning=contactError.message||"Shared contact synchronization failed.";}
      }
      if(moduleName==="countries"){
        for(const target of ["service_types","device_types","services","products","workshops","technicians","locations"]){
          const targetForm=document.querySelector('[data-module-form="'+target+'"]');
          if(targetForm)await loadModuleRelationOptions(target,targetForm);
        }
      }
      if(moduleName==="locations"){
        for(const target of ["workshops","technicians"]){
          const targetForm=document.querySelector('[data-module-form="'+target+'"]');
          if(targetForm)await loadModuleRelationOptions(target,targetForm);
        }
      }
      resetModuleForm(moduleName);
      const successMessage=config.title+(editId?" updated.":" created.");
      setModuleMessage(moduleName,contactSyncWarning?successMessage+" Shared contacts were not fully synchronized: "+contactSyncWarning:successMessage,contactSyncWarning?"error":"success");
      await loadContentModule(moduleName);
    } catch(error) {
      if (!saved) { for(const url of uploadedUrls){try{await removeStoredImage(url);}catch{}} }
      setModuleMessage(moduleName,error.message||"Could not save this record.","error");
    } finally { submit.disabled=false; }
  });
  document.querySelector('[data-module-cancel="'+moduleName+'"]')?.addEventListener("click",()=>resetModuleForm(moduleName));
  document.querySelector('[data-dashboard-tab="'+moduleName+'"]')?.addEventListener("click",()=>void loadContentModule(moduleName));
}

// Dashboard module tabs: all modules stay on one horizontal row.
const dashboardTabs = Array.from(document.querySelectorAll("[data-dashboard-tab]"));
const dashboardPanels = Array.from(document.querySelectorAll("[data-dashboard-panel]"));
function activateDashboardModule(moduleName, focusTab = false) {
  dashboardTabs.forEach((tab) => {
    const active = tab.dataset.dashboardTab === moduleName;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focusTab) tab.focus();
  });
  dashboardPanels.forEach((panel) => {
    const active = panel.dataset.dashboardPanel === moduleName;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });
}
document.querySelectorAll("[data-dashboard-open]").forEach(card=>card.addEventListener("click",()=>{const moduleName=card.dataset.dashboardOpen;activateDashboardModule(moduleName);if(dashboardContentModules[moduleName])void loadContentModule(moduleName);}));
activateDashboardModule("overview");
async function loadDashboardSummaryCounts(){
  if(!ownerDashboard||currentDashboardRole!=="owner")return;
  const counts={
    countries:["countries","id"],locations:["locations","id"],
    service_types:["service_types","id"],device_types:["device_types","id"],
    services:["services","id"],products:["products","id"],workshops:["workshops","id"],
    technicians:["technicians","id"],contacts:["contacts","id"],users:["Users","id"],
    roles:["Roles","id"],permission:["permissions","id"]
  };
  await Promise.all(Object.entries(counts).map(async([key,[table,column]])=>{
    const node=document.querySelector('[data-dashboard-count="'+key+'"]');
    if(!node)return;
    const {count,error}=await supabase.from(table).select(column,{count:"exact",head:true});
    node.textContent=error?"—":String(count??0);
    if(error)node.setAttribute("aria-label","Count unavailable");
  }));
}
void loadDashboardSummaryCounts();

dashboardTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateDashboardModule(tab.dataset.dashboardTab));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? dashboardTabs.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + dashboardTabs.length) % dashboardTabs.length;
    activateDashboardModule(dashboardTabs[nextIndex].dataset.dashboardTab, true);
  });
});




// Initialize extended Owner-only modules after core dashboard handlers.
if(ownerDashboard&&currentDashboardRole==="owner")initExtendedDashboard(supabase,currentDashboardRole);

// Load only published records for the five public homepage sections.
window.__applyPublicSiteSettings=applyPublicSiteSettings;
void applyPublicSiteSettings();
  void loadHomeCatalog();
}
