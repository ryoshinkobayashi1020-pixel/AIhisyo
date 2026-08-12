import { searchKnowledge } from "@/lib/liverKnowledge";

export const runtime = "nodejs";
export const maxDuration = 60;

// 資料には秘密保持義務があるため、外部AIへ渡すのは「質問にヒットしたページ」だけに限定する。
// 資料一式やファイルそのものは送らない。
const PAGE_CHAR_LIMIT = 2500;
const MAX_PAGES = 8;

const ANSWER_INSTRUCTIONS = `あなたはTikTok LIVE事務所のアシスタントです。
提示された資料ページを読み込み、お客さまへそのまま送れる日本語の回答文を作成してください。

回答の作り方:
- 資料に書かれている数字・条件・期間・名称は、省略せず具体的に記載する
- 質問に直接答える一文から書き始める。前置きや遠回しな言い方をしない
- 複数の条件や段階がある場合は箇条書きで整理する
- 資料に部分的にしか書かれていない場合でも、分かる範囲は必ず答えたうえで、
  確認が必要な点だけを最後に一行添える
- 本当に資料のどこにも記載が無い事項だけ、「こちらは確認のうえ改めてご連絡いたします」と書く

守ること:
- 資料に無い数字や条件を創作しない
- 「資料によると」「抜粋には」など、社内の資料を参照していることが分かる言い回しは使わない
- 著作権表記や秘密保持の注意書きは回答へ含めない
- 挨拶や署名は付けず、本文だけを書く`;

async function composeAnswer(question, results) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { answer: "", error: "OPENAI_API_KEYが設定されていません。" };

  const pages = results
    .filter(item => item.excerpt)
    .slice(0, MAX_PAGES)
    .map(item => `--- ${item.fileName}（${item.page}ページ目）---\n${item.excerpt.slice(0, PAGE_CHAR_LIMIT)}`)
    .join("\n\n");
  if (!pages) return { answer: "", error: "" };

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
        input: `お客さまからの質問:\n${question}\n\n参照できる資料ページ:\n${pages}`,
        reasoning: { effort: "medium" },
        max_output_tokens: 2500,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { answer: "", error: data.error?.message || "回答文の生成に失敗しました。" };
    }
    if (typeof data.output_text === "string" && data.output_text.trim()) {
      return { answer: data.output_text.trim(), error: "" };
    }
    const text = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(content => content.type === "output_text")
      .map(content => content.text)
      .join("\n")
      .trim();
    return { answer: text, error: text ? "" : "回答文を生成できませんでした。" };
  } catch (error) {
    return { answer: "", error: error.message || "回答文の生成に失敗しました。" };
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const question = String(body.question || "").trim();
    if (!question) {
      return Response.json({ error: "質問内容を入力してください。" }, { status: 400 });
    }

    const results = await searchKnowledge(question, 8);
    if (!results.length) {
      return Response.json({ ok: true, answer: "", results: [], message: "登録済みの資料の中に、該当する内容が見つかりませんでした。" });
    }

    const { answer, error: answerError } = await composeAnswer(question, results);

    // 表示用の根拠一覧は資料ごとにまとめる（同じ資料の複数ページを重複表示しない）
    const seen = new Set();
    const sources = [];
    for (const item of results) {
      if (seen.has(item.documentId)) continue;
      seen.add(item.documentId);
      sources.push({
        documentId: item.documentId,
        category: item.category,
        fileName: `${item.fileName}.${item.fileExt}`,
        page: item.page,
        snippet: item.snippet,
        materialUrl: `/api/liver-assistant/materials/${item.documentId}`,
      });
    }

    return Response.json({
      ok: true,
      answer,
      message: answer ? "" : (answerError || "回答文は作成できませんでしたが、該当しそうな資料を下に表示しました。"),
      results: sources,
    });
  } catch (error) {
    return Response.json({ error: error.message || "検索に失敗しました。" }, { status: 500 });
  }
}
