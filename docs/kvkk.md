# KVKK Uyumluluğu

> Bursa Büyükşehir Belediyesi CBS İHA Birimi için kişisel veri koruma kuralları.
> Son güncelleme: 2026-04-11 (v0.8.82)

## 1. Kurallar

- Kişisel veri (ad, lisans, foto, iletişim) sadece Supabase'de tutulur — asla localStorage/console/log'a yazılmaz
- Kişisel veri içeren her işlem `iha_audit_log`'a düşer (kim, ne zaman, ne yaptı)
- Supabase Storage'daki belgelere sadece yetkili roller erişebilir (RLS zorunlu)
- 3. taraf servisler (Nominatim, Leaflet tile) anonim çağrı yapar — kullanıcı IP'si loglanmaz
- Silme talepleri hard-delete değil: `deleted_at` timestamp + audit
- Veri saklama süresi: operasyon bitiminden itibaren 10 yıl (kamu kurumu)
- Aydınlatma metni her veri toplama noktasında (personel ekleme, dosya yükleme) görünür olmalı
- Veri sahibi hakları (erişim, düzeltme, silme, taşıma) için iletişim kanalı sunulur

## 2. Mevcut Durum (v0.8.82)

- ✅ Audit log altyapısı hazır: `iha_audit_log` tablosu ve UI (SettingsTab)
- ✅ Supabase RLS altyapısı hazır — ancak politika yazılmamış (tüm tablolarda açık)
- ❌ Auth + rol sistemi yok (admin / pilot / izleyici)
- ❌ Veri sahibi hakları UI'ı yok
- ❌ Aydınlatma metni sayfası yok
- ❌ Soft-delete (`deleted_at`) pattern'i uygulanmamış

## 3. Yol Haritası

- [ ] 1. `/kvkk` aydınlatma metni sayfası (marketing grubu)
- [ ] 2. Supabase Auth + 3 rol (admin / pilot / izleyici)
- [ ] 3. 15 tablo için RLS politikaları yazımı
- [ ] 4. Veri sahibi hakları formu (profil ekranı altında)
- [ ] 5. `deleted_at` soft-delete pattern'i tüm tablolara
