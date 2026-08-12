import { searchKnowledge } from "@/lib/liverKnowledge";

export const runtime = "nodejs";
export const maxDuration = 60;

// 資料には秘密保持義務があるため、外部AIへ渡すのは「質問にヒットしたページ」だけに限定する。
// 資料一式やファイルそのものは送らない。
const PAGE_CHAR_LIMIT = 2500;
const MAX_PAGES = 8;

const BASE_INSTRUCTIONS = `あなたはTikTok LIVE事務所のアシスタントです。
提示された資料ページを読み込み、そのまま送れる日本語の回答文を作成してください。

回答の作り方:
- 資料に書かれている数字・条件・期間・名称は、省略せず具体的に記載する
- 質問に直接答える一文から書き始める。前置きや遠回しな言い方をしない
- 複数の条件や段階がある場合は箇条書きで整理する
- 資料に部分的にしか書かれていない場合でも、分かる範囲は必ず答えたうえで、
  確認が必要な点だけを最後に一行添える

記載が見つからなかったときの書き方:
- 「記載がありません」「資料にございません」のような、突き放した言い方はしない
- 禁止や制限の案内が見当たらない事柄については、
  「TikTok運営から明確にNGとの案内は出ていない認識です」
  「現時点で禁止されているという案内は確認できておりません」
  のように、前向きな言い回しにしたうえで、
  「念のため確認のうえ、改めてご連絡いたします」と続ける
- ただし、提示されたページに禁止事項・違反・ペナルティ・注意事項として
  その内容が書かれている場合は、上の言い回しを使ってはいけない。
  その場合は制限があることを明確に伝える
- 金額・料率・期間など、事実として確定させる必要がある数値が見当たらない場合も、
  上の言い回しは使わず「確認のうえ改めてご連絡いたします」とだけ書く

書式（そのままLINEやメールへ貼れる形にする）:
- プレーンテキストで書く。「**」による太字や「#」による見出しなどの記号は使わない
- 箇条書きは行頭に「・」を使う。入れ子にする場合は全角スペース2つで字下げする
- 手順を示す場合は「1.」「2.」のような番号を使う

守ること:
- 資料に無い数字や条件を創作しない
- 「資料によると」「抜粋には」など、社内の資料を参照していることが分かる言い回しは使わない
- 資料名・ファイル名・ページ番号を回答へ書かない
- 「詳しくは〇〇の資料をご確認ください」のように、社内資料へ誘導する書き方をしない
- 著作権表記や秘密保持の注意書きは回答へ含めない
- 挨拶や署名は付けず、本文だけを書く`;

// クライアント（ライバー本人・見込み客）向け。事務所側の収益条件は一切出さない。
// 検索側でも該当資料を除外しているため、ここは二重の歯止め。
const CLIENT_RULES = `この回答はクライアントへ提示するものです。次の内容は、たとえ資料ページに
書かれていても回答へ一切含めないでください:
- 事務所報酬、事務所の取り分、報酬率、バディ率・バディ報酬
- 代理店のロイヤリティ、紹介料、弊社利益分などの収益条件
- 事務所向けのインセンティブや売上シェアの金額・料率
これらを聞かれた場合は、金額や条件には触れず
「担当者より個別にご案内いたします」とだけ書いてください。
（ライバー本人が受け取るクリエイター報酬・ライバー報酬の説明は含めて構いません）`;

// 換算対象を取り違えないための共通ルール。
// 事務所報酬以外の数値まで掛け算してしまうと、罰金額や実績値まで狂う。
const CONVERSION_SCOPE = `すべての事務所報酬の数値へ漏れなく適用してください。1か所だけ換算して
他を元のまま残すと、金額と料率が食い違って辻褄が合わなくなります。特に忘れやすいのは:
- 「4％〜30％」のような範囲や幅（両端とも換算する）
- 「最大〜％」「上限〜ドル」のような上限値
- レベル別・ランク別の一覧表に並ぶすべての数値
- 補足や注記の中に出てくる数値
書き終えたら、本文の計算例とあとに書いた料率が矛盾していないか確認してください。

換算してはいけないもの（資料の数値をそのまま使う）:
- ライバー本人が受け取るクリエイター報酬・ライバー報酬
- ダイヤ数、視聴数、時間、日数などの実績値
- 罰金額やペナルティ金額
- 応募条件、期間、開催日などの数値`;

// 社内スタッフ向け。弊社が実際に受け取る額で答える。
const INTERNAL_RULES = `この回答は社内スタッフ向けです。事務所報酬は、弊社が実際に受け取る額で答えてください。

- 資料に書かれている事務所報酬の金額・料率へ80％を掛けた数値が、弊社の受取額です
  （例: 資料が1,500ドルなら1,200ドル、資料が30％なら21％）
- ${CONVERSION_SCOPE}`;

// 代理店パートナー向け。資料の数値ではなく「御社に適用される料率」を答える。
// 弊社の取り分は非開示という立場を明示するので、数値を偽らずに済む。
const AGENCY_RULES = `この回答は代理店パートナー向けです。事務所報酬について答えるときは、
資料の数値をそのまま出すのではなく「御社に適用される料率・金額」を答えてください。

御社の適用額:
- 資料に書かれている事務所報酬の金額へ70％を掛けた金額が、御社の適用額です
  （例: 資料が1,500ドルなら1,050ドル）
- 回答では「御社の事務所報酬は〜です」のように、御社に適用される条件として提示する
- 事務所報酬については金額だけを答え、料率（〜％）は書かない。
  資料に料率で書かれている場合は、具体的な金額の例に置き換えて説明する
- ${CONVERSION_SCOPE}

料率や弊社の取り分を聞かれたとき:
- 事務所報酬の料率、弊社の取り分、手数料の割合は、いずれも開示していません
- 「料率につきましては個別のご契約に基づくご案内となりますので、
  担当者よりご連絡いたします」のように、非開示であることを伝える
- 取り分が存在しない、手数料は無い、といった否定の書き方はしない
- 資料に載っている料率の数値を、そのまま答えることはしない`;

// showSources: 根拠資料の一覧と原本リンクを画面へ返すかどうか。
// 資料には秘密保持義務があるため、社外へ渡る可能性のある窓口では原本を出さず、
// 回答文だけを見せる。社内用のなぎさだけは内容確認のために原本を開ける。
const AUDIENCES = {
  client: { includeRevenue: false, showSources: false, rules: CLIENT_RULES },
  internal: { includeRevenue: true, showSources: true, rules: INTERNAL_RULES },
  agency: { includeRevenue: true, showSources: false, rules: AGENCY_RULES },
};

async function composeAnswer(question, results, audience) {
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
        instructions: `${BASE_INSTRUCTIONS}\n\n${audience.rules}`,
        input: `質問:\n${question}\n\n参照できる資料ページ:\n${pages}`,
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

    const audience = AUDIENCES[String(body.audience || "client")] || AUDIENCES.client;

    const results = await searchKnowledge(question, 8, { includeRevenue: audience.includeRevenue });
    if (!results.length) {
      return Response.json({ ok: true, answer: "", results: [], message: "登録済みの資料の中に、該当する内容が見つかりませんでした。" });
    }

    const { answer, error: answerError } = await composeAnswer(question, results, audience);

    // 社外へ渡る窓口では、資料名も抜粋も原本リンクも返さない。回答文だけを見せる。
    const sources = [];
    if (audience.showSources) {
      // 根拠一覧は資料ごとにまとめる（同じ資料の複数ページを重複表示しない）
      const seen = new Set();
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
    }

    return Response.json({
      ok: true,
      answer,
      message: answer ? "" : (answerError || "回答文を作成できませんでした。"),
      results: sources,
    });
  } catch (error) {
    return Response.json({ error: error.message || "検索に失敗しました。" }, { status: 500 });
  }
}
