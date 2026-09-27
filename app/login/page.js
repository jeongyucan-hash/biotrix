"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const supabase = createClient();
    const redirectTo = window.location.origin + "/auth/callback";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    setBusy(false);
    setMessage(error ? "로그인 링크 전송에 실패했습니다." : "이메일로 로그인 링크를 보냈습니다.");
  }

  return (
    <main className="loginShell">
      <section className="loginCard">
        <div className="eyebrow">BIOTRIX HQ</div>
        <h1>Company OS Login</h1>
        <p>승인된 운영자만 BIOTRIX 내부 시스템에 접근할 수 있습니다.</p>
        <form onSubmit={submit}>
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
          <button type="submit" disabled={busy}>
            {busy ? "전송 중..." : "이메일 로그인 링크 받기"}
          </button>
        </form>
        {message && <div className="loginMessage">{message}</div>}
      </section>
    </main>
  );
}
