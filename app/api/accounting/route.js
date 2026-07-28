import { randomUUID } from "node:crypto";
import { loadAccountingData, saveAccountingData } from "@/lib/accounting";

export const runtime = "nodejs";

export async function GET() {
  try {
    return Response.json(await loadAccountingData());
  } catch (error) {
    console.error("Accounting data read error:", error);
    return Response.json({ error: "経理データを読み込めませんでした。" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = await loadAccountingData();
    const action = String(body?.action || "");

    if (action === "save-settings") {
      data.issuer = { ...data.issuer, ...(body.issuer || {}) };
      data.invoiceSettings = { ...data.invoiceSettings, ...(body.invoiceSettings || {}) };
      if (Array.isArray(body.bankAccounts) && body.bankAccounts.length) data.bankAccounts = body.bankAccounts;
      if (Array.isArray(body.contacts)) data.contacts = body.contacts;
    } else if (action === "save-client") {
      const incoming = body.client || {};
      const id = incoming.id || randomUUID();
      const client = {
        id,
        companyName: String(incoming.companyName || "").trim(),
        clientType: incoming.clientType === "individual" ? "individual" : "company",
        kana: String(incoming.kana || "").trim(),
        shortName: String(incoming.shortName || "").trim(),
        aliases: Array.isArray(incoming.aliases) ? incoming.aliases.filter(Boolean) : [],
        postalCode: String(incoming.postalCode || "").trim(),
        address: String(incoming.address || "").trim(),
        building: String(incoming.building || "").trim(),
        department: String(incoming.department || "").trim(),
        contactName: String(incoming.contactName || "").trim(),
        contactTitle: String(incoming.contactTitle || "").trim(),
        phone: String(incoming.phone || "").trim(),
        email: String(incoming.email || "").trim(),
        lineUserId: String(incoming.lineUserId || "").trim(),
        lineTargetType: ["user", "group", "room"].includes(incoming.lineTargetType) ? incoming.lineTargetType : "",
        registrationNumber: String(incoming.registrationNumber || "").trim(),
        closingDay: String(incoming.closingDay || "").trim(),
        paymentDay: String(incoming.paymentDay || "").trim(),
        paymentTerms: String(incoming.paymentTerms || "").trim(),
        defaultItem: String(incoming.defaultItem || "").trim(),
        defaultAmount: Number(incoming.defaultAmount) || 0,
        taxMode: incoming.taxMode || "included",
        feeBearer: incoming.feeBearer || "client",
        note: String(incoming.note || "").trim(),
        active: incoming.active !== false,
        updatedAt: new Date().toISOString(),
      };
      if (!client.companyName) return Response.json({ error: "法人名または個人名は必須です。" }, { status: 400 });
      const index = data.clients.findIndex(item => item.id === id);
      if (index >= 0) data.clients[index] = { ...data.clients[index], ...client };
      else data.clients.push({ ...client, createdAt: new Date().toISOString() });
    } else if (action === "set-line-target") {
      const client = data.clients.find(item => item.id === body.clientId);
      const targetType = ["group", "room"].includes(body.targetType) ? body.targetType : "";
      const targetId = String(body.targetId || "").trim();
      if (!client) return Response.json({ error: "登録済みの請求先が見つかりません。" }, { status: 404 });
      if (!targetType || !targetId) return Response.json({ error: "LINE送信先を特定できません。" }, { status: 400 });
      client.lineUserId = targetId;
      client.lineTargetType = targetType;
      client.updatedAt = new Date().toISOString();
    } else if (action === "delete-client") {
      const client = data.clients.find(item => item.id === body.clientId);
      if (client) client.active = false;
    } else if (action === "update-status") {
      const invoice = data.invoices.find(item => item.id === body.invoiceId);
      if (invoice) {
        invoice.status = String(body.status || invoice.status);
        invoice.updatedAt = new Date().toISOString();
      }
    } else {
      return Response.json({ error: "未対応の操作です。" }, { status: 400 });
    }

    return Response.json({ ok: true, data: await saveAccountingData(data) });
  } catch (error) {
    console.error("Accounting data write error:", error);
    return Response.json({ error: "経理データを保存できませんでした。" }, { status: 500 });
  }
}
