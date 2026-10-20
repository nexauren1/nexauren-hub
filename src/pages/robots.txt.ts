export async function GET({site}:{site:URL}) {
 const body=`User-agent: *\nAllow: /\nDisallow: /login/\nDisallow: /register/\nDisallow: /account/\nDisallow: /dashboard/\nDisallow: /upgrade/\nSitemap: ${new URL("/sitemap.xml",site).toString()}\n`;
 return new Response(body,{headers:{"Content-Type":"text/plain; charset=utf-8"}});
}