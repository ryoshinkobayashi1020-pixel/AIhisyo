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

async function handleMisakiMessage(origin, text) {
  const parseResponse = await fetch(`${origin}/api/accounting/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instruction: text }),
  });
  const parsed = await parseResponse.json().catch(() => ({}));
  if (!parseResponse.ok) {
    return parsed.error || "請求内容を読み取れませんでした。";
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
      archiveServerCopy: true, // LINE経由はブラウザが開いていないため、サーバー側に保管する
    }),
  });
  const result = await invoiceResponse.json().catch(() => ({}));
  if (!invoiceResponse.ok) {
    return result.error || "請求書を作成できませんでした。";
  }

  const summary = summarizeSendResults(result.sendResults);
  return {
    imageUrl: result.imageUrl || "",
    text: [
      `${result.invoice.client.companyName}様宛ての請求書を作成しました。`,
      `請求書番号：${result.invoice.invoiceNumber}`,
      `金額：${result.invoice.total}円`,
      `支払期限：${result.invoice.dueDate}`,
      summary,
    ].filter(Boolean).join("\n"),
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
    if (event.source?.type !== "user") continue; // 1:1トークのみ対応（グループ・複数人トークは対象外）

    try {
      const reply = await handleMisakiMessage(origin, event.message.text);
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
