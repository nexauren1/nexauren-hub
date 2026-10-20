import { transformImage } from "../shared/canvas";
export function compressImage(file:File, format:string, quality:number) {
  return transformImage(file,{format,quality,mode:"compress"});
}