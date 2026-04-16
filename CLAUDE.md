# CLAUDE.md

## Kurallar

- Her zaman dürüst ol. Kullanıcıya karşı asla yanıltıcı veya yanlış bilgi verme.

---

# SPHERICAL - Beyin Dosyası
> Bu dosya projenin DNA'sıdır. Her oturum başında okunur. Buradaki kurallar tartışılmaz.

---

## 1. Temel Felsefe

- **Yüzey sade, derinlik sonsuz.** Google gibi — kullanıcı ilk bakışta sadece ihtiyacını görür, ama altında onlarca katman yaşar.
- **Her şey modüler.** 400 satırı geçen dosya veya 150 satırı geçen top-level component şüpheli — yapısal olarak bölünmeli (detay için §3).
- **Her şey yönetilebilir.** Bugün eklenen her özellik, yarın config'den açılıp kapatılabilir olmalı.
- **Hiçbir şey hardcode değil.** Metinler, renkler, rotalar, özellikler — hepsi config veya veri katmanından gelir.
- **Design tokens zorunlu.** Yeni component/sayfa yazarken `src/config/tokens.ts` kullanılır. Hardcode renk, spacing, fontSize, radius, shadow, z-index, duration YASAK — hepsi tokens'dan gelir.

## 2. Mimari Kurallar

- **Atomic Design**: ui/ → atom, layout/ → molecule, features/ → organism
- **Bir component = bir iş.** Header sadece header'dır, içinde search bar ayrı component'tir.
- **Route grupları**: (marketing) = public, (platform) = auth gerektiren, (admin) = yönetim
- **Her feature kendi klasöründe yaşar**: components, hooks, types, utils hepsi feature içinde olabilir
- **Barrel exports (index.ts)**: Her klasörün bir index.ts'i olur, dışarıya temiz API sunar

## 3. Dosya Kuralları

- **Dosya**: max **400 satır** (sektör standardı, ESLint `max-lines` default'u civarı)
- **Top-level component fonksiyonu**: max **150 satır** JSX return bloğu
- **Sub-component** (aynı dosyada helper): limit yok — tek sorumluluk yeterli
- **Hook**: max **50 satır**
- **Utility**: max **30 satır** per function
- **Page**: sadece composition yapar, iş mantığı component'lere delege edilir
- **Style**: Tailwind inline, tekrar eden pattern varsa component'e çevir
- **Ruh**: Sayı bir rehber, mutlak değil. 410 satır dosya "hemen böl" değil, "şüpheli — gerçekten tek sorumluluğu mu kapsıyor?" sorusudur. Yapısal bölme, yapay bölmeden iyidir.

## 4. Tasarım Kuralları

> **TEK KAYNAK**: Tüm tasarım kararları `docs/design-system.md` ve `/design` sayfasında belgelenir.
> Bu iki kaynak birbiriyle SENKRON tutulur. Başka hiçbir yerde tasarım kuralı tanımlanmaz.

### 4.1 Tasarım Felsefesi
- **İlk izlenim minimalist.** Boşluk boldur. Boşluk = nefes.
- **Progressive disclosure**: Bilgi katman katman açılır, asla hepsi birden gösterilmez
- **Micro-interactions**: Hover, focus, transition — her şey canlı hissettirmeli
- **Dark mode birinci sınıf vatandaş.** Sonradan eklenmez, baştan tasarlanır.
- **Mobile-first.** Responsive değil, mobile-first.
- **Tutarlı spacing**: 4px grid sistemi (p-1, p-2, p-4, p-6, p-8...)

### 4.2 Tasarım Koruma Kuralları (MUTLAK)
1. **Tasarım değişikliği kullanıcı ONAYSIZ yapılmaz.** Renk, spacing, tipografi, component stili, animasyon — hiçbiri izinsiz değiştirilemez.
2. **Değişiklik önerisi formatı**: "Şu şu sebepten dolayı X değerini Y olarak değiştirmemizi öneriyorum. Onaylıyor musunuz?"
3. **Her tasarım değişikliğinde** `docs/design-system.md` + `/design` sayfası + ilgili token/CSS dosyası AYNI ANDA güncellenir.
4. **Yeni renk/token/component eklemek** için kullanıcıdan onay alınır, ardından: token → CSS → component → doküman → style guide sırasıyla eklenir.
5. **Hardcode YASAK**: Renk, spacing, fontSize, radius, shadow, z-index, duration — hepsi `src/config/tokens.ts` veya CSS değişkenlerinden gelir.
6. **Harici UI kütüphanesi YASAK**: shadcn, MUI, Chakra vb. eklenmez. Tüm component'ler custom.
7. **Doğrudan icon import YASAK**: Lucide iconları `src/config/icons.ts` üzerinden re-export edilir. Bileşenler `@/config/icons` kullanır, doğrudan `lucide-react` import etmez.
8. **Harici font YASAK**: Sistem fontları kullanılır.

### 4.3 Tasarım Referans Dosyaları
| Dosya | Amaç |
|-------|------|
| `docs/design-system.md` | Statik referans dokümanı — geliştiriciler için |
| `/design` sayfası | Canlı style guide — görsel referans |
| `src/config/tokens.ts` | Design token tanımları (runtime) |
| `src/app/globals.css` | CSS değişkenleri (light + dark) |
| `src/components/ui/` | Atom component'ler |

## 5. Performans Kuralları

- **Lazy load her şeyi.** Görünmeyen component yüklenmez.
- **Dynamic import** ağır modüller için (3D engine, editor, harita vs.)
- **Image optimization**: next/image veya lazy loading
- **Bundle size**: Her eklenen paket sorgulanır — gerçekten gerekli mi?

## 6. Kod Kalitesi

- TypeScript strict mode — `any` yasak
- Her public fonksiyon typed
- Console.log commit'lenmez
- Unused import/variable bırakılmaz
- **Mevcut varsa yeniden yazma.** Bir iş için `src/components/ui/`, `src/lib/`, `src/config/` altında hazır çözüm (component, hook, utility, config) varsa, o kullanılır. Aynı işi yapan ham kod (raw HTML, inline hesaplama, tekrar eden pattern) yazılmaz. Yoksa önce ortak katmana eklenir, sonra feature'da kullanılır.
  - UI atom'ları: `FormInput`, `FormSelect`, `FormTextarea`, `Button`, `Modal`, `Badge` vb. → raw `<input>`, `<select>`, `<button>` YASAK
  - Stil sabitleri: `inputClass`, `selectClass` → inline className tekrarı YASAK
  - Utility fonksiyonlar: `src/lib/` altında varsa (`turkish.ts`, `geocoding.ts`, `utils.ts`) → aynı mantığı başka yerde tekrar yazma
  - Config/sabitler: `src/config/` altında tanımlıysa → hardcode etme
- **Yeni ortak ihtiyaç = önce ortak katman.** Bir pattern 2+ yerde tekrar ediyorsa, üçüncü kullanımdan önce ortak katmana (`ui/`, `lib/`, `config/`) taşınır.
- **Tutarsızlık = borç.** Aynı işi farklı şekilde yapan kod (farklı hata yönetimi, farklı tarih formatı, farklı import yolu) fark edildiğinde düzeltilir, ertelenmez.

## 7. İsimlendirme

- Component: PascalCase (`ProjectCard.tsx`)
- Hook: camelCase, `use` prefix (`useProject.ts`)
- Utility: camelCase (`formatDate.ts`)
- Type: PascalCase (`ProjectType`)
- Config: camelCase (`siteConfig.ts`)
- Sabitler: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

## 8. Git & Deploy Akışı

- Commit mesajları Türkçe, açıklayıcı
- Bir commit = bir mantıksal değişiklik
- **Geliştirme branch'i**: `claude/*` branch'leri kullanılır
- **Otomasyon**: Claude branch'e push → GitHub Actions otomatik main'e merge → otomatik deploy
- **Manuel müdahale YOK**: Kullanıcı GitHub'a girmez, merge/deploy tamamen otomatik
- **Workflow dosyası**: `.github/workflows/auto-merge.yml` — merge + deploy tetikleme
- **Deploy dosyası**: `.github/workflows/deploy.yml` — build + GitHub Pages deploy
- **Site adresi**: https://ahmetguner74.github.io/spherical/
- **Akış**: `git push claude/*` → auto-merge → main → deploy → site güncellenir
- **PUSH ÖNCESİ BUILD KONTROLÜ ZORUNLU**: `npm run build` çalıştırılır, hata varsa push YAPILMAZ. Build kırık push = site çöker. Syntax hatası, eksik import, tip hatası — hepsi push öncesi yakalanmalı.
- **GitHub ayarları** (bir kerelik yapıldı):
  - Actions → Workflow permissions → "Read and write permissions"
  - Actions → "Allow GitHub Actions to create and approve pull requests" ✓
  - Pages → Source → "GitHub Actions"

## 9. Ahmet'in Dünyası (GitHub'dan Çıkarılan)

Ahmet'in uzmanlık alanları ve Spherical'a entegre edilecek projeler:

### 3D & GIS Uzmanı
- **cbs3b**: CesiumJS ile 3D şehir modeli (Bursa Belediyesi) — ölçüm, GeoJSON, DXF, admin paneli
- **Gis-360**: Küre fotoğrafların harita üzerinde görüntülenmesi (Pannellum + harita)
- **3d-digital-lab**: React + TypeScript + shadcn-ui ile 3D lab platformu
- **potree / potree_smo**: Nokta bulutu (point cloud) görüntüleyici
- **bursa360**: 360° panoramik içerik platformu
- **Solar**: Güneş enerjisi ile ilgili proje

### Web Geliştirme
- **mimaryusuf**: Mimar portfolio sitesi (Next.js + Vercel)
- **ev-servis**: Ev hizmetleri platformu (Next.js 15 + Supabase + auth + real-time)

### Oyun / Eğitim
- **bayrak-bilmece**: Bayrak tahmin oyunu (TypeScript, birçok versiyon)

### Spherical'ın Amacı
> Kapsamlı bir kişisel platform. GitHub projeleri referans, taşınmayacak.
> Spherical kendi başına büyüyecek: 3D, GIS, blog, admin, her şey zamanla eklenecek.
> Şu an öncelik: **sağlam iskelet**. İçerik sonra gelir, yapı şimdi doğru olmalı.

## 10. Gelecek Modüller (Hazırlıklı Ol)

- [ ] 3D/CesiumJS Viewer (cbs3b deneyiminden)
- [ ] 360° Panorama Viewer (Gis-360 / Pannellum entegrasyonu)
- [ ] Nokta Bulutu Viewer (Potree entegrasyonu)
- [ ] Harita entegrasyonu (GIS projeleri)
- [ ] Proje Yönetimi (Kanban, timeline)
- [ ] Blog CMS (MDX tabanlı)
- [ ] Auth sistemi (ev-servis'teki Supabase deneyimi)
- [ ] Admin paneli
- [ ] Dosya yönetimi
- [ ] Real-time collaboration
- [ ] AI entegrasyonu
- [ ] Bildirim sistemi

## 11. Kullanıcı Profili

- **Geliştirme ortamı**: Mobil web (telefondan geliştirme + test)
- **Hedef kitle**: Herkes — hem teknik hem kreatif, geniş kitleye hitap
- **Site amacı**: Başlangıçta kişisel portfolyo → zamanla ürün/SaaS platformuna dönüşecek
- **İlham kaynağı**: Chess.com — hızlı yüklenme, yoğun ama düzenli bilgi, koyu tema, anlık etkileşim
- **Dil**: Türkçe

## 12. Tasarım Kararları (Kesinleşmiş)

> **Detaylı tasarım referansı**: `docs/design-system.md` (tek kaynak)
> **Canlı style guide**: `/design` sayfası

**Özet** (detaylar için design-system.md'ye bak):
- Profesyonel-minimal karakter (Chess.com ilhamı)
- Koyu tema varsayılan, yeşil/sarı accent renkler
- 4px grid spacing, mobile-first responsive
- Dashboard tam genişlik, marketing sayfaları max 1280px
- Sistem fontları (harici font yok)
- Custom component'ler (harici UI kütüphanesi yok)

**UX kararları**:
- Arama çubuğu: Şu an yok, ileride eklenecek
- Komut çubuğu (Cmd+K): Şu an yok, ileride eklenecek

## 13. Çalışma Prensibi

- **Önce sor, sonra yap.** Yeni bir özellik veya büyük değişiklik öncesi kullanıcıya seçenekli sorular sor.
- **Varsayma, anla.** Kullanıcının kafasındakini tam anlamadan koda dokunma.
- **Hemen işe başlama.** Kullanıcıyı önce seçmeli sorularla tam anla, sonra harekete geç.
- **CLAUDE.md her oturum başında okunur.** Kurallar tekrar sorulmaz.
- **CLAUDE.md dinamik güncellenir.** Sohbet sırasında projenin yapısı, mimarisi, hedefleri veya kararları değiştiğinde CLAUDE.md anında güncellenir. Bu dosya her zaman en güncel ve en doğru hali yansıtmalı. Eski/geçersiz bilgi bırakılmaz, üzerine yazılır. Her commit'te CLAUDE.md kontrol edilir.

## 14. Versiyon Yönetimi (Semver)

- **Format**: `MAJOR.MINOR.PATCH` (örn: `0.3.1`)
- **Kaynak dosya**: `src/config/version.ts` — tek doğruluk kaynağı
- **Changelog**: `src/config/changelog.ts` — her versiyon için yapılanlar listesi
- **Gösterim**: Footer'da küçük versiyon badge'i, tıklanınca changelog açılır
- **Artırma kuralı**:
  - Her commit+push = **patch** otomatik artır
  - Yeni özellik (feat) = kullanıcı söyler → **minor** artır
  - Büyük kırılma (breaking) = kullanıcı söyler → **major** artır
- **Otomasyon**: Claude her commit+push öncesi version.ts'deki patch'i +1 artırır ve changelog'a ekleme yapar
- **ZORUNLU**: Commit+push işlemi yapılırken versiyon artırılmadan push YAPILMAZ

## 15. Altın Kural

> "Basit görünsün, güçlü çalışsın. Kullanıcı karmaşıklığı hissetmesin, geliştirici kaosu yaşamasın."

## 16. CBS İHA Birimi — Operasyon Yönetim Sistemi

> Bursa Büyükşehir Belediyesi CBS İHA Birimi için tam kapsamlı operasyon yönetim paneli.
> Saha ve ofiste kullanılabilir. Ekibin yaptığı işleri görünür kılmak ana hedef.

### Birim Bilgileri
- **Kurum**: Bursa Büyükşehir Belediyesi CBS Müdürlüğü
- **Birim**: İHA (İnsansız Hava Aracı) Birimi
- **Ekip**: 7 kişi (Pilot, GPS Operatörü, Veri İşleme Uzmanı, LiDAR Operatörü, CBS Uzmanı, Teknisyen)
- **Sunucu**: cbsuygulamalari.bursa.bel.tr
- **CORS Ağı**: BUSAGA (Bursa Su ve Kanalizasyon İdaresi GNSS ağı)

### Donanım Envanteri
- **Tarayıcı**: Xgrids L2 Pro (drone kiti + araç kiti)
- **GPS/GNSS**: Stonex S990A
- **Drone**: Wingtra Gen2, DJI Matrice 300 RTK (Share 102S oblik), DJI Matrice 4E
- **Ödünç**: DJI P1 kamera, Phantom 4 RTK, DJI Mini 4 Pro (Harita Şubeden)
- **Araç**: 1x Isuzu 4x4
- **Bilgisayar**: 4x İş İstasyonu
- **Depolama**: ihaarsiv (10TB), cografidrone (60TB)

### Yazılım Envanteri
Metashape, Bentley iTwin Capture, Pix4D, DJI Terra, QGIS, ArcGIS, NetCAD, AutoCAD, Blender, MicroStation, StaticToRinex, Lixel Studio, Lixel Cyber Color, Cyclone

### Operasyon Tipleri (5)
1. **LiDAR Tarama (El)**: Xgrids ile bina/yapı iç-dış tarama
2. **LiDAR Tarama (Araç)**: Xgrids araç üstü yol/cadde tarama (GPS 5km içinde)
3. **Drone Fotogrametri**: Wingtra/Matrice ile hava fotoğrafı → ortofoto/DEM/DSM
4. **Oblik Çekim**: Matrice 300 + Share 102S ile 3D şehir modeli
5. **360° Panorama**: DJI Matrice 4E ile panoramik çekim

### Wingtra İş Akışı (Referans)
1. Talep gelir (yazılı/sözlü/iç planlama)
2. SHGM'den uçuş izni alınır → HSD belgesi (koordinatlar, yükseklik, koşullar)
3. Sahaya gidilir, güvenli iniş/kalkış noktası seçilir
4. HSD'deki koordinasyon irtibatları aranır
5. Tabletten uçuş planı çizilir (alan, GSD, yükseklik)
6. Uçuş yapılır (birden fazla sorti olabilir)
7. Ofise dönülür, SD karttan veriler alınır
8. BUSAGA'dan RINEX dosyaları indirilir (tarih+saat)
9. PPK yazılımında hassas koordinat elde edilir
10. Fotogrametri yazılımında işlenir (Metashape/Pix4D)
11. Çıktılar (ortofoto, DEM, nokta bulutu) üretilir
12. COPC formatına dönüştürülüp sunucuya yüklenir
13. Talep edene teslim edilir

### Xgrids İş Akışı (Referans)
1. GPS (Stonex) statik oturum başlatılır
2. 20 dakikalık taramalar yapılır (bina iç/dış)
3. GPS durdurulur, RTK koordinatı ve statik data kaydedilir
4. Veriler drive'a yüklenir (Lixel Studio için)
5. StaticToRinex ile dönüşüm yapılır
6. Navigation dosyaları + veriler → PPK processing
7. Nokta bulutu + panorama çıktıları alınır

### Sistem Mimarisi (GÜNCEL — v0.8.199)

> **DİKKAT: Bu bölüm sistemin GERÇEK durumunu yansıtır. Varsayımda bulunma, burayı oku.**

- **Route**: `/` — Ana sayfa doğrudan İHA Birimi paneli
- **Framework**: Next.js 16 + TypeScript strict + Tailwind CSS
- **State**: Zustand (ihaStore.ts) — tüm veri Supabase'den çekilir (auditLog dahil)
- **Veritabanı**: **Supabase PostgreSQL — TAM ENTEGRE, ÇALIŞIYOR** ❗
  - Client: `src/lib/supabase.ts` (createClient ile gerçek bağlantı)
  - Data layer: `src/components/features/iha/shared/ihaStorage.ts`
  - **localStorage KULLANILMIYOR** — tüm CRUD direkt Supabase'e gider
  - 16 tablo: `iha_operations`, `iha_flight_permissions`, `iha_flight_logs`, `iha_equipment`, `iha_software`, `iha_team`, `iha_storage`, `iha_storage_folders`, `iha_deliverables`, `iha_audit_log`, `iha_attachments`, `iha_checkout_log`, `iha_maintenance`, `iha_info_bank`, `iha_vehicle_events`, `iha_field_prep` (saha hazırlığı checklist — ON DELETE CASCADE ile operasyona bağlı)
  - **Tüm tablolar UI'da görünür** — bakım, dosya ekleri, audit log, zimmet dahil
  - Dosya depolama: Supabase Storage `iha-files` bucket (profil foto, lisans belgesi, dosya ekleri)
  - Seed mekanizması: eksik varsayılan ekipman/yazılım otomatik eklenir
- **Auth**: Supabase Auth (client-side) — e-posta + şifre, JWT session, profiles tablosu (id, email, display_name, role), 16 tablo RLS
  - Provider: `src/components/providers/AuthProvider.tsx`
  - Login: `src/components/features/auth/LoginPage.tsx`
  - Hook: `src/hooks/useAuth.ts` (AuthContext wrapper)
  - Header menü: `src/components/features/auth/UserMenu.tsx`
  - SQL: `supabase/auth-profiles-rls.sql` (temel), `supabase/rls-admin-roles.sql` (rol bazlı), `supabase/role-3tier-migration.sql` (3 rol geçişi)
  - **Roller:** `super_admin` + `admin` + `viewer` (profiles.role)
  - **İzin sistemi:** `src/config/permissions.ts` (rol → izin mapping), `usePermission()` hook → `can("operations.delete")` granüler kontrol
  - **is_admin():** `super_admin` VEYA `admin` — her ikisi de yazar
  - **is_super_admin():** Sadece `super_admin` — kullanıcı yönetimi, kritik işlemler
  - **RLS politikaları (DB seviyesi):**
    - 14 iha_* tablo: SELECT → authenticated, INSERT/UPDATE/DELETE → admin+ (viewer hariç)
    - `iha_team`: SELECT → authenticated, INSERT/UPDATE/DELETE → admin+
    - `iha_audit_log`: SELECT/INSERT → authenticated, UPDATE/DELETE → tamamen yasak
    - `profiles`: SELECT → herkes, UPDATE → kendi profilini (role sadece super_admin değiştirir)
  - **Super admin only UI:** Kullanıcı yönetimi (settings.users), denetim günlüğü (reports.audit)
  - **Admin UI:** Silme butonları, ekipman/yazılım ekleme, personel ekleme, zimmet, ayarlar/depolama
  - **Viewer:** Tüm sekmeleri görür (ayarlar hariç), hiçbir şeyi değiştiremez
  - **Audit log:** `iha_audit_log` tablosu, `performedBy` gerçek user UUID
- **Harita**: Leaflet + react-leaflet (OSM/Dark/Uydu katmanları)
- **Hava Durumu**: Open-Meteo API (ücretsiz, API anahtarı gereksiz) — Dashboard'da anlık hava + 7 günlük tahmin şeridi, uçuş uygunluk göstergesi (yeşil/sarı/kırmızı), 15dk localStorage cache
- **Resmi Tatiller**: `src/config/holidays.ts` (2020-2030) — Sabit tatiller fonksiyonla, Ramazan/Kurban bayramları elle tanımlı (Diyanet verileri). Arefeler (yarım gün) dahil. Takvimde arka plan rengi (kırmızı/amber) + bayrak ikonu (🇹🇷/🕌) + gün detayında uyarı
- **Versiyon sistemi**: `src/config/version.ts` + `src/config/changelog.ts`
- **Changelog**: Endüstri standardı — kategori rozetleri (feat/fix/refactor/perf/docs/chore), filtre, timeline

### 9 Sekme Yapısı (GÜNCEL)
| Sekme | Amaç | Dosya |
|-------|------|-------|
| **Genel Bakış** | StatusBoard (Yapılacak/Yapılıyor/Yapıldı mini kart listesi + DnD), takvim (aylık + haftalık mod, tip renkleri, durum renkleri, sürükle-bırak, hızlı durum, saat ızgarası) | `dashboard/IhaDashboard.tsx` |
| **Operasyonlar** | Tablo görünümü (mobilde kart), arama, filtre, tek tıkla durum, pagination | `operations/OperationsTab.tsx` |
| **Uçuş İzinleri** | Form-19 (SHGM) bazlı — tam form, envanterden dinamik veri, DMS koordinat, PDF indirme | `permissions/FlightPermissionsTab.tsx` |
| **Harita** | Tam ekran harita — operasyonlar + izin bölgeleri + katman filtresi + legend | `map/MapTab.tsx` |
| **Envanter** | Donanım + yazılım CRUD, zimmet/iade, bakım kayıtları, dosya ekleri | `inventory/InventoryTab.tsx` |
| **Personel** | Personel CRUD, profil fotoğrafı, pilot lisansı | `personnel/PersonnelTab.tsx` |
| **Bilgi Bankası** | Tab yapısı: Hesaplar, Lisanslar, Ağ, Sigorta, Diğer, Araç Takip (araç kartları + etkinlik takibi) | `info-bank/InfoBankTab.tsx` |
| **Raporlar** | Özet, ekipman, personel, talep analizi + denetim günlüğü (admin-only) | `reports/ReportsTab.tsx` |
| **Ayarlar** | Depolama yönetimi (admin-only sekme) | `settings/SettingsTab.tsx` |

### Bursa Paftaları (v0.8.74 — YENİ)
- **Klasör**: `public/vector/pafta_index/`
- **Kaynak dosyalar**: `bursa_itrf_30_3_5000.shp` + `.dbf/.prj/.shx/.kmz/.DGN` (TUREF TM30, 2301 pafta)
- **Runtime**: `bursa-paftalar.geojson` (WGS84, 668 KB, gzipli 44 KB)
- **Dönüştürme**: `scripts/shp-to-geojson.py` (pyshp + pyproj ile TUREF TM30 → WGS84)
- **Katman**: `PaftaLayer.tsx` — LayersControl.Overlay olarak haritada açılıp kapanır (lazy load)
- **Hassasiyet**: 14 haneli (0.1mm altı — GPS hassasiyetinin 100 katı)
- **Şema**: Her feature `{ paftaadi: "H21C02C" }` özelliğine sahip
- **Planlı kullanımlar**: otomatik pafta tespiti, pafta seçici, uçuş durumu renklendirmesi

### Bursa İlçe + Mahalle Sınırları (v0.8.92 — YENİ)
- **Klasör**: `public/vector/administrative/`
- **Kaynak**: Bursa Büyükşehir Belediyesi resmi sınır dosyaları (WGS84, MultiPolygon)
- **İlçe dosyası**: `bursa-ilceler.geojson` (998 KB, 17 ilçe, properties: `AD`, `KIMLIKNO`)
- **Mahalle dosyası**: `bursa-mahalleler.geojson` (7.8 MB, 1074 mahalle, properties: `AD`, `KIMLIKNO`, `ILCEID`)
- **Kritik**: Mahalle → İlçe UUID bağı bozuk (ILCEID ≠ ILID). Çözüm: ilçe ve mahalle için bağımsız point-in-polygon lookup
- **Hook'lar**: `useIlceData.ts` (`findIlceAt`) + `useMahalleData.ts` (`findMahalleAt`) — PaftaData pattern'i duplicate
- **Layer'lar**: `IlceLayer.tsx` (MIN_ZOOM=8, label 10+) + `MahalleLayer.tsx` (MIN_ZOOM=13, label 15+, viewport culling zorunlu)
- **Kullanım**: LocationPickerModal'da nokta/poligon seçince ilçe + mahalle anında lokal lookup'tan gelir (offline çalışır). Nominatim artık sadece sokak için
- **Türkçe title case**: `src/lib/turkish.ts` → `titleCaseTr("NİLÜFER")` → "Nilüfer"

### Operasyon Detayı (Modal İçinde — Tek Yerde)
- Durum timeline + hızlı durum değiştirme butonları
- Uçuş İzni: ekle / düzenle / sil (inline)
- Uçuş Kayıtları: ekle / sil (inline)
- Çıktılar / Teslimat yönetimi
- Dosya ekleri (Supabase Storage)
- Konum bilgisi (il/ilçe/mahalle/pafta/ada/parsel + harita)
- İş akışı checklist

### Ekipman Detayı (Modal İçinde)
- Durum, model, seri no, sahiplik, sigorta, aksesuarlar
- Ek alanlar: fiziksel durum, bakım/kalibrasyon tarihleri, firmware, batarya döngüsü
- Zimmet ver/iade al (EquipmentCheckout)
- Bakım kayıtları (MaintenanceList — iha_maintenance)
- Dosya ekleri (AttachmentList — iha_attachments)

### Mobil Navigasyon
- Hamburger menü → tam ekran menü
- Alt kısımda versiyon kartı → tıklayınca changelog açılır

### Kullanım Senaryoları (Kritik UX)
- **Sahada (telefon)**: Operasyon kartları, tek tıkla durum, takvim
- **Ofiste (masaüstü)**: Tablo, harita, detaylı düzenleme, rapor, audit log
- **Aynı veri ikisinden de erişilebilir** — Supabase gerçek zamanlı

### Gelecek Planlar
- [x] Auth + kullanıcı rolleri ✅ (v0.8.166 — Supabase Auth, e-posta+şifre, profiles, RLS)
- [x] Rol bazlı UI kısıtlamaları ✅ (v0.8.179 — 3 katmanlı: super_admin/admin/viewer, permissions.ts + usePermission hook, 17 bileşen granüler izin)
- [x] Denetim günlüğü UI ✅ (v0.8.168 — Raporlar sekmesinde, kullanıcı adı, filtre)
- [x] Excel veri aktarımı ✅ (v0.8.75 — 4 adımlı wizard, custom field desteği)
- [ ] Veri işleme pipeline (10 adım checklist)
- [ ] Pafta bazlı takip (h22d05d gibi pafta kodları)
- [ ] HBB Proje Numarası takibi (2020-BLD-151 formatı)
- [ ] Koordinat sistemi dönüşüm takibi (ED50/TUREF/3857)
- [ ] PDF rapor export
- [ ] Leaflet genişletme (Kadastral katman, WMS)
- [ ] Çevrimdışı mod (service worker + senkronizasyon)
- [ ] Bildirim sistemi

## 17. Claude İçin Zorunlu Kurallar

> **Bu kurallar Claude'un hata yapmasını engellemek için konulmuştur. İhlal edilemez.**

1. **VARSAYIMDA BULUNMA.** Bir teknoloji/yapı hakkında yorum yapmadan önce ilgili dosyayı OKU. "localStorage kullanılıyor" demeden önce `ihaStorage.ts`'i oku. "Supabase yok" demeden önce `src/lib/supabase.ts`'i oku.
2. **CLAUDE.md'Yİ GÜNCEL TUT.** Her yapısal değişiklikten sonra (sekme ekleme/silme, teknoloji değişikliği, mimari karar) CLAUDE.md'deki ilgili bölümü HEMEN güncelle. Eski bilgi = yanlış bilgi = YASAK.
3. **SİSTEMİN GERÇEK DURUMUNU BİL.** Oturum başında §16 "Sistem Mimarisi" bölümünü oku. Orası tek doğruluk kaynağıdır.
4. **KONUŞMADAN ÖNCE KONTROL ET.** "X yok" veya "X şöyle çalışıyor" demeden önce grep/read ile doğrula. Yanlış bilgi vermektense "kontrol edeyim" de.
5. **HER PUSH ÖNCESİ VE SONRASI:**
   - **ÖNCESİ (ZORUNLU):** `npm run build` çalıştır. Build başarısız ise **push YAPMA**, hatayı düzelt. Build kırık push = site çöker, kullanıcı eski versiyonda kalır.
   - **SONRASI:** version.ts patch+1, changelog'a giriş ekle, CLAUDE.md'deki "Sistem Mimarisi" bölümündeki versiyon numarasını güncelle.
   - **buildDate ASLA TAHMİN EDİLMEZ.** Her push öncesi `TZ=Europe/Istanbul date '+%Y-%m-%d %H:%M'` komutunu Bash ile çalıştır, çıktıyı aynen `version.ts` içindeki `buildDate` alanına yaz. "Sanırım şu an şu saattir" yok, komut çalıştır, çıktıyı kopyala. Yanlış saat = kullanıcıya yalan söylemek = tolere edilmez.
6. **KOD VE SQL EŞZAMANLI DEĞİŞTİRİLİR.** Bir kolona `.is()`, `.eq()`, `.update()` gibi sorgu yazılıyorsa, o kolon ilgili tabloda MUTLAKA var olmalı. Kod değişikliği yapıldığında SQL migration da aynı anda yazılmalı. Bir tablo atlanırsa VERİ KAYBI gibi görünen kritik hatalar oluşur.
7. **TOPLU DEĞİŞİKLİKTE TAM LİSTE KONTROLÜ.** Birden fazla tablo/dosya etkileniyorsa, değişiklik sonrası tüm etkilenen tabloları/dosyaları tek tek say ve karşılaştır. Kod tarafında kaç tablo etkileniyorsa, SQL tarafında da aynı sayıda tablo olmalı. Eksik = hata.
8. **DEĞİŞİKLİK SONRASI ÇAPRAZ DOĞRULAMA.** Yeni bir kolon/filtre/sorgu eklendiğinde, `grep` ile kodda o kolonu kullanan TÜM yerleri bul ve SQL migration'da hepsinin karşılığı olduğunu doğrula. Tek bile eksik bırakılmaz.
9. **MEMORY.md HER OTURUM BAŞINDA OKUNUR.** Ertelenen özellikler, alınan kararlar ve hatalardan çıkarılan dersler `MEMORY.md`'de tutulur. Önemli karar/değişiklik yapıldığında MEMORY.md güncellenir.
10. **HER AÇIKLAMAYI ÖRNEKLE YAP.** Kullanıcıya yapılan işi anlatırken teknik terim kullanma. Somut örnekle açıkla: "X yaptın → eskiden Y oluyordu → şimdi Z oluyor" formatında. Kullanıcı geliştirici değil, sonucu görmek ister.
11. **PUSH ÖNCESİ MAIN SENKRON ZORUNLU.** Başka Claude ajanları paralel branch'lerde çalışabilir. Push öncesi §18'i uygula. İhlal = auto-merge failure = deploy olmaz.

## 18. Çoklu Ajan Koordinasyonu

> Spherical üzerinde eş zamanlı birden fazla Claude oturumu çalışabilir. Her biri kendi `claude/*` branch'inde. Main'e otomatik merge olduğu için çakışma riski yüksek.

### 18.1 Push Öncesi Senkron (ZORUNLU 5 adım)
Her `git push` öncesi:
```bash
# 1. Main'i fetch et
git fetch origin main

# 2. Main ileride mi? Eğer yeni commit varsa listele
git log HEAD..origin/main --oneline

# 3. Yeni commit varsa merge et
git merge origin/main

# 4. Çakışma varsa §18.2 kurallarına göre çöz

# 5. Merge sonrası TEKRAR build
npm run build

# 6. Build başarılıysa push
git push -u origin claude/<branch-name>
```

### 18.2 Çakışma Çözme Kuralları

**`src/config/version.ts`** (en sık çakışır):
- `git show origin/main:src/config/version.ts` ile main'in patch'ini oku
- Yeni patch = **max(local.patch, main.patch) + 1** (duplicate imkansız olur)
- buildDate = güncel Türkiye saati (`TZ=Europe/Istanbul date '+%Y-%m-%d %H:%M'`)

**`src/config/changelog.ts`**:
- **ASLA mevcut entry'yi DÜZENLEME veya SİLME** — main'den gelen entry'leri aynen koru
- Kendi entry'ni **en üste EKLE** (yeni bump'a uygun versiyonla)
- Main'den gelen entry'leri altta bırak, versiyon numaralarını yeniden sıralama

**`CLAUDE.md`**:
- Kendi versiyon referanslarını (§16 başlığı + son güncelleme satırı) yeni bump'a güncelle
- Main'in §16 veya §17 içeriğini değiştirmişse o içerikleri koru

### 18.3 Çakışma Alanları Tablosu

| Dosya | Çakışma Riski | Strateji |
|-------|---------------|----------|
| `src/config/version.ts` | 🔴 Her push'ta | max+1 kuralı |
| `src/config/changelog.ts` | 🔴 Her push'ta | Append-only, yeniden sıralama yok |
| `CLAUDE.md` | 🟡 Yüksek | Kendi versiyon referansını güncelle, diğer içeriği koru |
| Feature component'leri | 🟢 Düşük | Ajan başına farklı feature → nadir çakışır |
| Shared utilities | 🟡 Orta | Merge öncesi ilgili agent'ın ne değiştirdiğine bak |

### 18.4 Diğer Ajan Farkındalığı
- Kullanıcı "X ajanı Y konusunda çalışıyor" derse → o alana DOKUNMA
- `git log origin/main -10 --oneline` ile main'deki son aktiviteyi gör
- Çakışma şüphesinde: önce merge dene, sonuç iyi mi kontrol et, push et
- Asla `git push --force` yapma — diğer ajanın işini ezerler

### 18.5 Changelog Takip Edilebilirliği
Changelog endüstri standardı append-only tutulur. Main'deki her entry sabit kalır. Böylece:
- Her ajan kendi işini ekler, kimin ne yaptığı belli olur
- Versiyon numaraları linear (0.8.181, 0.8.182, ..., 0.8.186) — hiç duplicate yok
- Git blame ile her entry'nin kaynağı takip edilebilir

---
*Son güncelleme: 2026-04-16 (v0.8.199)*
