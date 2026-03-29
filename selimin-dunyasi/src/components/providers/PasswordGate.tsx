"use client";

import { useState, useEffect } from "react";
import { verifyPassword, getSession, setSession } from "@/config/auth";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthenticated(getSession());
    setChecking(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const ok = await verifyPassword(input);
    if (ok) {
      setSession();
      setAuthenticated(true);
    } else {
      setError(true);
      setInput("");
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div style={styles.page}>
        <div style={styles.loader}>\u26cf\ufe0f</div>
      </div>
    );
  }

  if (authenticated) return <>{children}</>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>\u26cf\ufe0f</div>
        <h1 style={styles.title}>Selim&apos;in D\u00fcnyas\u0131</h1>
        <p style={styles.subtitle}>Giri\u015f yapmak i\u00e7in \u015fifreni yaz</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="\u015eifre..."
            autoFocus
            style={{
              ...styles.input,
              borderColor: error ? "#ef5350" : "rgba(255,255,255,0.15)",
            }}
          />
          <button type="submit" disabled={loading || !input} style={styles.btn}>
            {loading ? "Kontrol ediliyor..." : "Giri\u015f Yap"}
          </button>
        </form>

        {error && (
          <p style={styles.error}>Yanl\u0131\u015f \u015fifre! Tekrar dene.</p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #0B0E1A 0%, #1A2332 50%, #2D4A1E 100%)", padding: 16 },
  card: { background: "rgba(30,40,55,0.95)", borderRadius: 16, padding: "32px 28px", maxWidth: 380, width: "100%", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" },
  title: { fontFamily: "'Silkscreen', monospace", fontSize: 22, color: "#7CFC00", textAlign: "center", letterSpacing: 2, marginBottom: 4 },
  subtitle: { textAlign: "center", color: "#999", fontSize: 14, marginBottom: 24 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: "12px 16px", fontSize: 16, background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "#E8F5E9", outline: "none", fontFamily: "'Nunito', sans-serif" },
  btn: { padding: "12px", fontSize: 16, fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: "pointer", background: "linear-gradient(135deg, #43A047, #2E7D32)", border: "2px solid #1B5E20", borderRadius: 10, color: "#fff" },
  error: { color: "#ef5350", fontSize: 13, textAlign: "center", marginTop: 12, fontWeight: 700 },
  loader: { fontSize: 48, animation: "pulse 1s infinite" },
};
