// Şifre kapısı ayarları
// Basit client-side gizlilik — gerçek güvenlik değil, temel erişim kontrolü

export const authConfig = {
  /** Şifre kapısı aktif mi? */
  enabled: true,

  /** Şifrenin SHA-256 hash'i (düz metin saklanmaz) */
  passwordHash:
    "90efb7c12c8900de266a9daff444ee310e49bc310ce14fd59e208edc683d01b1",

  /** localStorage anahtarı */
  storageKey: "spherical-auth",

  /** Oturum süresi (ms) — 7 gün */
  sessionDuration: 7 * 24 * 60 * 60 * 1000,
} as const;
