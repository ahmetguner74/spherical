# MEMORY.md — Oturum Hafızası

> Bu dosya oturumlar arası unutulmaması gereken kararları, ertelenen işleri ve notları tutar.
> Her oturum başında CLAUDE.md ile birlikte okunur.

---

## Ertelenen / Kaldırılan Özellikler

### Faz 7 — Auth + Roller + KVKK (ERTELENDİ, Vercel kurulumu bekleniyor)
- **Tarih:** 2026-04-11
- **Durum:** Planlama tamamlandı, kod çalışmalarına başlanmadı. Vercel hesabı kurulana kadar beklemede.
- **Neden ertelendi:** Faz 7, Next.js'in SSR + API route + middleware özelliklerine ihtiyaç duyuyor. GitHub Pages static export bunları desteklemiyor. Çözüm olarak Vercel paralel deploy seçildi (Yol C) ama kullanıcı Vercel kurulumunu şimdilik ertelemek istedi.

#### Neden Vercel?
- **Yol A (Edge Functions)** değerlendirildi → her admin işlem değişiminde Supabase Dashboard'a gidip manuel deploy gerektiriyor, zamanla sıkıcı
- **Yol B (Faz 7 tamamen ertele)** değerlendirildi → 7 kişilik ekip aynı PasswordGate şifresini paylaşır, ileride patlama riski
- **Yol C (Vercel paralel)** seçildi → GitHub Pages ve Vercel birlikte çalışır, Vercel asıl üretim, GitHub Pages dondurulmuş kopya. Geri dönüşsüz karar değil.

#### Paralel Deploy Stratejisi
`next.config.ts` dinamik olacak:
```ts
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
export default {
  ...(isGitHubPages && { output: "export", basePath: "/spherical" }),
};
```
- GitHub Actions → `GITHUB_ACTIONS=true` otomatik → static export + basePath
- Vercel → env yok → standart SSR + API routes + middleware
- Tek kod tabanı, iki deploy
- GitHub Pages'te admin paneli çalışmaz (BFF yok) → kullanıcıya "Admin için Vercel URL'ine gidin" mesajı
- Login/operasyon/envanter/harita her ikisinde de çalışır

#### Faz 7 Alt Fazları (Hazır, Vercel'den sonra başlanacak)
| Faz | İş | Versiyon |
|-----|-----|----------|
| 7A-prep | Vercel hesap + repo bağla + env vars (KULLANICI) | — |
| 7A | Env + Supabase client refactor + next.config dinamik | v0.8.91 |
| 7B | DB migration: `iha_team.user_id`, `auth_role`, `must_change_password` | v0.8.92 |
| 7C | Auth çekirdeği: middleware + login sayfası + session hook | v0.8.93 |
| 7D | Change password sayfası (ilk girişte zorunlu) | v0.8.94 |
| 7E | Admin kullanıcı yönetim paneli + BFF endpoints (`/api/admin/users/*`) | v0.8.95 |
| 7F | RLS policy'leri (2 aşamalı: read → write) | v0.8.96-97 |
| 7G | KVKK sayfası + audit user_id + rol badge | v0.8.98 |
| 7H | Minor bump | v0.9.0 |

#### 7A'da Ne Yazılacak (Hazır, başlanmaya hazır)
1. `src/lib/supabase/client.ts` — `createBrowserClient` (client-side, anon key)
2. `src/lib/supabase/server.ts` — `createServerClient` (SSR, cookie session)
3. `src/lib/supabase/admin.ts` — `createAdminClient` (BFF, service role key, SADECE server-side)
4. `src/lib/supabase.ts` — barrel export (geriye dönük uyumluluk)
5. `.env.example` — 3 env var placeholder (commit'lenir)
6. `.env.local` — gerçek değerler (`.gitignore`'da, commit'lenmez)
7. `next.config.ts` — dinamik hale getir
8. `@supabase/ssr` paketini `npm install`
9. Mevcut `src/lib/supabase.ts` kullanımını yeni yapıya migrate et (ihaStorage.ts başta olmak üzere)

#### Kullanıcı Tarafı (Vercel Kurulum Adımları)
1. **Supabase ilk admin kullanıcısı** — Auth → Users → Add user → Create new user (Auto Confirm açık)
2. **Supabase service role key** — Project Settings → API → `service_role` reveal + kopyala
3. **Vercel hesap + repo** — vercel.com → GitHub ile kayıt → spherical repo'yu Import → Next.js preset
4. **Env vars** (Vercel Dashboard):
   - `NEXT_PUBLIC_SUPABASE_URL=https://zkudizhpzcjanoisqzcs.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SCwp8SEAY_YQzNNHijFoyQ_r1nk5syX`
   - `SUPABASE_SERVICE_ROLE_KEY=[2. adımdaki key]`
5. **Deploy** — ilk deploy mevcut static export config ile çalışır, geçici `spherical-xyz.vercel.app/spherical/` URL'i alınır
6. Vercel "Deployment Successful" verdiğinde kullanıcı haber verir → 7A başlar

### Denetim Günlüğü (Audit Log) — UI kaldırıldı, arka plan aktif
- **Tarih:** 2026-04-09
- **Durum:** UI'dan kaldırıldı (ReportsTab + SettingsTab)
- **Arka plan:** `audit()` fonksiyonu + `iha_audit_log` tablosu çalışmaya devam ediyor
- **Neden kaldırıldı:** Tek kullanıcılı sistemde "kim yaptı" bilgisi anlamsız
- **Ne zaman açılacak:** Auth + çoklu kullanıcı geldiğinde
- **Dosyalar:** `AuditLogList.tsx` hala mevcut (silinmedi), sadece import kaldırıldı

### OperationTimeline — silindi
- **Tarih:** 2026-04-09
- **Durum:** Dosya silindi (`OperationTimeline.tsx`)
- **Neden:** OperationModal sadeleştirildi, 3 panel → 2 panel. Timeline detay görünümüyle birlikte kaldırıldı
- **Not:** İleride operasyon detay sayfası (tam sayfa) yapılırsa tekrar eklenebilir

### OperationDetail (salt okunur detay görünümü) — kaldırıldı
- **Tarih:** 2026-04-09
- **Durum:** OperationModal içinden kaldırıldı
- **Neden:** Kullanıcı 3 farklı panelle karşılaşıyordu (QuickCreate → Detail → Form). 2'ye indirildi
- **Mevcut akış:** Yeni → QuickCreateForm | Var olan → direkt OperationForm + OperationExtras

### WingtraImportModal + wingtra-import.ts — silindi
- **Tarih:** 2026-04-10
- **Durum:** `WingtraImportModal.tsx` ve `src/config/wingtra-import.ts` silindi
- **Neden:** Sadece 13 hardcoded demo veriyi kapsıyordu, genel Excel import gerekti
- **Yerine:** `src/components/features/iha/operations/ExcelImport/` wizard sistemi
- **Yeni wizard:** 4 adım (Dosya → Eşleştir → Önizle → Aktar), xlsx kütüphanesi lazy load

---

## Aktif Kararlar

### Konum Seçici + KML/KMZ Import (v0.8.77)
- **Dosya yapısı:** `src/components/features/iha/operations/LocationPicker/`
  - `LocationPickerModal.tsx` — ana modal, mod state (point/polygon), özet kart, reverse geocode
  - `MapCanvas.tsx` — react-leaflet harita (nokta/çizgi/poligon çizimi)
  - `kmlParser.ts` — KML/KMZ → LocationCoordinate (lazy load)
  - `locationHelpers.ts` — polygonAreaM2 (shoelace), chooseAreaUnit, centroid, bounds, formatArea
- **Pafta UI kaldırıldı:** QuickCreateForm PaftalarField + OperationForm PaftalarPicker silindi. Pafta hala `paftalar[]` alanında DB'de ve PaftaLayer haritada çalışıyor, sadece otomatik doldurma yoluyla set ediliyor.
- **Reverse geocoding:** Nominatim (OSM, ücretsiz, online), rate limit 1.1sn. Ağ hatası → sessizce sadece pafta + lat/lng kalır, ilçe elle doldurulur. `src/lib/geocoding.ts` → `reverseGeocode(lat, lng)`.
- **Poligon çizimi:** Custom (leaflet-draw YOK, CLAUDE.md 4.2.6). ClickHandler ile vertex ekle, Polyline ile göster, "Poligonu Kapat" ile Polygon'a çevir, shoelace ile m² hesapla.
- **Alan birimi otomatik:** < 10 000 m² → m², < 1 km² → hektar, ≥ 1 km² → km².
- **KML/KMZ:** `@tmcw/togeojson` (KML→GeoJSON) + `jszip` (KMZ açma), ikisi de lazy import. İlk Point/Polygon/MultiPoint/MultiPolygon alınır.
- **DB şeması:** `iha_operations.polygon_coordinates jsonb`, `sokak text`, `display_address text` eklendi (migration: `supabase/operation-location-polygon.sql` — kullanıcı çalıştıracak)
- **Fallback stratejisi:** ihaStorage upsert 5 adımlı fallback — yeni kolonlar DB'de yoksa bile eski kayıtları bozmadan çalışır.
- **OperationLocation yeni alanlar:** `polygonCoordinates?`, `sokak?`, `displayAddress?` + `LocationCoordinate` type alias.

### Excel İçe Aktarma Wizard (v0.8.75)
- **Dosya yapısı:** `src/components/features/iha/operations/ExcelImport/`
  - `ExcelImportWizard.tsx` — ana kontrolcü, step state
  - `Step1FileUpload.tsx` — dosya seç + xlsx parse (lazy load)
  - `Step2ColumnMapping.tsx` — Excel sütun → sistem alan eşleştirme, custom field toggle
  - `Step3Preview.tsx` — önizleme tablosu + özet kartlar + hata detayları
  - `Step4Loading.tsx` — ilerleme çubuğu + özet sonuç
  - `excelHelpers.ts` — parse, autoMatch, mapRowToOperation
- **Custom field stratejisi (b):** `Operation.customFields?: Record<string, string>`, Supabase'de `iha_operations.custom_fields jsonb` kolonu
- **SQL migration:** `supabase/operation-custom-fields.sql`
- **xlsx güvenlik:** iki yüksek dereceli CVE (Prototype Pollution, ReDoS) — saldırgan kontrollü dosya gerektirdiği için kabul edilebilir risk
- **Zorunlu alanlar:** title, ilce — eksikse satır atlanır (kullanıcı kararı)
- **Tarih parse:** ISO, DD.MM.YYYY, DD/MM/YYYY, Excel serial desteklenir

---

## Eski Aktif Kararlar

### Operasyon Paneli Akışı
- Yeni operasyon: QuickCreateForm (basit, 5-6 alan)
- Var olan operasyona tıkla: Direkt OperationForm + alt bölümler (tek panel)
- Alt bölümler: Uçuş İzni, Uçuş Kayıtları, İş Akışı, Çıktılar, Dosya Ekleri

### Saha Hazırlığı Paneli
- Her zaman görünür (gün seçilmese bile bugünü gösterir)
- Operasyon yoksa tam genişlik alır
- Ekipman kategorisine göre alt maddeler (drone→batarya/SD, GPS→pil/tripod, araç→yakıt)
- Checklist Supabase'de (`iha_field_prep` tablosu), localStorage fallback
- Tüm maddeler tamamlanınca "Sahaya Hazırız" butonu → durum otomatik "saha"ya çevrilir

### Soft Delete
- 14 tablo: `deleted_at` kolonu ile soft delete
- `iha_info_bank` dahil (sonradan eklendi — unutulmuştu!)
- Seed fonksiyonları: `limit(1)` ile mükerrer koruması
- `iha_audit_log` tablosuna soft delete uygulanmaz (log her zaman tam tutulur)

### Saat Yönetimi
- Operasyonlarda `startTime` + `endTime` zorunlu değil
- Varsayılan: 08:00 - 09:00
- Haftalık takvimde saat bazlı sürükle-bırak (30dk snap, süre korunur)
- Aylık takvimde saat gösterilmez

---

## Gelecek İşler (Kullanıcı Onayı Bekliyor)

- [ ] Auth + Supabase Auth + RLS politikaları
- [ ] Denetim günlüğü UI'ını tekrar aç (Auth sonrası)
- [ ] Excel veri aktarımı (519 Wingtra + 20 M300 + 32 Panorama)
- [ ] PDF rapor export
- [ ] Çevrimdışı mod (Service Worker + senkronizasyon)
- [ ] Bildirim sistemi
- [ ] Operasyon detay sayfası (tam sayfa, timeline ile)

---

## Hatalardan Çıkarılan Dersler

### iha_info_bank deleted_at eksikliği (2026-04-09)
- **Hata:** Soft delete SQL'inde `iha_info_bank` tablosu atlandı → bilgi bankası verileri görünmez oldu
- **Sebep:** 14 tablo elle yazıldı, 1'i unutuldu
- **Çözüm:** CLAUDE.md'ye kural 6-7-8 eklendi (kod-SQL eşzamanlılık, tam liste kontrolü, çapraz doğrulama)
- **Ders:** Toplu değişikliklerde grep ile etkilenen tüm yerleri say ve SQL ile karşılaştır

### Wingtra Gen2 mükerrer kayıtlar (2026-04-09)
- **Hata:** 8 adet Wingtra Gen2 kaydı oluştu
- **Sebep:** Seed fonksiyonu `maybeSingle()` ile kontrol yapıyordu, çoklu sonuçta hata veriyordu
- **Çözüm:** `maybeSingle()` → `limit(1)` değiştirildi
- **Ders:** Seed fonksiyonlarında `maybeSingle()` yerine `limit(1)` kullan

---

*Son güncelleme: 2026-04-11 (Faz 7 ertelendi, Vercel kurulumu bekleniyor)*
