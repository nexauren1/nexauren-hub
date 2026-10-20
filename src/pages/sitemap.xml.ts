import {categories,tools} from "../lib/catalog";
export async function GET({site}:{site:URL}) {
 const paths=["/","/tools/","/apps/","/about/","/contact/","/faq/","/privacy/","/terms/","/cookies/","/disclaimer/",...categories.map(c=>`/tools/${c.slug}/`),...tools.map(t=>`/tools/${t.category}/${t.slug}/`)];
 const body=paths.map(path=>`<url><loc>${new URL(path,site).toString()}</loc></url>`).join("");
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`,{headers:{"Content-Type":"application/xml; charset=utf-8"}});
}