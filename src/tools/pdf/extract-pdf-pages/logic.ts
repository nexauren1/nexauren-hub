import { PDFDocument } from "pdf-lib";
import { parsePageRanges } from "../shared/pages";

export async function extractPdfPages(file: File, range: string): Promise<Blob> {
  if (!file) throw new Error("Choose a PDF file.");
  const source = await PDFDocument.load(await file.arrayBuffer());
  const total = source.getPageCount();
  const tokens = range.split(",").map((value) => value.trim()).filter(Boolean);
  if (!tokens.length) throw new Error("Enter page numbers, for example 1, 3-5, 8.");

  const indexes: number[] = [];
  for (const token of tokens) {
    const match = token.match(/^(\d+)(?:\s*-\s*(\d+))?$/u);
    if (!match) throw new Error("Invalid page range: " + token);
    const first = Number(match[1]);
    const last = Number(match[2] || match[1]);
    if (first < 1 || last < first || last > total) {
      throw new Error("Pages must be between 1 and " + total + "; check \"" + token + "\".");
    }
    for (let page = first; page <= last; page++) {
      if (!indexes.includes(page - 1)) indexes.push(page - 1);
    }
  }

  const output = await PDFDocument.create();
  const copied = await output.copyPages(source, indexes);
  copied.forEach((page) => output.addPage(page));
  return new Blob([await output.save()], { type: "application/pdf" });
}

/** Create a copy of the PDF without the selected pages. At least one page must remain. */
export async function removePdfPages(file: File, range: string): Promise<Blob> {
  if (!file) throw new Error("Choose a PDF file.");
  const source = await PDFDocument.load(await file.arrayBuffer());
  const total = source.getPageCount();
  if (!range.trim()) throw new Error("Enter page numbers to remove, for example 1, 3-5, 8.");

  const remove = new Set(parsePageRanges(range, total));
  const keep = Array.from({ length: total }, (_, index) => index).filter((index) => !remove.has(index));
  if (!keep.length) throw new Error("You cannot remove every page. Leave at least one page in the document.");

  const output = await PDFDocument.create();
  const copied = await output.copyPages(source, keep);
  copied.forEach((page) => output.addPage(page));
  return new Blob([await output.save()], { type: "application/pdf" });
}
