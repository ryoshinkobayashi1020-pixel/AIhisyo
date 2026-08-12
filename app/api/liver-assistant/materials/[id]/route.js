import { getMaterialSignedUrl } from "@/lib/liverKnowledge";

export const runtime = "nodejs";

// 資料の原本(PDF・画像)を開くための配信用エンドポイント。
// 実体はSupabase Storage(非公開バケット)にあるため、期限付きURLへリダイレクトするだけにする。
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!/^[a-f0-9-]{10,60}$/i.test(String(id))) {
      return new Response("Not found", { status: 404 });
    }
    const signedUrl = await getMaterialSignedUrl(id, 60 * 10);
    return Response.redirect(signedUrl, 302);
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
