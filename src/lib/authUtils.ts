import { supabase } from "./supabase";
import { logger } from "./logger";

/**
 * Promise'ı belirlenen süre sonunda timeout hatası ile reject eder.
 * Supabase auth çağrılarının ağ/lock nedeniyle asılı kalmasını (hanging) önler.
 */
export function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout ${ms}ms: ${label}`)), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

/**
 * Supabase auth verilerini localStorage'dan temizler.
 * Tarayıcı kilitlenmelerini (navigator.locks) çözmek için en etkili yöntemdir.
 */
export function resetAuthStorage() {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("sb-") || k === "spherical-auth-profile")) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    logger.warn("[AuthUtils] Storage reset failed", err);
  }
}

/**
 * Güvenli SignOut — Sadece istemci tarafını (local scope) temizler ve kilitlenmeye karşı korumalıdır.
 */
export async function safeSignOut(): Promise<void> {
  try {
    await Promise.race([
      supabase.auth.signOut({ scope: "local" }),
      new Promise<void>((resolve) => setTimeout(resolve, 1500)),
    ]);
  } catch (err) {
    logger.error("[AuthUtils] safeSignOut error", err);
    // Hata gelse bile storage'ı temizle ki zombi session kalmasın
    resetAuthStorage();
  }
}

/**
 * Auth hatalarını kullanıcı dostu mesajlara çevirir.
 */
export function getFriendlyAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lowerMsg = msg.toLowerCase();

  if (lowerMsg.includes("timeout")) {
    return "Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı veya VPN durumunuzu kontrol edin.";
  }
  if (lowerMsg.includes("invalid") || lowerMsg.includes("credentials")) {
    return "E-posta veya şifre hatalı.";
  }
  if (lowerMsg.includes("email not confirmed")) {
    return "E-posta adresi henüz doğrulanmamış.";
  }
  if (lowerMsg.includes("rate limit") || lowerMsg.includes("too many requests")) {
    return "Çok fazla deneme yapıldı. Lütfen bir süre bekleyip tekrar deneyin.";
  }
  
  return `Giriş yapılamadı: ${msg}`;
}
