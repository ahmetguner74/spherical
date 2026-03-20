export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "0.2.2",
    date: "2026-03-20",
    changes: [
      "GitHub Actions: claude/* branch otomatik PR + merge workflow eklendi",
      "Artık claude branch'e push = otomatik main'e merge",
    ],
  },
  {
    version: "0.2.1",
    date: "2026-03-20",
    changes: [
      "Semver versiyon yönetim sistemi eklendi",
      "Footer'da tıklanabilir versiyon badge'i",
      "Changelog modal: tüm versiyonları ve değişiklikleri gösterir",
      "BRAIN.md'ye versiyon kuralları eklendi",
    ],
  },
  {
    version: "0.2.0",
    date: "2026-03-20",
    changes: [
      "Chess.com tarzı dashboard ana sayfa iskeleti",
      "Koyu tema: yeşil/sarı accent renk paleti",
      "Header: ana sayfada gizli, diğerlerinde minimal",
      "Tam ekran hamburger mobil menü",
      "CSS değişken sistemi ile tema altyapısı",
      "Feature flags config eklendi",
      "Blog, Projeler, Hakkımda sayfaları iskelet olarak güncellendi",
      "SVG ikonlar ayrı modüle taşındı",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-03-19",
    changes: [
      "Next.js 16 ile platform mimarisi kuruldu",
      "Temel sayfa yapısı: Ana Sayfa, Blog, Projeler, Hakkımda",
      "Tailwind CSS tema sistemi",
      "Dark/Light mode desteği",
      "Responsive header ve footer",
      "UI bileşenleri: Card, Badge, Button, Container",
    ],
  },
];
