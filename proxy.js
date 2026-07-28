import { NextResponse } from "next/server";

const ACCESS_COOKIE = "ai_office_access_token";
const ALLOWED_EMAIL = "ryoshin.kobayashi1020@gmail.com";

function unauthorizedApi() {
  return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
}

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/api/misaki-line/webhook") return NextResponse.next();
  if (pathname === "/login" || pathname === "/api/auth/session") return NextResponse.next();

  const internalSecret = request.headers.get("x-ai-office-internal") || "";
  if (
    internalSecret
    && process.env.LINE_CHANNEL_SECRET
    && internalSecret === process.env.LINE_CHANNEL_SECRET
  ) {
    return NextResponse.next();
  }

  const supabaseUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const anonKey = String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value || "";
  if (!supabaseUrl || !anonKey || !accessToken) {
    if (pathname.startsWith("/api/")) return unauthorizedApi();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
    const user = await response.json().catch(() => ({}));
    const allowedEmail = String(process.env.OFFICE_ALLOWED_EMAIL || ALLOWED_EMAIL).toLowerCase();
    if (response.ok && String(user.email || "").toLowerCase() === allowedEmail) {
      return NextResponse.next();
    }
  } catch {
    // 認証確認に失敗した場合はアクセスを許可しない。
  }

  if (pathname.startsWith("/api/")) return unauthorizedApi();
  const redirect = NextResponse.redirect(new URL("/login", request.url));
  redirect.cookies.delete(ACCESS_COOKIE);
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
