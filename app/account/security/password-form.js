"use client";
import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { passwordIssue } from "../../../lib/auth-options.mjs";
export default function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const issue = passwordIssue(password, confirmation);
    if (issue) { setMessage(issue); return; }
    setBusy(true); setMessage(""); setSaved(false);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) { setMessage(error.code === "weak_password" ? "더 강한 비밀번호를 사용해 주세요. 영문·숫자·기호 조합을 권장합니다." : "저장하지 못했습니다. 기존과 다른 비밀번호를 사용해 주세요. 계속 실패하면 로그인 화면에서 재설정 메일을 요청해 주세요."); return; }
      setPassword(""); setConfirmation(""); setSaved(true);
      setMessage("비밀번호를 저장했습니다. 다음부터 이메일과 비밀번호로 로그인할 수 있습니다.");
    } catch { setMessage("연결에 실패했습니다. 잠시 후 다시 시도해 주세요."); }
    finally { setBusy(false); }
  }
  return <form className="stackForm passwordForm" onSubmit={submit}>
    <label htmlFor="new-password">새 비밀번호 (12자 이상)</label>
    <input id="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required disabled={busy} value={password} onChange={e => setPassword(e.target.value)} />
    <label htmlFor="confirm-password">새 비밀번호 확인</label>
    <input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required disabled={busy} value={confirmation} onChange={e => setConfirmation(e.target.value)} />
    <button className="hqButton" type="submit" disabled={busy}>{busy ? "저장 중…" : "비밀번호 저장"}</button>
    {message && <p role="status">{message}</p>}{saved && <a href="/sourcing">소싱 업무로 이동 →</a>}
  </form>;
}
