# CLAUDE.md

## Kurallar

- Her zaman dürüst ol. Kullanıcıya karşı asla yanıltıcı veya yanlış bilgi verme.

---

# SPHERICAL - Beyin Dosyası
> Bu dosya projenin DNA'sıdır. Her oturum başında okunur. Buradaki kurallar tartışılmaz.

---

## 1. Temel Felsefe

- **Yüzey sade, derinlik sonsuz.** Google gibi — kullanıcı ilk bakışta sadece ihtiyacını görür, ama altında onlarca katman yaşar.
- **Her şey modüler.** Tek bir dosya asla şişmez. 50 satırı geçen component bölünür.
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

- Component: max **50 satır** JSX, geçerse böl
- Hook: max **30 satır**, geçerse böl
- Utility: max **20 satır** per function
- Page: sadece composition yapar, iş mantığı component'lere delege edilir
- Style: Tailwind inline, tekrar eden pattern varsa component'e çevir

## 4. Tasarım Kuralları

- **İlk izlenim minimalist.** Boşluk boldur. Boşluk = nefes.
- **Progressive disclosure**: Bilgi katman katman açılır, asla hepsi birden gösterilmez
- **Micro-interactions**: Hover, focus, transition — her şey canlı hissettirmeli
- **Dark mode birinci sınıf vatandaş.** Sonradan eklenmez, baştan tasarlanır.
- **Mobile-first.** Responsive değil, mobile-first.
- **Tutarlı spacing**: 4px grid sistemi (p-1, p-2, p-4, p-6, p-8...)

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

- **Şu anki aşama**: İHA Birimi operasyon paneli aktif — Supabase entegre, 8 sekmeli, mobil uyumlu
- **Karakter**: Profesyonel-minimal — siyah-beyaz ağırlıklı, ciddi, mühendislik hissi
- **Ana sayfa**: Chess.com tarzı dashboard yapısı (kartlar ileride doldurulacak)
- **Header**: Her sayfada aynı, tutarlı tek header (mainNav config'den)
- **Mobil navigasyon**: Hamburger menü → tam ekran menü açılır
- **Renk teması**: Koyu zemin (Chess.com tarzı) + yeşil/sarı accent renkler, göze rahat
- **Arama çubuğu**: Şu an yok, ileride eklenecek
- **Komut çubuğu (Cmd+K)**: Şu an yok, ileride eklenecek
- **Dark mode**: Varsayılan ve birincil tema
- **Performans**: Anlık tepki, hızlı sayfa geçişleri — Chess.com standardı
- **UX**: Yoğun ama düzenli bilgi sunumu, kalabalık hissettirmeden
- **Layout**: Dashboard `Container size="full"` (tam genişlik), marketing sayfaları `"lg"` (max 1280px)
- **Geliştirme ortamı**: Mobil web — telefondan geliştirme + test

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

### Sistem Mimarisi (GÜNCEL — v0.8.42)

> **DİKKAT: Bu bölüm sistemin GERÇEK durumunu yansıtır. Varsayımda bulunma, burayı oku.**

- **Route**: `/` — Ana sayfa doğrudan İHA Birimi paneli
- **Framework**: Next.js 16 + TypeScript strict + Tailwind CSS
- **State**: Zustand (ihaStore.ts) — tüm veri Supabase'den çekilir (auditLog dahil)
- **Veritabanı**: **Supabase PostgreSQL — TAM ENTEGRE, ÇALIŞIYOR** ❗
  - Client: `src/lib/supabase.ts` (createClient ile gerçek bağlantı)
  - Data layer: `src/components/features/iha/shared/ihaStorage.ts`
  - **localStorage KULLANILMIYOR** — tüm CRUD direkt Supabase'e gider
  - 15 tablo: `iha_operations`, `iha_flight_permissions`, `iha_flight_logs`, `iha_equipment`, `iha_software`, `iha_team`, `iha_storage`, `iha_storage_folders`, `iha_deliverables`, `iha_audit_log`, `iha_attachments`, `iha_checkout_log`, `iha_maintenance`, `iha_info_bank`, `iha_vehicle_events`
  - **Tüm tablolar UI'da görünür** — bakım, dosya ekleri, audit log, zimmet dahil
  - Dosya depolama: Supabase Storage `iha-files` bucket (profil foto, lisans belgesi, dosya ekleri)
  - Seed mekanizması: eksik varsayılan ekipman/yazılım otomatik eklenir
- **Harita**: Leaflet + react-leaflet (OSM/Dark/Uydu katmanları)
- **Versiyon sistemi**: `src/config/version.ts` + `src/config/changelog.ts`
- **Changelog**: Endüstri standardı — kategori rozetleri (feat/fix/refactor/perf/docs/chore), filtre, timeline

### 9 Sekme Yapısı (GÜNCEL)
| Sekme | Amaç | Dosya |
|-------|------|-------|
| **Genel Bakış** | StatusBoard (Yapılacak/Yapılıyor/Yapıldı mini kart listesi + DnD), takvim (aylık + haftalık mod, tip renkleri, durum renkleri, sürükle-bırak, hızlı durum, saat ızgarası) | `dashboard/IhaDashboard.tsx` |
| **Operasyonlar** | Tablo görünümü (mobilde kart), arama, filtre, tek tıkla durum, pagination | `operations/OperationsTab.tsx` |
| **Uçuş İzinleri** | Bağımsız izin yönetimi — CRUD, durum takibi, poligon/daire bölge desteği | `permissions/FlightPermissionsTab.tsx` |
| **Harita** | Tam ekran harita — operasyonlar + izin bölgeleri + katman filtresi + legend | `map/MapTab.tsx` |
| **Envanter** | Donanım + yazılım CRUD, zimmet/iade, bakım kayıtları, dosya ekleri | `inventory/InventoryTab.tsx` |
| **Personel** | Personel CRUD, profil fotoğrafı, pilot lisansı | `personnel/PersonnelTab.tsx` |
| **Bilgi Bankası** | Tab yapısı: Hesaplar, Lisanslar, Ağ, Sigorta, Diğer, Araç Takip (araç kartları + etkinlik takibi) | `info-bank/InfoBankTab.tsx` |
| **Raporlar** | Özet, ekipman, personel, talep analizi, denetim günlüğü | `reports/ReportsTab.tsx` |
| **Ayarlar** | Depolama yönetimi + işlem geçmişi (audit log) | `settings/SettingsTab.tsx` |

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
- [ ] Auth + kullanıcı rolleri (Supabase Auth + RLS)
- [ ] Excel veri aktarımı (519 Wingtra + 20 M300 + 32 Panorama)
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
5. **HER PUSH'TAN SONRA** version.ts patch+1, changelog'a giriş ekle, CLAUDE.md'deki "Sistem Mimarisi" bölümündeki versiyon numarasını güncelle.

---
*Son güncelleme: 2026-04-08 (v0.8.42)*
