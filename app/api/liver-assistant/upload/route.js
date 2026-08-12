import { saveDocument, saveChunks } from "@/lib/liverKnowledge";
import { extractPdfPages } from "@/lib/pdfText";

export const runtime = "nodejs";

const CONTENT_TYPES = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" };

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const category = String(formData.get("category") || "追加資料").trim() || "追加資料";
    if (!file || typeof file === "string") {
      return Response.json({ error: "資料ファイルを選択してください。" }, { status: 400 });
    }

    const originalName = String(file.name || "資料");
    const dot = originalName.lastIndexOf(".");
    const fileExt = (dot >= 0 ? originalName.slice(dot + 1) : "").toLowerCase();
    const fileName = dot >= 0 ? originalName.slice(0, dot) : originalName;
    const contentType = CONTENT_TYPES[fileExt];
    if (!contentType) {
      return Response.json({ error: "PDF・PNG・JPGのみアップロードできます。" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let pageCount = 0;
    let pages = [];
    if (fileExt === "pdf") {
      try {
        const extracted = await extractPdfPages(buffer);
        pageCount = extracted.pageCount;
        pages = extracted.pages;
      } catch {
        // 画像だけのPDFなど、本文抽出できない場合はファイルの保存のみ行う
      }
    }

    const documentId = await saveDocument({ category, fileName, fileExt, buffer, contentType, pageCount });
    if (pages.length) await saveChunks(documentId, pages);

    return Response.json({ ok: true, documentId, fileName: `${fileName}.${fileExt}`, pageCount });
  } catch (error) {
    return Response.json({ error: error.message || "資料の登録に失敗しました。" }, { status: 500 });
  }
}
