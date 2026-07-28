import crypto from "node:crypto";
import { getStoreValue, setStoreValue } from "@/lib/supabaseStore";

const AUTH_STORE_KEY = "google-calendar-auth";
const CONVERSATION_STORE_KEY = "google-calendar-conversations";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const TIME_ZONE = "Asia/Tokyo";

function requiredEnv(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) throw new Error(`${name}が設定されていません。`);
  return value;
}

export function calendarId() {
  return requiredEnv("GOOGLE_CALENDAR_ID");
}

export function calendarRedirectUri(origin) {
  const base = String(process.env.PUBLIC_BASE_URL || origin || "").replace(/\/+$/, "");
  return `${base}/api/calendar/oauth/callback`;
}

export function createOAuthState(origin) {
  const payload = Buffer.from(JSON.stringify({
    issuedAt: Date.now(),
    origin: String(origin || ""),
    nonce: crypto.randomBytes(12).toString("hex"),
  })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", requiredEnv("GOOGLE_CLIENT_SECRET"))
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyOAuthState(state) {
  const [payload, signature] = String(state || "").split(".");
  if (!payload || !signature) return false;
  const expected = crypto
    .createHmac("sha256", requiredEnv("GOOGLE_CLIENT_SECRET"))
    .update(payload)
    .digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number(parsed.issuedAt) > Date.now() - 10 * 60 * 1000;
  } catch {
    return false;
  }
}

export async function exchangeAuthorizationCode(code, redirectUri) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error_description || "Google認証コードを交換できませんでした。");
  const previous = await getStoreValue(AUTH_STORE_KEY).catch(() => null);
  const auth = {
    ...previous,
    accessToken: result.access_token,
    refreshToken: result.refresh_token || previous?.refreshToken || "",
    expiresAt: Date.now() + Number(result.expires_in || 3600) * 1000,
    scope: result.scope || "",
    updatedAt: new Date().toISOString(),
  };
  if (!auth.refreshToken) throw new Error("更新トークンを取得できませんでした。接続を解除して再認証してください。");
  await setStoreValue(AUTH_STORE_KEY, auth);
  return auth;
}

export async function calendarConnectionStatus() {
  try {
    const auth = await getStoreValue(AUTH_STORE_KEY);
    return {
      configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALENDAR_ID),
      connected: Boolean(auth?.refreshToken),
      calendarId: process.env.GOOGLE_CALENDAR_ID || "",
    };
  } catch {
    return {
      configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALENDAR_ID),
      connected: false,
      calendarId: process.env.GOOGLE_CALENDAR_ID || "",
    };
  }
}

async function accessToken() {
  const auth = await getStoreValue(AUTH_STORE_KEY);
  if (!auth?.refreshToken) throw new Error("Googleカレンダーが未接続です。設定画面から接続してください。");
  if (auth.accessToken && Number(auth.expiresAt) > Date.now() + 60_000) return auth.accessToken;
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requiredEnv("GOOGLE_CLIENT_ID"),
      client_secret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      refresh_token: auth.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error_description || "Googleカレンダーの認証を更新できませんでした。");
  const updated = {
    ...auth,
    accessToken: result.access_token,
    expiresAt: Date.now() + Number(result.expires_in || 3600) * 1000,
    updatedAt: new Date().toISOString(),
  };
  await setStoreValue(AUTH_STORE_KEY, updated);
  return updated.accessToken;
}

async function googleRequest(path, options = {}) {
  const token = await accessToken();
  const response = await fetch(`${CALENDAR_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error?.message || "Googleカレンダーとの通信に失敗しました。");
  return result;
}

export async function getBusyIntervals(timeMin, timeMax) {
  const id = calendarId();
  const result = await googleRequest("/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin,
      timeMax,
      timeZone: TIME_ZONE,
      items: [{ id }],
    }),
  });
  return result.calendars?.[id]?.busy || [];
}

export async function isCalendarSlotAvailable(startIso, durationMinutes = 60, travelMinutes = 0) {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const windowStart = new Date(start.getTime() - travelMinutes * 60_000);
  const windowEnd = new Date(end.getTime() + travelMinutes * 60_000);
  const busy = await getBusyIntervals(windowStart.toISOString(), windowEnd.toISOString());
  const conflict = busy.some(item =>
    new Date(item.start).getTime() < windowEnd.getTime()
    && new Date(item.end).getTime() > windowStart.getTime()
  );
  return { available: !conflict, start, end };
}

export async function createCalendarEvent({ startIso, title, description = "", durationMinutes = 60 }) {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  return googleRequest(`/calendars/${encodeURIComponent(calendarId())}/events`, {
    method: "POST",
    body: JSON.stringify({
      summary: title || "撮影",
      description,
      start: { dateTime: start.toISOString(), timeZone: TIME_ZONE },
      end: { dateTime: end.toISOString(), timeZone: TIME_ZONE },
    }),
  });
}

export async function loadCalendarConversation(conversationId) {
  if (!conversationId) return null;
  const all = await getStoreValue(CONVERSATION_STORE_KEY).catch(() => null);
  const item = all?.[conversationId] || null;
  if (!item || Number(item.expiresAt) < Date.now()) return null;
  return item;
}

export async function saveCalendarConversation(conversationId, value) {
  if (!conversationId) return;
  const all = await getStoreValue(CONVERSATION_STORE_KEY).catch(() => ({})) || {};
  const now = Date.now();
  const cleaned = Object.fromEntries(
    Object.entries(all).filter(([, item]) => Number(item?.expiresAt) > now)
  );
  cleaned[conversationId] = {
    ...value,
    expiresAt: now + 24 * 60 * 60 * 1000,
    updatedAt: new Date().toISOString(),
  };
  await setStoreValue(CONVERSATION_STORE_KEY, cleaned);
}
