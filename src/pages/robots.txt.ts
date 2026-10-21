export async function GET({site}:{site:URL}) {
 const body=["User-agent: *","Allow: /","Disallow: /login/","Disallow: /register/","Disallow: /account/","Disallow: /dashboard/","Disallow: /upgrade/","Disallow: /forgot-password/","Disallow: /reset-password/","Disallow: /auth/","Sitemap: "+new URL("/sitemap-index.xml",site).toString(),""].join("\n");
 return new Response(body,{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, max-age=3600"}});
}