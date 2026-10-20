import { transformImage } from "../shared/canvas";
export function convertImage(file:File, format:string, quality:number) {
  return transformImage(file,{format,quality,mode:"convert"});
}