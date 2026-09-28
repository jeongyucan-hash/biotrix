import { fetchTranscript } from "youtube-transcript";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeNative(segment) {
  const rawStart = Number(segment.offset ?? 0);
  const rawDuration = Number(segment.duration ?? 0);
  return {
    text: String(segment.text ?? "").trim(),
    start: Number.isFinite(rawStart) ? rawStart / 1000 : 0,
    duration: Number.isFinite(rawDuration) ? rawDuration / 1000 : 0,
  };
}

function normalizeSupadata(segment) {
  const rawStart = Number(segment.offset ?? 0);
  const rawDuration = Number(segment.duration ?? 0);
  return {
    text: String(segment.text ?? "").trim(),
    start: Number.isFinite(rawStart) ? rawStart / 1000 : 0,
    duration: Number.isFinite(rawDuration) ? rawDuration / 1000 : 0,
  };
}

async function fetchViaSupadata(url, lang) {
  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey) return null;

  const endpoint = new URL("https://api.supadata.ai/v1/transcript");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("lang", lang || "ko");

  const response = await fetch(endpoint, {
    headers: { "x-api-key": apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Supadata transcript failed", response.status, detail.slice(0, 300));
    throw new Error(`supadata_${response.status}`);
  }

  const json = await response.json();
  const raw = Array.isArray(json.content) ? json.content : [];
  const segments = raw.map(normalizeSupadata).filter((item) => item.text);

  if (!segments.length) {
    throw new Error("supadata_empty");
  }

  return {
    source: "supadata",
    language: json.lang || null,
    segments,
  };
}

async function fetchViaNative(url, lang) {
  const raw = await fetchTranscript(url, lang ? { lang } : undefined);
  const segments = raw.map(normalizeNative).filter((item) => item.text);

  if (!segments.length) {
    throw new Error("native_empty");
  }

  return {
    source: "youtube_caption",
    language: lang || null,
    segments,
  };
}

export async function POST(request) {
  try {
    const { url, lang } = await request.json();

    if (!url || typeof url !== "string") {
      return Response.json({ error: "YouTube URL을 입력해주세요." }, { status: 400 });
    }

    let result;

    if (process.env.SUPADATA_API_KEY) {
      result = await fetchViaSupadata(url, lang);
    } else {
      result = await fetchViaNative(url, lang);
    }

    return Response.json({
      source: result.source,
      language: result.language,
      text: result.segments.map((item) => item.text).join(" "),
      segments: result.segments,
    });
  } catch (error) {
    console.error("scribe youtube transcript failed", error);

    const providerConfigured = Boolean(process.env.SUPADATA_API_KEY);
    const message = providerConfigured
      ? "YouTube 필사를 가져오지 못했습니다. 영상 접근 상태 또는 자막/음성 인식 가능 여부를 확인해주세요."
      : "현재 서버의 직접 YouTube 자막 접근이 제한되었습니다. SUPADATA_API_KEY를 연결하거나 오디오·영상 파일 업로드를 사용해주세요.";

    return Response.json(
      {
        error: message,
        code: providerConfigured ? "youtube_transcript_failed" : "youtube_provider_not_configured",
      },
      { status: 422 }
    );
  }
}
