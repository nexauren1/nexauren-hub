export type ImageOptions = { width?:number; height?:number; format:string; quality:number; mode:"resize"|"compress"|"convert"; lockRatio?:boolean };
export async function transformImage(file:File, options:ImageOptions):Promise<{blob:Blob;width:number;height:number}> {
  if (!file.type.startsWith("image/")) throw new Error("Choose a supported image file.");
  const image = await createImageBitmap(file);
  try {
    let width = image.width, height = image.height;
    if (options.mode === "resize") {
      width = Math.round(options.width || width);
      height = Math.round(options.height || height);
      if (width < 1 || height < 1 || width > 12000 || height > 12000) throw new Error("Width and height must be between 1 and 12,000 pixels.");
      if (width * height > 40000000) throw new Error("That output is too large for this tool. Choose smaller dimensions.");
    }
    const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable in this browser.");
    if (options.format === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,width,height); }
    ctx.drawImage(image,0,0,width,height);
    const blob = await new Promise<Blob>((resolve,reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("This browser could not encode the chosen format.")), options.format, Math.min(1,Math.max(.2,options.quality/100))));
    if (blob.type !== options.format && options.format !== "image/png") throw new Error("The selected output format is not supported by this browser. Try JPEG, PNG or WebP.");
    return {blob,width,height};
  } finally { image.close(); }
}