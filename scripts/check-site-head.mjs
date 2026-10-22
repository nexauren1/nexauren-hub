import fs from "node:fs";
import path from "node:path";
const dist = path.join(process.cwd(), "dist");
let checked = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (entry.name !== "index.html") continue;
    const html = fs.readFileSync(file, "utf8");
    const relative = path.relative(dist, file);
    const required = [
      ["page title", /<title>[^<]{3,}<\/title>/i],
      ["meta description", /<meta\s+name="description"\s+content="[^"]{30,}"/i],
      ["Open Graph preview image", /<meta\s+property="og:image"\s+content="https?:\/\//i],
      ["X/Twitter preview image", /<meta\s+name="twitter:image"\s+content="https?:\/\//i],
      ["ICO favicon", /<link\s+rel="icon"\s+href="\/favicon\.ico"/i]
    ];
    for (const [label, pattern] of required) {
      if (!pattern.test(html)) throw new Error("Missing " + label + " metadata in " + relative);
    }
    checked++;
  }
}
walk(dist);
if (checked < 35) throw new Error("Expected to check at least 35 generated HTML pages; found " + checked);
console.log("Shared SEO and social metadata verified on " + checked + " generated HTML pages.");
