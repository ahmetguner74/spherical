# GitHub → Otomatik Yayın Derin İnceleme (20 Nisan 2026)

Bu doküman, **"claude branch'e push edince otomatik yayın neden bazen olmuyor?"** sorusunu teknik kök nedenleriyle çözer.

## 1) Mevcut Sorunun Kök Nedeni

GitHub Actions'ta kritik bir davranış var:

- Bir workflow içinde `GITHUB_TOKEN` kullanarak yapılan işlemler, yeni bir `push` workflow'unu her durumda tetiklemeyebilir.
- Özellikle zincirleme otomasyonlarda (`workflow A` push yapıyor, `workflow B` push ile tetiklensin bekleniyor) bu davranış deploy zincirini kırabilir.

Kaynaklar:
- GitHub Docs — Triggering a workflow: `GITHUB_TOKEN` ile oluşan event'lerin sınırlamaları.
- GitHub Docs — GITHUB_TOKEN: workflow'dan atılan commit/push tetikleme kısıtı.

## 2) Uygulanan Stabil Çözüm

`deploy.yml` dosyasına aşağıdaki tetikleyici eklendi:

- `workflow_run` (workflows: `Auto Merge Claude Branches`, types: `completed`)

Böylece akış şu oldu:

1. `claude/*` branch'e push
2. `auto-merge.yml` çalışır, `main` merge/push yapar
3. `deploy.yml`, `workflow_run` üzerinden tetiklenir
4. `workflow_run` sonucu `success` ise build+deploy ilerler

Ek güvenlik:

- `build` job'ında koşul var:
  - `github.event_name != 'workflow_run' || github.event.workflow_run.conclusion == 'success'`
- Yani merge başarısızsa boşuna deploy denemesi yapılmaz.

## 3) Neden Bu Model Daha Güvenli?

- `push(main)` tetikleyicisi yine duruyor (manuel merge veya normal push için).
- Ama otomatik merge zinciri için `workflow_run` ikinci bir güvenli yol sağlıyor.
- `gh workflow run` gibi CLI tabanlı ek adım bağımlılığı kaldırıldı; akış sadeleşti.

## 4) GitHub Tarafında Kontrol Edilecek Ayarlar

Repo ayarlarında kesinlikle doğrulayın:

1. **Settings → Actions → General → Workflow permissions**
   - `Read and write permissions`
2. **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests**
   - açık
3. **Settings → Pages → Build and deployment → Source**
   - `GitHub Actions`

> Bu üç ayardan biri yanlışsa otomasyon kısmen çalışır, kısmen sessizce başarısız olabilir.

## 5) Operasyonel Kontrol Listesi (Her Yayında)

1. Push sonrası Actions sekmesinde sıralı olarak iki run görünmeli:
   - `Auto Merge Claude Branches`
   - `Deploy to GitHub Pages`
2. Deploy run içinde:
   - `npm ci` ✅
   - `npm run build` ✅
   - `upload-pages-artifact` ✅
   - `deploy-pages` ✅
3. Site doğrulama:
   - `https://ahmetguner74.github.io/spherical`
   - sürüm etiketi doğru mu?

## 6) Hâlâ Çalışmıyorsa Derin Teşhis

Sırayla şunlara bakın:

1. **Auto-merge run logu**
   - `git merge` çatışması var mı?
   - `git push origin main` başarısız mı?
2. **Deploy run tetiklendi mi?**
   - tetiklenmediyse workflow adı değişmiş olabilir (`workflows:` filtresi birebir isim ister)
3. **Deploy build hatası**
   - eksik secret (`ECZANE_API_KEY`) veya build-time env problemi
4. **Pages deployment hatası**
   - permissions / Pages source ayarı

## 7) Referans Linkler

- GitHub Docs — Triggering a workflow  
  https://docs.github.com/en/actions/using-workflows/triggering-a-workflow
- GitHub Docs — GITHUB_TOKEN  
  https://docs.github.com/actions/concepts/security/github_token
- GitHub Docs — Events that trigger workflows (`workflow_run`)  
  https://docs.github.com/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows
- GitHub Docs — Using custom workflows with GitHub Pages  
  https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

---

Bu yapı ile hedef: **Sen kodu push'la, sistem otomatik merge etsin, ardından otomatik ve deterministik şekilde yayına alsın.**
