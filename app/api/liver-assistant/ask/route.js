import { searchKnowledge } from "@/lib/liverKnowledge";
import { calculateReward, yenToDiamonds, REWARD_CONFIG } from "@/lib/liverReward";

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

// バディ制度は事務所報酬を投げ銭として還元する任意の仕組みであって、
// 事務所報酬そのものの計算式ではない。にもかかわらずAIが繰り返し
// 「バディ率30％」を計算根拠に使い、実際より高い金額を答えていたため明示的に禁じる。
const NO_BUDDY_BASIS = `事務所報酬の金額を答えるとき、バディ制度（バディ率・バディ報酬）を
計算の根拠に使ってはいけません。バディ制度は事務所報酬を投げ銭として還元する任意の仕組みで、
事務所報酬そのものの計算式ではありません。
事務所報酬は次の4つのインセンティブの合計です:
- ①ランクアップ／維持インセンティブ
- ②アクティブインセンティブ
- ③売上増加インセンティブ
- ④優良クリエイターインセンティブ（他プラットフォーム実績者のみ・6ヶ月限定）
いずれも「獲得ダイヤ数 × 1ダイヤあたりの単価(ドル) × 為替」で算出します。
ライバー報酬に何％かを掛けて事務所報酬を出す計算はしないでください。`;

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

${NO_BUDDY_BASIS}

${CONVERSION_SCOPE}`;

// 代理店パートナー向け。資料の数値ではなく「御社に適用される料率」を答える。
// 弊社の取り分は非開示という立場を明示するので、数値を偽らずに済む。
const AGENCY_RULES = `この回答は代理店パートナー向けです。

まず大前提として、金額は出し惜しみせず答えてください。
非開示にするのは「料率（〜％）」だけです。金額を聞かれたら必ず金額で答えます。
「担当者にご確認ください」で済ませてよいのは、資料から金額が算出できないときだけです。

御社の適用額:
- 資料に書かれている事務所報酬の金額へ70％を掛けた金額が、御社の適用額です
  （例: 資料が1,500ドルなら1,050ドル）
- 回答では「御社の事務所報酬は〜です」のように、御社に適用される条件として提示する
- 事務所報酬については金額だけを答え、料率（〜％）は書かない。
  資料に料率で書かれている場合は、具体的な金額の例に置き換えて説明する

${NO_BUDDY_BASIS}

${CONVERSION_SCOPE}

料率や弊社の取り分を聞かれたとき:
- 事務所報酬の料率、弊社の取り分、手数料の割合は、いずれも開示していません
- 「料率につきましては個別のご契約に基づくご案内となりますので、
  担当者よりご連絡いたします」と答える
- ただしこれは料率だけの話です。同じ質問の中に金額の要素があれば、金額は答えること

弊社の手数料・控除について、絶対にしてはいけないこと:
- 「手数料はありません」「差し引くことはありません」「100％お支払いします」など、
  弊社が手数料や控除を取っていないと読める書き方は、いかなる場合もしない
- 資料に「手数料なし」「全額支払い」といった記載があっても、それは他社の制度の説明なので、
  弊社の対応として書き写さない
- 手数料・取り分・控除・上乗せの有無を問われたら、有無について一切断定せず、
  上の非開示の案内だけを返す
- 資料に載っている料率の数値を、そのまま答えることはしない`;

// showSources: 根拠資料の一覧と原本リンクを画面へ返すかどうか。
// 資料には秘密保持義務があるため、社外へ渡る可能性のある窓口では原本を出さず、
// 回答文だけを見せる。社内用のなぎさだけは内容確認のために原本を開ける。
const AUDIENCES = {
  client: { includeRevenue: false, showSources: false, rules: CLIENT_RULES },
  internal: { includeRevenue: true, showSources: true, showBreakdown: true, rewardShare: REWARD_CONFIG.retained.internal, rules: INTERNAL_RULES },
  agency: { includeRevenue: true, showSources: false, showBreakdown: false, rewardShare: REWARD_CONFIG.retained.agency, guardFeeDisclosure: true, rules: AGENCY_RULES },
};

// 代理店向けの回答が、弊社の手数料・控除を「無い」と断定していないか機械的に確認する。
// LINEの自動返信では人の目が入らないため、指示だけに頼らず最後にここで止める。
// 資料にはNi-ni create側の「手数料なし」「全額支払い」という記載があり、
// モデルがそれを弊社の対応として書き写してしまうことが実際に起きた。
const FEE_DENIAL_PATTERNS = [
  /手数料(は|を)?(一切)?(かかりません|ありません|発生しません|いただ(きません|いておりません)|徴収(しません|しておりません|したりすることはありません))/,
  /手数料(なし|無し|不要)/,
  /(差し引|差引|控除|天引き)(く|いた)?(ことは)?(ありません|ございません|いたしません|しません)/,
  /(上乗せ)(する)?(ことは)?(ありません|ございません)/,
  /(100|１００)ぱーせんと|(100|１００)％(を)?(そのまま)?(お支払い|お渡し|支給)/,
  /全額(を)?(そのまま)?(お支払い|お渡し|支給)/,
];

const FEE_DISCLOSURE_FALLBACK = `事務所報酬の料率につきましては、個別のご契約に基づくご案内となりますので、担当者よりご連絡いたします。

ご不明な点がございましたら、担当者までお問い合わせください。`;

// 手数料を否定している文だけを取り除く。
// 回答ごと差し替えると、正しく算出できていた金額まで消えてしまい、
// 「細かい数字になると答えてくれない」状態になる。
export function stripFeeDenials(answer) {
  const lines = String(answer || "").split("\n");
  const kept = [];
  let removed = false;
  for (const line of lines) {
    const sentences = line.split(/(?<=。)/);
    const keptSentences = sentences.filter(sentence => {
      const normalized = sentence.replace(/\s+/g, "");
      if (!normalized) return true;
      const hit = FEE_DENIAL_PATTERNS.some(pattern => pattern.test(normalized));
      if (hit) removed = true;
      return !hit;
    });
    const rebuilt = keptSentences.join("").trimEnd();
    // 文をすべて落とした行（箇条書きなど）は行ごと捨てる
    if (!rebuilt && line.trim()) continue;
    kept.push(rebuilt);
  }
  const result = kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { text: result, removed };
}

// 「100万円投げられたら事務所にいくら入る？」のような金額の質問は、
// AIに計算させるとダイヤ換算や料率の取り違えが起きるため、ここで判定してコードで計算する。
function parseJapaneseAmount(text) {
  const normalized = String(text).replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)).replace(/,/g, "");
  const unit = /ダイヤ|だいや|diamond/i.test(normalized) ? "diamond" : "yen";
  const oku = normalized.match(/(\d+(?:\.\d+)?)\s*億/);
  const man = normalized.match(/(\d+(?:\.\d+)?)\s*万/);
  const plain = normalized.match(/(\d{3,})\s*(?:円|ダイヤ)/);
  let value = 0;
  if (oku) value += Number(oku[1]) * 100_000_000;
  if (man) value += Number(man[1]) * 10_000;
  if (!value && plain) value = Number(plain[1]);
  return value > 0 ? { value, unit } : null;
}

function isRewardAmountQuestion(text) {
  const value = String(text);
  // 「100万投げられたら？」のように述語が省略される聞き方も拾う。
  // 金額かダイヤ数が書かれていることは呼び出し側で確認している。
  return /(いくら|何円|どれくらい|どのくらい|金額|報酬|入る|入って|受け取|もらえ|なる)/.test(value);
}

function yen(value) {
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}

function buildRewardAnswer(question, audience) {
  if (!audience.includeRevenue || !isRewardAmountQuestion(question)) return null;
  const parsed = parseJapaneseAmount(question);
  if (!parsed) return null;

  const diamonds = parsed.unit === "diamond" ? parsed.value : yenToDiamonds(parsed.value);
  const keep = calculateReward({ diamonds, rankMovement: "keep" });
  const up = calculateReward({ diamonds, rankMovement: "up" });

  // ①ランクアップ/維持の単価は、資料から読み取れていないランクがある。
  // その場合でも②③は確定しているので、①を除いた金額を「最低限これだけは入る額」として答える。
  // 黙って少なく見せることになるため、変動する旨を必ず添える。
  const baseOnly = calculateReward({ diamonds, rankMovement: "down" });

  const share = audience.rewardShare;
  const lines = [];

  // ②③だけでも算出できなければ、金額は出さない
  if (baseOnly.unresolved.length) return null;

  if (audience.showBreakdown) {
    lines.push(`${parsed.unit === "diamond" ? `${parsed.value.toLocaleString("ja-JP")}ダイヤ` : yen(parsed.value)}の場合、獲得ダイヤは約${diamonds.toLocaleString("ja-JP")}ダイヤ（ランク${keep.rank}）です。`);
    lines.push("");
    lines.push(`・ライバー報酬：${yen(keep.liverReward)}`);
    lines.push("");
    if (!keep.unresolved.length) {
      lines.push("【ランク維持の場合】");
      for (const item of keep.breakdown) lines.push(`・${item.label}：${item.note || yen(item.amount)}`);
      lines.push(`・事務所報酬 合計：${yen(keep.total)}`);
      lines.push(`・弊社受取：${yen(keep.total * share)}`);
    } else {
      lines.push("【ランクアップ／維持インセンティブを除いた分】");
      for (const item of baseOnly.breakdown.filter(item => item.key !== "rank")) lines.push(`・${item.label}：${yen(item.amount)}`);
      lines.push(`・小計：${yen(baseOnly.total)}`);
      lines.push(`・弊社受取：${yen(baseOnly.total * share)}`);
      lines.push(`※ランク${keep.rank}の維持単価が資料から確定できていないため、①の分は含まれていません。実際はこれより多くなります。`);
    }
    if (!up.unresolved.length) {
      lines.push("");
      lines.push("【ランクアップの場合】");
      for (const item of up.breakdown) lines.push(`・${item.label}：${item.note || yen(item.amount)}`);
      lines.push(`・事務所報酬 合計：${yen(up.total)}`);
      lines.push(`・弊社受取：${yen(up.total * share)}`);
    }
  } else {
    // 代理店向けは金額のみ。内訳や料率は出さない。
    if (!keep.unresolved.length) {
      lines.push(`ランクを維持された場合、御社の事務所報酬は約${yen(keep.total * share)}です。`);
      if (!up.unresolved.length) lines.push(`ランクアップされた場合は約${yen(up.total * share)}となります。`);
    } else {
      // ①が確定していない状態で断定すると少なく伝えてしまうため、下限として示す
      lines.push(`御社の事務所報酬は、${yen(baseOnly.total * share)}以上となる見込みです。`);
      lines.push("ランクの推移によってはこれに加算されますので、確定額は担当者よりご案内いたします。");
    }
    lines.push("");
    lines.push("実際の金額は、配信日数や獲得ダイヤ数などの状況により変動いたします。");
  }
  return lines.join("\n");
}

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

    // 金額の質問はAIに計算させず、確定した料率からコードで算出する。
    const computed = buildRewardAnswer(question, audience);
    if (computed) {
      return Response.json({ ok: true, answer: computed, message: "", results: [] });
    }

    const results = await searchKnowledge(question, 8, { includeRevenue: audience.includeRevenue });
    if (!results.length) {
      return Response.json({ ok: true, answer: "", results: [], message: "登録済みの資料の中に、該当する内容が見つかりませんでした。" });
    }

    let { answer, error: answerError } = await composeAnswer(question, results, audience);

    // 代理店向けで手数料の有無を断定してしまった文だけを取り除く。
    // 残りが無くなった場合にかぎり、非開示の案内へ差し替える。
    if (audience.guardFeeDisclosure && answer) {
      const { text, removed } = stripFeeDenials(answer);
      if (removed) answer = text || FEE_DISCLOSURE_FALLBACK;
    }

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
