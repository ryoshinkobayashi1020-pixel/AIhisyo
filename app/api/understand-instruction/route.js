const DEFAULT_MODEL = "gpt-5.6-luna";

const STAFF = [
  ["reina", "SPIテスト担当"],
  ["sakura", "漢字テスト担当"],
  ["takumi", "算数テスト担当"],
  ["asuka", "応募者との面接専用（面接を開始する）"],
  ["elf_sketch", "えるふろんてぃあの寸劇系TikTok台本制作"],
  ["elf_if", "えるふろんてぃあのもしもシリーズ系TikTok台本制作"],
  ["elf_lively", "えるふろんてぃあのにぎやか・わちゃわちゃ系TikTok台本制作"],
  ["elf_jobs", "えるふろんてぃあの求人系TikTok台本制作"],
  ["mana_jobs", "マナコーポレーションの求人TikTok台本制作"],
  ["mana_narration", "マナコーポレーション代表者の一人語りTikTok台本制作。経営観、仕事観、人との向き合い方を語る台本"],
  ["mana_staff_dialogue", "マナコーポレーションの瀬川社長と美容室スタッフによる駆け引き、質疑応答、反論型TikTok台本制作"],
  ["miyabis_ads", "ミヤビスの広告TikTok台本制作"],
  ["kabayaki_script", "かばやき屋のTikTok運用代行・台本制作"],
  ["invoice_clerk", "合同会社良心の請求担当・社長個人予定担当。Googleカレンダーで社長の個人予定の空き確認、予定登録・取消、請求書画像作成、請求先管理"],
  ["ryoshin_jobs", "合同会社良心の求人TikTok台本制作"],
  ["ryoshin_video_editor", "合同会社良心のTikTok動画編集・編集指示制作"],
];

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    staff_id: { type: "string", enum: STAFF.map(([id]) => id) },
    understood_instruction: { type: "string" },
    short_summary: { type: "string" },
  },
  required: ["staff_id", "understood_instruction", "short_summary"],
};

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text;
    }
  }
  return "";
}

function normalizeSpeechForStaffRouting(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[\u30a1-\u30f6]/g, char => String.fromCharCode(char.charCodeAt(0) - 0x60))
    .replace(/(?:優樹|優希|悠希|悠樹|勇気|祐樹|結城|友紀|有紀|裕樹|雄輝|夕希)(?=(?:さん|くん|君|に|へ|、|,|と|台本|動画|お願い|作って|つくって|で))/g, "ゆうき")
    .replace(/(?:新|真|慎|進|心)(?=(?:さん|くん|君|に|へ|、|,|と|台本|語り|お願い|作って|つくって|で))/g, "しん")
    .replace(/(?:真奈|愛奈|麻奈|茉奈)(?=(?:さん|ちゃん|に|へ|、|,|と|台本|求人|お願い|作って|つくって|で))/g, "まな")
    .replace(/[、。！？!?・\s]/g, "");
}

function explicitlyCalledStaffId(normalizedText) {
  const candidates = [
    ["mana_jobs", normalizedText.indexOf("まな")],
    ["mana_narration", normalizedText.indexOf("しん")],
    ["mana_staff_dialogue", normalizedText.indexOf("ゆうき")],
  ].filter(([, index]) => index >= 0).sort((a, b) => a[1] - b[1]);
  return candidates[0]?.[0] || "";
}

export async function POST(request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OPENAI_API_KEYが.env.localに設定されていません。" },
      { status: 503 }
    );
  }

  const { instruction = "", targetStaffId = "" } = await request.json();
  const cleanInstruction = String(instruction).trim().slice(0, 8000);
  if (!cleanInstruction) {
    return Response.json({ error: "指示内容がありません。" }, { status: 400 });
  }

  const normalizedInstruction = normalizeSpeechForStaffRouting(cleanInstruction);
  const explicitlyCallsAsuka = /(あすか|あすこ|飛鳥|明日香|安須賀)/.test(normalizedInstruction);
  const explicitlyCalledStaff = explicitlyCalledStaffId(normalizedInstruction);
  const fixedTarget = STAFF.some(([id]) => id === targetStaffId)
    ? targetStaffId
    : explicitlyCalledStaff
      ? explicitlyCalledStaff
    : explicitlyCallsAsuka
      ? "asuka"
      : "";
  const staffList = STAFF.map(([id, role]) => `- ${id}: ${role}`).join("\n");
  const fixedTargetName = {
    mana_jobs: "まな",
    mana_narration: "しん",
    mana_staff_dialogue: "ゆうき",
  }[fixedTarget] || "";
  const prompt = `あなたはAI社員オフィスの業務受付です。ユーザーの音声認識結果を理解し、実行しやすい指示に整理してください。

音声認識結果:
${cleanInstruction}

スタッフ一覧:
${staffList}

ルール:
- 担当者名は、音声認識で漢字になっていても、最初に読みをひらがなへ直してから判定する
- 「新・真・慎」などが「しん」、「優樹・優希・勇気・悠希」などが「ゆうき」と呼びかけられている場合は、それぞれ本人への指示として扱う
- ユーザーの目的、成果物、対象者、媒体、口調、長さ、期限、固有名詞、ハッシュタグを可能な限り保持する
- 聞き間違いと思われる箇所も、根拠なく別の内容へ変更しない
- 情報を捏造しない。不足情報は不足したまま簡潔に整理する
- understood_instructionは、担当スタッフがそのまま作業に使える日本語の指示文にする
- short_summaryは業務ログ用に30文字程度で要約する
- スタッフ名を呼んでいる場合は、業務名に似た単語が含まれていても、呼ばれた本人を優先する
- 台本を複数本依頼されても担当者を増やさず、選ばれた1人だけへ全本をまとめて依頼する
- 音声に複数のスタッフ名が入っていても、先に呼ばれた1人だけを担当者とする。understood_instructionにも他のスタッフへの依頼を残さない
${fixedTarget
  ? `- 担当者はユーザーが直接選んだ ${fixedTarget}${fixedTargetName ? `（${fixedTargetName}）` : ""} 1人に固定し、staff_idを変更しない。複数本もすべてこの1人へ依頼する`
  : "- 内容に最も適した担当者を1人選ぶ"}`;

  try {
    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OFFICE_ROUTER_MODEL || DEFAULT_MODEL,
        input: prompt,
        reasoning: { effort: "none" },
        text: {
          format: {
            type: "json_schema",
            name: "understood_instruction",
            strict: true,
            schema: OUTPUT_SCHEMA,
          },
        },
      }),
    });
    const data = await openAIResponse.json();
    if (!openAIResponse.ok) {
      console.error("Instruction understanding API error:", openAIResponse.status, data);
      return Response.json({ error: "指示内容を理解できませんでした。" }, { status: openAIResponse.status });
    }

    const result = JSON.parse(extractOutputText(data));
    if (fixedTarget) result.staff_id = fixedTarget;
    return Response.json(result);
  } catch (error) {
    console.error("Instruction understanding error:", error);
    return Response.json({ error: "指示の解析中にエラーが発生しました。" }, { status: 502 });
  }
}
