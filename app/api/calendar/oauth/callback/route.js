import { calendarRedirectUri, exchangeAuthorizationCode, verifyOAuthState } from "@/lib/googleCalendar";

export const runtime = "nodejs";

export async function GET(request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (error) return Response.redirect(`${url.origin}/?calendar=denied`);
  if (!code || !verifyOAuthState(state)) {
    return Response.json({ error: "Google認証の内容を確認できませんでした。" }, { status: 400 });
  }
  try {
    await exchangeAuthorizationCode(code, calendarRedirectUri(url.origin));
    return Response.redirect(`${url.origin}/?calendar=connected`);
  } catch (exchangeError) {
    console.error("Google Calendar OAuth callback error:", exchangeError);
    return Response.redirect(`${url.origin}/?calendar=error`);
  }
}

