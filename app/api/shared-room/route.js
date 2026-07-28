import { getStoreValue, setStoreValue } from "@/lib/supabaseStore";

export const runtime = "nodejs";

const STORE_KEY = "shared-room";
// サーバーレス環境では複数インスタンスに分かれるため、このキューは同一インスタンス内の
// 連続リクエストの競合を減らす程度の役割（完全な排他制御ではない）。
let writeQueue = Promise.resolve();

function emptyState() {
  return { presence: {}, cinema: { videoId: "", title: "", updatedAt: 0, by: "" }, events: [], nextEventId: 1 };
}

async function readState() {
  const stored = await getStoreValue(STORE_KEY);
  return { ...emptyState(), ...(stored || {}) };
}

async function mutateState(mutator) {
  let result;
  writeQueue = writeQueue.then(async () => {
    const state = await readState();
    result = mutator(state) || state;
    const now = Date.now();
    state.presence = Object.fromEntries(
      Object.entries(state.presence || {}).filter(([, participant]) => now - Number(participant.seenAt || 0) < 15000),
    );
    state.events = (state.events || []).filter(event => now - Number(event.createdAt || 0) < 10 * 60 * 1000).slice(-100);
    await setStoreValue(STORE_KEY, state);
  });
  await writeQueue;
  return result;
}

function safeClient(value) {
  return /^[a-z0-9_-]{6,80}$/i.test(String(value || "")) ? String(value) : "";
}

function publicState(state) {
  return {
    participants: Object.values(state.presence || {}).map(item => ({ id:item.id, name:item.name })),
    cinema: state.cinema || emptyState().cinema,
    events: state.events || [],
  };
}

export async function GET(request) {
  const url = new URL(request.url);
  const clientId = safeClient(url.searchParams.get("clientId"));
  const name = String(url.searchParams.get("name") || "ゲスト").trim().slice(0, 20);
  const state = await mutateState(current => {
    if (clientId) current.presence[clientId] = { id:clientId, name, seenAt:Date.now() };
    return current;
  });
  return Response.json(publicState(state), { headers:{ "Cache-Control":"no-store" } });
}

export async function POST(request) {
  const body = await request.json();
  const clientId = safeClient(body?.clientId);
  if (!clientId) return Response.json({ error:"接続情報が正しくありません。" }, { status:400 });
  const state = await mutateState(current => {
    current.presence[clientId] = {
      id:clientId,
      name:String(body?.name || "ゲスト").trim().slice(0, 20),
      seenAt:Date.now(),
    };
    if (body?.action === "cinema") {
      const videoId = /^[\w-]{6,20}$/.test(String(body.videoId || "")) ? String(body.videoId) : "";
      if (videoId) {
        current.cinema = {
          videoId,
          title:String(body.title || "YouTube動画").slice(0, 120),
          updatedAt:Date.now(),
          by:clientId,
        };
      }
    }
    if (body?.action === "event" && ["task-start", "task-complete"].includes(body?.event?.type)) {
      current.events.push({
        type:body.event.type,
        taskId:String(body.event.taskId || "").slice(0, 100),
        staffId:String(body.event.staffId || "").slice(0, 40),
        instruction:String(body.event.instruction || "").slice(0, 4000),
        deliverable:String(body.event.deliverable || "").slice(0, 60000),
        image:String(body.event.image || "").slice(0, 1000),
        model:String(body.event.model || "").slice(0, 100),
        durationMs:Math.max(0, Math.min(60 * 60 * 1000, Number(body.event.durationMs) || 0)),
        id:current.nextEventId++,
        source:clientId,
        createdAt:Date.now(),
      });
    }
    return current;
  });
  return Response.json(publicState(state));
}
