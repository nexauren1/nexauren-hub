import { resizeImage } from "../tools/image/image-resizer/logic";
import { compressImage } from "../tools/image/image-compressor/logic";
import { convertImage } from "../tools/image/image-converter/logic";
import { analyseText } from "../tools/text/word-counter/logic";
import { convertCase } from "../tools/text/case-converter/logic";
import { deduplicateLines } from "../tools/text/remove-duplicate-lines/logic";
import { mergePdfs } from "../tools/pdf/merge-pdf/logic";
import { extractPdfPages } from "../tools/pdf/extract-pdf-pages/logic";
import { trimAudio } from "../tools/audio/audio-trimmer/logic";
import { convertAudioToWav } from "../tools/audio/audio-to-wav/logic";

export function mountTool(root:HTMLElement) {
 const id=root.dataset.toolId||"";
 const fileInput=root.querySelector<HTMLInputElement>("[data-files]");
 const output=root.querySelector<HTMLElement>("[data-output]");
 const message=root.querySelector<HTMLElement>("[data-message]");
 const runButton=root.querySelector<HTMLButtonElement>("[data-run]");
 const updateMessage=(text:string, bad=false)=>{
  if(message){message.textContent=text;message.classList.toggle("is-error",bad);}
  if(output){output.innerHTML="";const p=document.createElement("p");p.textContent=text;output.append(p);}
 };
 const download=(blob:Blob,name:string,detail:string)=>{
  if(!output)return;
  output.replaceChildren();
  const status=document.createElement("div");status.className="result-success";status.textContent="✓ Ready to download";
  const desc=document.createElement("p");desc.textContent=detail;
  const a=document.createElement("a");a.className="button button-primary";a.href=URL.createObjectURL(blob);a.download=name;a.textContent="Download file ↓";
  output.append(status,desc,a);
 };
 const selected=()=>Array.from(fileInput?.files||[]);
 if(id==="word-counter"){
  const input=root.querySelector<HTMLTextAreaElement>("[data-input-text]");
  const fields:Record<string,string>={words:"[data-words]",characters:"[data-characters]",noSpaces:"[data-no-spaces]",sentences:"[data-sentences]",paragraphs:"[data-paragraphs]"};
  const update=()=>{const result=analyseText(input?.value||"");Object.entries(fields).forEach(([key,sel])=>{const el=root.querySelector<HTMLElement>(sel);if(el)el.textContent=String(result[key as keyof typeof result]);});};
  input?.addEventListener("input",update);update();
 }
 if(id==="case-converter"){
  root.querySelectorAll<HTMLButtonElement>("[data-case]").forEach(button=>button.addEventListener("click",()=>{const input=root.querySelector<HTMLTextAreaElement>("[data-input-text]"),result=root.querySelector<HTMLTextAreaElement>("[data-result-text]");if(result)result.value=convertCase(input?.value||"",button.dataset.case as "upper"|"lower"|"title"|"sentence");}));
 }
 if(id==="remove-duplicate-lines"){
  runButton?.addEventListener("click",()=>{const input=root.querySelector<HTMLTextAreaElement>("[data-input-text]"),result=root.querySelector<HTMLTextAreaElement>("[data-result-text]");const res=deduplicateLines(input?.value||"",!!root.querySelector<HTMLInputElement>("[data-case-sensitive]")?.checked,!!root.querySelector<HTMLInputElement>("[data-trim-lines]")?.checked);if(result)result.value=res.text;if(message)message.textContent=`Removed ${res.removed} duplicate line(s) from ${res.total} line(s).`;});
 }
 root.querySelector<HTMLButtonElement>("[data-copy]")?.addEventListener("click",async()=>{const value=root.querySelector<HTMLTextAreaElement>("[data-result-text]")?.value||"";if(!value){updateMessage("There is no result to copy yet.",true);return;}try{await navigator.clipboard.writeText(value);updateMessage("Result copied to clipboard.");}catch{updateMessage("Clipboard access is unavailable. Select the result and copy it manually.",true);}});
 if(id.startsWith("image-")){
  const quality=root.querySelector<HTMLInputElement>("[data-quality]"),qualityValue=root.querySelector<HTMLElement>("[data-quality-value]");
  quality?.addEventListener("input",()=>{if(qualityValue)qualityValue.textContent=quality.value+"%";});
  const width=root.querySelector<HTMLInputElement>("[data-width]"),height=root.querySelector<HTMLInputElement>("[data-height]"),lock=root.querySelector<HTMLInputElement>("[data-lock]");
  let ratio=1;
  fileInput?.addEventListener("change",async()=>{const file=selected()[0];if(!file)return;try{const bitmap=await createImageBitmap(file);ratio=bitmap.width/bitmap.height;if(width)width.value=String(bitmap.width);if(height)height.value=String(bitmap.height);bitmap.close();updateMessage(`Selected ${file.name} (${file.size.toLocaleString()} bytes).`);}catch{updateMessage("This image could not be opened. Try another supported image.",true);}});
  width?.addEventListener("input",()=>{if(lock?.checked&&height&&Number(width.value)>0)height.value=String(Math.max(1,Math.round(Number(width.value)/ratio));});
  height?.addEventListener("input",()=>{if(lock?.checked&&width&&Number(height.value)>0)width.value=String(Math.max(1,Math.round(Number(height.value)*ratio));});
  runButton?.addEventListener("click",async()=>{
   const file=selected()[0];if(!file){updateMessage("Choose an image first.",true);return;}
   runButton.disabled=true;runButton.textContent="Processing…";
   try{
    const format=root.querySelector<HTMLSelectElement>("[data-format]")?.value||"image/webp";
    const q=Number(quality?.value||82),name=file.name.replace(/\.[^.]+$/u,"");
    const result=id==="image-resizer"?await resizeImage(file,Number(width?.value),Number(height?.value),format,q):id==="image-compressor"?await compressImage(file,format,q):await convertImage(file,format,q);
    const ext=format==="image/jpeg"?"jpg":format==="image/png"?"png":"webp";
    download(result.blob,`${name}-nexauren.${ext}`,`${result.width} × ${result.height} px · Original ${file.size.toLocaleString()} bytes · Output ${result.blob.size.toLocaleString()} bytes.`);
   }catch(e){updateMessage(e instanceof Error?e.message:"The image could not be processed.",true);}
   finally{runButton.disabled=false;runButton.innerHTML=(id==="image-resizer"?"Resize image":id==="image-compressor"?"Compress image":"Convert image")+" →";}
  });
 }
 if(id==="merge-pdf"||id==="extract-pdf-pages"){
  runButton?.addEventListener("click",async()=>{
   const files=selected();if(!files.length){updateMessage("Choose a PDF file first.",true);return;}
   runButton.disabled=true;runButton.textContent="Processing PDF…";
   try{
    const blob=id==="merge-pdf"?await mergePdfs(files):await extractPdfPages(files[0],root.querySelector<HTMLInputElement>("[data-pages]")?.value||"");
    download(blob,id==="merge-pdf"?"merged-document.pdf":"extracted-pages.pdf",`Created PDF · ${(blob.size/1024).toFixed(1)} KB · Processed in your browser.`);
   }catch(e){updateMessage(e instanceof Error?e.message:"The PDF could not be processed. Check that it is a valid, unencrypted PDF.",true);}
   finally{runButton.disabled=false;runButton.textContent=id==="merge-pdf"?"Merge PDFs →":"Extract pages →";}
  });
 }
 if(id==="audio-trimmer"||id==="audio-to-wav"){
  let decoded:AudioBuffer|null=null;
  const preview=root.querySelector<HTMLAudioElement>("[data-preview]"),info=root.querySelector<HTMLElement>("[data-audio-info]");
  fileInput?.addEventListener("change",async()=>{
   const file=selected()[0];if(!file)return;
   try{
    const AudioContextClass=window.AudioContext||((window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext);
    if(!AudioContextClass)throw new Error("Web Audio is not supported in this browser.");
    const ctx=new AudioContextClass();decoded=await ctx.decodeAudioData(await file.arrayBuffer());await ctx.close();
    if(preview){preview.src=URL.createObjectURL(file);preview.hidden=false;}
    if(info){info.hidden=false;info.textContent=`${file.name} · ${decoded.duration.toFixed(2)} seconds · ${decoded.sampleRate.toLocaleString()} Hz · ${decoded.numberOfChannels} channel(s)`;}
    const end=root.querySelector<HTMLInputElement>("[data-end]");if(end)end.value=decoded.duration.toFixed(2);
    updateMessage("Audio ready. Preview it before exporting.");
   }catch(e){decoded=null;updateMessage(e instanceof Error?e.message:"This audio format could not be decoded by your browser.",true);}
  });
  runButton?.addEventListener("click",()=>{
   if(!decoded){updateMessage("Choose a supported audio file first.",true);return;}
   try{const blob=id==="audio-trimmer"?trimAudio(decoded,Number(root.querySelector<HTMLInputElement>("[data-start]")?.value||0),Number(root.querySelector<HTMLInputElement>("[data-end]")?.value||0)):convertAudioToWav(decoded);download(blob,id==="audio-trimmer"?"trimmed-audio.wav":"converted-audio.wav",`WAV · ${(blob.size/1024).toFixed(1)} KB · ${id==="audio-trimmer"?"Selected clip":"Full audio"}.`);}
   catch(e){updateMessage(e instanceof Error?e.message:"Audio export failed.",true);}
  });
 }
}