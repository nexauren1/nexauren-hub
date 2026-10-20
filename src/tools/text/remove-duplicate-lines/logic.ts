export function deduplicateLines(value:string,caseSensitive:boolean,trim:boolean) {
 const seen=new Set<string>(); let removed=0;
 const lines=value.split(/\r?\n/u);
 const output=lines.filter(line=>{
   const shown=trim?line.trim():line;
   const key=caseSensitive?shown:shown.toLocaleLowerCase();
   if(seen.has(key)){removed++;return false;}
   seen.add(key);return true;
 });
 return {text:output.join("\n"),removed,total:lines.length};
}