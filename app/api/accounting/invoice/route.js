import { randomUUID } from "node:crypto";
import {
  loadAccountingData,
  nextInvoiceNumber,
  sanitizeFilename,
  saveAccountingData,
} from "@/lib/accounting";
import { sendInvoiceEmail, sendInvoiceLine } from "@/lib/notify";
import { uploadInvoiceImage, getInvoiceImageSignedUrl, downloadInvoiceImage } from "@/lib/supabaseStorage";
import { renderInvoiceImage } from "@/lib/renderInvoice";

export const runtime = "nodejs";

function calculate(items, taxMode, discount, taxRate) {
  const raw = items.reduce((sum, item) => sum + Number(item.amount || (item.quantity * item.unitPrice) || 0), 0);
  let subtotal;
  let tax;
  if (taxMode === "excluded") {
    subtotal = raw;
    tax = Math.round((subtotal - discount) * taxRate / 100);
  } else {
    const afterDiscount = Math.max(0, raw - discount);
    subtotal = Math.round(afterDiscount / (1 + taxRate / 100));
    tax = afterDiscount - subtotal;
  }
  return {
    subtotal,
    tax,
    total: taxMode === "excluded" ? subtotal - discount + tax : Math.max(0, raw - discount),
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = await loadAccountingData();
    const client = body.clientId
      ? data.clients.find(item => item.id === body.clientId)
      : body.client;
    if (!client?.companyName) return Response.json({ error: "請求先会社名が必要です。" }, { status: 400 });
    if (!body.invoiceDate) return Response.json({ error: "請求日が必要です。" }, { status: 400 });
    if (!body.dueDate) return Response.json({ error: "支払期限が必要です。" }, { status: 400 });
    const items = Array.isArray(body.items) ? body.items.filter(item => item.description && Number(item.amount || item.unitPrice)) : [];
    if (!items.length) return Response.json({ error: "請求明細と金額が必要です。" }, { status: 400 });

    const invoiceNumber = body.invoiceNumber || nextInvoiceNumber(data, body.invoiceDate);
    if (data.invoices.some(item => item.invoiceNumber === invoiceNumber)) {
      return Response.json({ error: "同じ請求書番号がすでに存在します。" }, { status: 409 });
    }
    const taxRate = Number(body.taxRate ?? data.invoiceSettings.taxRate) || 10;
    const discount = Number(body.discount) || 0;
    const totals = calculate(items, body.taxMode || data.invoiceSettings.defaultTaxMode, discount, taxRate);
    const bank = data.bankAccounts.find(item => item.id === body.bankAccountId)
      || data.bankAccounts.find(item => item.isDefault)
      || data.bankAccounts[0];
    const id = randomUUID();
    const month = String(body.invoiceDate).slice(0, 7).replace("-", "年") + "月";
    const baseName = sanitizeFilename(`請求書_${client.companyName}_${month}`);
    let filename = `${baseName}.png`;
    let suffix = 2;
    while (data.invoices.some(item => item.filename === filename)) {
      filename = `${baseName}_${String(suffix).padStart(2, "0")}.png`;
      suffix += 1;
    }
    const invoice = {
      id,
      invoiceNumber,
      clientId: client.id || "",
      client: structuredClone(client),
      invoiceDate: body.invoiceDate,
      closingDate: body.closingDate || "",
      dueDate: body.dueDate,
      period: body.period || "",
      items,
      taxMode: body.taxMode || data.invoiceSettings.defaultTaxMode,
      taxRate,
      discount,
      ...totals,
      note: body.note || "",
      bank: structuredClone(bank || {}),
      issuer: structuredClone(data.issuer),
      status: "発行済み",
      filename,
      filePath: "",
      storage: "deliverable-vault",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const pdfPayload = {
      ...invoice,
      title: data.invoiceSettings.title,
      feeNote: data.invoiceSettings.feeNote,
      note: [body.period ? `対象期間：${body.period}` : "", body.closingDate ? `締め日：${body.closingDate}` : "", body.note || data.invoiceSettings.defaultNote].filter(Boolean).join("\n"),
    };
    const image = await renderInvoiceImage(pdfPayload);

    // send channels: explicit request override, otherwise whatever the client has registered
    const requestedChannels = Array.isArray(body.sendChannels) ? body.sendChannels : null;
    const wantsEmail = requestedChannels ? requestedChannels.includes("email") : Boolean(client.email);
    const wantsLine = requestedChannels ? requestedChannels.includes("line") : Boolean(client.lineUserId);
    // set when the caller has no browser open to archive the PNG into the
    // deliverable vault itself (e.g. created via the LINE webhook) — keep a
    // server-side copy so it stays downloadable via GET ?id=
    const needsServerCopy = wantsLine || body.archiveServerCopy === true;

    const sendResults = {};
    if (wantsEmail) {
      sendResults.email = await sendInvoiceEmail({
        to: client.email,
        clientName: client.companyName,
        invoiceNumber: invoice.invoiceNumber,
        total: totals.total,
        dueDate: invoice.dueDate,
        imageBuffer: image,
        filename,
      });
    }
    if (needsServerCopy) {
      // normal flow keeps everything browser-side only (IndexedDB vault) and
      // deletes the temp render; this path uploads a copy to Supabase Storage
      // instead, since Vercel's local disk doesn't persist between requests.
      try {
        invoice.filePath = await uploadInvoiceImage(id, image);
        invoice.storage = "supabase-storage";
      } catch (error) {
        console.error("Invoice storage upload error:", error);
      }
    }
    let imageUrl = "";
    if (needsServerCopy && invoice.filePath) {
      try {
        imageUrl = await getInvoiceImageSignedUrl(id);
      } catch (error) {
        console.error("Invoice signed URL error:", error);
      }
    }
    if (wantsLine) {
      sendResults.line = await sendInvoiceLine({
        lineUserId: client.lineUserId,
        clientName: client.companyName,
        invoiceNumber: invoice.invoiceNumber,
        total: totals.total,
        dueDate: invoice.dueDate,
        imageUrl,
      });
    }
    invoice.sendResults = sendResults;

    data.invoices.unshift(invoice);
    await saveAccountingData(data);
    return Response.json({
      ok: true,
      invoice,
      sendResults,
      imageUrl,
      imageBase64: image.toString("base64"),
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return Response.json({ error: error.message || "請求書画像を作成できませんでした。" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    const data = await loadAccountingData();
    const invoice = data.invoices.find(item => item.id === id);
    if (!invoice) return Response.json({ error: "請求書が見つかりません。" }, { status: 404 });
    if (!invoice.filePath) {
      return Response.json({ error: "この請求書は完成物保管庫からダウンロードしてください。" }, { status: 410 });
    }
    const file = await downloadInvoiceImage(invoice.id);
    const isImage = String(invoice.filename).toLowerCase().endsWith(".png");
    return new Response(file, {
      headers: {
        "Content-Type": isImage ? "image/png" : "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(invoice.filename)}`,
      },
    });
  } catch (error) {
    console.error("Invoice download error:", error);
    return Response.json({ error: "請求書ファイルを読み込めませんでした。" }, { status: 500 });
  }
}
