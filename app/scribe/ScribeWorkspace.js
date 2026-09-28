"use client";

import { useMemo, useState } from "react";
import styles from "./scribe.module.css";

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts = h > 0 ? [h, m, s] : [m, s];
  return parts.map((part) => String(part).padStart(2, "0")).join(":");
}

export default function ScribeWorkspace() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [segments, setSegments] = useState([]);
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("입력 대기 중");
  const [busy, setBusy] = useState(false);
  const [summaryBusy, setSummaryBusy] = useState(false);

  const wordCount = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean).length,
    [text]
  );

  async function loadYouTube() {
    if (!youtubeUrl.trim()) return;
    setBusy(true);
    setSummary("");
    setStatus("YouTube 공개 자막을 확인하고 있습니다…");
    try {
      const response = await fetch("/api/scribe/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "자막을 가져오지 못했습니다.");
      setText(data.text || "");
      setSegments(data.segments || []);
      setStatus(`완료 · ${data.segments?.length || 0}개 자막 구간`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function transcribeFile() {
    if (!file) return;
    setBusy(true);
    setSummary("");
    setStatus("음성을 인식해 필사하고 있습니다…");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/scribe/transcribe", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "음성 인식에 실패했습니다.");
      setText(data.text || "");
      setSegments([]);
      setStatus(`완료 · ${data.model || "speech-to-text"}`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function summarize() {
    if (!text.trim()) return;
    setSummaryBusy(true);
    try {
      const response = await fetch("/api/scribe/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "요약에 실패했습니다.");
      setSummary(data.summary || "");
    } catch (error) {
      setSummary(error.message);
    } finally {
      setSummaryBusy(false);
    }
  }

  async function copyText() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setStatus("필사본을 복사했습니다.");
  }

  return (
    <div className={styles.wrap}>
      <section className={styles.intro}>
        <div>
          <span className={styles.badge}>SCRIBE β</span>
          <h2>영상과 음성을<br />검색 가능한 지식으로</h2>
        </div>
        <p>
          공개 YouTube 자막은 타임스탬프와 함께 가져오고, 자막이 없는 자료는
          권한이 있는 오디오·영상 파일을 업로드해 AI로 필사합니다.
        </p>
      </section>

      <section className={styles.sources}>
        <article className={styles.card}>
          <div className={styles.step}>01 · YOUTUBE</div>
          <h3>링크에서 필사</h3>
          <p>공개 자막이 있는 영상에 가장 빠른 경로입니다.</p>
          <input
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <button onClick={loadYouTube} disabled={busy || !youtubeUrl.trim()}>
            {busy ? "처리 중…" : "YouTube 필사"}
          </button>
        </article>

        <article className={styles.card}>
          <div className={styles.step}>02 · AUDIO / VIDEO</div>
          <h3>음성 인식으로 필사</h3>
          <p>MP3, M4A, WAV, MP4 등 권한이 있는 파일을 사용합니다.</p>
          <label className={styles.file}>
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <strong>{file ? file.name : "파일 선택"}</strong>
            <span>현재 MVP 최대 25MB</span>
          </label>
          <button onClick={transcribeFile} disabled={busy || !file}>
            {busy ? "처리 중…" : "음성 인식 시작"}
          </button>
        </article>
      </section>

      <div className={styles.status}><i />{status}</div>

      <section className={styles.workspace}>
        <article className={styles.transcript}>
          <header>
            <div>
              <span>TRANSCRIPT</span>
              <h3>필사본</h3>
            </div>
            <div className={styles.tools}>
              <small>{wordCount.toLocaleString()} words</small>
              <button onClick={copyText} disabled={!text}>복사</button>
            </div>
          </header>

          {segments.length ? (
            <div className={styles.segmentList}>
              {segments.map((segment, index) => (
                <div className={styles.segment} key={`${segment.start}-${index}`}>
                  <time>{formatTime(segment.start)}</time>
                  <p>{segment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="필사 결과가 여기에 나타납니다."
            />
          )}
        </article>

        <aside className={styles.summary}>
          <header>
            <span>AI SYNTHESIS</span>
            <h3>지식화</h3>
          </header>
          <button
            className={styles.summaryButton}
            onClick={summarize}
            disabled={!text.trim() || summaryBusy}
          >
            {summaryBusy ? "정리 중…" : "AI 핵심 정리"}
          </button>
          <div className={styles.summaryBody}>
            {summary ? (
              <pre>{summary}</pre>
            ) : (
              <p>핵심 요약, 주요 논점, 전문용어, 콘텐츠 재활용 포인트를 정리합니다.</p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
