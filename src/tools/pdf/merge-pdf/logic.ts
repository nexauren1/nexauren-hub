import { PDFDocument } from "pdf-lib";
export async function mergePdfs(files:File[]) {
 if(files.length<2) throw new Error("Choose at least two PDF files to merge.");
 const merged=await PDFDocument.create();
 for(const file of files){
  if(file.size>100*1024*1024) throw new Error(`${file.name} is larger than the 100 MB per-file safety limit.`);
  const source=await PDFDocument.load(await file.arrayBuffer());
  const pages=await merged.copyPages(source,source.getPageIndices());
  pages.forEach(page=>merged.addPage(page));
 }
 return new Blob([await merged.save()],{type:"application/pdf"});
}