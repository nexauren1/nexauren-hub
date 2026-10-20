import { defineConfig } from "astro/config";
export default defineConfig({
  output: "static",
  site: process.env.SITE_URL || "https://nexauren-hub.pages.dev",
  trailingSlash: "always"
});