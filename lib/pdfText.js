import { extractText, getDocumentProxy } from "unpdf";

export async function extractPdfPages(buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text, totalPages } = await extractText(pdf, { mergePages: false });
  const pages = text
    .map((content, index) => ({ page: index + 1, content: String(content || "").trim() }))
    .filter(item => item.content.length > 0);
  return { pageCount: totalPages, pages };
}
