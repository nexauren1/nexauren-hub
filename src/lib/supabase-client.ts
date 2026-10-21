import { createClient,type SupabaseClient } from "@supabase/supabase-js";
let singleton:SupabaseClient|null=null;
export function getSupabaseClient():SupabaseClient{
 const url=import.meta.env.PUBLIC_SUPABASE_URL?.trim();
 const key=import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
 if(!url||!key||!url.startsWith("https://"))throw new Error("Account access is not configured yet. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY in the build environment.");
 if(!singleton)singleton=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,flowType:"pkce"}});
 return singleton;
}