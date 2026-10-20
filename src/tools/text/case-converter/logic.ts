export type CaseMode="upper"|"lower"|"title"|"sentence";
export function convertCase(value:string,mode:CaseMode):string {
 if(mode==="upper") return value.toLocaleUpperCase();
 if(mode==="lower") return value.toLocaleLowerCase();
 if(mode==="title") return value.toLocaleLowerCase().replace(/(^|[\s\-])([\p{L}\p{N}])/gu,(_m,prefix,letter)=>prefix+letter.toLocaleUpperCase());
 return value.toLocaleLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu,m=>m.toLocaleUpperCase());
}