export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_FILE_BYTES = 25 * 1024 * 1024;

export async function POST(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "HQ 서버에 OPENAI_API_KEY가 아직 등록되지 않았습니다." },
        { status: 503 }
      );
    }

    const incoming = await request.formData();
    const file = incoming.get("file");
    if (!file || typeof file === "string") {
      return Response.json({ error: "음성 또는 영상 파일을 선택해주세요." }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return Response.json({ error: "현재 MVP에서는 25MB 이하 파일만 처리합니다." }, { status: 413 });
    }

    const model = process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-transcribe";
    const form = new FormData();
    form.append("file", file, file.name || "audio");
    form.append("model", model);
    form.append("response_format", "json");
    form.append(
      "prompt",
      "한국어와 영어가 혼용될 수 있습니다. 바이오의약품, 제약, 임상, 의학 용어, 제품명과 약어를 문맥에 맞게 정확히 보존하세요."
    );

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(55000),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("OpenAI transcription failed", response.status, detail.slice(0, 300));
      return Response.json(
        { error: `음성 인식 API 오류 (${response.status})` },
        { status: response.status >= 400 && response.status < 500 ? response.status : 502 }
      );
    }

    const json = await response.json();
    return Response.json({
      source: "speech_to_text",
      model,
      text: json.text || "",
    });
  } catch (error) {
    console.error("scribe transcription failed", error);
    return Response.json({ error: "음성 인식 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
