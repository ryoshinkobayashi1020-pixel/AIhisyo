import { findClientCandidates, loadAccountingData } from "@/lib/accounting";

export const runtime = "nodejs";

const DEFAULT_MODEL = "gpt-5.6-luna";

const PARSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    clientId: { type: "string" },
    clientSpokenName: { type: "string" },
    invoiceDate: { type: "string" },
    dueDate: { type: "string" },
    closingDate: { type: "string" },
    period: { type: "string" },
    taxMode: { type: "string", enum: ["included", "excluded"] },
    discount: { type: "number" },
    note: { type: "string" },
    invoiceNumber: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          description: { type: "string" },
          quantity: { type: "number" },
          unit: { type: "string" },
          unitPrice: { type: "number" },
          amount: { type: "number" },
          taxRate: { type: "number" },
        },
        required: ["description", "quantity", "unit", "unitPrice", "amount", "taxRate"],
      },
    },
  },
  required: [
    "clientId", "clientSpokenName", "invoiceDate", "dueDate", "closingDate",
    "period", "taxMode", "discount", "note", "invoiceNumber", "items",
  ],
};

function parseSchemaForClients(clients) {
  return {
    ...PARSE_SCHEMA,
    properties: {
      ...PARSE_SCHEMA.properties,
      clientId: {
        type: "string",
        enum: ["", ...clients.map(client => client.id)],
      },
    },
  };
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return "";
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function endOfMonth(date, offset = 0) {
  return isoDate(new Date(date.getFullYear(), date.getMonth() + offset + 1, 0, 12));
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? value : "";
}

function dueDateFromRegisteredClient(client, invoiceDateText) {
  if (!client || !validDate(invoiceDateText)) return "";
  const invoiceDate = new Date(`${invoiceDateText}T12:00:00`);
  const terms = `${client.paymentTerms || ""} ${client.paymentDay || ""}`;
  if (/翌々月.*末/.test(terms)) return endOfMonth(invoiceDate, 2);
  if (/翌月.*末/.test(terms)) return endOfMonth(invoiceDate, 1);
  if (/(?:当月|同月).*末|当月末払い|^末日$|\s末日(?:\s|$)/.test(terms)) return endOfMonth(invoiceDate, 0);
  const nextMonthDay = terms.match(/翌月\s*(\d{1,2})日/);
  if (nextMonthDay) {
    return isoDate(new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() + 1, Number(nextMonthDay[1]), 12));
  }
  const currentMonthDay = terms.match(/(?:当月)?\s*(\d{1,2})日(?:払い)?/);
  if (currentMonthDay) {
    return isoDate(new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), Number(currentMonthDay[1]), 12));
  }
  return "";
}

function registeredClientSummary(clients) {
  return clients
    .filter(client => client.active !== false)
    .map(client => ({
      id: client.id,
      name: client.companyName,
      type: client.clientType === "individual" ? "個人" : "法人",
      shortName: client.shortName || "",
      aliases: client.aliases || [],
      kana: client.kana || "",
      paymentTerms: client.paymentTerms || "",
      defaultItem: client.defaultItem || "",
      defaultAmount: Number(client.defaultAmount) || 0,
      defaultTaxMode: client.taxMode || "included",
    }));
}

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "請求内容の読み取りAPIが設定されていません。" }, { status: 503 });
    }

    const { instruction = "" } = await request.json();
    const text = String(instruction).trim().slice(0, 10000);
    if (!text) return Response.json({ error: "音声またはテキストの内容がありません。" }, { status: 400 });

    const data = await loadAccountingData();
    const activeClients = data.clients.filter(client => client.active !== false);
    const today = new Date();
    const prompt = `あなたは合同会社良心の請求書入力アシスタントです。
音声認識された依頼から請求書データを整理してください。

現在日: ${isoDate(today)}
音声指示:
${text}

登録済みクライアント:
${JSON.stringify(registeredClientSummary(activeClients), null, 2)}

必須ルール:
- 請求先は登録済みクライアントだけから選び、明確に対応する1件のidをclientIdへ入れる
- 正式名と多少違っても、呼び名・略称・読み方・文脈が一致する登録先を選ぶ
- 判断できなければclientIdを空文字にする。新しい会社や個人を作らない
- 言い直しは最後に明確に話した内容を採用する
- 「今日」「来月末」などは現在日を基準にYYYY-MM-DDへ変換する
- 請求日の指定がなければ現在日を使う
- 支払期限が音声にない場合は空文字にする（登録済み支払条件はサーバー側で適用する）
- ユーザーが口頭で伝える金額は、すべて消費税込みの総額として扱い、taxModeは必ずincludedにする
- 数量がなければ1、単位がなければ「式」
- 金額と項目を勝手に補わない。ただし登録先の通常項目・通常金額があり、ユーザーがそれを使うと明確に述べた場合だけ使用する
- 金額は円単位の数値にする。「3万3千円」は33000
- 税込金額へ消費税を重ねて加えない`;

    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ACCOUNTING_PARSE_MODEL || process.env.OFFICE_ROUTER_MODEL || DEFAULT_MODEL,
        input: prompt,
        reasoning: { effort: "none" },
        text: {
          format: {
            type: "json_schema",
            name: "invoice_instruction",
            strict: true,
            schema: parseSchemaForClients(activeClients),
          },
        },
      }),
    });
    const apiData = await openAIResponse.json();
    if (!openAIResponse.ok) {
      console.error("Invoice parse API error:", openAIResponse.status, apiData);
      return Response.json({ error: "請求内容を読み取れませんでした。" }, { status: openAIResponse.status });
    }

    const parsed = JSON.parse(extractOutputText(apiData));
    let client = activeClients.find(item => item.id === parsed.clientId) || null;
    if (!client && parsed.clientSpokenName) {
      const candidates = findClientCandidates(activeClients, parsed.clientSpokenName);
      if (candidates.length === 1) client = candidates[0].client;
    }
    if (!client) {
      const candidates = findClientCandidates(activeClients, text);
      if (candidates.length === 1) client = candidates[0].client;
    }

    const questions = [];
    if (!client) questions.push("登録済みクライアントを特定できませんでした。登録名または呼び名を伝えてください。");
    const invoiceDate = validDate(parsed.invoiceDate) || isoDate(today);
    const dueDate = validDate(parsed.dueDate) || dueDateFromRegisteredClient(client, invoiceDate);
    if (client && !dueDate) questions.push("このクライアントには支払期限が登録されていません。支払期限を伝えてください。");
    const configuredTaxRate = Number(data.invoiceSettings?.taxRate) || 10;
    const items = Array.isArray(parsed.items)
      ? parsed.items
        .filter(item => item.description && Number(item.amount || item.unitPrice) > 0)
        .map(item => {
          const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
          const unitPrice = Number(item.unitPrice) || Number(item.amount) || 0;
          const amount = Number(item.amount) || quantity * unitPrice;
          return {
            description: String(item.description).trim(),
            quantity,
            unit: String(item.unit || "式").trim() || "式",
            unitPrice,
            amount,
            taxRate: configuredTaxRate,
          };
        })
      : [];
    if (!items.length) questions.push("請求項目と金額を確認してください。");

    return Response.json({
      clientId: client?.id || "",
      clientQuery: client?.companyName || parsed.clientSpokenName || "",
      contactName: client?.contactName || "",
      invoiceDate,
      dueDate,
      closingDate: validDate(parsed.closingDate),
      period: parsed.period || "",
      items,
      // Misaki's spoken invoice amounts are always final tax-inclusive totals.
      taxMode: "included",
      discount: Math.max(0, Number(parsed.discount) || 0),
      note: parsed.note || "",
      bankAccountId: "",
      contactId: "",
      invoiceNumber: parsed.invoiceNumber || "",
      confidence: questions.length ? "low" : "high",
      questions,
      processingMode: "api-with-registered-data",
    });
  } catch (error) {
    console.error("Invoice API parse error:", error);
    return Response.json({ error: "請求内容を整理できませんでした。" }, { status: 500 });
  }
}
