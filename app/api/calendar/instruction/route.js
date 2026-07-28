import {
  createCalendarEvent,
  deleteCalendarEvent,
  findCalendarEvents,
  isCalendarSlotAvailable,
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
    action: { type: "string", enum: ["check", "suggest", "book", "cancel", "clarify"] },
    startIso: { type: "string" },
    title: { type: "string" },
    clientName: { type: "string" },
    eventType: { type: "string", enum: ["shooting", "meeting", "other"] },
    durationMinutes: { type: "number" },
  },
  required: ["action", "startIso", "title", "clientName", "eventType", "durationMinutes"],
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
  const prompt = `あなたは合同会社良心のみさきです。予定調整の自然な日本語を整理してください。

現在日時: ${now.toISOString()}
タイムゾーン: Asia/Tokyo
今回の指示: ${text}
直前に提示した候補: ${JSON.stringify(pending?.options || [])}
直前の案件名: ${pending?.title || ""}

action:
- check: 特定の日時が空いているか質問している
- suggest: 空いている日や時間を複数聞いている
- book: 「その時間で」「15時で」「そこに決定」「予定を追加して」「カレンダーに登録して」「打ち合わせを入れて」など、日時を確定して予定登録を頼んでいる
- cancel: 登録済みの予定をキャンセル、取り消し、削除したい
- clarify: 日程に関係しない、または判断不能

ルール:
- 「今日」「明日」「来週」などは現在日時を基準にする
- startIsoは日時が一意に決まる場合だけ、+09:00付きISO 8601で入れる
- bookで時刻だけ言われた場合、直前候補から一致する候補が1件なら、その完全な日時をstartIsoへ入れる
- 「1つ目で」「2番目で」「3番で」などはbookとして扱い、直前候補の該当日時をstartIsoへ入れる
- cancelでは、日時が分かる場合はstartIso、予定名や相手名が分かる場合はtitleまたはclientNameへ入れる
- eventTypeは撮影ならshooting、打ち合わせ・会議・面談ならmeeting、それ以外または不明ならother
- durationMinutesは撮影なら120、打ち合わせ・会議・面談なら60、明示された所要時間があればその分数。不明なら60
- startIsoには開始時刻だけを入れる
- titleは相手や案件と予定種別が分かる自然な名前。不明なら「予定」
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

function nextMonday(from) {
  const result = new Date(from);
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "short" }).format(result);
  const day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[weekday] ?? 0;
  const daysUntilMonday = ((8 - day) % 7) || 7;
  result.setDate(result.getDate() + daysUntilMonday);
  return result;
}

function durationLabel(minutes) {
  if (minutes === 60) return "1時間";
  if (minutes === 120) return "2時間";
  return `${minutes}分`;
}

async function suggestSlots({ startDate, durationMinutes, travelMinutes }) {
  const availableDays = [];
  const candidateHours = [10, 13, 16, 19];
  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    const day = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const rotatedHours = candidateHours.map((_, index) => candidateHours[(index + dayOffset) % candidateHours.length]);
    for (const hour of rotatedHours) {
      if (hour * 60 + durationMinutes > 21 * 60) continue;
      const startIso = tokyoIso(day, hour);
      const checked = await isCalendarSlotAvailable(startIso, durationMinutes, travelMinutes);
      if (checked.available) {
        availableDays.push({ startIso: checked.start.toISOString(), label: formatJapanese(checked.start) });
        break;
      }
    }
  }
  if (availableDays.length <= 3) return availableDays;
  const middleIndex = Math.floor((availableDays.length - 1) / 2);
  return [availableDays[0], availableDays[middleIndex], availableDays[availableDays.length - 1]];
}

export async function POST(request) {
  try {
    const body = await request.json();
    const instruction = String(body?.instruction || "").trim().slice(0, 4000);
    const conversationId = String(body?.conversationId || "").trim().slice(0, 300);
    if (!instruction) return Response.json({ error: "日程の指示がありません。" }, { status: 400 });

    const pending = await loadCalendarConversation(conversationId);
    const parsed = await understandInstruction(instruction, pending);
    const explicitBooking = /(?:予定|撮影|打ち合わせ|打合せ|面談|カレンダー).*(?:追加して|登録して|入れて|入れといて)|(?:この|その)(?:時間|日時|日程|候補)で(?:お願い)?|(?:1|１|一|2|２|二|3|３|三)(?:つ目|番目|番)で(?:お願い)?|\d{1,2}時(?:半)?で(?:お願い)?$/.test(instruction);
    if (explicitBooking) parsed.action = "book";
    let startIso = validStart(parsed.startIso);
    const eventType = parsed.eventType || pending?.eventType || "other";
    const durationMinutes = Math.min(240, Math.max(30, Number(parsed.durationMinutes) || (eventType === "shooting" ? 120 : 60)));
    const travelMinutes = eventType === "shooting" ? 60 : 0;

    if (parsed.action === "cancel") {
      const refersToRecentEvent = /(この|その|さっき|先ほど|今|登録した)?予定.*(?:キャンセル|取消|取り消|削除)|(?:キャンセル|取消|取り消|削除)(?:して|お願い)?$/.test(instruction);
      if (pending?.eventId && refersToRecentEvent) {
        await deleteCalendarEvent(pending.eventId);
        const cancelledTitle = pending.title || "予定";
        await saveCalendarConversation(conversationId, {
          action: "cancelled",
          title: cancelledTitle,
          options: [],
          eventId: "",
        });
        return Response.json({
          action: "cancel",
          cancelled: true,
          message: `Googleカレンダーの「${cancelledTitle}」をキャンセルしました。`,
        });
      }

      const query = [parsed.clientName, parsed.title]
        .map(value => String(value || "").trim())
        .find(value => value && !["予定", "撮影", "打ち合わせ", "会議", "面談"].includes(value)) || "";
      const events = await findCalendarEvents({ startIso, query, maxResults: 10 });
      if (!events.length) {
        return Response.json({
          action: "cancel",
          cancelled: false,
          message: "該当する予定が見つかりませんでした。予定名と日付・開始時刻を教えてください。",
        });
      }
      if (events.length > 1) {
        const candidates = events.slice(0, 3).map(event => {
          const eventStart = event.start?.dateTime || event.start?.date || "";
          return `${formatJapanese(eventStart)}「${event.summary || "予定"}」`;
        });
        return Response.json({
          action: "cancel",
          cancelled: false,
          message: `予定が複数見つかりました。キャンセルする予定の日付と開始時刻を教えてください。\n${candidates.join("\n")}`,
        });
      }

      const [event] = events;
      await deleteCalendarEvent(event.id);
      return Response.json({
        action: "cancel",
        cancelled: true,
        message: `${formatJapanese(event.start?.dateTime || event.start?.date)}の「${event.summary || "予定"}」をキャンセルしました。`,
      });
    }

    if (parsed.action === "suggest") {
      const baseDate = /来週以降/.test(instruction)
        ? nextMonday(new Date())
        : new Date(Date.now() + 24 * 60 * 60 * 1000);
      const options = await suggestSlots({ startDate: baseDate, durationMinutes, travelMinutes });
      if (!options.length) {
        return Response.json({ action: "suggest", message: "ご指定の開始日から7日間に、ご案内できる予定候補が見つかりませんでした。" });
      }
      await saveCalendarConversation(conversationId, {
        action: "suggest",
        title: parsed.title || pending?.title || "予定",
        clientName: parsed.clientName || pending?.clientName || "",
        eventType,
        durationMinutes,
        options,
      });
      return Response.json({
        action: "suggest",
        options,
        message: `空いている候補は、${options.map(option => option.label).join("、または")}です。ご希望の日時をお知らせください。`,
      });
    }

    if (parsed.action === "check") {
      if (!startIso) {
        return Response.json({ action: "clarify", message: "確認したい日付と開始時刻を教えてください。" });
      }
      const checked = await isCalendarSlotAvailable(startIso, durationMinutes, travelMinutes);
      const option = { startIso: checked.start.toISOString(), label: formatJapanese(checked.start) };
      await saveCalendarConversation(conversationId, {
        action: "check",
        title: parsed.title || pending?.title || "予定",
        clientName: parsed.clientName || pending?.clientName || "",
        eventType,
        durationMinutes,
        options: checked.available ? [option] : [],
      });
      return Response.json({
        action: "check",
        available: checked.available,
        options: checked.available ? [option] : [],
        message: checked.available
          ? `${option.label}から${durationLabel(durationMinutes)}、予定を入れられます。この時間でよろしければ「この時間で」とお伝えください。`
          : `${option.label}は予定があるため難しいです。別の空き時間を3つお探しできます。`,
      });
    }

    if (parsed.action === "book") {
      if (!startIso && pending?.options?.length) {
        const ordinalMatch = instruction.match(/(?:^|\D)([123１２３一二三])(?:つ目|番目|番)/);
        const ordinalIndex = ordinalMatch
          ? { "1": 0, "１": 0, "一": 0, "2": 1, "２": 1, "二": 1, "3": 2, "３": 2, "三": 2 }[ordinalMatch[1]]
          : -1;
        if (ordinalIndex >= 0 && pending.options[ordinalIndex]) {
          startIso = validStart(pending.options[ordinalIndex].startIso);
        }
      }
      if (!startIso && pending?.options?.length === 1) startIso = validStart(pending.options[0].startIso);
      if (!startIso) {
        return Response.json({ action: "clarify", message: "登録する日付と開始時刻をもう一度教えてください。" });
      }
      const bookedDuration = Number(pending?.durationMinutes) || durationMinutes;
      const bookedEventType = pending?.eventType || eventType;
      const checked = await isCalendarSlotAvailable(startIso, bookedDuration, bookedEventType === "shooting" ? 60 : 0);
      if (!checked.available) {
        return Response.json({
          action: "book",
          booked: false,
          message: `${formatJapanese(startIso)}は、その後に予定が入ったため登録できませんでした。別の時間をお探しします。`,
        });
      }
      const title = parsed.title && parsed.title !== "撮影"
        ? parsed.title
        : pending?.title || "予定";
      const event = await createCalendarEvent({
        startIso,
        title,
        durationMinutes: bookedDuration,
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
        message: `${formatJapanese(startIso)}から${durationLabel(bookedDuration)}で、Googleカレンダーに「${title}」を登録しました。`,
      });
    }

    return Response.json({
      action: "clarify",
      message: "予定の空き確認なら、日付と開始時刻を教えてください。空いている候補を探すこともできます。",
    });
  } catch (error) {
    console.error("Calendar instruction error:", error);
    return Response.json({ error: error.message || "Googleカレンダーを確認できませんでした。" }, { status: 500 });
  }
}
