import { getInvoiceImageSignedUrl } from "@/lib/supabaseStorage";

export const runtime = "nodejs";

// LINEのMessaging APIが画像を取得するための、公開HTTPS配信用エンドポイント。
// 実体はSupabase Storage（非公開バケット）にあるため、ここでは期限付きURLへ
// リダイレクトするだけにする。認証なし・請求書ID(UUID)をキーにするだけの
// 単純な作りなので、IDが漏れない限り第三者は中身を知り得ない。
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!/^[a-f0-9-]{10,60}$/i.test(String(id))) {
      return new Response("Not found", { status: 404 });
    }
    const signedUrl = await getInvoiceImageSignedUrl(id, 60 * 10);
    return Response.redirect(signedUrl, 302);
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
