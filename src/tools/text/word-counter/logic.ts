export function analyseText(value:string) {
 const words=value.trim()?value.trim().split(/\s+/u).length:0;
 const sentences=value.trim()?value.split(/[.!?]+/u).filter(s=>s.trim()).length:0;
 const paragraphs=value.split(/\n\s*\n/u).filter(p=>p.trim()).length;
 return {words,characters:value.length,noSpaces:value.replace(/\s/gu,"").length,sentences,paragraphs};
}