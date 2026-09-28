"use client";
import "../auth-access.css";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { safeNext } from "../../lib/auth-options.mjs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("password");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("error")) setMessage("인증 링크가 만료됐거나 다른 브라우저에서 열렸습니다. 비밀번호로 로그인하거나 이 브라우저에서 새 설정 메일을 요청해 주세요.");
  }, []);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const supabase = createClient();
      const redirectTo = window.location.origin + "/auth/callback";
      if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) { setMessage("로그인하지 못했습니다. 이메일·비밀번호를 확인하거나 최초 설정 / 재설정을 진행해 주세요."); return; }
        window.location.assign(safeNext(new URLSearchParams(window.location.search).get("next")));
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
        setMessage(error ? "설정 메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요." : "등록된 계정이면 비밀번호 설정 메일이 발송됩니다. 이 요청을 한 브라우저에서 메일 링크를 열어 주세요. 반복 요청 시 전송이 제한될 수 있습니다.");
      } else {
        const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo, shouldCreateUser: false } });
        setMessage(error ? "로그인 링크를 보내지 못했습니다. 이메일을 확인하고 잠시 후 다시 시도해 주세요." : "로그인 링크를 보냈습니다. 이 요청을 한 브라우저에서 열어 주세요.");
      }
    } catch { setMessage("연결에 실패했습니다. 네트워크를 확인하고 다시 시도해 주세요."); }
    finally { setBusy(false); }
  }
  function changeMode(value) { setMode(value); setPassword(""); setMessage(""); }
  return <main className="loginShell"><section className="loginCard">
    <div className="eyebrow">BIOTRIX HQ</div><h1>{mode === "reset" ? "비밀번호 설정" : "HQ 로그인"}</h1>
    <p>{mode === "reset" ? "최초 설정 또는 재설정에만 이메일 인증이 필요합니다. 설정 후에는 이메일과 비밀번호로 로그인하세요." : "승인된 운영자 계정으로 로그인하세요."}</p>
    <form onSubmit={submit}>
      <label htmlFor="email">이메일</label><input id="email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required disabled={busy} />
      {mode === "password" && <><label htmlFor="password">비밀번호</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required disabled={busy} /></>}
      <button type="submit" disabled={busy}>{busy ? "처리 중…" : mode === "password" ? "비밀번호로 로그인" : mode === "reset" ? "비밀번호 설정 메일 받기" : "이메일 로그인 링크 받기"}</button>
    </form>
    <div className="authOptions">
      {mode !== "password" && <button type="button" disabled={busy} onClick={() => changeMode("password")}>비밀번호 로그인으로 돌아가기</button>}
      {mode !== "reset" && <button type="button" disabled={busy} onClick={() => changeMode("reset")}>비밀번호 최초 설정 / 재설정</button>}
      {mode !== "link" && <button type="button" disabled={busy} onClick={() => changeMode("link")}>이메일 링크로 로그인</button>}
      <a href="/account/security">이미 로그인했다면 바로 비밀번호 설정</a>
    </div>
    {message && <div className="loginMessage" role="status">{message}</div>}
  </section></main>;
}
