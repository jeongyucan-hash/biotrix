import { responseText } from "../../../../lib/ai/responses.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/responses";
const MODEL = "openai/gpt-5.4-mini";

export async function POST(request) {
  try {
    const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || "";
    if (!token) {
      return Response.json(
        { error: "HQ AI Gateway 인증이 아직 준비되지 않았습니다." },
        { status: 503 }
      );
    }

    const { text } = await request.json();
    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return Response.json({ error: "요약할 필사 내용이 부족합니다." }, { status: 400 });
    }

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_output_tokens: 1800,
        input: [
          {
            role: "system",
            content:
              "당신은 제약·바이오 분야에 강한 전문 편집자다. 원문을 왜곡하거나 사실을 추가하지 말고 한국어로 간결하고 정확하게 정리한다.",
          },
          {
            role: "user",
            content:
              "아래 필사본을 1) 핵심 요약 5개, 2) 주요 논점, 3) 제약·바이오 전문용어, 4) 콘텐츠 재활용 아이디어 순서로 정리해줘.\n\n" +
              text.slice(0, 100000),
          },
        ],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(55000),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("scribe summary failed", response.status, detail.slice(0, 300));
      return Response.json({ error: `AI 요약 오류 (${response.status})` }, { status: 502 });
    }

    const json = await response.json();
    return Response.json({ model: MODEL, summary: responseText(json) || "" });
  } catch (error) {
    console.error("scribe summary failed", error);
    return Response.json({ error: "AI 요약 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
