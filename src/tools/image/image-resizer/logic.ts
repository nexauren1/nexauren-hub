import { transformImage } from "../shared/canvas";
export function resizeImage(file:File, width:number, height:number, format:string, quality:number) {
  return transformImage(file,{width,height,format,quality,mode:"resize"});
}