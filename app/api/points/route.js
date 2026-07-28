import { getStoreValue, setStoreValue } from "@/lib/supabaseStore";

export const runtime = "nodejs";

const STORE_KEY = "points";

function currentGrantMonth() {
  const tokyoParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(tokyoParts.map(part => [part.type, part.value]));
  return {
    monthKey: `${value.year}-${value.month}`,
    day: Number(value.day),
  };
}

function sanitize(value) {
  const staff = {};
  if (value?.staff && typeof value.staff === "object") {
    for (const [id, points] of Object.entries(value.staff)) {
      if (/^[a-z0-9_-]{1,40}$/i.test(id)) {
        staff[id] = Math.max(0, Math.min(100000000, Math.floor(Number(points) || 0)));
      }
    }
  }
  return {
    owner: Math.max(0, Math.min(100000000, Math.floor(Number(value?.owner) || 0))),
    staff,
    lastGrantMonth: typeof value?.lastGrantMonth === "string"
      ? value.lastGrantMonth.slice(0, 7)
      : "",
  };
}

function applyMonthlyGrant(points) {
  const { monthKey, day } = currentGrantMonth();
  if (day < 27 || points.lastGrantMonth === monthKey) return { points, changed: false };
  points.owner += 1000;
  for (const id of Object.keys(points.staff)) points.staff[id] += 1000;
  points.lastGrantMonth = monthKey;
  return { points: sanitize(points), changed: true };
}

export async function GET() {
  try {
    const stored = await getStoreValue(STORE_KEY);
    if (!stored) return Response.json({ points: null });
    const granted = applyMonthlyGrant(sanitize(stored));
    if (granted.changed) await setStoreValue(STORE_KEY, granted.points);
    return Response.json({ points: granted.points });
  } catch (error) {
    console.error("Points read error:", error);
    return Response.json({ error: "ポイントを読み込めませんでした。" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const points = applyMonthlyGrant(sanitize((await request.json())?.points)).points;
    await setStoreValue(STORE_KEY, points);
    return Response.json({ ok: true, points });
  } catch (error) {
    console.error("Points write error:", error);
    return Response.json({ error: "ポイントを保存できませんでした。" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const winnerId = typeof body?.winnerId === "string" ? body.winnerId : "";
    const amount = Math.max(0, Math.min(1000000, Math.floor(Number(body?.amount) || 0)));
    if (!amount || (winnerId !== "you" && !/^[a-z0-9_-]{1,40}$/i.test(winnerId))) {
      return Response.json({ error: "ポイント加算の内容が正しくありません。" }, { status: 400 });
    }
    const stored = await getStoreValue(STORE_KEY);
    let points = sanitize(stored || {});
    points = applyMonthlyGrant(points).points;
    if (winnerId === "you") {
      points.owner = Math.min(100000000, points.owner + amount);
    } else {
      points.staff[winnerId] = Math.min(100000000, (points.staff[winnerId] || 0) + amount);
    }
    await setStoreValue(STORE_KEY, points);
    return Response.json({ ok: true, points });
  } catch (error) {
    console.error("Points grant error:", error);
    return Response.json({ error: "勝利ポイントを加算できませんでした。" }, { status: 500 });
  }
}
