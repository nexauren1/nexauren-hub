export function encodeBase64(value: string): string {
 const bytes = new TextEncoder().encode(value);
 let binary = "";
 for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
 return btoa(binary);
}
export function decodeBase64(value: string): string {
 const clean = value.replace(/\s+/gu, "");
 try { const binary = atob(clean); const bytes = Uint8Array.from(binary, char => char.charCodeAt(0)); return new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
 catch { throw new Error("This is not valid Base64 containing UTF-8 text."); }
}
