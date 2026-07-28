function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  return (data.output || [])
    .flatMap(item => item.content || [])
    .filter(content => content.type === "output_text")
    .map(content => content.text)
    .join("\n")
    .trim();
}

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: { type: "string" },
    should_end: { type: "boolean" },
    end_reason: { type: "string" },
  },
  required: ["reply", "should_end", "end_reason"],
};

function localInterviewResponse(transcript) {
  const answerCount = (String(transcript).match(/^応募者：/gm) || []).length;
  const questions = [
    "はい、ありがとうございます。これまでの経験で、最も成果につながった具体的な取り組みを教えてください。",
    "なるほど。その際に難しかった点と、ご自身で工夫したことを教えてください。",
    "ありがとうございます。チームで意見が合わなかった時、どのように対応しますか。",
    "はい、よく分かりました。最後に、この仕事で活かせるご自身の強みを教えてください。",
  ];
  const shouldEnd = answerCount >= 5;
  return {
    reply: shouldEnd
      ? "ありがとうございます。必要な内容を確認できましたので、面接は以上です。"
      : questions[Math.min(Math.max(0, answerCount - 1), questions.length - 1)],
    should_end: shouldEnd,
    end_reason: shouldEnd ? "ローカル面接で必要項目を確認しました" : "確認を続けます",
  };
}

export async function POST(request) {
  const { job = "", criteria = "", transcript = "" } = await request.json();
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ ...localInterviewResponse(transcript), local: true });
  }
  const prompt = `あなたは人事担当「あすか」です。応募者と日本語で自然な採用面接をしてください。
応募職種: ${String(job).slice(0, 300)}
採用基準・面接方針:
${String(criteria || "具体的な経験、問題解決力、協働性、志望動機を確認する").slice(0, 5000)}

これまでの会話:
${String(transcript).slice(0, 24000)}

あなた自身が、面接を続けるか終了するか判断してください。
- 応募者の回答が3回未満なら、本人が終了を希望した場合を除いて続ける
- 志望動機、関連経験・実績、問題解決、協働性、強み、および採用基準の重要項目が十分確認できたら終了する
- 応募者の回答が6回以上なら、重要な未確認事項がない限り終了する
- 同じ趣旨の質問を繰り返さない。回答が7回に達したら必ず終了する
- 続ける場合、直前の回答を受け止め、短い相づちを1つ入れてから次の質問を1つだけする
- 無言の間を作らず、相づちと次の質問を一続きの短い返答としてすぐに返す
- 終了する場合、should_endをtrueにし、replyは質問ではなく「ありがとうございます。必要な内容を確認できましたので、面接は以上です。」のような終了挨拶にする
話を遮らず、採用・不採用や点数は伝えないでください。
返答は音声で読み上げやすい80文字以内にしてください。`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ASUKA_INTERVIEW_MODEL || "gpt-5.6-terra",
        input: prompt,
        reasoning: { effort: "low" },
        max_output_tokens: 160,
        text: {
          format: {
            type: "json_schema",
            name: "interview_turn_decision",
            strict: true,
            schema: RESPONSE_SCHEMA,
          },
        },
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "次の質問を作成できませんでした。");
    return Response.json(JSON.parse(extractOutputText(data)));
  } catch (error) {
    console.error("Interview response error:", error);
    return Response.json({ ...localInterviewResponse(transcript), local: true });
  }
}
