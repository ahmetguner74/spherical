/**
 * Auth sistem sabitleri — endüstri standardı (NIST SP 800-63B + Google Workspace + Microsoft 365)
 *
 * Strateji:
 *   - Aktif kullanıcı ASLA atılmaz: aktivite tespit edilirken token sessizce yenilenir
 *   - İdle kullanıcı 60dk sonra atılır: 5dk önceden uyarı verilir
 *   - Sekme değişimi / ağ hiccup'ı: token canlı ise devam, değilse grace period ile yumuşak geçiş
 *   - Presence: diğer kullanıcıların giriş/çıkışı gerçek zamanlı
 */

/** Aktivite yokken kullanıcıyı otomatik çıkar — 60 dakika (belediye/kurumsal standart) */
export const IDLE_TIMEOUT_MS = 60 * 60 * 1000;

/** Çıkışa kaç ms kala uyarı göster — 5 dakika önceden */
export const IDLE_WARNING_MS = 5 * 60 * 1000;

/** Aktivite timestamp'i en fazla bu aralıkta güncellenir (re-render fırtınasını önler) */
export const ACTIVITY_THROTTLE_MS = 30 * 1000;

/** Aktifken token sessizce yenilenir — 15 dakika */
export const SILENT_REFRESH_INTERVAL_MS = 15 * 60 * 1000;

/** SIGNED_OUT grace period — Supabase SDK'nın kendiliğinden recover etmesine izin ver.
 * 30sn: mobil ağ geçişi (wifi→4G), tünel, asansör gibi senaryolarda SDK'nın
 * token refresh için ikinci-üçüncü denemesi tamamlanana kadar bekler. Daha kısa
 * tutarsak kullanıcı çalışırken "oturum sona erdi" uyarısı sahte tetiklenir. */
export const SIGNED_OUT_GRACE_MS = 30 * 1000;

/** Token expire'a bu kadar kalmışken force refresh tetikle (sekme geri geldiğinde) */
export const TOKEN_REFRESH_THRESHOLD_MS = 10 * 60 * 1000;

/** İdle sayaç kontrol aralığı — 30 saniye (5dk uyarısı +/- 30sn hassasiyetle tetiklenir) */
export const IDLE_CHECK_INTERVAL_MS = 30 * 1000;

/** Presence "son görülme" tazelemesi — 30 saniyede bir heartbeat */
export const PRESENCE_HEARTBEAT_MS = 30 * 1000;

/** Dinlenen aktivite olayları — fare, klavye, dokunmatik, scroll */
export const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const;
