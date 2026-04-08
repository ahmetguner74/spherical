# Spherical Design System

> **Bu dosya projenin TEK tasarim referans kaynagindir.**
> Tasarimla ilgili her karar burada belgelenir. Bu dosyada yazili olmayan bir tasarim kurali GECERSIZDIR.
> Degisiklik yapmak icin kullanicidan ONAY alinmalidir.

**Son guncelleme**: 2026-04-08 | **Versiyon**: v0.8.42

---

## 1. Tasarim Felsefesi

| Ilke | Aciklama |
|------|----------|
| **Minimalist ilk izlenim** | Bosluk boldur. Bosluk = nefes. |
| **Progressive disclosure** | Bilgi katman katman acilir, asla hepsi birden gosterilmez |
| **Micro-interactions** | Hover, focus, transition — her sey canli hissettirmeli |
| **Dark mode birinci sinif** | Sonradan eklenmez, bastan tasarlanir |
| **Mobile-first** | Responsive degil, mobile-first |
| **4px grid** | Tum spacing degerleri 4px'in katlari |
| **Chess.com ilhami** | Hizli yuklenme, yogun ama duzenli bilgi, koyu tema, anlik etkilesim |

---

## 2. Renk Paleti

### 2.1 Temel Renkler

| Token | Light | Dark | Kullanim |
|-------|-------|------|----------|
| `--background` | `#ffffff` | `#262522` | Sayfa arka plani |
| `--foreground` | `#1a1a1a` | `#bababa` | Ana metin rengi |
| `--surface` | `#f5f5f4` | `#302e2b` | Kart/panel arka plani |
| `--surface-hover` | `#e7e5e4` | `#3a3835` | Hover durumu arka plani |
| `--accent` | `#4d9c2d` | `#81b64c` | Ana vurgu rengi (yesil) |
| `--accent-hover` | `#3d7c23` | `#95ca5e` | Vurgu hover |
| `--accent-secondary` | `#c9a227` | `#e8c452` | Ikincil vurgu (altin/sari) |
| `--muted` | `#f5f5f4` | `#1a1916` | Soluk arka plan |
| `--muted-foreground` | `#78716c` | `#989898` | Ikincil metin rengi |
| `--border` | `#e7e5e4` | `#3a3835` | Kenar cizgisi |

### 2.2 Durum Renkleri

| Durum | Renk | Hex | Kullanim |
|-------|------|-----|----------|
| Talep | Gri | `#6b7280` | Yeni gelen talepler |
| Planlama | Sari | `#eab308` | Planlamaya alinan isler |
| Saha | Yesil | `#22c55e` | Sahada olan operasyonlar |
| Isleme | Turuncu | `#f97316` | Veri isleme asamasi |
| Kontrol | Mavi | `#3b82f6` | Kalite kontrol |
| Teslim | Teal | `#10b981` | Tamamlanan isler |
| Iptal | Kirmizi | `#ef4444` | Iptal edilen isler |

Her durum renginin `20` (12% opacity) seffaflikta `-bg` varyanti vardir.

### 2.3 Operasyon Tipi Renkleri

| Tip | Light | Dark |
|-----|-------|------|
| LiDAR (El) | `#3b82f6` | `#60a5fa` |
| LiDAR (Arac) | `#6366f1` | `#818cf8` |
| Drone Fotogrametri | `#a855f7` | `#c084fc` |
| Oblik Cekim | `#ec4899` | `#f472b6` |
| 360 Panorama | `#06b6d4` | `#22d3ee` |

### 2.4 Harita Renkleri

| Token | Hex | Kullanim |
|-------|-----|----------|
| `permission` | `#22c55e` | Ucus izni bolgeleri |
| `emptyText` | `#888888` | Bos durum metni |

---

## 3. Tipografi

### 3.1 Font Ailesi

```
Sans:  system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
Mono:  ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace
```

Harici font KULLANILMAZ. Sistem fontlari performans icin tercih edilir.

### 3.2 Font Boyutlari

| Token | Boyut | Piksel | Kullanim |
|-------|-------|--------|----------|
| `xs` | 0.75rem | 12px | Etiketler, badge, yardimci metin |
| `sm` | 0.875rem | 14px | Tablo icerigi, form alanlari, buton metni |
| `base` | 1rem | 16px | Govde metni |
| `lg` | 1.125rem | 18px | Alt basliklar |
| `xl` | 1.25rem | 20px | Basliklar |
| `2xl` | 1.5rem | 24px | Sayfa basliklari |
| `3xl` | 1.875rem | 30px | Buyuk basliklar |
| `4xl` | 2.25rem | 36px | Hero basliklar |

### 3.3 Font Agirlik

| Token | Deger | Kullanim |
|-------|-------|----------|
| `normal` | 400 | Govde metni |
| `medium` | 500 | Vurgulu govde |
| `semibold` | 600 | Kart basliklari, etiketler |
| `bold` | 700 | Sayfa basliklari, logo |

### 3.4 Satir Yuksekligi

| Token | Deger | Kullanim |
|-------|-------|----------|
| `tight` | 1.25 | Basliklar |
| `normal` | 1.5 | Govde metni |
| `relaxed` | 1.75 | Uzun paragraflar |

---

## 4. Spacing Sistemi (4px Grid)

| Token | Deger | Piksel | Kullanim |
|-------|-------|--------|----------|
| `0` | 0 | 0px | — |
| `0.5` | 0.125rem | 2px | Cok kucuk bosluklar |
| `1` | 0.25rem | 4px | Icon boslugu |
| `2` | 0.5rem | 8px | Ic bosluk kucuk |
| `3` | 0.75rem | 12px | Form alanlari arasi |
| `4` | 1rem | 16px | Kart ic boslugu |
| `5` | 1.25rem | 20px | Bolum boslugu |
| `6` | 1.5rem | 24px | Buyuk ic bosluk |
| `8` | 2rem | 32px | Bolum arasi |
| `10` | 2.5rem | 40px | Buyuk bolum arasi |
| `12` | 3rem | 48px | Sayfa bolumleri |
| `16` | 4rem | 64px | Buyuk ayirici |
| `20` | 5rem | 80px | Hero bolumleri |

---

## 5. Border Radius

| Token | Deger | Piksel | Kullanim |
|-------|-------|--------|----------|
| `none` | 0 | 0px | Keskin koseler |
| `sm` | 0.25rem | 4px | Badge, kucuk elemanlar |
| `md` | 0.375rem | 6px | Form alanlari |
| `lg` | 0.5rem | 8px | Butonlar |
| `xl` | 0.75rem | 12px | Kartlar, modaller |
| `2xl` | 1rem | 16px | Buyuk kartlar |
| `full` | 9999px | — | Pill seklinde, avatar |

---

## 6. Golge (Shadow)

| Token | Deger | Kullanim |
|-------|-------|----------|
| `none` | none | Golgesiz |
| `sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Hafif yukselme |
| `md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Kart, dropdown |
| `lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Modal, toast |

---

## 7. Animasyon

### 7.1 Sure

| Token | Deger | Kullanim |
|-------|-------|----------|
| `fast` | 100ms | Hover efektleri |
| `normal` | 150ms | Tema gecisi, genel transition |
| `slow` | 300ms | Slide animasyonlari |
| `slower` | 500ms | Buyuk gecisler |

### 7.2 Easing

| Token | Deger | Kullanim |
|-------|-------|----------|
| `default` | ease-in-out | Genel gecis |
| `in` | ease-in | Cikarma animasyonu |
| `out` | ease-out | Giris animasyonu |
| `bounce` | cubic-bezier(0.68, -0.55, 0.265, 1.55) | Eglenceli etkiler |

### 7.3 Tanimli Animasyonlar

| Isim | Kullanim |
|------|----------|
| `slideUp` | Asagidan yukari giris (300ms ease-out) |
| `toastSlideIn` | Toast giris (250ms ease-out) |
| `toastFadeOut` | Toast cikis (300ms ease-in, 3.7s gecikme) |

---

## 8. Z-Index Katmanlari

| Token | Deger | Kullanim |
|-------|-------|----------|
| `base` | 0 | Normal icerik |
| `dropdown` | 10 | Acilir menuler |
| `sticky` | 20 | Yapiskan elemanlar |
| `overlay` | 30 | Arka plan ortusu |
| `header` | 40 | Sayfa basligi |
| `modal` | 50 | Modal diyaloglar |
| `toast` | 60 | Bildirimler (en ust) |

---

## 9. Breakpoint (Kirilma Noktalari)

| Token | Deger | Kullanim |
|-------|-------|----------|
| `sm` | 640px | Kucuk telefonlar |
| `md` | 768px | Tabletler |
| `lg` | 1024px | Kucuk masaustu |
| `xl` | 1280px | Masaustu |
| `2xl` | 1536px | Genis ekran |

---

## 10. Container Boyutlari

| Token | Deger | Piksel | Kullanim |
|-------|-------|--------|----------|
| `sm` | 48rem | 768px | Dar icerik (form, yazi) |
| `md` | 64rem | 1024px | Orta icerik |
| `lg` | 80rem | 1280px | Marketing sayfalari (varsayilan) |
| `xl` | 87.5rem | 1400px | Genis icerik |
| `full` | max-w-full | — | Dashboard (tam genislik) |

---

## 11. Component Referansi

### 11.1 Button

**Dosya**: `src/components/ui/Button.tsx`

**Varyantlar**:
| Varyant | Kullanim | Stil |
|---------|----------|------|
| `primary` | Ana aksiyon | Mavi arka plan, beyaz metin |
| `secondary` | Ikincil aksiyon | Gri arka plan |
| `ghost` | Hafif aksiyon | Seffaf, hover'da arka plan |
| `outline` | Kenarli aksiyon | Border ile cevrelenmis |
| `danger` | Tehlikeli islem | Kirmizi arka plan |

**Boyutlar**:
| Boyut | Padding | Font |
|-------|---------|------|
| `sm` | px-3 py-1.5 | text-sm |
| `md` | px-4 py-2 | text-sm |
| `lg` | px-6 py-3 | text-base |

**Genel stiller**: `rounded-lg`, `font-medium`, `transition-colors`, focus ring (blue-500)

### 11.2 Card

**Dosya**: `src/components/ui/Card.tsx`

- Radius: `rounded-xl`
- Border: `border-[var(--border)]`
- Arka plan: `bg-[var(--surface)]`
- Padding: `p-4`
- Hover: `hover:bg-[var(--surface-hover)]` (kapatilabilir)

Alt bilesenler: `CardHeader` (mb-3), `CardTitle` (text-base font-semibold), `CardDescription` (text-sm muted), `CardContent`, `CardFooter` (mt-3 flex gap-2)

### 11.3 Badge

**Dosya**: `src/components/ui/Badge.tsx`

| Varyant | Kullanim |
|---------|----------|
| `default` | Genel etiket |
| `success` | Basarili durum (accent/10) |
| `warning` | Uyari (accent-secondary/10) |
| `danger` | Hata (red-500/10) |
| `info` | Bilgi (blue-500/10) |

Stil: `rounded-md px-2 py-0.5 text-xs font-medium`

### 11.4 Modal

**Dosya**: `src/components/ui/Modal.tsx`

- Overlay: `bg-black/50`, z-50
- Icerik: `max-w-lg`, `rounded-xl`, `p-6`, `max-h-[85vh]`, overflow scroll
- Escape ile kapanir, disariya tikla ile kapanir
- Body scroll kilidi aktif

### 11.5 Toast

**Dosya**: `src/components/ui/Toast.tsx`

- Pozisyon: `fixed bottom-4`, mobilde tam genislik, masaustunde `sm:max-w-sm`
- Tipler: success (yesil), error (kirmizi), info (mavi)
- Titresim destegi (mobil)
- Otomatik kapanma: 4 saniye
- Animasyon: slide-in + fade-out

### 11.6 Container

**Dosya**: `src/components/ui/Container.tsx`

- Padding: `px-4 sm:px-6 lg:px-8`
- Boyut secenekleri: sm, md, lg, xl, full

### 11.7 Form Alanlari

**Dosya**: `src/components/features/iha/shared/styles.ts`

Ortak sinif: `rounded-md`, `border-[var(--border)]`, `bg-[var(--background)]`, `px-3 py-2`, `text-sm`, focus ring accent

---

## 12. Layout Kurallari

### 12.1 Header
- Sticky, z-40
- Yukseklik: `h-14`
- Scroll'da: `backdrop-blur-md`, `bg-[var(--background)]/80`
- Logo: `text-lg font-bold`
- Nav link: `rounded-lg px-3 py-1.5 text-sm font-medium`

### 12.2 Footer
- `border-t`, `py-6`
- Copyright + GitHub linki
- `text-xs text-[var(--muted-foreground)]`

### 12.3 Sayfa Yapisi
- Marketing: `Container size="lg"` (max 1280px)
- Dashboard: `Container size="full"` (tam genislik)
- Her sayfa sadece composition yapar, is mantigi component'lere delege edilir

---

## 13. Icon Sistemi

- **Harici kutuphane KULLANILMAZ**
- Tum iconlar `src/components/ui/Icons.tsx` dosyasinda custom SVG olarak tanimli
- Props: `className` (opsiyonel)
- Renk: `currentColor` (parent'tan miras alinir)
- Mevcut iconlar: SunIcon, MoonIcon, MenuIcon, CloseIcon, GitHubIcon

Yeni icon eklemek icin:
1. `Icons.tsx` dosyasina SVG component ekle
2. `index.ts` barrel export'a ekle
3. Bu dokumani guncelle

---

## 14. Tema Sistemi

- **Varsayilan tema**: Dark mode
- **Desteklenen temalar**: light, dark, system
- **Depolama**: localStorage (`spherical-theme` anahtari)
- **Uygulama**: `.dark` class'i `<html>` elemanina eklenir
- **Gecis**: 150ms ease-in-out (background-color, border-color, color)
- **Provider**: `src/components/providers/ThemeProvider.tsx`

---

## 15. Mobil Uyumluluk Kurallari

- Input font-size: 16px (zoom engellemek icin)
- Masaustunde: 14px
- Scrollbar: 6px genislik
- Hamburger menu → tam ekran overlay
- Tablo → mobilde kart gorunumu
- Touch hedef: minimum 44px

---

## 16. Performans Kurallari (Tasarim ile Ilgili)

- Sistem fontlari kullan (harici font yuklemesi YOK)
- SVG iconlar inline (icon font YOK)
- Lazy load her gorsel (`next/image` veya native loading="lazy")
- CSS transition tercih et, JS animasyonlarindan kacin
- Bundle'a tasarim kutuphanesi EKLENMEZ (shadcn, MUI, vb. YOK)

---

## 17. Kullanilmamasi Gerekenler (YASAK)

| Yasak | Neden |
|-------|-------|
| Hardcode renk degeri | Token kullan |
| Hardcode spacing | Spacing token kullan |
| `!important` (gerekmedikce) | Specificity sorunu yaratir |
| Inline `style` (gerekmedikce) | Tailwind siniflarini kullan |
| Harici UI kutuphanesi | Tum component'ler custom |
| Harici icon kutuphanesi | Icons.tsx kullan |
| Harici font | Sistem fontlari kullan |
| `any` tipi | TypeScript strict mode |
| `console.log` commit'te | Temizlenmeli |

---

## 18. Dosya Haritasi

```
src/
├── config/
│   ├── tokens.ts          ← Design token tanimlari
│   └── site.ts            ← Site adi, nav, feature flags
├── app/
│   └── globals.css        ← CSS degiskenleri (light + dark)
├── stores/
│   └── themeStore.ts      ← Tema state yonetimi
├── components/
│   ├── ui/                ← Atom component'ler
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Container.tsx
│   │   ├── CollapsibleSection.tsx
│   │   └── Icons.tsx
│   ├── layout/            ← Layout component'ler
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileMenu.tsx
│   │   └── VersionBadge.tsx
│   ├── providers/
│   │   └── ThemeProvider.tsx
│   └── features/
│       └── iha/shared/
│           └── styles.ts  ← Ortak form siniflari
└── docs/
    └── design-system.md   ← BU DOSYA (tek kaynak)
```

---

## 19. Degisiklik Protokolu

> **KRITIK: Bu kurallar ihmal edilemez.**

1. Bu dokumanda yazili olmayan bir tasarim karari GECERSIZDIR.
2. Tasarim degisikligi yapmadan ONCE bu dokuman okunur.
3. Yeni renk, spacing, component veya pattern eklenecekse:
   - Once kullaniciya **sebep + oneri** sunulur
   - Kullanici ONAY vermeden degisiklik YAPILMAZ
   - Onay sonrasi hem kod hem bu dokuman AYNI ANDA guncellenir
4. Mevcut token/component degisikligi icin de ayni sureç isler.
5. Canli style guide sayfasi (`/design`) bu dokumanla her zaman SENKRON olmalidir.

---

*Bu dosya Spherical projesinin tek tasarim referans kaynagindir. Son guncelleme: 2026-04-08*
