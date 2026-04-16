"use client";

import { Component, type ReactNode } from "react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * React render hatalarını yakalayıp beyaz ekran yerine kurtarma kartı gösterir.
 * "Tekrar Giriş Yap" = auth cache temizle + sayfayı yenile (fresh session).
 *
 * NOT: Son çare fallback'tır — diğer bileşenler güvensiz olabileceği için
 * raw button + doğrudan localStorage erişimi kullanılır.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error("ErrorBoundary yakaladı", { error, info });
  }

  private handleRelogin = () => {
    // Tüm auth cache'lerini temizle → fresh login zorunlu
    try {
      localStorage.removeItem("spherical-auth-profile");
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("sb-")) localStorage.removeItem(k);
      });
    } catch {
      /* localStorage erişim hatası — sessizce geç */
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)] p-4">
          <div className="max-w-sm w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 text-center space-y-4 shadow-lg">
            <div className="text-4xl" aria-hidden>⚠️</div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Bir sorun oluştu</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Uygulama beklenmeyen bir hatayla karşılaştı. Tekrar giriş yaparak devam edebilirsiniz.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={this.handleRelogin}
                className="w-full px-4 py-2 rounded-lg font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                Tekrar Giriş Yap
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full px-4 py-2 rounded-lg font-medium border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                Yeniden Yükle
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
