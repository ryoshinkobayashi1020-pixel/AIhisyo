import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const dataDirectory = path.join(process.cwd(), ".data");
const settingsFile = path.join(dataDirectory, "staff-settings.json");
const temporaryFile = path.join(dataDirectory, "staff-settings.tmp.json");
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
    const stored = JSON.parse(await readFile(settingsFile, "utf8"));
    return Response.json({ settings: sanitizeSettings(stored) });
  } catch (error) {
    if (error?.code === "ENOENT") return Response.json({ settings: {} });
    console.error("Staff settings read error:", error);
    return Response.json({ error: "設定を読み込めませんでした。" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const settings = sanitizeSettings(body?.settings);
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(temporaryFile, JSON.stringify(settings, null, 2), "utf8");
    await rename(temporaryFile, settingsFile);
    return Response.json({ ok: true, settings });
  } catch (error) {
    console.error("Staff settings write error:", error);
    return Response.json({ error: "設定を保存できませんでした。" }, { status: 500 });
  }
}
