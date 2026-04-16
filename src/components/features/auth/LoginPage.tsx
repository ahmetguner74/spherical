"use client";

import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui";
import { IconLoader } from "@/config/icons";

/** Promise'ı süre sonunda reject et — hang etmesin */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout ${ms}ms: ${label}`)), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const { error: authError } = await withTimeout(
          supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          }),
          10000,
          "signInWithPassword"
        );

        if (authError) {
          const msg = authError.message?.toLowerCase() ?? "";
          if (msg.includes("invalid") || msg.includes("credentials")) {
            setError("E-posta veya şifre hatalı");
          } else {
            setError(`Giriş hatası: ${authError.message}`);
          }
          setPassword("");
          setLoading(false);
        }
        // Başarılı giriş → AuthProvider onAuthStateChange ile yakalar
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[LoginPage] signInWithPassword hata:", err);
        if (msg.startsWith("Timeout")) {
          setError(
            "Sunucuya ulaşılamıyor (10sn timeout). Ağınızı veya tarayıcı uzantılarınızı kontrol edin. DLP/firewall Supabase'i engelliyor olabilir."
          );
        } else {
          setError(`Giriş başarısız: ${msg}`);
        }
        setPassword("");
        setLoading(false);
      }
    },
    [email, password]
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-xs px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            CBS İHA BİRİMİ
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Giriş yapın
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="login-email" className="text-xs font-medium text-[var(--muted-foreground)]">
              E-posta
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@bursa.bel.tr"
              autoFocus
              autoComplete="email"
              required
              className="w-full px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all duration-150"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="login-password" className="text-xs font-medium text-[var(--muted-foreground)]">
              Şifre
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all duration-150"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--feedback-error)] text-center">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3"
            size="lg"
          >
            {loading ? (
              <IconLoader className="h-4 w-4 animate-spin" />
            ) : (
              "Giriş Yap"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
