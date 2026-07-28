const REVIEW_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: { type: "integer", minimum: 0, maximum: 20 },
    completed_items: { type: "array", items: { type: "string" } },
    missing_items: { type: "array", items: { type: "string" } },
    evidence: { type: "array", items: { type: "string" } },
    summary: { type: "string" },
  },
  required: ["score", "completed_items", "missing_items", "evidence", "summary"],
};

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  return (data.output || [])
    .flatMap(item => item.content || [])
    .filter(content => content.type === "output_text")
    .map(content => content.text)
    .join("\n");
}

export async function POST(request) {
  const { job = "", task = "", criteria = "", frames = [] } = await request.json();
  const safeFrames = Array.isArray(frames)
    ? frames.filter(frame => /^data:image\/jpeg;base64,/.test(frame)).slice(0, 8)
    : [];
  if (!task.trim() || !criteria.trim()) {
    return Response.json({ error: "実演課題と客観的な採点基準を設定してください。" }, { status: 400 });
  }
  if (!safeFrames.length) {
    return Response.json({ error: "確認できる録画画像がありません。" }, { status: 400 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "映像確認にはOpenAI API接続が必要です。" }, { status: 503 });
  }

  const prompt = `採用面接中に行われた実演課題を、指定された客観基準だけで確認してください。
応募職種: ${String(job).slice(0, 300)}
実演課題: ${String(task).slice(0, 3000)}
客観的な採点基準: ${String(criteria).slice(0, 5000)}

重要な制約:
- 画像は時系列の抜粋であり、映って確認できる事実だけを書く
- 容姿、年齢、性別、人種、障害、健康、服装、背景環境を評価しない
- 表情、視線、姿勢、身振り、緊張、声質から性格・熱意・適性を推測しない
- 指定された作業手順、提示物、実演結果など職務に直接関係する要件だけを評価する
- 画像だけで確認できない基準は減点せず「確認不能」としてmissing_itemsへ入れる
- 採用・不採用を判断しない
- scoreはこの実演課題だけの別枠20点。通常面接の100点には加算しない`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ASUKA_VIDEO_REVIEW_MODEL || "gpt-5.6-luna",
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            ...safeFrames.map(image_url => ({ type: "input_image", image_url, detail: "low" })),
          ],
        }],
        reasoning: { effort: "low" },
        text: {
          format: {
            type: "json_schema",
            name: "objective_practical_task_review",
            strict: true,
            schema: REVIEW_SCHEMA,
          },
        },
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "映像を確認できませんでした。");
    return Response.json({ review: JSON.parse(extractOutputText(data)) });
  } catch (error) {
    console.error("Video task review error:", error);
    return Response.json({ error: error.message || "映像確認に失敗しました。" }, { status: 502 });
  }
}
