export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "0.4.4",
    date: "2026-03-21",
    changes: [
      "Tek modal: iş oluşturma, düzenleme, ödeme, çalışan yönetimi tek yerde",
      "Form modal kaldırıldı — detay modal her şeyi yapıyor",
      "Yeni iş akışı: oluştur → aynı modal'da çalışan/ödeme ekle",
      "Konum düzenleme: harita açılıp kapanabiliyor",
      "Dinamik kaydet butonu: değişiklik varsa görünür",
    ],
  },
  {
    version: "0.4.2",
    date: "2026-03-21",
    changes: [
      "Çalışana ödeme takibi: her çalışana yapılan ödemeler ayrı kaydedilir",
      "Kalan alacak hesaplama: Toplam Alacak - Ödenen = Kalan otomatik güncellenir",
      "Pay % limiti: toplam pay %100'ü geçemez, form ve güncelleme engellenir",
      "İş silme onayı: 'Emin misiniz?' sorusu ile çift tıklama koruması",
      "Harcama/ödeme/çalışan silme onayı: tüm silme işlemlerinde onay adımı",
      "WorkWorkerPaymentList component: çalışan bazlı ödeme ekleme/silme UI",
      "Supabase: work_worker_payments tablosu gerekli",
    ],
  },
  {
    version: "0.4.0",
    date: "2026-03-20",
    changes: [
      "Adil pay dağılımı: Model B — harcamalar yüzdeye göre paylaşılır, harcayan geri alır",
      "Çalışan pay yüzdesi: her çalışana % pay atanır, toplam %100 uyarısı",
      "Ödeme geçmişi: her ödeme ayrı kayıt (tarih + tutar + not), toplam otomatik",
      "Net kâr hesaplama: toplam ücret - harcamalar = net kâr gösterimi",
      "Çalışan alacak hesaplama: (netKâr × pay%) + kendi harcamaları",
      "isAdmin kaldırıldı: şifre kapısından geçen her şeyi görür",
      "WorkPaymentList + WorkPaymentForm: ödeme ekleme/silme UI",
      "Supabase: work_payments tablosu, work_workers.share kolonu",
    ],
  },
  {
    version: "0.3.0",
    date: "2026-03-20",
    changes: [
      "İş takip sistemi genişletildi: finansal takip, çalışan yönetimi, harita",
      "Finansal takip: toplam ücret, alınan, kalan (otomatik hesaplama)",
      "Çalışan sistemi: her işe çalışan ekle, harcama girişi, alacak hesaplama",
      "Leaflet + OpenStreetMap harita entegrasyonu: pin ile konum seçimi",
      "Admin kontrolü: finansal bilgiler sadece şifre kapısından geçenlere görünür",
      "useAuth hook eklendi — admin durumu kontrolü",
      "useWorkDetail hook eklendi — çalışan + harcama yönetimi",
      "9 yeni component: finans, harita, çalışan, harcama UI'ları",
      "Supabase: work_workers ve work_expenses tabloları, works tablosu genişletildi",
    ],
  },
  {
    version: "0.2.13",
    date: "2026-03-20",
    changes: [
      "Supabase entegrasyonu: veriler artık bulutta, herkes aynı veriyi görüyor",
      "localStorage yerine Supabase PostgreSQL veritabanı kullanılıyor",
      "CRUD işlemleri (ekle/düzenle/sil) gerçek zamanlı veritabanına yazılıyor",
      "Loading spinner ve hata durumu eklendi",
      "Supabase client kütüphanesi (src/lib/supabase.ts) oluşturuldu",
    ],
  },
  {
    version: "0.2.12",
    date: "2026-03-20",
    changes: [
      "Düzenleme formu artık mevcut iş verilerini doğru yüklüyor (useEffect ile senkron)",
    ],
  },
  {
    version: "0.2.11",
    date: "2026-03-20",
    changes: [
      "İşlerim (/works) sayfası eklendi — ortak çalışma ve proje takip paneli",
      "Tablo + kart görünümü arası geçiş (toggle)",
      "Tam CRUD: iş ekle, düzenle, sil — sayfa içi formlar",
      "Durum filtreleme (Tamamlandı/Devam Ediyor/Beklemede) + müşteri filtresi",
      "Renkli durum badge'leri (yeşil/sarı/kırmızı)",
      "Detay modalı — işe tıklayınca bilgi açılır",
      "localStorage ile veri kalıcılığı, JSON seed data",
      "Modal UI componenti eklendi (src/components/ui/Modal.tsx)",
      "Navigasyona İşlerim linki eklendi",
    ],
  },
  {
    version: "0.2.10",
    date: "2026-03-20",
    changes: [
      "Şifre artık SHA-256 hash olarak saklanıyor, kaynak kodda düz metin yok",
    ],
  },
  {
    version: "0.2.9",
    date: "2026-03-20",
    changes: [
      "Şifre kapısı (PasswordGate) eklendi — basit client-side erişim kontrolü",
      "Auth config dosyası oluşturuldu (src/config/auth.ts)",
      "Şifre doğruysa 7 gün localStorage'da oturum hatırlanır",
      "Feature flag: auth aktif edildi",
    ],
  },
  {
    version: "0.2.8",
    date: "2026-03-20",
    changes: [
      "CLAUDE.md'ye design tokens zorunluluğu kuralı eklendi",
    ],
  },
  {
    version: "0.2.7",
    date: "2026-03-20",
    changes: [
      "Design tokens sistemi eklendi (src/config/tokens.ts)",
      "Renkler, tipografi, spacing, radius, gölge, animasyon, z-index, breakpoint sabitleri",
      "CSS değişkenleriyle senkron, TS tarafında erişilebilir",
    ],
  },
  {
    version: "0.2.6",
    date: "2026-03-20",
    changes: [
      "4 ESLint uyarısı düzeltildi (setState in useEffect anti-pattern)",
      "useMediaQuery: useSyncExternalStore ile yeniden yazıldı",
      "ThemeProvider & useTheme: resolvedTheme artık state yerine derive ediliyor",
      "Header: pathname değişikliğinde render-time state update pattern",
      "README.md Spherical'a özel içerikle güncellendi",
      "package.json versiyonu senkronize edildi",
      "Kullanılmayan platformNav kaldırıldı",
    ],
  },
  {
    version: "0.2.5",
    date: "2026-03-20",
    changes: [
      "CLAUDE.md: Git & Deploy akışı dokümante edildi",
      "Otomasyon akışı beyin dosyasına kaydedildi",
    ],
  },
  {
    version: "0.2.4",
    date: "2026-03-20",
    changes: [
      "Auto-merge workflow v3: merge + deploy ayrı adımlar",
      "Deploy workflow_dispatch ile tetikleniyor",
    ],
  },
  {
    version: "0.2.3",
    date: "2026-03-20",
    changes: [
      "Auto-merge workflow düzeltildi: PR yerine direkt merge + deploy",
      "Tek workflow ile merge ve deploy birleştirildi",
    ],
  },
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
