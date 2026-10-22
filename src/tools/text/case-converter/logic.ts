export type CaseMode="upper"|"lower"|"title"|"sentence"|"camel"|"snake"|"kebab"|"alternating";

export function convertCase(value:string,mode:CaseMode):string {
 if(mode==="upper") return value.toLocaleUpperCase();
 if(mode==="lower") return value.toLocaleLowerCase();
 if(mode==="title") return value.toLocaleLowerCase().replace(/(^|[\\s\\-])([\\p{L}\\p{N}])/gu,(_m,prefix,letter)=>prefix+letter.toLocaleUpperCase());
 if(mode==="sentence") return value.toLocaleLowerCase().replace(/(^\\s*\\p{L}|[.!?]\\s+\\p{L})/gu,m=>m.toLocaleUpperCase());
 if(mode==="alternating") {
  let position=0;
  return Array.from(value).map(character=>{
   if(!/[\\p{L}\\p{N}]/u.test(character)) return character;
   const result=position%2===0?character.toLocaleLowerCase():character.toLocaleUpperCase();
   position++;
   return result;
  }).join("");
 }
 const words=value.match(/[\\p{L}\\p{N}]+/gu)||[];
 if(mode==="snake") return words.map(word=>word.toLocaleLowerCase()).join("_");
 if(mode==="kebab") return words.map(word=>word.toLocaleLowerCase()).join("-");
 return words.map((word,index)=>index===0?word.toLocaleLowerCase():word.charAt(0).toLocaleUpperCase()+word.slice(1).toLocaleLowerCase()).join("");
}
