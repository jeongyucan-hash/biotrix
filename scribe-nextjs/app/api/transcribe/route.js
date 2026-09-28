import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILE_BYTES = 25 * 1024 * 1024;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json({ error: "음성 또는 영상 파일을 선택해주세요." }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return Response.json(
        { error: "현재 MVP에서는 25MB 이하 파일만 처리합니다." },
        { status: 413 }
      );
    }

    const openai = getClient();
    const model = process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-transcribe";

    const result = await openai.audio.transcriptions.create({
      file,
      model,
      response_format: "json",
      prompt:
        "한국어와 영어가 혼용될 수 있습니다. 바이오의약품, 제약, 임상, 의학 용어와 제품명, 약어는 문맥에 맞게 정확히 보존하세요.",
    });

    return Response.json({
      source: "speech_to_text",
      model,
      text: result.text ?? "",
      segments: [],
    });
  } catch (error) {
    console.error("transcription failed", error);

    const isConfigError =
      error instanceof Error && error.message.includes("OPENAI_API_KEY");

    return Response.json(
      {
        error: isConfigError
          ? "서버에 OpenAI API 키가 아직 등록되지 않았습니다."
          : "음성 인식에 실패했습니다. 파일 형식과 API 설정을 확인해주세요.",
      },
      { status: isConfigError ? 503 : 500 }
    );
  }
}
