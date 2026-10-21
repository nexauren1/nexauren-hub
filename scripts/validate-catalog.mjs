import fs from "node:fs";
import path from "node:path";
const root=process.cwd(), categories=["image","pdf","text","audio"], ids=new Set(), routes=new Set();
let total=0;
for(const category of categories){
 const dataPath=path.join(root,"src/data",`data-${category}.json`), catPath=path.join(root,"src/data",`category-${category}.json`);
 if(!fs.existsSync(dataPath)||!fs.existsSync(catPath))throw new Error(`Missing category files for ${category}`);
 const tools=JSON.parse(fs.readFileSync(dataPath,"utf8")), meta=JSON.parse(fs.readFileSync(catPath,"utf8"));
 if(meta.slug!==category)throw new Error(`Category metadata mismatch: ${category}`);
 if(tools.length!==5)throw new Error(`Expected 5 ${category} tools, found ${tools.length}`);
 for(const t of tools){
  if(t.category!==category||!t.id||!t.slug||!t.name||!t.tagline||!t.description||!t.seoTitle||!t.seoDescription||t.seoDescription.length<60)throw new Error(`Missing tool/SEO fields or wrong category: ${t.id||"unknown"}`);
  if(ids.has(t.id))throw new Error(`Duplicate tool id: ${t.id}`);
  const route=`/tools/${category}/${t.slug}/`;if(routes.has(route))throw new Error(`Duplicate route: ${route}`);
  const dir=path.join(root,"src/tools",category,t.slug);
  for(const file of ["logic.ts","metadata.json"])if(!fs.existsSync(path.join(dir,file)))throw new Error(`Missing ${file} for ${t.id}`);
  const tm=JSON.parse(fs.readFileSync(path.join(dir,"metadata.json"),"utf8"));
  if(tm.id!==t.id||tm.category!==category||tm.slug!==t.slug||tm.mode!==t.mode)throw new Error(`Registry/metadata mismatch: ${t.id}`);
  ids.add(t.id);routes.add(route);total++;
 }
}
console.log(`Catalog valid: ${total} tools; five in each category, with unique routes and SEO metadata.`);
