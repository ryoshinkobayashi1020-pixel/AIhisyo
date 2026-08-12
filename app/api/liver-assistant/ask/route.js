import { searchKnowledge } from "@/lib/liverKnowledge";

export const runtime = "nodejs";

// 資料には秘密保持義務があるため、外部AIへ渡すのは「質問にヒットした抜粋」だけに限定する。
// 資料全文やファイル一式は送らない。
const EXCERPT_LIMIT = 700;

const ANSWER_INSTRUCTIONS = `あなたはライバー事務所のアシスタントです。
提示された資料の抜粋だけを根拠に、お客さまへそのまま送れる日本語の回答文を作成してください。

守ること:
- 抜粋に書かれていない事実を推測で補わない。抜粋だけでは答えられない場合は、その旨を丁寧に伝える
- 敬体（です・ます）で、丁寧かつ簡潔に書く
- 箇条書きが分かりやすい場合は使ってよい
- 「資料によると」「抜粋には」といった内部事情を示す言い回しは使わない
- 資料の秘密保持に関する注意書きや著作権表記は回答へ含めない
- 挨拶や署名は付けず、本文だけを書く`;

async function composeAnswer(question, results) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "";

  const excerpts = results
    .filter(item => item.excerpt)
    .map((item, index) => `【抜粋${index + 1}】${item.excerpt.slice(0, EXCERPT_LIMIT)}`)
    .join("\n\n");
  if (!excerpts) return "";

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.LIVER_ANSWER_MODEL || "gpt-5.6-luna",
        instructions: ANSWER_INSTRUCTIONS,
        input: `お客さまからの質問:\n${question}\n\n資料の抜粋:\n${excerpts}`,
        reasoning: { effort: "low" },
        max_output_tokens: 1200,
      }),
    });
    const data = await response.json();
    if (!response.ok) return "";
    if (typeof data.output_text === "string") return data.output_text.trim();
    return (data.output || [])
      .flatMap(item => item.content || [])
      .filter(content => content.type === "output_text")
      .map(content => content.text)
      .join("\n")
      .trim();
  } catch {
    return "";
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const question = String(body.question || "").trim();
    if (!question) {
      return Response.json({ error: "質問内容を入力してください。" }, { status: 400 });
    }

    const results = await searchKnowledge(question, 5);
    if (!results.length) {
      return Response.json({ ok: true, answer: "", results: [], message: "登録済みの資料の中に、該当する内容が見つかりませんでした。" });
    }

    const answer = await composeAnswer(question, results);

    return Response.json({
      ok: true,
      answer,
      results: results.map(item => ({
        documentId: item.documentId,
        category: item.category,
        fileName: `${item.fileName}.${item.fileExt}`,
        page: item.page,
        snippet: item.snippet,
        materialUrl: `/api/liver-assistant/materials/${item.documentId}`,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message || "検索に失敗しました。" }, { status: 500 });
  }
}
