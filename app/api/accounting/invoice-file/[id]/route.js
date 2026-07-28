import { readFile } from "node:fs/promises";
import path from "node:path";
import { invoiceDirectory } from "@/lib/accounting";

export const runtime = "nodejs";

// LINEのMessaging APIが画像を取得するための、公開HTTPS配信用エンドポイント。
// 認証なし・請求書ID(UUID)をキーにするだけなので、ローカル(.data/invoices)に
// LINE送信時のみ一時的にコピーした請求書画像しか置かない。
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!/^[a-f0-9-]{10,60}$/i.test(String(id))) {
      return new Response("Not found", { status: 404 });
    }
    const filePath = path.join(invoiceDirectory, `${id}.png`);
    const file = await readFile(filePath);
    return new Response(file, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
