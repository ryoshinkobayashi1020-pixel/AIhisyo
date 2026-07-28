import {
  createShootingEvent,
  isShootingSlotAvailable,
  loadCalendarConversation,
  saveCalendarConversation,
} from "@/lib/googleCalendar";

export const runtime = "nodejs";

const DEFAULT_MODEL = "gpt-5.6-luna";
const TIME_ZONE = "Asia/Tokyo";

const INSTRUCTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    action: { type: "string", enum: ["check", "suggest", "book", "clarify"] },
    startIso: { type: "string" },
    title: { type: "string" },
    clientName: { type: "string" },
  },
  required: ["action", "startIso", "title", "clientName"],
};

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return "";
}

function formatJapanese(iso) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: TIME_ZONE,
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function datePartsInTokyo(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function tokyoIso(date, hour) {
  const { year, month, day } = datePartsInTokyo(date);
  return `${year}-${month}-${day}T${String(hour).padStart(2, "0")}:00:00+09:00`;
}

function validStart(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "";
  return new Date(value).toISOString();
}

async function understandInstruction(text, pending) {
  if (!process.env.OPENAI_API_KEY) throw new Error("予定指示の読み取りAPIが設定されていません。");
  const now = new Date();
  const prompt = `あなたは合同会社良心のみさきです。撮影日程の自然な日本語を整理してください。

現在日時: ${now.toISOString()}
タイムゾーン: Asia/Tokyo
今回の指示: ${text}
直前に提示した候補: ${JSON.stringify(pending?.options || [])}
直前の案件名: ${pending?.title || ""}

action:
- check: 特定の日時が空いているか質問している
- suggest: 空いている日や時間を2つほど聞いている
- book: 「その時間で」「15時で」「そこに決定」など、日時を確定して予定登録を頼んでいる
- clarify: 日程に関係しない、または判断不能

ルール:
- 「今日」「明日」「来週」などは現在日時を基準にする
- startIsoは日時が一意に決まる場合だけ、+09:00付きISO 8601で入れる
- bookで時刻だけ言われた場合、直前候補から一致する候補が1件なら、その完全な日時をstartIsoへ入れる
- 撮影時間は2時間だが、startIsoには開始時刻だけを入れる
- titleは相手や案件が分かれば「〇〇 撮影」、不明なら「撮影」
- 情報を作らない`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.CALENDAR_PARSE_MODEL || process.env.OFFICE_ROUTER_MODEL || DEFAULT_MODEL,
      input: prompt,
      reasoning: { effort: "none" },
      text: {
        format: {
          type: "json_schema",
          name: "calendar_instruction",
          strict: true,
          schema: INSTRUCTION_SCHEMA,
        },
      },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error("撮影日程の指示を読み取れませんでした。");
  return JSON.parse(extractOutputText(data));
}

async function suggestSlots() {
  const options = [];
  const today = new Date();
  const candidateHours = [10, 13, 16, 19];
  for (let dayOffset = 1; dayOffset <= 21 && options.length < 2; dayOffset += 1) {
    const day = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    for (const hour of candidateHours) {
      const startIso = tokyoIso(day, hour);
      const checked = await isShootingSlotAvailable(startIso);
      if (checked.available) {
        options.push({ startIso: checked.start.toISOString(), label: formatJapanese(checked.start) });
        if (options.length === 2) break;
      }
    }
  }
  return options;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const instruction = String(body?.instruction || "").trim().slice(0, 4000);
    const conversationId = String(body?.conversationId || "").trim().slice(0, 300);
    if (!instruction) return Response.json({ error: "日程の指示がありません。" }, { status: 400 });

    const pending = await loadCalendarConversation(conversationId);
    const parsed = await understandInstruction(instruction, pending);
    let startIso = validStart(parsed.startIso);

    if (parsed.action === "suggest") {
      const options = await suggestSlots();
      if (!options.length) {
        return Response.json({ action: "suggest", message: "直近3週間でご案内できる撮影枠が見つかりませんでした。" });
      }
      await saveCalendarConversation(conversationId, {
        action: "suggest",
        title: parsed.title || pending?.title || "撮影",
        clientName: parsed.clientName || pending?.clientName || "",
        options,
      });
      return Response.json({
        action: "suggest",
        options,
        message: `空いている撮影枠は、${options.map(option => option.label).join("、または")}です。ご希望の日時をお知らせください。`,
      });
    }

    if (parsed.action === "check") {
      if (!startIso) {
        return Response.json({ action: "clarify", message: "確認したい日付と開始時刻を教えてください。" });
      }
      const checked = await isShootingSlotAvailable(startIso);
      const option = { startIso: checked.start.toISOString(), label: formatJapanese(checked.start) };
      await saveCalendarConversation(conversationId, {
        action: "check",
        title: parsed.title || pending?.title || "撮影",
        clientName: parsed.clientName || pending?.clientName || "",
        options: checked.available ? [option] : [],
      });
      return Response.json({
        action: "check",
        available: checked.available,
        options: checked.available ? [option] : [],
        message: checked.available
          ? `${option.label}から2時間、撮影可能です。この時間でよろしければ「この時間で」とお伝えください。`
          : `${option.label}は予定があるため難しいです。別の空き時間を2つお探しできます。`,
      });
    }

    if (parsed.action === "book") {
      if (!startIso && pending?.options?.length === 1) startIso = validStart(pending.options[0].startIso);
      if (!startIso) {
        return Response.json({ action: "clarify", message: "登録する日付と開始時刻をもう一度教えてください。" });
      }
      const checked = await isShootingSlotAvailable(startIso);
      if (!checked.available) {
        return Response.json({
          action: "book",
          booked: false,
          message: `${formatJapanese(startIso)}は、その後に予定が入ったため登録できませんでした。別の時間をお探しします。`,
        });
      }
      const title = parsed.title && parsed.title !== "撮影"
        ? parsed.title
        : pending?.title || "撮影";
      const event = await createShootingEvent({
        startIso,
        title,
        description: parsed.clientName || pending?.clientName
          ? `撮影先：${parsed.clientName || pending.clientName}`
          : "",
      });
      await saveCalendarConversation(conversationId, {
        action: "booked",
        title,
        options: [],
        eventId: event.id,
      });
      return Response.json({
        action: "book",
        booked: true,
        eventId: event.id,
        htmlLink: event.htmlLink || "",
        message: `${formatJapanese(startIso)}から2時間で、Googleカレンダーに「${title}」を登録しました。`,
      });
    }

    return Response.json({
      action: "clarify",
      message: "撮影日の空き確認なら、日付と開始時刻を教えてください。空いている候補を探すこともできます。",
    });
  } catch (error) {
    console.error("Calendar instruction error:", error);
    return Response.json({ error: error.message || "Googleカレンダーを確認できませんでした。" }, { status: 500 });
  }
}

