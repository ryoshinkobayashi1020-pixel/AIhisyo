import { loadAccountingData } from "@/lib/accounting";

export const runtime = "nodejs";

function matchValue(text, labels) {
  const match = text.match(new RegExp(`(?:${labels})(?:は|：|:)?\\s*([^\\n。]+)`));
  return match?.[1]?.trim() || "";
}

function parseAmount(value) {
  const text = String(value || "").replace(/[,，\s]/g, "");
  const man = text.match(/(\d+)万(\d*)/);
  return man ? Number(man[1]) * 10000 + Number(man[2] || 0) : Number(text.replace(/\D/g, "")) || 0;
}

function parseClient(text, existing = {}) {
  const corporation = text.match(/((?:株式会社|合同会社|有限会社|一般社団法人|医療法人|社会福祉法人)[^\n、。]+|[^\n、。]+(?:株式会社|合同会社|有限会社))/)?.[1]?.trim();
  const first = text.split(/[\n、。]/).map(value => value.trim()).find(Boolean) || "";
  const explicitType = matchValue(text, "区分");
  const clientType = /個人/.test(explicitType || text.slice(0, 80)) && !corporation ? "individual" : corporation ? "company" : existing.clientType || "individual";
  const name = corporation || matchValue(text, "法人名|会社名|個人名|氏名|名前") || existing.companyName || first.replace(/^(?:個人の請求先|個人)[：:\s]*/, "");
  const postal = text.match(/〒?\s*(\d{3})-?(\d{4})/);
  const address = matchValue(text, "住所") || (postal
    ? text.slice((postal.index || 0) + postal[0].length).split(/[。\n]/)[0].replace(/^[、,\s]+/, "").trim()
    : existing.address || "");
  const aliasesText = matchValue(text, "呼び名|別名|音声認識候補");
  const amountText = matchValue(text, "通常金額|通常の金額");
  return {
    ...existing,
    companyName: name,
    clientType,
    kana: matchValue(text, "フリガナ|ふりがな") || existing.kana || "",
    shortName: matchValue(text, "略称") || existing.shortName || "",
    aliases: aliasesText ? aliasesText.split(/[,、／]/).map(value => value.trim()).filter(Boolean) : existing.aliases || [],
    postalCode: postal ? `${postal[1]}-${postal[2]}` : existing.postalCode || "",
    address,
    building: matchValue(text, "建物名|ビル名") || existing.building || "",
    department: matchValue(text, "部署|部門") || existing.department || "",
    contactName: matchValue(text, "担当者|担当")?.replace(/さん$/, "") || existing.contactName || "",
    contactTitle: matchValue(text, "担当者役職|役職") || existing.contactTitle || "",
    phone: text.match(/0\d{1,4}-\d{1,4}-\d{3,4}/)?.[0] || existing.phone || "",
    email: text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || existing.email || "",
    lineUserId: matchValue(text, "LINEユーザーID|LINE ID|LINEアイディー|LINEアイディ") || existing.lineUserId || "",
    registrationNumber: matchValue(text, "登録番号|適格請求書発行事業者登録番号") || existing.registrationNumber || "",
    closingDay: matchValue(text, "締め日") || existing.closingDay || "",
    paymentDay: matchValue(text, "支払日") || existing.paymentDay || "",
    paymentTerms: matchValue(text, "支払条件") || text.match(/(?:月末|20日)締め(?:翌月末|翌月\d+日)払い/)?.[0] || existing.paymentTerms || "",
    defaultItem: matchValue(text, "通常の請求項目|通常請求項目") || existing.defaultItem || "",
    defaultAmount: amountText ? parseAmount(amountText) : Number(existing.defaultAmount) || 0,
    taxMode: /税抜/.test(amountText || text) ? "excluded" : existing.taxMode || "included",
    feeBearer: existing.feeBearer || "client",
    note: matchValue(text, "備考") || existing.note || "",
    active: true,
  };
}

export async function POST(request) {
  try {
    const { instruction = "", clientId = "" } = await request.json();
    const text = String(instruction).trim().slice(0, 10000);
    if (!text) return Response.json({ error: "請求先情報を一つの入力枠へまとめて入力してください。" }, { status: 400 });
    const data = await loadAccountingData();
    const existing = data.clients.find(client => client.id === clientId) || {};
    return Response.json({ client: { ...parseClient(text, existing), id: existing.id || "" }, processingMode: "local-template" });
  } catch (error) {
    console.error("Client local parse error:", error);
    return Response.json({ error: "請求先情報を整理できませんでした。" }, { status: 500 });
  }
}
