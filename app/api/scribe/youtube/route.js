import { fetchTranscript } from "youtube-transcript";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalize(segment) {
  const usesOffsetMs = segment.offset != null;
  const rawStart = Number(segment.offset ?? segment.start ?? 0);
  const rawDuration = Number(segment.duration ?? 0);
  return {
    text: String(segment.text ?? "").trim(),
    start: Number.isFinite(rawStart) ? (usesOffsetMs ? rawStart / 1000 : rawStart) : 0,
    duration: Number.isFinite(rawDuration) ? (usesOffsetMs ? rawDuration / 1000 : rawDuration) : 0,
  };
}

export async function POST(request) {
  try {
    const { url, lang } = await request.json();
    if (!url || typeof url !== "string") {
      return Response.json({ error: "YouTube URL을 입력해주세요." }, { status: 400 });
    }

    const raw = await fetchTranscript(url, lang ? { lang } : undefined);
    const segments = raw.map(normalize).filter((item) => item.text);
    if (!segments.length) {
      return Response.json({ error: "사용 가능한 공개 자막이 없습니다." }, { status: 404 });
    }

    return Response.json({
      source: "youtube_caption",
      text: segments.map((item) => item.text).join(" "),
      segments,
    });
  } catch (error) {
    console.error("scribe youtube transcript failed", error);
    return Response.json(
      { error: "공개 자막을 불러오지 못했습니다. 자막이 없거나 YouTube가 접근을 제한했을 수 있습니다. 파일 업로드를 사용해주세요." },
      { status: 422 }
    );
  }
}
