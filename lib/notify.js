// 請求書の自動送信（メール／LINE）。
// どちらもAPIキー未設定なら送信をスキップし、理由を返すだけで例外を投げない
// （送信できなくても請求書自体の作成は止めない）。

export async function sendInvoiceEmail({ to, clientName, invoiceNumber, total, dueDate, imageBuffer, filename }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INVOICE_EMAIL_FROM;
  if (!apiKey || !from) {
    return { ok: false, skipped: true, reason: "RESEND_API_KEY または INVOICE_EMAIL_FROM が未設定です。" };
  }
  if (!to) return { ok: false, skipped: true, reason: "請求先にメールアドレスが登録されていません。" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `【${clientName}様】請求書のお届け（請求書番号：${invoiceNumber}）`,
        html: `<p>${escapeHtml(clientName)} 様</p><p>いつもお世話になっております。請求書をお送りいたします。</p><ul><li>請求書番号：${escapeHtml(invoiceNumber)}</li><li>請求金額：${escapeHtml(String(total))}円</li><li>お支払期限：${escapeHtml(dueDate)}</li></ul><p>添付の画像をご確認ください。</p>`,
        attachments: [
          {
            filename: filename.endsWith(".png") ? filename : `${filename}.png`,
            content: imageBuffer.toString("base64"),
          },
        ],
      }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return { ok: false, skipped: false, reason: `メール送信に失敗しました（${response.status}）：${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, skipped: false, reason: `メール送信に失敗しました：${error.message}` };
  }
}

export async function sendInvoiceLine({ lineUserId, clientName, invoiceNumber, total, dueDate, imageUrl }) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const publicBaseUrl = process.env.PUBLIC_BASE_URL;
  if (!token) return { ok: false, skipped: true, reason: "LINE_CHANNEL_ACCESS_TOKEN が未設定です。" };
  if (!lineUserId) return { ok: false, skipped: true, reason: "請求先にLINE送信先が登録されていません。" };
  if (!publicBaseUrl || !/^https:\/\//.test(publicBaseUrl)) {
    return { ok: false, skipped: true, reason: "PUBLIC_BASE_URL が未設定、またはhttpsではありません。LINEの画像送信には公開HTTPS URLが必須です（localhostでは送れません）。" };
  }

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [
          {
            type: "image",
            originalContentUrl: imageUrl,
            previewImageUrl: imageUrl,
          },
          {
            type: "text",
            text: `${clientName}様\n請求書をお送りしました。\n請求書番号：${invoiceNumber}\n請求金額：${total}円\nお支払期限：${dueDate}`,
          },
        ],
      }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return { ok: false, skipped: false, reason: `LINE送信に失敗しました（${response.status}）：${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, skipped: false, reason: `LINE送信に失敗しました：${error.message}` };
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
