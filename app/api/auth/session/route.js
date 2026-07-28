import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ACCESS_COOKIE = "ai_office_access_token";
const ALLOWED_EMAIL = "ryoshin.kobayashi1020@gmail.com";

export async function POST(request) {
  try {
    const { accessToken = "" } = await request.json();
    const supabaseUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
    const anonKey = String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
    if (!supabaseUrl || !anonKey || !accessToken) {
      return NextResponse.json({ error: "ログイン情報を確認できません。" }, { status: 400 });
    }

    const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
    const user = await authResponse.json().catch(() => ({}));
    const allowedEmail = String(process.env.OFFICE_ALLOWED_EMAIL || ALLOWED_EMAIL).toLowerCase();
    if (!authResponse.ok || String(user.email || "").toLowerCase() !== allowedEmail) {
      return NextResponse.json({ error: "このメールアドレスにはアクセス権がありません。" }, { status: 403 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "ログイン処理に失敗しました。" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ACCESS_COOKIE);
  return response;
}
