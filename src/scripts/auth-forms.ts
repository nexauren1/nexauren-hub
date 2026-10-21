import {getSupabaseClient} from "../lib/supabase-client";
function msg(root:ParentNode,text:string,error=false){const el=root.querySelector<HTMLElement>("[data-auth-message]");if(!el)return;el.hidden=false;el.textContent=text;el.classList.toggle("is-error",error);el.classList.toggle("is-success",!error);}
function client(root:ParentNode){try{return getSupabaseClient();}catch(e){msg(root,e instanceof Error?e.message:"Account services are not configured.",true);return null;}}
function busy(b:HTMLButtonElement|null,on:boolean,label:string){if(!b)return;if(!b.dataset.originalLabel)b.dataset.originalLabel=b.textContent||"Continue";b.disabled=on;b.textContent=on?label:b.dataset.originalLabel;}
const callback=()=>new URL("/auth/callback/",location.origin).toString();
document.querySelectorAll<HTMLFormElement>("[data-auth-form]").forEach(form=>form.addEventListener("submit",async event=>{
 event.preventDefault();const b=form.querySelector<HTMLButtonElement>('button[type="submit"]'),supabase=client(form);if(!supabase)return;
 const d=new FormData(form),action=form.dataset.authForm||"",email=String(d.get("email")||"").trim(),password=String(d.get("password")||"");
 const label=action==="register"?"Creating account…":action==="login"?"Signing in…":action==="forgot"?"Sending recovery link…":"Updating password…";busy(b,true,label);
 try{
  if(action==="register"){
   if(password.length<8)throw new Error("Use a password with at least 8 characters.");
   const r=await supabase.auth.signUp({email,password,options:{emailRedirectTo:callback(),data:{full_name:String(d.get("full_name")||"").trim()}}});
   if(r.error)throw r.error;
   if(r.data.session){msg(form,"Account created. Opening dashboard…");location.assign("/dashboard/");}
   else msg(form,"Check your inbox for the confirmation email. Confirm your address before logging in.");
  }else if(action==="login"){
   const r=await supabase.auth.signInWithPassword({email,password});if(r.error)throw r.error;location.assign("/dashboard/");
  }else if(action==="forgot"){
   const r=await supabase.auth.resetPasswordForEmail(email,{redirectTo:new URL("/reset-password/",location.origin).toString()});
   if(r.error)throw r.error;msg(form,"If that email is registered, a recovery link will be sent. Check your inbox.");
  }else if(action==="update-password"){
   if(password.length<8)throw new Error("Use a password with at least 8 characters.");
   if(password!==String(d.get("confirm_password")||""))throw new Error("The passwords do not match.");
   const r=await supabase.auth.updateUser({password});if(r.error)throw r.error;await supabase.auth.signOut();msg(form,"Password updated. Please log in with the new password.");setTimeout(()=>location.assign("/login/"),1300);
  }
 }catch(e){msg(form,e instanceof Error?e.message:"The request could not be completed. Please try again.",true);}
 finally{busy(b,false,label);}
}));
document.querySelectorAll<HTMLButtonElement>("[data-google-auth]").forEach(b=>b.addEventListener("click",async()=>{
 const root=b.closest("section")||document,supabase=client(root);if(!supabase)return;busy(b,true,"Connecting to Google…");
 try{const r=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:callback(),queryParams:{prompt:"select_account"}}});if(r.error)throw r.error;}
 catch(e){msg(root,e instanceof Error?e.message:"Google sign-in could not start.",true);busy(b,false,"Continue with Google");}
}));
const cb=document.querySelector<HTMLElement>("[data-auth-callback]");
if(cb)void(async()=>{const s=client(cb);if(!s)return;const p=new URLSearchParams(location.search),err=p.get("error_description")||p.get("error");if(err){msg(cb,err.replace(/\+/gu," "),true);return;}
 try{const code=p.get("code");if(code){const r=await s.auth.exchangeCodeForSession(code);if(r.error)throw r.error;}const r=await s.auth.getSession();if(r.error)throw r.error;if(r.data.session)location.replace("/dashboard/");else msg(cb,"No valid session was found. The link may have expired. Return to login and try again.",true);}
 catch(e){msg(cb,e instanceof Error?e.message:"Sign-in could not be completed.",true);}})();
const reset=document.querySelector<HTMLElement>("[data-password-reset-root]");
if(reset)void(async()=>{const s=client(reset);if(!s)return;const p=new URLSearchParams(location.search),err=p.get("error_description")||p.get("error");if(err){msg(reset,err.replace(/\+/gu," "),true);return;}
 try{const code=p.get("code");if(code){const r=await s.auth.exchangeCodeForSession(code);if(r.error)throw r.error;}const r=await s.auth.getSession();if(r.error)throw r.error;if(!r.data.session)throw new Error("This recovery link is invalid or expired. Request a new one.");const form=reset.querySelector<HTMLElement>("[data-reset-form-wrap]");if(form)form.hidden=false;const loading=reset.querySelector<HTMLElement>("[data-reset-loading]");if(loading)loading.hidden=true;const status=reset.querySelector<HTMLElement>("[data-auth-message]");if(status)status.hidden=true;}
 catch(e){msg(reset,e instanceof Error?e.message:"Could not verify the recovery link.",true);}})();
const dash=document.querySelector<HTMLElement>("[data-auth-dashboard]");
if(dash)void(async()=>{const s=client(dash);if(!s)return;try{const r=await s.auth.getUser();if(r.error)throw r.error;if(!r.data.user){location.replace("/login/");return;}const u=r.data.user,n=dash.querySelector<HTMLElement>("[data-user-name]"),em=dash.querySelector<HTMLElement>("[data-user-email]");if(n)n.textContent=String(u.user_metadata?.full_name||u.email?.split("@")[0]||"there");if(em)em.textContent=u.email||"";dash.querySelectorAll<HTMLElement>("[data-auth-loading]").forEach(x=>x.hidden=true);dash.querySelectorAll<HTMLElement>("[data-auth-loaded]").forEach(x=>x.hidden=false);}
 catch(e){msg(dash,e instanceof Error?e.message:"Could not load the account session.",true);}})();
dash?.querySelector<HTMLButtonElement>("[data-sign-out]")?.addEventListener("click",async()=>{const s=client(dash!);if(!s)return;try{const r=await s.auth.signOut();if(r.error)throw r.error;location.replace("/login/");}catch(e){msg(dash!,e instanceof Error?e.message:"Could not sign out.",true);}});
