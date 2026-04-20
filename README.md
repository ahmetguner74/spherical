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

## Deploy (GitHub Actions + GitHub Pages)

### Otomatik akış (doğru ve stabil model)

1. `claude/*` branch'e push et
2. `.github/workflows/auto-merge.yml` branch'i otomatik `main` ile birleştirir
3. `.github/workflows/deploy.yml` **workflow_run** olayı ile otomatik tetiklenir
4. Build başarılıysa GitHub Pages'e yayınlanır

> Neden `workflow_run`? GitHub dokümantasyonuna göre `GITHUB_TOKEN` ile yapılan push'lar başka `push` workflow'larını her zaman tetiklemeyebilir; `workflow_run` bu zinciri daha güvenli hale getirir.

### Gerekli GitHub ayarları (bir kere)

Repo → **Settings**:

- **Actions → General → Workflow permissions** = `Read and write permissions`
- **Actions → General → Allow GitHub Actions to create and approve pull requests** = `Enabled`
- **Pages → Build and deployment → Source** = `GitHub Actions`

### Sorun giderme (derin kontrol)

Detaylı teşhis ve adım adım kontrol listesi için:

- [`docs/deploy-arastirma-2026-04-20.md`](docs/deploy-arastirma-2026-04-20.md)

### Semver sürüm takibi (ilk açılış ekranı kontrolü)

Her güncellemede `src/config/version.ts` içindeki sürüm artırılır (duruma göre major/minor/patch).
Böylece login/ilk açılış ekranındaki `vX.Y.Z · tarih` satırından deployun güncel olup olmadığını anında görebilirsiniz.

Kaynaklar:

- `src/config/version.ts`
- `src/config/changelog.ts`

### Canlı sürüm doğrulama

Deploy sonrası canlıda doğru sürümü görmek için:

1. Siteyi aç: `https://ahmetguner74.github.io/spherical`
2. Giriş ekranının altındaki sürüm satırını kontrol et (`vX.Y.Z · YYYY-MM-DD HH:MM`)
3. Gerekirse tarayıcıda hard refresh yap (`Ctrl+F5`)

> Not: `codex/*` gibi farklı branch adları auto-merge akışını bozabilir; yalnızca `claude/*` kullanın.

### Hızlı sağlık kontrolü (deploy sonrası)

```bash
npm run build
```

Build başarılıysa ve canlıda sürüm satırı güncelse yayın sağlıklıdır.

## Lisans

MIT
