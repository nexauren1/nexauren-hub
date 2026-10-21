import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
export default defineConfig({
 output:"static",
 site:process.env.SITE_URL||"https://nexauren-hub.pages.dev",
 trailingSlash:"always",
 integrations:[sitemap({filter:(page)=>{
  const p=new URL(page).pathname;
  return !["/login/","/register/","/account/","/dashboard/","/upgrade/","/forgot-password/","/reset-password/","/auth/callback/"].includes(p);
 }})]
});