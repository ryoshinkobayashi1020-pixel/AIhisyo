import { getStoreValue, setStoreValue } from "@/lib/supabaseStore";

export const runtime = "nodejs";

const STORE_KEY = "staff-settings";
const allowedFields = ["prompt", "strengths", "weaknesses", "videoEvaluationPrompt"];

function sanitizeSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const sanitized = {};
  for (const [staffId, fields] of Object.entries(value)) {
    if (!/^[a-z0-9_-]{1,40}$/i.test(staffId) || !fields || typeof fields !== "object") continue;
    sanitized[staffId] = {};
    for (const field of allowedFields) {
      sanitized[staffId][field] = typeof fields[field] === "string"
        ? fields[field].slice(0, 50000)
        : "";
    }
  }
  return sanitized;
}

export async function GET() {
  try {
    const stored = await getStoreValue(STORE_KEY);
    return Response.json({ settings: sanitizeSettings(stored) });
  } catch (error) {
    console.error("Staff settings read error:", error);
    return Response.json({ error: "設定を読み込めませんでした。" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const settings = sanitizeSettings(body?.settings);
    await setStoreValue(STORE_KEY, settings);
    return Response.json({ ok: true, settings });
  } catch (error) {
    console.error("Staff settings write error:", error);
    return Response.json({ error: "設定を保存できませんでした。" }, { status: 500 });
  }
}
