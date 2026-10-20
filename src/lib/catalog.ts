import imageCategory from "../data/category-image.json";
import pdfCategory from "../data/category-pdf.json";
import textCategory from "../data/category-text.json";
import audioCategory from "../data/category-audio.json";
import imageTools from "../data/data-image.json";
import pdfTools from "../data/data-pdf.json";
import textTools from "../data/data-text.json";
import audioTools from "../data/data-audio.json";

export type Category = { slug:string; name:string; label:string; icon:string; eyebrow:string; title:string; description:string; seoTitle:string; seoDescription:string; intro:string; benefits:string[] };
export type Tool = { id:string; slug:string; category:string; name:string; icon:string; tagline:string; description:string; seoTitle:string; seoDescription:string; keywords:string[]; features:string[]; steps:string[]; mode:string };
export const categories = [imageCategory,pdfCategory,textCategory,audioCategory] as Category[];
export const tools = [...imageTools,...pdfTools,...textTools,...audioTools] as Tool[];
const catSlugs = new Set(categories.map(c=>c.slug)), ids = new Set<string>(), routes = new Set<string>();
for (const t of tools) {
  if (!catSlugs.has(t.category)) throw new Error(`Unknown category ${t.category} on ${t.id}`);
  if (ids.has(t.id)) throw new Error(`Duplicate tool id ${t.id}`);
  const route = `${t.category}/${t.slug}`;
  if (routes.has(route)) throw new Error(`Duplicate tool route ${route}`);
  if (!t.name || !t.description || !t.seoTitle || !t.seoDescription || t.seoDescription.length < 60) throw new Error(`Incomplete SEO metadata for ${t.id}`);
  ids.add(t.id); routes.add(route);
}
export const getToolsByCategory = (slug:string) => tools.filter(t=>t.category===slug);
export const getCategory = (slug:string) => categories.find(c=>c.slug===slug);
export const getTool = (category:string, slug:string) => tools.find(t=>t.category===category && t.slug===slug);
