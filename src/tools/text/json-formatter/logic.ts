function sortJsonValue(value: unknown): unknown {
 if (Array.isArray(value)) return value.map(sortJsonValue);
 if (value !== null && typeof value === "object") {
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(entries.map(([key, child]) => [key, sortJsonValue(child)]));
 }
 return value;
}

export function formatJson(value:string,minify=false,sortKeys=false):string {
 let parsed:unknown;
 try { parsed=JSON.parse(value); }
 catch(error) {
  const msg=error instanceof Error?error.message:"Invalid JSON";
  throw new Error("JSON could not be parsed: "+msg);
 }
 const normalized=sortKeys?sortJsonValue(parsed):parsed;
 return minify?JSON.stringify(normalized):JSON.stringify(normalized,null,2);
}
