import fs from "node:fs";
import path from "node:path";
const dist=path.join(process.cwd(),"dist");
if(!fs.existsSync(dist))throw new Error("Build output dist/ was not created.");
for(const p of ["index.html","tools/index.html","apps/index.html"])if(!fs.existsSync(path.join(dist,p)))throw new Error(`Missing built page: dist/${p}`);
for(const category of ["image","pdf","text","audio"]){
 const dir=path.join(dist,"tools",category);
 if(!fs.existsSync(dir))throw new Error(`Missing category output: ${category}`);
 const pages=fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.isDirectory()&&fs.existsSync(path.join(dir,e.name,"index.html")));
 if(pages.length!==5)throw new Error(`Expected 5 built ${category} tool pages; found ${pages.length}`);
}
console.log("Build output valid: homepage, app directory and all 20 individual tool pages exist.");
