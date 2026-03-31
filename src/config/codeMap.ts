export interface MapNode {
  id: string;
  label: string;
  emoji: string;
  category: string;
  layer: number;
  group?: string;
  description: string;
}

export interface MapEdge {
  source: string;
  target: string;
}

export const CATEGORIES: Record<string, { color: string; label: string }> = {
  page: { color: "#60A5FA", label: "Sayfalar" },
  layout: { color: "#FBBF24", label: "Sayfa Yapısı" },
  provider: { color: "#A78BFA", label: "Güvenlik & Tema" },
  ui: { color: "#34D399", label: "UI Parçaları" },
  feature: { color: "#FB923C", label: "Özellikler" },
  hook: { color: "#F472B6", label: "Servisler" },
  config: { color: "#F87171", label: "Ayarlar" },
  type: { color: "#38BDF8", label: "Veri Şablonları" },
  lib: { color: "#2DD4BF", label: "Altyapı" },
  store: { color: "#4ADE80", label: "Veri Deposu" },
};

export const LAYER_LABELS = [
  "Sayfalar — Kullanıcının gördüğü ekranlar",
  "Sayfa Yapısı — Ortak çerçeve ve güvenlik",
  "Ana Modüller — Sistemin büyük parçaları",
  "Alt Modüller — Her özelliğin iç detayları",
  "Servisler & Arayüz — Arka plan + görsel parçalar",
  "Altyapı — Ayarlar, veritabanı, veri yapıları",
];

export const nodes: MapNode[] = [
  // ── Katman 0: Sayfalar ──
  { id: "p-home", label: "Ana Sayfa", emoji: "🏠", category: "page", layer: 0,
    description: "Siteye girdiğinde ilk gördüğün ekran. Dashboard kartlarıyla tüm modüllere hızlı erişim sağlar." },
  { id: "p-blog", label: "Blog", emoji: "📝", category: "page", layer: 0,
    description: "Teknik yazılar ve makaleler sayfası. Şu an yapım aşamasında." },
  { id: "p-projects", label: "Projeler", emoji: "📁", category: "page", layer: 0,
    description: "GitHub'daki tüm projelerin vitrin sayfası." },
  { id: "p-works", label: "İşlerim", emoji: "💼", category: "page", layer: 0,
    description: "Özel iş ve proje takip paneli. Ücret, çalışan ve ödeme yönetimi yapar." },
  { id: "p-iha", label: "İHA Birimi", emoji: "🚁", category: "page", layer: 0,
    description: "CBS İHA Birimi operasyon yönetim sistemi. 9 sekmeli kapsamlı panel." },
  { id: "p-selim", label: "Selim", emoji: "🎮", category: "page", layer: 0,
    description: "Selim'in eğitim bölümü. Matematik, Türkçe, Fen alt kategorileri." },
  { id: "p-about", label: "Hakkımda", emoji: "👤", category: "page", layer: 0,
    description: "Kişisel bilgiler ve iletişim sayfası." },

  // ── Katman 1: Sayfa Yapısı ──
  { id: "l-root", label: "Ana Çerçeve", emoji: "🏗️", category: "layout", layer: 1,
    description: "Tüm sayfaları saran en dış çerçeve. Tema ve şifre kontrolünü başlatır." },
  { id: "l-marketing", label: "Sayfa Şablonu", emoji: "📄", category: "layout", layer: 1,
    description: "Her sayfanın ortak yapısı: üst menü + içerik alanı + alt bilgi." },
  { id: "lc-header", label: "Üst Menü", emoji: "📌", category: "layout", layer: 1,
    description: "Sayfalar arası gezinti menüsü. Her sayfada üstte görünür." },
  { id: "lc-footer", label: "Alt Bilgi", emoji: "📎", category: "layout", layer: 1,
    description: "Sayfa altındaki versiyon ve telif bilgisi." },
  { id: "lc-mobile", label: "Mobil Menü", emoji: "📱", category: "layout", layer: 1,
    description: "Telefonda tam ekran açılan hamburger menü." },
  { id: "lc-version", label: "Versiyon", emoji: "🏷️", category: "layout", layer: 1,
    description: "Sitenin mevcut versiyonunu gösteren küçük etiket." },
  { id: "pv-theme", label: "Tema Yönetimi", emoji: "🎨", category: "provider", layer: 1,
    description: "Açık/koyu tema sistemi. Kullanıcı tercihini hatırlar." },
  { id: "pv-password", label: "Şifre Kapısı", emoji: "🔒", category: "provider", layer: 1,
    description: "Siteye girişte şifre soran güvenlik ekranı. 7 gün hatırlar." },

  // ── Katman 2: Ana Modüller ──
  { id: "f-dash", label: "Dashboard", emoji: "📊", category: "feature", layer: 2,
    description: "Ana sayfa kartları — her modüle hızlı erişim sağlayan karşılama paneli." },
  { id: "f-iha", label: "İHA Sistemi", emoji: "🚁", category: "feature", layer: 2, group: "iha",
    description: "CBS İHA Birimi operasyon yönetim paneli. 9 sekmede operasyon, envanter, personel, harita ve daha fazlası." },
  { id: "f-works", label: "İş Takip", emoji: "💼", category: "feature", layer: 2, group: "works",
    description: "İşleri oluştur, takip et, çalışan ve ödemeleri yönet. Tablo ve kart görünümleri." },
  { id: "f-quiz", label: "Matematik Oyunu", emoji: "🎮", category: "feature", layer: 2, group: "selim",
    description: "Minecraft temalı 20 soruluk interaktif matematik quizi. XP ve can sistemi ile." },
  { id: "f-changelog", label: "Değişiklik Geçmişi", emoji: "📋", category: "feature", layer: 2,
    description: "Her versiyonda ne değişti — tıklanabilir sürüm geçmişi." },

  // ── Katman 3: Alt Modüller (İHA) ──
  { id: "iha-dash", label: "Özet Panel", emoji: "📈", category: "feature", layer: 3, group: "iha",
    description: "KPI kartları, aktif operasyonlar, hızlı eylemler — İHA biriminin genel durumu." },
  { id: "iha-ops", label: "Operasyonlar", emoji: "🎯", category: "feature", layer: 3, group: "iha",
    description: "İş emirleri yönetimi. Kanban, tablo, takvim ve harita görünümleri." },
  { id: "iha-perm", label: "Uçuş İzinleri", emoji: "📜", category: "feature", layer: 3, group: "iha",
    description: "SHGM'den alınan HSD uçuş izin belgesi takibi. Poligon koordinatları." },
  { id: "iha-flight", label: "Uçuş Defteri", emoji: "📒", category: "feature", layer: 3, group: "iha",
    description: "Her uçuş ve taramanın detay kaydı — GPS, batarya, hava durumu." },
  { id: "iha-map", label: "Harita", emoji: "🗺️", category: "feature", layer: 3, group: "iha",
    description: "Operasyonları ve izin bölgelerini gösteren interaktif harita." },
  { id: "iha-inv", label: "Envanter", emoji: "📦", category: "feature", layer: 3, group: "iha",
    description: "Drone, GPS, kamera, araç — tüm donanım ve yazılım takibi." },
  { id: "iha-pers", label: "Personel", emoji: "👥", category: "feature", layer: 3, group: "iha",
    description: "7 kişilik ekibin rolleri, yetkinlikleri ve görev dağılımı." },
  { id: "iha-stor", label: "Depolama", emoji: "💾", category: "feature", layer: 3, group: "iha",
    description: "Sunucu doluluk oranları ve dosya/klasör yapısı takibi." },
  { id: "iha-rep", label: "Raporlar", emoji: "📊", category: "feature", layer: 3, group: "iha",
    description: "Aylık özet, ekipman kullanım ve personel performans raporları." },

  // ── Katman 3: Alt Modüller (Works) ──
  { id: "w-table", label: "İş Tablosu", emoji: "📋", category: "feature", layer: 3, group: "works",
    description: "Tüm işleri filtrelenebilir tablo halinde listeler." },
  { id: "w-grid", label: "İş Kartları", emoji: "🗂️", category: "feature", layer: 3, group: "works",
    description: "İşleri görsel kart görünümünde gösterir." },
  { id: "w-detail", label: "İş Detayı", emoji: "🔍", category: "feature", layer: 3, group: "works",
    description: "Tek bir işin tüm detayları — çalışanlar, ödemeler, konum bilgisi." },

  // ── Katman 3: Alt Modüller (Selim) ──
  { id: "s-sorular", label: "Sorular", emoji: "📝", category: "feature", layer: 3, group: "selim",
    description: "20 matematik sorusu — kesirler, geometri, ondalık sayılar." },
  { id: "s-xp", label: "XP Barı", emoji: "⭐", category: "feature", layer: 3, group: "selim",
    description: "Oyun ilerlemesini gösteren Minecraft tarzı deneyim çubuğu." },
  { id: "s-hearts", label: "Can Sistemi", emoji: "❤️", category: "feature", layer: 3, group: "selim",
    description: "3 can — her yanlış cevapta bir can kaybedilir." },
  { id: "s-frac", label: "Kesir Gösterimi", emoji: "🔢", category: "feature", layer: 3, group: "selim",
    description: "Kesirleri pay/payda olarak görsel gösteren özel bileşen." },

  // ── Katman 4: Servisler ──
  { id: "h-theme", label: "Tema Servisi", emoji: "🎨", category: "hook", layer: 4,
    description: "Açık/koyu tema tercihini yönetir ve sayfaya uygular." },
  { id: "h-auth", label: "Kimlik Kontrolü", emoji: "🔑", category: "hook", layer: 4,
    description: "Şifre girilip girilmediğini kontrol eder." },
  { id: "h-media", label: "Ekran Takibi", emoji: "📐", category: "hook", layer: 4,
    description: "Mobil mi masaüstü mü — cihaz boyutunu kontrol eder." },
  { id: "h-iha", label: "İHA Veri Servisi", emoji: "📡", category: "hook", layer: 4,
    description: "İHA verilerini veritabanından çeker, günceller ve senkronize eder." },
  { id: "h-works", label: "İş Veri Servisi", emoji: "📡", category: "hook", layer: 4,
    description: "İş verilerini veritabanından çeker ve CRUD işlemlerini yapar." },
  { id: "s-theme", label: "Tema Hafızası", emoji: "💾", category: "store", layer: 4,
    description: "Tema tercihini tarayıcıda hatırlar — sayfa yenilenince kaybolmaz." },
  { id: "s-iha", label: "İHA Veri Deposu", emoji: "🗄️", category: "store", layer: 4,
    description: "İHA biriminin tüm verilerini bellekte tutar. Zustand ile yönetilir." },

  // ── Katman 4: UI Parçaları ──
  { id: "ui-btn", label: "Buton", emoji: "🔘", category: "ui", layer: 4,
    description: "Tıklanabilir buton bileşeni — çeşitli boyut ve renkler." },
  { id: "ui-card", label: "Kart", emoji: "🃏", category: "ui", layer: 4,
    description: "İçerik kutucuğu — başlık, açıklama ve alt bilgi alanları." },
  { id: "ui-modal", label: "Açılır Pencere", emoji: "🪟", category: "ui", layer: 4,
    description: "Ekranın üstüne açılan dialog penceresi." },
  { id: "ui-toast", label: "Bildirim", emoji: "⚡", category: "ui", layer: 4,
    description: "Anlık mesajlar — 'Kayıt başarılı', 'Hata oluştu' gibi." },
  { id: "ui-icons", label: "İkonlar", emoji: "🎭", category: "ui", layer: 4,
    description: "Güneş, ay, menü, kapat, GitHub gibi SVG ikonlar." },

  // ── Katman 5: Altyapı ──
  { id: "c-site", label: "Site Ayarları", emoji: "⚙️", category: "config", layer: 5,
    description: "Site adı, URL, navigasyon menüsü, özellik açma/kapama bayrakları." },
  { id: "c-auth", label: "Şifre Ayarları", emoji: "🔐", category: "config", layer: 5,
    description: "Şifre hash'i ve oturum süresini tutan güvenlik ayarları." },
  { id: "c-tokens", label: "Tasarım Sabitleri", emoji: "🎨", category: "config", layer: 5,
    description: "Renkler, fontlar, boşluklar, gölgeler — tüm tasarım değerleri burada." },
  { id: "c-version", label: "Versiyon", emoji: "📌", category: "config", layer: 5,
    description: "Sitenin güncel versiyon numarası." },
  { id: "c-changelog", label: "Değişiklik Listesi", emoji: "📜", category: "config", layer: 5,
    description: "Hangi versiyonda ne değişti — tüm geçmiş." },
  { id: "t-core", label: "Veri Şablonları", emoji: "📐", category: "type", layer: 5,
    description: "Proje, blog, iş, çalışan gibi temel veri yapılarının tanımları." },
  { id: "t-iha", label: "İHA Şablonları", emoji: "📐", category: "type", layer: 5,
    description: "Operasyon, ekipman, personel, uçuş izni veri yapılarının tanımları." },
  { id: "lib-supa", label: "Veritabanı", emoji: "🔗", category: "lib", layer: 5,
    description: "Supabase bulut veritabanı bağlantısı. Tüm veriler burada saklanır." },
  { id: "lib-utils", label: "Araç Kutusu", emoji: "🔧", category: "lib", layer: 5,
    description: "Tarih formatlama, class birleştirme gibi küçük yardımcı fonksiyonlar." },
  { id: "lib-iha-db", label: "İHA Veritabanı", emoji: "💽", category: "lib", layer: 5,
    description: "İHA verilerini Supabase'e okuyan ve yazan ara katman." },
  { id: "lib-works-db", label: "İş Veritabanı", emoji: "💽", category: "lib", layer: 5,
    description: "İş verilerini Supabase'e okuyan ve yazan ara katman." },
  { id: "lib-offline", label: "Çevrimdışı", emoji: "📴", category: "lib", layer: 5,
    description: "İnternet yokken verileri sıraya koyar. Bağlantı gelince otomatik gönderir." },
];

export const edges: MapEdge[] = [
  // Sayfalar → Ana Modüller
  { source: "p-home", target: "f-dash" },
  { source: "p-iha", target: "f-iha" },
  { source: "p-works", target: "f-works" },
  { source: "p-selim", target: "f-quiz" },

  // Sayfa Yapısı
  { source: "l-root", target: "pv-theme" },
  { source: "l-root", target: "pv-password" },
  { source: "l-marketing", target: "lc-header" },
  { source: "l-marketing", target: "lc-footer" },
  { source: "lc-header", target: "lc-mobile" },
  { source: "lc-footer", target: "lc-version" },

  // Ana Modüller → Alt Modüller
  { source: "f-iha", target: "iha-dash" },
  { source: "f-iha", target: "iha-ops" },
  { source: "f-iha", target: "iha-perm" },
  { source: "f-iha", target: "iha-flight" },
  { source: "f-iha", target: "iha-map" },
  { source: "f-iha", target: "iha-inv" },
  { source: "f-iha", target: "iha-pers" },
  { source: "f-iha", target: "iha-stor" },
  { source: "f-iha", target: "iha-rep" },

  { source: "f-works", target: "w-table" },
  { source: "f-works", target: "w-grid" },
  { source: "f-works", target: "w-detail" },

  { source: "f-quiz", target: "s-sorular" },
  { source: "f-quiz", target: "s-xp" },
  { source: "f-quiz", target: "s-hearts" },
  { source: "s-sorular", target: "s-frac" },

  // Modüller → Servisler
  { source: "f-iha", target: "h-iha" },
  { source: "f-works", target: "h-works" },
  { source: "pv-theme", target: "s-theme" },
  { source: "pv-password", target: "h-auth" },
  { source: "lc-header", target: "h-theme" },
  { source: "h-iha", target: "s-iha" },

  // Servisler → Altyapı
  { source: "s-iha", target: "lib-iha-db" },
  { source: "s-iha", target: "lib-offline" },
  { source: "s-iha", target: "t-iha" },
  { source: "h-works", target: "lib-works-db" },
  { source: "h-works", target: "t-core" },
  { source: "h-auth", target: "c-auth" },
  { source: "lc-header", target: "c-site" },
  { source: "lc-version", target: "c-version" },
  { source: "lc-version", target: "c-changelog" },
  { source: "lc-version", target: "f-changelog" },
  { source: "lib-iha-db", target: "lib-supa" },
  { source: "lib-works-db", target: "lib-supa" },
  { source: "lib-iha-db", target: "t-iha" },
];
