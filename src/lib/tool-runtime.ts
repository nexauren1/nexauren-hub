import { resizeImage } from "../tools/image/image-resizer/logic";
import { compressImage } from "../tools/image/image-compressor/logic";
import { convertImage } from "../tools/image/image-converter/logic";
import { cropImage } from "../tools/image/image-cropper/logic";
import { rotateImage } from "../tools/image/image-rotator/logic";
import { analyseText } from "../tools/text/word-counter/logic";
import { convertCase } from "../tools/text/case-converter/logic";
import { deduplicateLines } from "../tools/text/remove-duplicate-lines/logic";
import { formatJson } from "../tools/text/json-formatter/logic";
import { compareText } from "../tools/text/text-diff/logic";
import { mergePdfs } from "../tools/pdf/merge-pdf/logic";
import { extractPdfPages, removePdfPages } from "../tools/pdf/extract-pdf-pages/logic";
import { rotatePdfPages } from "../tools/pdf/rotate-pdf-pages/logic";
import { imagesToPdf } from "../tools/pdf/images-to-pdf/logic";
import { inspectPdf } from "../tools/pdf/inspect-pdf/logic";
import { trimAudio } from "../tools/audio/audio-trimmer/logic";
import { convertAudioToWav } from "../tools/audio/audio-to-wav/logic";
import { joinAudioBuffers } from "../tools/audio/audio-joiner/logic";
import { changeAudioSpeed } from "../tools/audio/audio-speed-changer/logic";
import { inspectAudio } from "../tools/audio/audio-inspector/logic";

type AudioContextConstructor = typeof AudioContext & { new(options?:AudioContextOptions): AudioContext };
async function decodeAudio(file:File):Promise<AudioBuffer>{
 if(file.size>60*1024*1024)throw new Error("This browser tool is limited to 60 MB per audio source to reduce memory failures.");
 const Ctor=(window.AudioContext||((window as unknown as {webkitAudioContext?:AudioContextConstructor}).webkitAudioContext)) as AudioContextConstructor|undefined;
 if(!Ctor)throw new Error("Web Audio is not supported by this browser.");
 const ctx=new Ctor();
 try{return await ctx.decodeAudioData(await file.arrayBuffer());}finally{await ctx.close().catch(()=>{});}
}
export function mountTool(root:HTMLElement){
 const id=root.dataset.toolId||"", mode=root.dataset.mode||id;
 const fileInput=root.querySelector<HTMLInputElement>("[data-files]");
 const output=root.querySelector<HTMLElement>("[data-output]");
 const message=root.querySelector<HTMLElement>("[data-message]");
 const button=root.querySelector<HTMLButtonElement>("[data-run]");
 const allFiles=()=>Array.from(fileInput?.files||[]);
 const status=(text:string,bad=false)=>{if(message){message.textContent=text;message.classList.toggle("is-error",bad);} };
 const makeDownload=(blob:Blob,name:string,detail:string,previewImage=false)=>{
  if(!output)return;
  output.replaceChildren();
  const card=document.createElement("div");card.className="result-ready-card";
  const statusLine=document.createElement("strong");statusLine.className="result-success";statusLine.textContent="✓ Result ready";
  const detailLine=document.createElement("p");detailLine.textContent=detail;
  const link=document.createElement("a");link.className="button button-primary";link.href=URL.createObjectURL(blob);link.download=name;link.textContent="Download result ↓";
  card.append(statusLine,detailLine,link);
  if(previewImage&&blob.type.startsWith("image/")){const img=document.createElement("img");img.src=URL.createObjectURL(blob);img.alt="Processed image preview";img.className="result-image-preview";card.prepend(img);}
  output.replaceChildren(card);
 };
 const showDetails=(entries:[string,string][])=>{if(!output)return;const dl=document.createElement("dl");dl.className="inspection-details";for(const [label,value] of entries){const row=document.createElement("div"),dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=label;dd.textContent=value;row.append(dt,dd);dl.append(row);}output.replaceChildren(dl);};
 const setBusy=(value:boolean,label:string)=>{if(button){button.disabled=value;button.textContent=value?"Working…":label;}};
 const setSelectedList=(selector:string,files:File[],countSelector="[data-list-count]")=>{
  const list=root.querySelector<HTMLElement>(selector),count=root.querySelector<HTMLElement>(countSelector);
  if(count)count.textContent=files.length+(files.length===1?(mode==="audio-joiner"?" clip":" document"):(mode==="audio-joiner"?" clips":" documents"));
  if(!list)return;list.replaceChildren();
  if(!files.length){const blank=document.createElement("div");blank.className="queue-empty";blank.textContent="No files selected yet.";list.append(blank);return;}
  files.forEach((file,index)=>{const row=document.createElement("div");row.className="selected-file-row";const num=document.createElement("span");num.className="file-order";num.textContent=String(index+1).padStart(2,"0");const detail=document.createElement("span");detail.className="selected-file-detail";const name=document.createElement("strong");name.textContent=file.name;const size=document.createElement("small");size.textContent=(file.size/1024).toFixed(1)+" KB";detail.append(name,size);const type=document.createElement("span");type.className="selected-file-type";type.textContent=file.type.split("/")[1]?.toUpperCase()||"FILE";row.append(num,detail,type);list.append(row);});
 };
 const catchError=(e:unknown)=>status(e instanceof Error?e.message:"The operation failed. Check the input and try again.",true);

 if(mode==="image-resizer"||mode==="image-compressor"||mode==="image-converter"||mode==="image-cropper"||mode==="image-rotator"){
  const quality=root.querySelector<HTMLInputElement>("[data-quality]");
  const qValue=root.querySelector<HTMLElement>("[data-quality-value]");
  const width=root.querySelector<HTMLInputElement>("[data-width]");
  const height=root.querySelector<HTMLInputElement>("[data-height]");
  const lock=root.querySelector<HTMLInputElement>("[data-lock]");
  const x=root.querySelector<HTMLInputElement>("[data-crop-x]"),y=root.querySelector<HTMLInputElement>("[data-crop-y]"),cw=root.querySelector<HTMLInputElement>("[data-crop-width]"),ch=root.querySelector<HTMLInputElement>("[data-crop-height]");
  const preview=root.querySelector<HTMLImageElement>("[data-image-preview]");
  const empty=root.querySelector<HTMLElement>(".crop-empty, .rotation-empty");
  const srcStatus=root.querySelector<HTMLElement>("[data-crop-source]");
  const degreeLabel=root.querySelector<HTMLElement>("[data-angle-label]");
  let ratio=1,dimensionWidth=0,dimensionHeight=0,angle=90;
  quality?.addEventListener("input",()=>{if(qValue)qValue.textContent=quality.value+"%";});
  root.querySelectorAll<HTMLButtonElement>("[data-preset]").forEach(p=>p.addEventListener("click",()=>{const [w,h]=String(p.dataset.preset).split("x").map(Number);if(width)width.value=String(w);if(height)height.value=String(h);root.querySelectorAll("[data-preset]").forEach(el=>el.classList.toggle("is-selected",el===p));}));
  root.querySelectorAll<HTMLButtonElement>("[data-crop-ratio]").forEach(p=>p.addEventListener("click",()=>{
   root.querySelectorAll("[data-crop-ratio]").forEach(el=>el.classList.toggle("is-selected",el===p));
   const ratioValue=p.dataset.cropRatio||"free";
   if(ratioValue==="free")return;
   if(!dimensionWidth||!dimensionHeight){status("Choose an image before selecting a crop ratio.",true);return;}
   const [rw,rh]=ratioValue.split(":").map(Number),targetRatio=rw/rh;
   let cropWidth=dimensionWidth,cropHeight=Math.round(cropWidth/targetRatio);
   if(cropHeight>dimensionHeight){cropHeight=dimensionHeight;cropWidth=Math.round(cropHeight*targetRatio);}
   if(cw)cw.value=String(cropWidth);if(ch)ch.value=String(cropHeight);
   if(x)x.value=String(Math.floor((dimensionWidth-cropWidth)/2));if(y)y.value=String(Math.floor((dimensionHeight-cropHeight)/2));
   status("Crop ratio set to "+ratioValue+". Review the crop dimensions before exporting.");
  }));
  root.querySelectorAll<HTMLInputElement>("[data-format-option]").forEach(el=>el.addEventListener("change",()=>{const sel=root.querySelector<HTMLSelectElement>("[data-format]");if(sel)sel.value=el.value;}));
  root.querySelectorAll<HTMLButtonElement>("[data-angle]").forEach(p=>p.addEventListener("click",()=>{angle=Number(p.dataset.angle);root.querySelectorAll("[data-angle]").forEach(el=>el.classList.toggle("is-selected",el===p));if(degreeLabel)degreeLabel.textContent=angle+"° "+(angle===180?"rotation":angle===90?"clockwise":"counter-clockwise");}));
  fileInput?.addEventListener("change",async()=>{
   const file=allFiles()[0];if(!file)return;
   try{const image=await createImageBitmap(file);dimensionWidth=image.width;dimensionHeight=image.height;ratio=image.width/image.height;
    if(width){width.value=String(image.width);}if(height){height.value=String(image.height);}
    if(cw)cw.value=String(image.width);if(ch)ch.value=String(image.height);
    if(srcStatus)srcStatus.textContent=image.width+" × "+image.height+" px · "+file.name;
    if(preview){preview.src=URL.createObjectURL(file);preview.hidden=false;}if(empty)empty.hidden=true;
    image.close();status("Source image ready: "+dimensionWidth+" × "+dimensionHeight+" pixels.");
   }catch(e){catchError(e);}
  });
  width?.addEventListener("input",()=>{if(lock?.checked&&height&&Number(width.value)>0)height.value=String(Math.max(1,Math.round(Number(width.value)/ratio)));});
  height?.addEventListener("input",()=>{if(lock?.checked&&width&&Number(height.value)>0)width.value=String(Math.max(1,Math.round(Number(height.value)*ratio)));});
  button?.addEventListener("click",async()=>{
   const file=allFiles()[0];if(!file){status("Choose an image first.",true);return;}
   setBusy(true,"Processing image…");
   try{
    const format=root.querySelector<HTMLSelectElement>("[data-format]")?.value||"image/webp",q=Number(quality?.value||90);
    let blob:Blob,widthOut=dimensionWidth,heightOut=dimensionHeight;
    if(mode==="image-resizer"){const r=await resizeImage(file,Number(width?.value),Number(height?.value),format,q);blob=r.blob;widthOut=r.width;heightOut=r.height;}
    else if(mode==="image-compressor"){const r=await compressImage(file,format,q);blob=r.blob;widthOut=r.width;heightOut=r.height;}
    else if(mode==="image-converter"){const r=await convertImage(file,format,q);blob=r.blob;widthOut=r.width;heightOut=r.height;}
    else if(mode==="image-cropper"){blob=await cropImage(file,Number(x?.value),Number(y?.value),Number(cw?.value),Number(ch?.value),format,q);widthOut=Number(cw?.value);heightOut=Number(ch?.value);}
    else{const r=await rotateImage(file,angle,format,q);blob=r.blob;widthOut=r.width;heightOut=r.height;}
    const ext=format==="image/jpeg"?"jpg":format==="image/png"?"png":"webp";
    const reduction=Math.round((1-blob.size/file.size)*100);
    makeDownload(blob,file.name.replace(/\.[^.]+$/u,"")+"-nexauren."+ext,widthOut+" × "+heightOut+" px · Original "+file.size.toLocaleString()+" bytes · Output "+blob.size.toLocaleString()+" bytes"+(mode==="image-compressor"?" · "+reduction+"% size change":""),true);
   }catch(e){catchError(e);}
   finally{setBusy(false,mode==="image-resizer"?"Resize image →":mode==="image-compressor"?"Compress image →":mode==="image-converter"?"Convert format →":mode==="image-cropper"?"Crop selection →":"Rotate and export →");}
  });
 }

 if(mode==="merge-pdf"||mode==="extract-pdf-pages"||mode==="rotate-pdf-pages"||mode==="images-to-pdf"||mode==="inspect-pdf"){
  fileInput?.addEventListener("change",()=>{const files=allFiles();if(mode==="merge-pdf"||mode==="audio-joiner")setSelectedList("[data-selected-list]",files);if(mode==="images-to-pdf"){const count=root.querySelector<HTMLElement>("[data-list-count]");if(count)count.textContent=files.length+" picture"+(files.length===1?"":"s")+" selected";}if(mode==="inspect-pdf"&&files[0])status("Selected "+files[0].name+" · "+(files[0].size/1024).toFixed(1)+" KB.");});
  root.querySelectorAll<HTMLButtonElement>("[data-pdf-angle]").forEach(p=>p.addEventListener("click",()=>{root.querySelectorAll("[data-pdf-angle]").forEach(el=>el.classList.toggle("is-selected",el===p));}));
  const pageActionInputs=Array.from(root.querySelectorAll<HTMLInputElement>("[data-page-action]"));
  const pageActionButtonLabel=()=>root.querySelector<HTMLButtonElement>("[data-run]")?.textContent;
  const updatePageAction=()=>{
   const action=pageActionInputs.find(input=>input.checked)?.value||"extract";
   if(button)button.textContent=action==="remove"?"Remove selected pages →":"Extract selected pages →";
  };
  pageActionInputs.forEach(input=>input.addEventListener("change",updatePageAction));
  if(mode==="extract-pdf-pages")updatePageAction();
  button?.addEventListener("click",async()=>{
   const files=allFiles();if(!files.length){status(mode==="images-to-pdf"?"Choose at least one image first.":"Choose a source file first.",true);return;}
   setBusy(true,"Processing…");
   try{
    if(mode==="merge-pdf"){const blob=await mergePdfs(files);makeDownload(blob,"merged-document.pdf","Combined "+files.length+" PDF files · "+(blob.size/1024).toFixed(1)+" KB.");}
    if(mode==="extract-pdf-pages"){
     const range=root.querySelector<HTMLInputElement>("[data-pages]")?.value||"";
     const action=root.querySelector<HTMLInputElement>("[data-page-action]:checked")?.value||"extract";
     if(action==="remove"){
      const blob=await removePdfPages(files[0],range);
      makeDownload(blob,"pages-removed.pdf","A new PDF without the selected pages · "+(blob.size/1024).toFixed(1)+" KB.");
     }else{
      const blob=await extractPdfPages(files[0],range);
      makeDownload(blob,"extracted-pages.pdf","Selected pages · "+(blob.size/1024).toFixed(1)+" KB.");
     }
    }
    if(mode==="rotate-pdf-pages"){const angle=Number(root.querySelector<HTMLButtonElement>("[data-pdf-angle].is-selected")?.dataset.pdfAngle||90),range=root.querySelector<HTMLInputElement>("[data-pages]")?.value||"";const blob=await rotatePdfPages(files[0],range,angle);makeDownload(blob,"rotated-pages.pdf","Rotation applied: "+angle+"° · "+(range.trim()?"Selected pages":"All pages")+".");}
    if(mode==="images-to-pdf"){const size=root.querySelector<HTMLInputElement>("[data-page-size]:checked")?.value||"a4";const blob=await imagesToPdf(files,size);makeDownload(blob,"images-document.pdf",files.length+" images converted to PDF · "+(blob.size/1024).toFixed(1)+" KB.");}
    if(mode==="inspect-pdf"){if(files[0].size>100*1024*1024)throw new Error("Choose a PDF under 100 MB.");const data=await inspectPdf(files[0]);showDetails([["File",data.name],["File size",(data.size/1024).toFixed(1)+" KB"],["Pages",String(data.pages)],["Title",data.title],["Author",data.author],["Subject",data.subject],["Creator",data.creator],["Producer",data.producer],["Created",data.created],["Modified",data.modified]]);}
   }catch(e){catchError(e);}
   finally{setBusy(false,mode==="merge-pdf"?"Merge PDF files →":mode==="extract-pdf-pages"?"Extract selected pages →":mode==="rotate-pdf-pages"?"Rotate PDF pages →":mode==="images-to-pdf"?"Create PDF from images →":"Inspect document →");}
  });
 }

 if(mode==="word-counter"){
  const input=root.querySelector<HTMLTextAreaElement>("[data-input-text]");
  const targets:Record<string,string>={words:"[data-words]",characters:"[data-characters]",noSpaces:"[data-no-spaces]",sentences:"[data-sentences]",paragraphs:"[data-paragraphs]"};
  const update=()=>{const result=analyseText(input?.value||"");for(const [key,selector] of Object.entries(targets)){const el=root.querySelector<HTMLElement>(selector);if(el)el.textContent=String(result[key as keyof typeof result]);}};
  input?.addEventListener("input",update);update();
  root.querySelector("[data-clear]")?.addEventListener("click",()=>{if(input)input.value="";update();input?.focus();});
  root.querySelector("[data-copy-input]")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(input?.value||"");status("Text copied.");}catch{status("Clipboard access was denied.",true);}});
 }
 if(mode==="case-converter"){
  root.querySelectorAll<HTMLButtonElement>("[data-case]").forEach(p=>p.addEventListener("click",()=>{const input=root.querySelector<HTMLTextAreaElement>("[data-input-text]"),result=root.querySelector<HTMLTextAreaElement>("[data-result-text]");if(result)result.value=convertCase(input?.value||"",p.dataset.case as "upper"|"lower"|"title"|"sentence");status("Text converted. Review proper names and abbreviations.");}));
 }
 if(mode==="remove-duplicate-lines"){
  button?.addEventListener("click",()=>{const input=root.querySelector<HTMLTextAreaElement>("[data-input-text]"),result=root.querySelector<HTMLTextAreaElement>("[data-result-text]");const value=input?.value||"";const res=deduplicateLines(value,!!root.querySelector<HTMLInputElement>("[data-case-sensitive]")?.checked,!!root.querySelector<HTMLInputElement>("[data-trim-lines]")?.checked);if(result)result.value=res.text;status("Removed "+res.removed+" duplicate lines from "+res.total+" input lines.");});
 }
 if(mode==="json-formatter"){
  root.querySelectorAll<HTMLButtonElement>("[data-json-action]").forEach(p=>p.addEventListener("click",()=>{const input=root.querySelector<HTMLTextAreaElement>("[data-input-text]"),result=root.querySelector<HTMLTextAreaElement>("[data-result-text]");try{if(!input||!result)throw new Error("Editor is unavailable.");result.value=formatJson(input.value,p.dataset.jsonAction==="minify");status("Valid JSON · "+(p.dataset.jsonAction==="minify"?"minified":"formatted")+" successfully.");}catch(e){catchError(e);}}));
 }
 if(mode==="text-diff"){
  let report="";
  button?.addEventListener("click",()=>{try{const a=root.querySelector<HTMLTextAreaElement>("[data-diff-a]")?.value||"",b=root.querySelector<HTMLTextAreaElement>("[data-diff-b]")?.value||"",result=compareText(a,b),out=root.querySelector<HTMLElement>("[data-diff-output]");report=result.rows.map(row=>(row.kind==="added"?"+ ":row.kind==="removed"?"− ":"  ")+row.text).join("\n");if(out){out.replaceChildren();for(const row of result.rows){const line=document.createElement("div");line.className="diff-line diff-"+row.kind;const mark=document.createElement("span");mark.className="diff-line-mark";mark.textContent=row.kind==="added"?"+":row.kind==="removed"?"−":" ";const text=document.createElement("code");text.textContent=row.text||" ";line.append(mark,text);out.append(line);}}for(const [selector,value] of [["[data-diff-added]",result.added],["[data-diff-removed]",result.removed],["[data-diff-unchanged]",result.unchanged]] as [string,number][]){const el=root.querySelector<HTMLElement>(selector);if(el)el.textContent=String(value);}status("Comparison complete.");}catch(e){catchError(e);}});
  root.querySelector("[data-copy-diff]")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(report);status("Difference report copied.");}catch{status("Clipboard access was denied.",true);}});
 }
 if(mode==="audio-trimmer"||mode==="audio-to-wav"||mode==="audio-joiner"||mode==="audio-speed-changer"||mode==="audio-inspector"){
  let decoded:AudioBuffer|null=null;
  const preview=root.querySelector<HTMLAudioElement>("[data-preview]");
  const info=root.querySelector<HTMLElement>("[data-audio-info]");
  const formatTime=(seconds:number)=>{const m=Math.floor(seconds/60),s=Math.floor(seconds%60);return m+":"+String(s).padStart(2,"0");};
  const speed=root.querySelector<HTMLInputElement>("[data-speed]");
  const updateSpeed=()=>{const v=Number(speed?.value||1),val=root.querySelector<HTMLElement>("[data-speed-value]"),label=root.querySelector<HTMLElement>("[data-speed-label]"),duration=root.querySelector<HTMLElement>("[data-speed-duration]");if(val)val.textContent=v.toFixed(1)+"×";if(label)label.textContent=v===1?"Normal speed":v<1?"Slower · lower pitch":"Faster · higher pitch";if(duration)duration.textContent=decoded?formatTime(decoded.duration/v):"Load audio first";};
  speed?.addEventListener("input",updateSpeed);
  fileInput?.addEventListener("change",async()=>{
   const files=allFiles();if(mode==="audio-joiner"){setSelectedList("[data-selected-list]",files);status(files.length+" clips selected. The sequence follows the file picker.");if(files.length<2)return;decoded=null;return;}
   const file=files[0];if(!file)return;status("Decoding audio…");
   try{decoded=await decodeAudio(file);if(preview){preview.src=URL.createObjectURL(file);preview.hidden=false;}if(info){info.hidden=false;info.textContent=formatTime(decoded.duration)+" · "+decoded.sampleRate.toLocaleString()+" Hz · "+decoded.numberOfChannels+" channel(s)";}const end=root.querySelector<HTMLInputElement>("[data-end]");if(end)end.value=decoded.duration.toFixed(2);const start=root.querySelector<HTMLInputElement>("[data-start]");if(start&&Number(start.value)>=decoded.duration)start.value="0";updateSpeed();
    if(mode==="audio-inspector"){const data=inspectAudio(decoded);const values:[string,string][]=[["[data-inspect-duration]",formatTime(data.duration)],["[data-inspect-rate]",data.sampleRate.toLocaleString()+" Hz"],["[data-inspect-channels]",String(data.channels)],["[data-inspect-peak]",(data.peak*100).toFixed(1)+"%"],["[data-inspect-rms]",(data.rms*100).toFixed(1)+"%"],["[data-inspect-frames]",data.frames.toLocaleString()]];values.forEach(([selector,value])=>{const el=root.querySelector<HTMLElement>(selector);if(el)el.textContent=value;});const hint=root.querySelector<HTMLElement>("[data-inspect-hint]");if(hint)hint.textContent="Peak "+(data.peak*100).toFixed(1)+"% · RMS "+(data.rms*100).toFixed(1)+"% · Levels are calculated from decoded samples.";const canvas=root.querySelector<HTMLCanvasElement>("[data-waveform]");if(canvas){const ctx=canvas.getContext("2d");if(ctx){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#fff1f2";ctx.fillRect(0,0,canvas.width,canvas.height);const channel=decoded.getChannelData(0),bars=canvas.width,step=Math.max(1,Math.floor(channel.length/bars));ctx.strokeStyle="#d92344";ctx.lineWidth=1.4;ctx.beginPath();for(let i=0;i<bars;i++){let peak=0;for(let j=0;j<step&&i*step+j<channel.length;j++)peak=Math.max(peak,Math.abs(channel[i*step+j]));const y=canvas.height/2,amp=Math.max(1,peak*(canvas.height*.44));ctx.moveTo(i+.5,y-amp);ctx.lineTo(i+.5,y+amp);}ctx.stroke();}}}
    status("Audio ready to inspect or export.");
   }catch(e){decoded=null;catchError(e);}
  });
  button?.addEventListener("click",async()=>{
   try{
    if(mode==="audio-joiner"){
      const files=allFiles();if(files.length<2)throw new Error("Choose at least two audio clips.");setBusy(true,"Decoding clips…");const buffers:AudioBuffer[]=[];for(const f of files)buffers.push(await decodeAudio(f));const blob=joinAudioBuffers(buffers);makeDownload(blob,"joined-audio.wav",files.length+" clips joined in selected order · "+(blob.size/1024).toFixed(1)+" KB.");return;
    }
    if(!decoded)throw new Error("Choose a supported audio file first.");
    if(mode==="audio-trimmer"){const blob=trimAudio(decoded,Number(root.querySelector<HTMLInputElement>("[data-start]")?.value||0),Number(root.querySelector<HTMLInputElement>("[data-end]")?.value||0));makeDownload(blob,"trimmed-audio.wav","Selected section · "+(blob.size/1024).toFixed(1)+" KB.");}
    if(mode==="audio-to-wav"){const blob=convertAudioToWav(decoded);makeDownload(blob,"converted-audio.wav","PCM WAV · "+formatTime(decoded.duration)+" · "+(blob.size/1024).toFixed(1)+" KB.");}
    if(mode==="audio-speed-changer"){const v=Number(speed?.value||1),blob=changeAudioSpeed(decoded,v);makeDownload(blob,"audio-"+v.toFixed(1)+"x.wav",v.toFixed(1)+"× speed · Estimated duration "+formatTime(decoded.duration/v)+".");}
   }catch(e){catchError(e);}finally{setBusy(false,mode==="audio-trimmer"?"Cut selected segment →":mode==="audio-to-wav"?"Convert audio → WAV":mode==="audio-joiner"?"Join audio clips →":"Export at this speed →");}
  });
 }
 root.querySelector<HTMLButtonElement>("[data-copy]")?.addEventListener("click",async()=>{const value=root.querySelector<HTMLTextAreaElement>("[data-result-text]")?.value||"";if(!value){status("There is no result to copy yet.",true);return;}try{await navigator.clipboard.writeText(value);status("Copied to clipboard.");}catch{status("Clipboard access was denied.",true);}});
}