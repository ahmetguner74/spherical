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

- **Şu anki aşama**: SADECE İSKELET — mimari doğru, yapı sağlam, sayfalar boş kalabilir
- **Karakter**: Profesyonel-minimal — siyah-beyaz ağırlıklı, ciddi, mühendislik hissi
- **Ana sayfa**: Chess.com tarzı dashboard yapısı (kartlar ileride doldurulacak)
- **Header**: Ana sayfada GİZLİ, diğer sayfalarda minimal header
- **Mobil navigasyon**: Hamburger menü → tam ekran menü açılır
- **Renk teması**: Koyu zemin (Chess.com tarzı) + yeşil/sarı accent renkler, göze rahat
- **Arama çubuğu**: Şu an yok, ileride eklenecek
- **Komut çubuğu (Cmd+K)**: Şu an yok, ileride eklenecek
- **Dark mode**: Varsayılan ve birincil tema
- **Performans**: Anlık tepki, hızlı sayfa geçişleri — Chess.com standardı
- **UX**: Yoğun ama düzenli bilgi sunumu, kalabalık hissettirmeden
- **Geliştirme ortamı**: Mobil web — telefondan geliştirme + test

## 13. Çalışma Prensibi

- **Önce sor, sonra yap.** Yeni bir özellik veya büyük değişiklik öncesi kullanıcıya seçenekli sorular sor.
- **Varsayma, anla.** Kullanıcının kafasındakini tam anlamadan koda dokunma.
- **Hemen işe başlama.** Kullanıcıyı önce seçmeli sorularla tam anla, sonra harekete geç.
- **CLAUDE.md her oturum başında okunur.** Kurallar tekrar sorulmaz.

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

---
*Son güncelleme: 2026-03-20*
