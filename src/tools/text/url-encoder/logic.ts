export function encodeUrlComponent(value: string): string { return encodeURIComponent(value); }
export function decodeUrlComponent(value: string): string { try { return decodeURIComponent(value.replace(/\+/gu, "%20")); } catch { throw new Error("This text contains invalid percent-encoding. Check the % sequences and try again."); } }
