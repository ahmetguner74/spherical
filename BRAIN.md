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

## 8. Git Kuralları

- Commit mesajları Türkçe, açıklayıcı
- Bir commit = bir mantıksal değişiklik
- Feature branch → PR → merge

## 9. Gelecek Modüller (Hazırlıklı Ol)

- [ ] 3D Viewer (Three.js / React Three Fiber)
- [ ] Proje Yönetimi (Kanban, timeline)
- [ ] Blog CMS (MDX tabanlı)
- [ ] Auth sistemi
- [ ] Admin paneli
- [ ] Harita entegrasyonu
- [ ] Dosya yönetimi
- [ ] Real-time collaboration
- [ ] AI entegrasyonu
- [ ] Bildirim sistemi

## 10. Kullanıcı Profili

- **Geliştirme ortamı**: Mobil web (telefondan geliştirme + test)
- **Hedef kitle**: Herkes — hem teknik hem kreatif, geniş kitleye hitap
- **Site amacı**: Başlangıçta kişisel portfolyo → zamanla ürün/SaaS platformuna dönüşecek
- **İlham kaynağı**: Chess.com — hızlı yüklenme, yoğun ama düzenli bilgi, koyu tema, anlık etkileşim
- **Dil**: Türkçe

## 11. Tasarım Kararları (Kesinleşmiş)

- **Ana sayfa**: Chess.com tarzı dashboard — direkt içerik kartları (son projeler, son yazılar, hızlı erişim)
- **Header**: Ana sayfada GİZLİ, diğer sayfalarda minimal header
- **Mobil navigasyon**: Hamburger menü → tam ekran menü açılır
- **Renk teması**: Koyu zemin (Chess.com tarzı) + yeşil/sarı accent renkler, göze rahat
- **Arama çubuğu**: Şu an öncelik değil, ileride eklenebilir
- **Dark mode**: Varsayılan ve birincil tema
- **Performans**: Anlık tepki, hızlı sayfa geçişleri — Chess.com standardı
- **UX**: Yoğun ama düzenli bilgi sunumu, kalabalık hissettirmeden

## 12. Çalışma Prensibi

- **Önce sor, sonra yap.** Yeni bir özellik veya büyük değişiklik öncesi kullanıcıya seçenekli sorular sor.
- **Varsayma, anla.** Kullanıcının kafasındakini tam anlamadan koda dokunma.
- **Hemen işe başlama.** Kullanıcıyı önce seçmeli sorularla tam anla, sonra harekete geç.
- **BRAIN.md her oturum başında okunur.** Kurallar tekrar sorulmaz.

## 13. Altın Kural

> "Basit görünsün, güçlü çalışsın. Kullanıcı karmaşıklığı hissetmesin, geliştirici kaosu yaşamasın."

---
*Son güncelleme: 2026-03-20*
