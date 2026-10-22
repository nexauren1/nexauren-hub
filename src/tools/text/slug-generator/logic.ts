export function generateSlug(value: string): string {
 return value.normalize("NFD").replace(/[\u0300-\u036f]/gu, "").toLowerCase().trim().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "");
}
