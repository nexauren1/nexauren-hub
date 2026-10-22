export function generateUuids(count: number): string[] {
 if (!Number.isInteger(count) || count < 1 || count > 50) throw new Error("Choose between 1 and 50 UUIDs.");
 const cryptoApi = globalThis.crypto;
 if (!cryptoApi?.getRandomValues) throw new Error("Secure random number generation is unavailable in this browser.");
 return Array.from({ length: count }, () => {
  if (typeof cryptoApi.randomUUID === "function") return cryptoApi.randomUUID();
  const bytes = cryptoApi.getRandomValues(new Uint8Array(16)); bytes[6] = (bytes[6] & 0x0f) | 0x40; bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  return hex.slice(0,8)+"-"+hex.slice(8,12)+"-"+hex.slice(12,16)+"-"+hex.slice(16,20)+"-"+hex.slice(20);
 });
}
