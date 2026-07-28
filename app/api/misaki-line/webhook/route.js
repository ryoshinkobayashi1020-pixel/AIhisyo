import crypto from "node:crypto";

export const runtime = "nodejs";

// LINEからのWebhookは「x-line-signature」ヘッダーで署名されている。
// チャネルシークレットで検証しないと、誰でも偽のリクエストを送れてしまう。
function verifySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const hash = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

async function replyLine(replyToken, text, imageUrl = "") {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || !replyToken) return;
  const messages = [];
  if (/^https:\/\//.test(imageUrl)) {
    messages.push({
      type: "image",
      originalContentUrl: imageUrl,
      previewImageUrl: imageUrl,
    });
  }
  messages.push({ type: "text", text: String(text).slice(0, 4900) });
  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ replyToken, messages }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`LINE返信に失敗しました（${response.status}）：${body.slice(0, 300)}`);
  }
}

function summarizeSendResults(sendResults = {}) {
  const lines = [];
  if (sendResults.email) {
    lines.push(sendResults.email.ok ? "・メール送信：完了" : `・メール送信：未送信（${sendResults.email.reason || "失敗"}）`);
  }
  if (sendResults.line) {
    lines.push(sendResults.line.ok ? "・LINE送信：完了" : `・LINE送信：未送信（${sendResults.line.reason || "失敗"}）`);
  }
  return lines.join("\n");
}

function getLineSourceTarget(source = {}) {
  if (source.type === "group") return { targetId: source.groupId || "", targetType: "group" };
  if (source.type === "room") return { targetId: source.roomId || "", targetType: "room" };
  return { targetId: source.userId || "", targetType: "user" };
}

async function registerLineGroupTarget(origin, clientId, source) {
  const { targetId, targetType } = getLineSourceTarget(source);
  if (!clientId || !targetId || !["group", "room"].includes(targetType)) return;
  const response = await fetch(`${origin}/api/accounting`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "set-line-target", clientId, targetId, targetType }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || "LINEグループを請求書送信先へ登録できませんでした。");
  }
}

async function handleMisakiMessage(origin, text, source = {}) {
  const parseResponse = await fetch(`${origin}/api/accounting/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instruction: text }),
  });
  const parsed = await parseResponse.json().catch(() => ({}));
  if (!parseResponse.ok) {
    return parsed.error || "請求内容を読み取れませんでした。";
  }

  // グループまたは複数人トークから登録済みクライアントを指定したら、
  // そのトークを以後の既定送信先として記録する。
  await registerLineGroupTarget(origin, parsed.clientId, source);
  if (
    parsed.clientId
    && ["group", "room"].includes(source.type)
    && /(この(グループ|トーク)|請求書).*(送信先|送り先|登録)|(送信先|送り先).*(登録)/.test(text)
  ) {
    return "このLINEトークを請求書の送信先として登録しました。";
  }
  if (
    source.type === "user"
    && parsed.clientId
    && !parsed.lineTargetId
  ) {
    return `${parsed.clientQuery || "この請求先"}のLINE送信先がまだ登録されていません。送信したいLINEグループで「このグループを${parsed.clientQuery || "この請求先"}の請求書送信先に登録」と送ってください。`;
  }

  const missing = [];
  if (!parsed.clientId) missing.push("登録済みの請求先（会社名・呼び名）");
  if (!parsed.invoiceDate) missing.push("請求日");
  if (parsed.clientId && !parsed.dueDate) missing.push("支払期限");
  if (!parsed.items?.length || !parsed.items.some(item => item.description && Number(item.amount || item.unitPrice))) {
    missing.push("請求項目と金額");
  }
  if (missing.length) {
    return `請求書を作成できませんでした。不足情報：${missing.join("、")}`;
  }

  const invoiceResponse = await fetch(`${origin}/api/accounting/invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: parsed.clientId,
      invoiceDate: parsed.invoiceDate,
      dueDate: parsed.dueDate,
      closingDate: parsed.closingDate,
      period: parsed.period,
      taxMode: parsed.taxMode,
      discount: parsed.discount,
      invoiceNumber: parsed.invoiceNumber,
      note: parsed.note,
      bankAccountId: parsed.bankAccountId,
      items: parsed.items,
      // グループ内の指示はreply APIで同じ場所へ画像を返すため、
      // push APIによる二重送信を止める。個人トークからの指示は
      // 登録済みグループへpushしつつ、依頼者本人にもreplyする。
      ...(source.type === "group" || source.type === "room" ? { sendChannels: [] } : {}),
      archiveServerCopy: true, // LINE経由はブラウザが開いていないため、サーバー側に保管する
    }),
  });
  const result = await invoiceResponse.json().catch(() => ({}));
  if (!invoiceResponse.ok) {
    return result.error || "請求書を作成できませんでした。";
  }

  return {
    // 個人トークからの指示では、請求書画像は登録済み送信先へpushする。
    // 依頼者個人へは確認文だけを返し、請求書画像を重複送信しない。
    imageUrl: ["group", "room"].includes(source.type) ? (result.imageUrl || "") : "",
    text: "いつもお世話になっております。請求書をお送りいたしますので、ご確認をお願いいたします。",
  };
}

export async function POST(request) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature") || "";

  if (!verifySignature(rawBody, signature, secret)) {
    return new Response("invalid signature", { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const events = Array.isArray(payload.events) ? payload.events : [];

  for (const event of events) {
    if (event.type !== "message" || event.message?.type !== "text") continue;
    if (!["user", "group", "room"].includes(event.source?.type)) continue;

    try {
      const reply = await handleMisakiMessage(origin, event.message.text, event.source);
      if (typeof reply === "string") {
        await replyLine(event.replyToken, reply);
      } else {
        await replyLine(event.replyToken, reply.text, reply.imageUrl);
      }
    } catch (error) {
      console.error("Misaki LINE webhook error:", error);
      await replyLine(event.replyToken, `エラーが発生しました：${error.message}`);
    }
  }

  return Response.json({ ok: true });
}
