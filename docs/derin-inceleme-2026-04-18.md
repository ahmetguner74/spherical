# Derin İnceleme Raporu — 18 Nisan 2026

Bu rapor, `/workspace/spherical` deposunda hızlı fakat kapsamlı bir teknik tarama sonucu hazırlanmıştır.

## 1) Durum Özeti

- Proje Next.js 16 + React 19 + TypeScript + Tailwind 4 stack'i üzerinde.
- `npm run lint` çıktısı, kod tabanında **53 problem** olduğunu gösteriyor: **30 error**, **23 warning**.
- Hata tiplerinin büyük bölümü React 19 + React Compiler kurallarıyla ilgilidir (`react-hooks/set-state-in-effect`, `react-hooks/preserve-manual-memoization`, `react-hooks/purity`, `react-hooks/refs`).

## 2) Önceliklendirilmiş Bulgular

### P0 — Build/CI kırabilecek kalite bariyerleri

1. **Effect içinde senkron setState** kullanımları
   - Etki: Gereksiz render zincirleri, compiler optimizasyonlarının atlanması, lint fail.
   - Örnek dosyalar:
     - `src/components/features/iha/dashboard/FieldPrepPanel.tsx`
     - `src/components/features/iha/operations/WorkflowChecklist.tsx`
     - `src/components/layout/Header.tsx`
     - `src/components/providers/PresenceProvider.tsx`

2. **Manuel memoization ile compiler çıkarımı uyuşmazlığı**
   - Etki: React Compiler optimizasyonlarını atlıyor, teknik borç büyüyor.
   - Örnek dosyalar:
     - `src/components/features/iha/dashboard/OperationCalendar.tsx`
     - `src/components/features/iha/shared/useIhaData.ts`

3. **Render sırasında impure çağrı / ref mutation**
   - Etki: Deterministik render kuralı ihlali.
   - Örnek dosyalar:
     - `src/components/providers/AuthProvider.tsx` (`Date.now()` in render path)
     - `src/components/ui/Modal.tsx` (render sırasında `ref.current` yazımı)

### P1 — Bakım maliyeti ve davranış tutarlılığı

- `useEffect` dependency uyuşmazlıkları.
- Kullanılmayan değişken/importlar.
- `<img>` yerine `next/image` önerileri (performans/LCP etkisi).

## 3) Kök Neden Hipotezi

- React 19 ve yeni ESLint/React Compiler kuralları aktif, ancak kod tabanının önemli kısmı React 18 dönemi etkisiyle yazılmış.
- UI state akışları çoğunlukla effect-merkezli; event/reducer/callback odaklı modele tam geçilmemiş.

## 4) Önerilen Uygulama Planı

### Faz 1 (Hızlı Stabilizasyon — 0.5-1 gün)

- Amaç: `npm run lint` error sayısını 30'dan tek haneye düşürmek.
- İşler:
  1. Effect içinde sync setState kullanan bileşenleri toplu refactor et.
  2. Gereksiz `useCallback` sarmallarını kaldır veya dependency'leri compiler ile uyumlu hale getir.
  3. `Date.now()` ve render sırasında `ref.current = ...` kalıplarını effect/even-handler içine taşı.

### Faz 2 (Mimari Temizlik — 1-2 gün)

- Amaç: IHA modülünde tekrar eden state kalıplarını sadeleştirmek.
- İşler:
  1. Dashboard + Operations + Settings altında ortak state pattern'lerini hook yardımcılarına böl.
  2. Async çağrılarda loading/error/success state standardı belirle.
  3. `ihaStore` ile component-local state sınırlarını netleştir.

### Faz 3 (Kalite Kapıları — 0.5 gün)

- `lint` + `build` + temel smoke test'i CI'da zorunlu kapı yap.
- PR şablonuna “React Compiler uyumluluğu” checklist'i ekle.

## 5) Hızlı Kazanç Backlog'u

1. `src/components/layout/Header.tsx`: mount kontrolünü effect setState ile değil render-safe pattern ile çöz.
2. `src/components/ui/Modal.tsx`: `onCloseRef.current = onClose` atamasını effect'e taşı.
3. `src/components/providers/AuthProvider.tsx`: `Date.now()` başlangıcını lazy init/effect ile ele al.
4. `src/components/features/iha/dashboard/OperationCalendar.tsx`: callback dependency setlerini sadeleştir.
5. `src/components/features/iha/operations/WorkflowChecklist.tsx`: initial parse + controlled update akışını ayrıştır.

## 6) Ölçülebilir Başarı Kriterleri

- Lint: 30 error → 0 error.
- Warning: 23 warning → <10 warning.
- Dashboard/Operations ilk etkileşim TTI ve render sayılarında gözle görülür azalma.
- Re-render hotspot'larında React DevTools profiler ile doğrulanmış iyileşme.
