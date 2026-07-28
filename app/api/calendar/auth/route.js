import { calendarRedirectUri, createOAuthState } from "@/lib/googleCalendar";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const origin = new URL(request.url).origin;
    const redirectUri = calendarRedirectUri(origin);
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar",
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state: createOAuthState(origin),
    });
    return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

