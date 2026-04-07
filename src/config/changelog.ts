export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "0.8.21",
    date: "2026-04-07",
    changes: [
      "Gerçekçi demo veri: 7 operasyon (Bursa ilçeleri), 6 uçuş kaydı, gerçek ekipman/konum bilgileri",
      "Dashboard: 'Sahada' KPI kartı, son uçuş özeti, anlamlı depolama doluluk verileri",
      "Hızlı Uçuş Kaydı: sahadan tek butonla minimum alanla kayıt, GPS otomatik konum, operasyonla eşleşme",
      "Ekipman durumları güncellendi: Wingtra ve Stonex sahada kullanımda, uçuş saatleri eklendi",
    ],
  },
  {
    version: "0.8.20",
    date: "2026-04-07",
    changes: [
      "Ortak DataTable bileşeni: 4 tablo tek yapıya birleştirildi",
      "Ortak ViewToolbar bileşeni: 2 toolbar tek yapıya birleştirildi",
      "MapTab sadeleştirildi: 258 → 115 satır, tekrarlı detay kodu kaldırıldı",
      "OperationStatusBadge kaldırıldı, OPERATION_STATUS_VARIANTS merkezi yapıya taşındı",
      "8 gereksiz barrel index dosyası silindi",
    ],
  },
  {
    version: "0.8.19",
    date: "2026-04-07",
    changes: [
      "Genel Bakış tamamen yeniden tasarlandı — sadece önemli bilgiler",
      "Kaldırılan: Ekipman durumu, depolama, uçuş izinleri özeti, son uçuş kayıtları, 5 hızlı eylem butonu",
      "Uyarılar en üste taşındı, yoksa gizleniyor",
      "Aktif operasyonlar kartına 'Yeni Operasyon' butonu eklendi",
      "EquipmentStatusSummary ve StorageSummary bileşenleri silindi",
    ],
  },
  {
    version: "0.8.18",
    date: "2026-04-07",
    changes: [
      "Harita bileşenlerindeki hardcoded renkler mapColors token'ına taşındı",
      "Worktree artıkları temizlendi (silinen modüllerin dosyaları)",
    ],
  },
  {
    version: "0.8.17",
    date: "2026-04-07",
    changes: [
      "İHA modülü kapsamlı refactoring: ölü kod temizliği, performans, kod kalitesi",
      "N+1 sorgu problemi çözüldü (fetchOperations, fetchEquipment, fetchStorage)",
      "Tab değişiminde gereksiz tam reload kaldırıldı",
      "Maintenance sistemi ve offline queue ölü kodu temizlendi",
      "inputClass 13 dosyadan shared/styles.ts'e taşındı",
      "TabHeader paylaşılan bileşeni oluşturuldu",
      "Arama filtresi OperationsTab ve InventoryTab'da çalışır hale getirildi",
      "Form tarih validasyonları eklendi (OperationForm, PermissionForm, FlightLogForm)",
      "Hardcoded değerler config'e taşındı (Bursa, yıl listesi, ay isimleri, placeholder'lar)",
      "toast() helper fonksiyonu eklendi",
    ],
  },
  {
    version: "0.8.16",
    date: "2026-04-07",
    changes: [
      "Ana sayfa artık doğrudan İHA Birimi panelini gösteriyor",
      "İHA Birimi ayrı rotası (/iha-birimi) kaldırıldı — ana sayfa ile birleştirildi",
      "Navigasyon: İHA Birimi (ana sayfa), Projeler, Hakkımda",
      "DashboardGrid kaldırıldı, DashboardHeader ve DashboardCard korundu",
      "Lint düzeltmeleri: unused import/variable temizliği, React Hook pattern düzeltmeleri",
    ],
  },
  {
    version: "0.8.15",
    date: "2026-04-07",
    changes: [
      "Selim, Works, Blog, Kod Haritası modülleri tamamen kaldırıldı",
      "Blog ve Projeler sayfaları feature component yapısına refactor edildi",
      "Hakkımda sayfası feature component yapısına refactor edildi",
      "Navigasyon sadeleştirildi: Ana Sayfa, İHA Birimi, Projeler, Hakkımda",
      "gameColors ve codeMapColors token'ları kaldırıldı",
      "Work tipleri types/index.ts'den temizlendi",
      "Site açıklaması İHA Birimi odaklı güncellendi",
    ],
  },
  {
    version: "0.8.14",
    date: "2026-04-04",
    changes: [
      "Selim'in Dünyası: yerel geliştirme branch'ı canlıya entegre edildi",
      "Matematik quiz UI componentleri, sayfa layout'u ve ilerleme sistemi eklendi",
    ],
  },
  {
    version: "0.8.13",
    date: "2026-04-04",
    changes: [
      "İHA Modülü: Supabase (snake_case) ve Frontend (camelCase) veri eşleme sorunları giderildi",
      "Uçuş Kayıtları: Pilot ve ekipman isimlerinin veritabanına kaydedilmesi ve listede gösterilmesi sağlandı",
      "Konum Verileri: İl, ilçe ve koordinat bilgilerinin otomatik eşlenmesi tüm modüllerde aktif edildi",
    ],
  },
  {
    version: "0.8.11",
    date: "2026-04-01",
    changes: [
      "Envanter seed UUID hatası düzeltildi: seed ID'leri kaldırıldı, Supabase UUID üretir",
      "Name bazlı kontrol: aynı ekipman/yazılım tekrar eklenmez",
    ],
  },
  {
    version: "0.8.10",
    date: "2026-04-01",
    changes: [
      "Envanter seed güçlendirildi: her açılışta eksik varsayılan veriler Supabase'e otomatik eklenir",
    ],
  },
  {
    version: "0.8.9",
    date: "2026-04-01",
    changes: [
      "Envanter otomatik seed: Supabase'de donanım/yazılım boşsa varsayılan veriler otomatik yüklenir",
    ],
  },
  {
    version: "0.8.8",
    date: "2026-03-31",
    changes: [
      "Kod Haritası v2: Proje yöneticisi gözüyle tasarlandı — teknik bilgi gerektirmez",
      "Hiyerarşik katmanlı layout: üstten alta 6 katman — Sayfalar → Altyapı akışı",
      "Türkçe etiketler + emoji'ler: her modül anlaşılır isimle ve ikonla",
      "Bilgi paneli: node'a tıkla → ne olduğu, bağlantıları, açıklaması çıkar",
      "Grup kutuları: İHA, İş Takip, Selim modülleri renkli çerçevelerle ayrılır",
      "Katman başlıkları: 'Sayfalar — Kullanıcının gördüğü ekranlar' gibi açıklamalar",
    ],
  },
  {
    version: "0.8.5",
    date: "2026-03-29",
    changes: [
      "Selim sayfası eklendi: alt kategori yapısıyla eğitim platformu (/selim)",
      "Matematik bölümü: 20 soruluk interaktif quiz — kesirler, geometri, ondalık sayılar",
      "Minecraft temalı UI: XP bar, kalp sistemi, ipucu mekanizması, animasyonlar",
      "İleride Türkçe, Fen Bilimleri gibi yeni bölümler eklenebilir yapıda",
    ],
  },
  {
    version: "0.6.0",
    date: "2026-03-27",
    changes: [
      "İHA Birimi v2: Kapsamlı revize — 5 tab → 7 tab",
      "Uçuş Defteri (yeni): GPS/CORS, batarya, hava koşulları, özelleştirilebilir alanlar",
      "Raporlar (yeni): Aylık özet, ekipman kullanım, personel performans, talep analizi",
      "Operasyonlar: 4 görünüm (Kanban board, Tablo, Takvim, Harita)",
      "Operasyonlar: 5 tip + Konum detayı (İl/İlçe/Mahalle/Pafta/Ada/Parsel)",
      "Depolama: Klasör yapısı yönetimi",
      "Dashboard: Hızlı eylemler, son uçuş kayıtları",
      "Envanter: Zimmet takibi, bakım kayıtları, firmware/kalibrasyon",
      "Personel: Uzmanlık alanları, gerçekçi roller",
    ],
  },
  {
    version: "0.5.0",
    date: "2026-03-27",
    changes: [
      "CBS İHA Birimi Operasyon Yönetim Paneli eklendi (ilk sürüm)",
    ],
  },
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
