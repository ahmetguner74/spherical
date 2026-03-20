// Şifre kapısı ayarları
// Basit client-side gizlilik — gerçek güvenlik değil, temel erişim kontrolü

export const authConfig = {
  /** Şifre kapısı aktif mi? */
  enabled: true,

  /** Şifre (client-side, gizlilik amaçlı) */
  password: "spherical2026",

  /** localStorage anahtarı */
  storageKey: "spherical-auth",

  /** Oturum süresi (ms) — 7 gün */
  sessionDuration: 7 * 24 * 60 * 60 * 1000,
} as const;
