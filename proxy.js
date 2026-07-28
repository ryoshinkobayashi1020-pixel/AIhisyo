function unauthorized() {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="AI社員オフィス", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

export function proxy(request) {
  const pathname = request.nextUrl.pathname;

  // LINEは署名検証済みWebhookだけを外部公開する。
  if (pathname === "/api/misaki-line/webhook") return;

  const password = String(process.env.OFFICE_ACCESS_PASSWORD || "");
  // 環境変数を登録するまでは既存連携を壊さない。登録後は全画面・APIを保護する。
  if (!password) return;

  const expectedUser = String(process.env.OFFICE_ACCESS_USER || "kobayashi");
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Basic ")) return unauthorized();

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    const user = separator >= 0 ? decoded.slice(0, separator) : "";
    const suppliedPassword = separator >= 0 ? decoded.slice(separator + 1) : "";
    if (user === expectedUser && suppliedPassword === password) return;
  } catch {
    // 不正なAuthorizationヘッダーは下の401へ進める。
  }
  return unauthorized();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
