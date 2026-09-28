import { fetchTranscript } from "youtube-transcript";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeSegment(segment) {
  const offsetMs = Number(segment.offset ?? 0);
  const durationMs = Number(segment.duration ?? 0);

  return {
    text: String(segment.text ?? "").trim(),
    start: Number.isFinite(offsetMs) ? offsetMs / 1000 : 0,
    duration: Number.isFinite(durationMs) ? durationMs / 1000 : 0,
  };
}

export async function POST(request) {
  try {
    const { url, lang } = await request.json();

    if (!url || typeof url !== "string") {
      return Response.json({ error: "YouTube URL을 입력해주세요." }, { status: 400 });
    }

    const options = lang ? { lang } : undefined;
    const transcript = await fetchTranscript(url, options);
    const segments = transcript
      .map(normalizeSegment)
      .filter((segment) => segment.text.length > 0);

    if (!segments.length) {
      return Response.json(
        { error: "사용 가능한 공개 자막을 찾지 못했습니다." },
        { status: 404 }
      );
    }

    const text = segments.map((segment) => segment.text).join(" ");

    return Response.json({
      source: "youtube_caption",
      text,
      segments,
      segmentCount: segments.length,
    });
  } catch (error) {
    console.error("youtube transcript failed", error);
    return Response.json(
      {
        error:
          "이 영상의 공개 자막을 불러오지 못했습니다. 자막이 없거나 YouTube가 접근을 제한했을 수 있습니다. 영상/오디오 파일 업로드를 사용해주세요.",
      },
      { status: 422 }
    );
  }
}
