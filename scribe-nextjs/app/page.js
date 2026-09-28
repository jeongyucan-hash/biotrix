"use client";

import { useMemo, useState } from "react";

function formatTime(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = Math.floor(value % 60);

  if (hours > 0) {
    return [hours, minutes, secs]
      .map((part) => String(part).padStart(2, "0"))
      .join(":");
  }

  return [minutes, secs]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export default function HomePage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [segments, setSegments] = useState([]);
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const wordCount = useMemo(
    () => transcript.trim().split(/\s+/).filter(Boolean).length,
    [transcript]
  );

  async function runYoutube() {
    if (!youtubeUrl.trim()) return;

    setLoading(true);
    setStatus("YouTube 공개 자막을 확인하고 있습니다…");
    setSummary("");

    try {
      const response = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl.trim() }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "필사에 실패했습니다.");

      setTranscript(data.text || "");
      setSegments(data.segments || []);
      setStatus(`완료 · ${data.segmentCount || 0}개 자막 구간`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function runFileTranscription() {
    if (!file) return;

    setLoading(true);
    setStatus("음성을 인식해 필사하고 있습니다…");
    setSummary("");

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body,
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "필사에 실패했습니다.");

      setTranscript(data.text || "");
      setSegments(data.segments || []);
      setStatus(`완료 · ${data.model || "speech-to-text"}`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function runSummary() {
    if (!transcript.trim()) return;

    setSummaryLoading(true);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "요약에 실패했습니다.");

      setSummary(data.summary || "");
    } catch (error) {
      setSummary(error.message);
    } finally {
      setSummaryLoading(false);
    }
  }

  async function copyTranscript() {
    if (!transcript) return;
    await navigator.clipboard.writeText(transcript);
    setStatus("필사본을 클립보드에 복사했습니다.");
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">BIOTRIX · KNOWLEDGE INGESTION</div>
        <h1>
          Scribe<span>β</span>
        </h1>
        <p>
          유튜브, 강의, 세미나, 인터뷰를 읽을 수 있는 지식으로 바꿉니다.
          공개 자막은 즉시 가져오고, 파일은 AI 음성인식으로 필사합니다.
        </p>
      </section>

      <section className="inputGrid">
        <article className="panel">
          <div className="panelTitle">
            <span>01</span>
            YouTube
          </div>
          <p className="helper">
            공개 자막이 있는 영상은 타임스탬프와 함께 바로 불러옵니다.
          </p>
          <input
            className="urlInput"
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <button
            className="primaryButton"
            onClick={runYoutube}
            disabled={loading || !youtubeUrl.trim()}
          >
            {loading ? "처리 중…" : "YouTube 필사"}
          </button>
        </article>

        <article className="panel">
          <div className="panelTitle">
            <span>02</span>
            Audio / Video
          </div>
          <p className="helper">
            자막이 없는 영상은 MP3, M4A, WAV, MP4 등을 직접 업로드하세요.
          </p>
          <label className="fileDrop">
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <strong>{file ? file.name : "파일 선택"}</strong>
            <small>현재 MVP 최대 25MB</small>
          </label>
          <button
            className="secondaryButton"
            onClick={runFileTranscription}
            disabled={loading || !file}
          >
            {loading ? "처리 중…" : "음성 인식 시작"}
          </button>
        </article>
      </section>

      <div className="statusBar">
        <span className="statusDot" />
        {status || "입력 대기 중"}
      </div>

      <section className="workspace">
        <article className="transcriptCard">
          <div className="cardHeader">
            <div>
              <div className="kicker">TRANSCRIPT</div>
              <h2>필사본</h2>
            </div>
            <div className="metrics">
              <span>{wordCount.toLocaleString()} words</span>
              <button onClick={copyTranscript} disabled={!transcript}>
                복사
              </button>
            </div>
          </div>

          {segments.length > 0 ? (
            <div className="segments">
              {segments.map((segment, index) => (
                <div className="segment" key={`${segment.start}-${index}`}>
                  <time>{formatTime(segment.start)}</time>
                  <p>{segment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <textarea
              className="transcriptArea"
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              placeholder="필사 결과가 여기에 나타납니다."
            />
          )}
        </article>

        <aside className="insightCard">
          <div className="cardHeader">
            <div>
              <div className="kicker">AI SYNTHESIS</div>
              <h2>지식화</h2>
            </div>
          </div>

          <button
            className="summaryButton"
            onClick={runSummary}
            disabled={!transcript.trim() || summaryLoading}
          >
            {summaryLoading ? "정리 중…" : "AI 핵심 정리"}
          </button>

          <div className="summaryBox">
            {summary ? (
              <pre>{summary}</pre>
            ) : (
              <p>
                필사 후 핵심 요약, 주요 논점, 전문용어와 콘텐츠 인사이트를
                자동으로 정리할 수 있습니다.
              </p>
            )}
          </div>
        </aside>
      </section>

      <footer>
        <span>SCRIBE MVP · 2026</span>
        <span>Built for BIOTRIX Content Intelligence</span>
      </footer>
    </main>
  );
}
