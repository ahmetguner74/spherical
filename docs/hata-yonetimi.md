# Hata Yönetimi

> Hataları yakalama, kullanıcıya gösterme ve kurtarma stratejisi.
> Son güncelleme: 2026-04-11 (v0.8.82)

## 1. Kurallar

- Her async çağrı try/catch içinde olmalı + kullanıcıya toast ile gösterilmeli
- Global `ErrorBoundary` her sekmenin üstünde (iha/* altında)
- Supabase hataları merkezi parse edilir, Türkçe mesaja çevrilir (`src/lib/errors.ts`)
- Sessiz hata (console.error ile bitirme) YASAK — kullanıcı haberdar olmalı
- Ağ hatası, sunucu hatası, doğrulama hatası ayrı renklerde gösterilir (uyarı/kırmızı/turuncu)
- Her hata toast'unda "Tekrar Dene" butonu bulunur
- Hata detayı (stack trace) sadece geliştirici modunda açılır, prod'da gizli
- Kritik hatalar `iha_audit_log`'a `error` tipinde kayıt olur

## 2. Mevcut Durum (v0.8.82)

- ⚠️ Kısmi fallback: `src/lib/geocoding.ts:57` — Nominatim ağ hatası sessizce yutuluyor (kullanıcı bilmiyor)
- ❌ Global `ErrorBoundary` yok
- ❌ Toast/bildirim sistemi yok (CLAUDE.md §16 ertelenen işler listesinde)
- ❌ Merkezi hata parse utility'si (`src/lib/errors.ts`) yok
- ❌ Retry mekanizması yok
- ✅ CRUD tek noktadan geçiyor: `src/components/features/iha/shared/ihaStorage.ts` (middleware için uygun)

## 3. Yol Haritası

- [ ] 1. `src/lib/errors.ts` — Supabase hata → Türkçe mesaj mapper
- [ ] 2. `src/components/ui/Toast.tsx` + `useToast` hook
- [ ] 3. `src/components/shared/ErrorBoundary.tsx` + sekme seviyesinde sarmalama
- [ ] 4. `ihaStorage.ts` çağrılarını merkezi middleware ile sarmalamak
- [ ] 5. `geocoding.ts` kısmi fallback'ını toast sistemine bağlamak
