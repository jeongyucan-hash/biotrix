import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return Response.json({ error: "요약할 필사 내용이 부족합니다." }, { status: 400 });
    }

    const openai = getClient();
    const model = process.env.OPENAI_SUMMARY_MODEL || "gpt-5-mini";

    const response = await openai.responses.create({
      model,
      input: [
        {
          role: "system",
          content:
            "당신은 제약·바이오 분야에 강한 전문 편집자입니다. 원문을 왜곡하지 말고 한국어로 명확하게 정리하세요.",
        },
        {
          role: "user",
          content:
            "아래 필사본을 1) 5줄 핵심 요약, 2) 주요 논점, 3) 제약·바이오 전문용어, 4) 콘텐츠로 재활용할 수 있는 인사이트 순서로 정리하세요.\n\n" +
            text.slice(0, 120000),
        },
      ],
    });

    return Response.json({
      model,
      summary: response.output_text || "",
    });
  } catch (error) {
    console.error("summary failed", error);

    const isConfigError =
      error instanceof Error && error.message.includes("OPENAI_API_KEY");

    return Response.json(
      {
        error: isConfigError
          ? "서버에 OpenAI API 키가 아직 등록되지 않았습니다."
          : "AI 요약에 실패했습니다.",
      },
      { status: isConfigError ? 503 : 500 }
    );
  }
}
