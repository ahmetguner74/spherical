"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./Button";
import { IDLE_WARNING_MS } from "@/config/auth";

/**
 * İdle timeout'a yaklaşıldığında (5dk kala) gösterilen uyarı overlay'i.
 * Geri sayım gösterir. "Devam et" → aktivite tazelenir. "Çıkış yap" → signOut.
 * Herhangi bir gerçek aktivite (fare/klavye) olduğunda zaten AuthProvider
 * idleWarning'i kapatır — overlay otomatik kaybolur.
 */
export function IdleWarningOverlay() {
  const { extendSession, signOut } = useAuth();
  const [remainingSec, setRemainingSec] = useState(
    Math.ceil(IDLE_WARNING_MS / 1000)
  );

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, IDLE_WARNING_MS - elapsed);
      setRemainingSec(Math.ceil(left / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mm = Math.floor(remainingSec / 60);
  const ss = remainingSec % 60;
  const countdown = `${mm}:${ss.toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]/95 backdrop-blur-sm p-4">
      <div className="max-w-sm w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 text-center space-y-4 shadow-lg">
        <div className="text-4xl" aria-hidden>⏰</div>
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Hâlâ orada mısınız?
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Bir süredir hareket algılanmadı. Güvenlik için otomatik çıkış yapılacak.
        </p>
        <div className="text-3xl font-mono font-bold text-[var(--accent)] tabular-nums">
          {countdown}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => void signOut()}
          >
            Çıkış Yap
          </Button>
          <Button className="flex-1" onClick={extendSession}>
            Devam Et
          </Button>
        </div>
      </div>
    </div>
  );
}
