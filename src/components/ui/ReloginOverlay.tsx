"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "./Button";

interface ReloginOverlayProps {
  title?: string;
  description?: string;
}

/**
 * Tam ekran "Tekrar Giriş Yap" paneli.
 * Kullanım: veri yüklenemediğinde / oturum bozulduğunda gösterilir.
 * Butona basınca signOut → AuthProvider login ekranına yönlendirir.
 */
export function ReloginOverlay({
  title = "Bağlantı problemi",
  description = "Sunucuya bağlanılamıyor. Oturumunuz sona ermiş olabilir — tekrar giriş yapın.",
}: ReloginOverlayProps) {
  const { signOut } = useAuth();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]/95 backdrop-blur-sm p-4">
      <div className="max-w-sm w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 text-center space-y-4 shadow-lg">
        <div className="text-4xl" aria-hidden>⚠️</div>
        <h2 className="text-lg font-bold text-[var(--foreground)]">{title}</h2>
        <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
        <Button className="w-full" onClick={() => void signOut()}>
          Tekrar Giriş Yap
        </Button>
      </div>
    </div>
  );
}
