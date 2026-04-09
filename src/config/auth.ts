// Şifre kapısı ayarları
// Basit client-side gizlilik — gerçek güvenlik değil, temel erişim kontrolü

export const authConfig = {
  /** Şifre kapısı aktif mi? */
  enabled: true,

  /** Şifrenin SHA-256 hash'i (düz metin saklanmaz) */
  passwordHash:
    "acd7add67731d76c4f00acea6b219a56f8a4ecb36824ca0a974e5cecef6594c1",

  /** localStorage anahtarı */
  storageKey: "spherical-auth",

  /** Oturum süresi (ms) — 7 gün */
  sessionDuration: 7 * 24 * 60 * 60 * 1000,
} as const;
