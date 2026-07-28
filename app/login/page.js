"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_EMAIL = "ryoshin.kobayashi1020@gmail.com";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createClient(url, key) : null;
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const saveSession = async session => {
      if (!active || !session?.access_token) return;
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: session.access_token }),
      });
      if (response.ok) window.location.replace("/");
      else {
        const result = await response.json().catch(() => ({}));
        setMessage(result.error || "ログインできませんでした。");
      }
    };
    supabase.auth.getSession().then(({ data }) => saveSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void saveSession(session);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const sendLoginLink = async () => {
    if (!supabase) {
      setMessage("Supabase Authの設定を確認してください。");
      return;
    }
    setSending(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: ALLOWED_EMAIL,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    setSending(false);
    setMessage(error
      ? `ログインリンクを送信できませんでした：${error.message}`
      : `${ALLOWED_EMAIL} にログインリンクを送りました。メール内のリンクを開いてください。`);
  };

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: 24,
      background: "linear-gradient(145deg,#fff4fa,#f4ecff 50%,#fff8e8)",
      color: "#3d2944",
      fontFamily: "sans-serif",
    }}>
      <section style={{
        width: "min(460px,100%)",
        padding: 32,
        borderRadius: 24,
        background: "rgba(255,255,255,.94)",
        boxShadow: "0 24px 70px rgba(97,57,111,.18)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48 }}>🏢</div>
        <h1 style={{ margin: "12px 0 8px", fontSize: 26 }}>AI社員オフィス</h1>
        <p style={{ margin: "0 0 24px", color: "#765f7c", lineHeight: 1.7 }}>
          このサービスは小林さん専用です。登録メールへ届くログインリンクからアクセスしてください。
        </p>
        <button
          type="button"
          onClick={sendLoginLink}
          disabled={sending}
          style={{
            width: "100%",
            border: 0,
            borderRadius: 14,
            padding: "14px 18px",
            background: "#d94c91",
            color: "white",
            fontSize: 16,
            fontWeight: 800,
            cursor: sending ? "wait" : "pointer",
            opacity: sending ? .7 : 1,
          }}
        >
          {sending ? "送信中…" : "ログインリンクをメールで受け取る"}
        </button>
        {message && (
          <p style={{ margin: "18px 0 0", lineHeight: 1.6, color: "#6c536f" }}>{message}</p>
        )}
      </section>
    </main>
  );
}
