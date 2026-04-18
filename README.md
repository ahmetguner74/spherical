# Spherical

Kapsamlı kişisel platform — yazılım projeleri, 3D görselleştirme, proje yönetimi ve teknik blog.

**Site:** [ahmetguner74.github.io/spherical](https://ahmetguner74.github.io/spherical)

## Teknolojiler

- **Next.js 16** — App Router, static export
- **React 19** — Server & Client Components
- **TypeScript** — Strict mode
- **Tailwind CSS 4** — Utility-first styling
- **Zustand** — State management
- **GitHub Pages** — Deployment

## Geliştirme

```bash
npm install
npm run dev
```

## Deploy

GitHub Actions ile otomatik:

1. `claude/*` branch'e push
2. Auto-merge workflow → main'e merge
3. Deploy workflow → GitHub Pages'e yayınla

### Canlı sürüm doğrulama

Deploy sonrası canlıda doğru sürümü görmek için:

1. Siteyi aç: `https://ahmetguner74.github.io/spherical`
2. Giriş ekranının altındaki sürüm satırını kontrol et (`vX.Y.Z · YYYY-MM-DD HH:MM`)
3. Gerekirse tarayıcıda hard refresh yap (`Ctrl+F5`)

## Lisans

MIT
