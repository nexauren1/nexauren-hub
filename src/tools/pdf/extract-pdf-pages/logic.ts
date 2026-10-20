import { PDFDocument } from "pdf-lib";
export async function extractPdfPages(file:File,range:string) {
 if(!file) throw new Error("Choose a PDF file.");
 const source=await PDFDocument.load(await file.arrayBuffer());
 const total=source.getPageCount(), indexes:number[]=[];
 const tokens=range.split(",").map(s=>s.trim()).filter(Boolean);
 if(!tokens.length) throw new Error("Enter page numbers, for example 1, 3-5, 8.");
 for(const token of tokens){
  const match=token.match(/^(\d+)(?:\s*-\s*(\d+))?$/u);
  if(!match) throw new Error(`Invalid page range: ${token}`);
  const first=Number(match[1]), last=Number(match[2]||match[1]);
  if(first<1||last<first||last>total) throw new Error(`Pages must be between 1 and ${total}; check "${token}".`);
  for(let n=first;n<=last;n++) if(!indexes.includes(n-1)) indexes.push(n-1);
 }
 const output=await PDFDocument.create();
 (await output.copyPages(source,indexes)).forEach(p=>output.addPage(p));
 return new Blob([await output.save()],{type:"application/pdf"});
}