export type ChangeType = "feat" | "fix" | "refactor" | "perf" | "docs" | "chore";

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  feat: "Yeni Özellik",
  fix: "Düzeltme",
  refactor: "Yeniden Yapılandırma",
  perf: "Performans",
  docs: "Dokümantasyon",
  chore: "Bakım",
};

export const CHANGE_TYPE_COLORS: Record<ChangeType, string> = {
  feat: "#22c55e",
  fix: "#ef4444",
  refactor: "#a855f7",
  perf: "#f59e0b",
  docs: "#3b82f6",
  chore: "#6b7280",
};

export interface ChangeItem {
  type: ChangeType;
  text: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: (string | ChangeItem)[];
  summary?: string;
}

/** Yardımcı: string|ChangeItem → normalize */
export function normalizeChange(c: string | ChangeItem): ChangeItem {
  if (typeof c === "object") return c;
  if (c.startsWith("P1:") || c.startsWith("P2:") || c.startsWith("P3:")) return { type: "feat", text: c };
  const lower = c.toLowerCase();
  if (lower.includes("düzelt") || lower.includes("hata") || lower.includes("fix")) return { type: "fix", text: c };
  if (lower.includes("kaldır") || lower.includes("refactor") || lower.includes("taşındı") || lower.includes("birleştirildi") || lower.includes("sadeleştirildi")) return { type: "refactor", text: c };
  if (lower.includes("performans") || lower.includes("optimiz")) return { type: "perf", text: c };
  if (lower.includes("dokümant") || lower.includes("claude.md") || lower.includes("readme")) return { type: "docs", text: c };
  if (lower.includes("silindi") || lower.includes("temizlen") || lower.includes("lint")) return { type: "chore", text: c };
  return { type: "feat", text: c };
}

export const changelog: ChangelogEntry[] = [
  {
    version: "0.8.74",
    date: "2026-04-10",
    summary: "StatusBoard renkleri + tam navbar + pafta filtresi + popup sadeleştirme",
    changes: [
      { type: "feat", text: "StatusBoard: Yapılacak turuncu / Yapılıyor mavi / Yapıldı yeşil (aynı opaklık)" },
      { type: "fix", text: "StatusBoard mobilde tam label görünür (Yap/Yap/Yap kısaltması kaldırıldı)" },
      { type: "refactor", text: "Alt navbar 'Daha' butonu kaldırıldı — 9 sekme yatay kaydırılabilir" },
      { type: "refactor", text: "Pafta katmanı LayersControl'dan çıkarıldı → Filtre paneline taşındı (her tıklamada kapanma sorunu çözüldü)" },
      { type: "feat", text: "Pafta rengi: uydu görünümünde sarı (#fbbf24), diğer modlarda mavi" },
      { type: "feat", text: "IhaMapBase baselayerchange event listener ile aktif katman takibi" },
      { type: "refactor", text: "MapTab operasyon popup sadeleştirildi — 'sonraki durum' butonu kaldırıldı, minimalist içerik" },
      { type: "fix", text: "MapTab marker click artık detail modal'ı direkt açar (tek dokunuş)" },
      { type: "chore", text: "no-scrollbar CSS utility eklendi (bottom nav yatay scroll)" },
    ],
  },
  {
    version: "0.8.73",
    date: "2026-04-10",
    summary: "Pafta performansı + mobil UX + logger + Button/Lucide yaygınlaştırma",
    changes: [
      { type: "perf", text: "PaftaLayer: viewport culling (2301 → ~20-100 görünür polygon), etiket eşiği 14 → 13" },
      { type: "fix", text: "Mobil: Harita popup z-index düzeltildi (1 → 30, bottom nav altında kalmıyor)" },
      { type: "fix", text: "Mobil: inputClass globale min-h-[44px] eklendi (WCAG dokunma hedefi)" },
      { type: "fix", text: "Mobil: WeeklyCalendar saat sütunu 3rem → 2.5rem sm:3rem (sıkışma giderildi)" },
      { type: "fix", text: "Pafta etiketi uzun adlarda truncate (max-width 120px + ellipsis)" },
      { type: "feat", text: "Logger servisi: dev-only console, production'da no-op" },
      { type: "refactor", text: "usePaftaData + ihaStore console.error → logger.error" },
      { type: "feat", text: "4 sekmede EmptyState: Personnel, Inventory, InfoBank, Reports" },
      { type: "refactor", text: "QuickCreateForm + InfoEntryModal + VehicleEventsPanel ham butonlar → Button" },
      { type: "refactor", text: "FlightPermissionsTab + OperationModal emoji → Lucide (Edit, Trash, Check, Plane, FileText, Package, Paperclip)" },
      { type: "refactor", text: "MapTab popup ikonları: 📏📅 → IconRuler + IconCalendar" },
      { type: "fix", text: "OperationForm pafta picker + PersonnelForm * işareti + min-h[44px]" },
    ],
  },
  {
    version: "0.8.72",
    date: "2026-04-10",
    summary: "UX tutarlılık paketi — Button refactor, EmptyState yayılımı, Lucide ikonlar, TERIMLER.md",
    changes: [
      { type: "feat", text: "TERIMLER.md: yazılım/UX sözlüğü (darboğaz, teknik borç, tutarlılık, 50+ terim)" },
      { type: "refactor", text: "QuickCreateForm: 4 native button → Button component (TeamField, Paftalar, FormActions)" },
      { type: "feat", text: "EmptyState 4 yeni sekmede: PersonnelTab, InventoryTab, InfoBankTab, ReportsTab" },
      { type: "refactor", text: "FlightPermissionsTab: ✏️ 🗑️ action emoji → IconEdit, IconTrash (Lucide)" },
      { type: "refactor", text: "OperationModal sekme ikonları: 📄 🛩️ ✓ 📦 📎 → Lucide ikonları" },
      { type: "feat", text: "icons.ts: Paperclip (IconFiles), Plane (IconPlane) eklendi" },
    ],
  },
  {
    version: "0.8.71",
    date: "2026-04-10",
    summary: "Pafta etiketleri, harita tıklama kaldırıldı, Yapıldı sıralama",
    changes: [
      { type: "feat", text: "Pafta etiketleri: zoom >= 14 iken her pafta üstünde adı kalıcı gösterilir" },
      { type: "feat", text: ".pafta-label CSS stili: şeffaf beyaz arkaplan + mavi kenar, mobil uyumlu" },
      { type: "refactor", text: "Harita tıklama ile yeni operasyon oluşturma kaldırıldı (UX kazası engellendi)" },
      { type: "refactor", text: "MapTab: ClickHandler, newOpCoords, QuickCreate modal, kullanılmayan importlar silindi" },
      { type: "feat", text: "StatusBoard Yapıldı sütunu: son tamamlananlar en üstte (updatedAt desc)" },
    ],
  },
  {
    version: "0.8.70",
    date: "2026-04-10",
    summary: "Durum sistemi sadeleştirildi — 3 grup: Yapılacak / Yapılıyor / Yapıldı",
    changes: [
      { type: "feat", text: "OperationStatusGroup tipi eklendi: yapilacak / yapiliyor / yapildi" },
      { type: "feat", text: "getStatusGroup() helper: 7 durum → 3 grup eşleşmesi" },
      { type: "refactor", text: "OperationsTab filtresi: 'Tüm Durumlar' dropdown → 4 buton (Tümü/Yapılacak/Yapılıyor/Yapıldı)" },
      { type: "refactor", text: "MapTab filtre modalı: 6 durum butonu → 3 grup butonu + Tümü" },
      { type: "chore", text: "Detay ekranları (modal, timeline) hala 7 durum gösterir — hassas bilgi korundu" },
    ],
  },
  {
    version: "0.8.69",
    date: "2026-04-10",
    summary: "Saha hazırlığı sadeleştirildi — sadece envanter ekipmanları",
    changes: [
      { type: "refactor", text: "Saha Hazırlığı: ekipman alt maddeleri (batarya, SD kart vb.) kaldırıldı" },
      { type: "refactor", text: "Sadece envanterde atanmış ekipmanlar ve ekip üyeleri listelenir" },
      { type: "chore", text: "EQUIPMENT_PREP_ITEMS sabiti, isSubItem alanı, detay varyasyonları silindi" },
    ],
  },
  {
    version: "0.8.68",
    date: "2026-04-10",
    summary: "UX Faz 3 tamamlandı — emoji → Lucide ikonları (nav + butonlar)",
    changes: [
      { type: "feat", text: "icons.ts genişletildi: 15+ yeni Lucide ikon eklendi (nav, durum, işlem)" },
      { type: "refactor", text: "Mobil bottom nav: emoji ikonlar (🏠 🗺️) → Lucide (LayoutDashboard, Map, ClipboardList...)" },
      { type: "refactor", text: "'Daha' butonu → MoreHorizontal Lucide ikonu" },
      { type: "refactor", text: "OperationsTab 'Excel' butonu → FileUp Lucide ikonu" },
      { type: "chore", text: "Durum ikonları (✅ ⏳ ❌) FlightPermissionsTab'da semantik nedenlerle emoji olarak bırakıldı" },
    ],
  },
  {
    version: "0.8.67",
    date: "2026-04-10",
    summary: "UX Faz 3 (3/3) — native buttonlar Button'a, form etiketleri, EmptyState",
    changes: [
      { type: "refactor", text: "FlightPermissionsTab: 7 native button → Button component (primary/outline varyantları)" },
      { type: "refactor", text: "FlightPermissionsTab: local EmptyState → paylaşılan EmptyState bileşeni" },
      { type: "refactor", text: "OperationsTab: 'Sonuç yok' div → EmptyState (ikon + açıklama + CTA)" },
      { type: "fix", text: "Form zorunlu alan işaretleri: * → <span className='text-red-400'>*</span> (OperationForm, EquipmentForm)" },
    ],
  },
  {
    version: "0.8.66",
    date: "2026-04-10",
    summary: "UX Faz 3 (2/3) — mobil bottom nav, pafta popup, operasyon sekmeli",
    changes: [
      { type: "feat", text: "Mobil bottom tab bar: 4 ana sekme (Genel Bakış, Harita, Operasyonlar, İzinler) + 'Daha' butonu" },
      { type: "feat", text: "Mobilde üst sekmeler gizlendi, aktif sekme başlık olarak gösterilir" },
      { type: "feat", text: "'Daha' butonu → bottom sheet ile diğer 5 sekme (Envanter, Personel, Bilgi, Rapor, Ayarlar)" },
      { type: "refactor", text: "Pafta tıklama: tam ekran modal yerine harita üstü küçük popup + 'Detayı Gör' butonu" },
      { type: "refactor", text: "OperationModal alt bölümler sekmeli yapıya çevrildi (Uçuş İzni, Kayıtlar, İş Akışı, Çıktılar, Dosyalar)" },
      { type: "feat", text: "Sekme ikonları ile görsel navigasyon kolaylaştı" },
    ],
  },
  {
    version: "0.8.65",
    date: "2026-04-10",
    summary: "UX Faz 3 (1/3) — pafta performans, tıklama akışı sadeleştirme, arama standardı",
    changes: [
      { type: "perf", text: "Pafta katmanı zoom < 11 iken gizlenir — mobil performans sıçradı (2301 poligon yerine 0)" },
      { type: "refactor", text: "Haritaya tıklayınca pending pin ara adımı kaldırıldı — direkt modal açılır (3 adım → 2 adım)" },
      { type: "refactor", text: "PendingPinMarker bileşeni ve ilgili importlar silindi" },
      { type: "fix", text: "Arama placeholder'ları standartlaştırıldı: her yerde '🔍 Ara...'" },
    ],
  },
  {
    version: "0.8.64",
    date: "2026-04-10",
    summary: "UX iyileştirmeleri Faz 1 — modal, harita, pafta, tutarlılık altyapısı",
    changes: [
      { type: "fix", text: "Modal mobilde tam genişlik (max-w-full sm:max-w-lg + mx-2)" },
      { type: "fix", text: "Harita pending pin popup butonları min-h-[44px] dokunma alanı" },
      { type: "fix", text: "Leaflet CSS: LayersControl tap hedefi 44px, zoom kontrolleri 36px" },
      { type: "fix", text: "Pafta renklendirme: dominant status yerine en son operasyon durumu" },
      { type: "fix", text: "Harita mobil yüksekliği h-[50vh] → daha az overflow" },
      { type: "feat", text: "styles.ts: modalHeaderClass, modalFooterClass, labelClass, searchInputClass sabitleri" },
      { type: "feat", text: "EmptyState: paylaşılan boş durum bileşeni (icon + title + description + CTA)" },
    ],
  },
  {
    version: "0.8.63",
    date: "2026-04-10",
    summary: "Pafta ↔ Operasyon entegrasyonu — otomatik tespit, formda seçim, tıklama + renklendirme",
    changes: [
      { type: "feat", text: "usePaftaData: tek fetch, cache'li hook — tüm bileşenler paylaşır" },
      { type: "feat", text: "Nokta-içinde-poligon algoritması: haritaya tıklayınca otomatik pafta tespiti" },
      { type: "feat", text: "Operation tipine paftalar: string[] alanı eklendi (çoklu pafta desteği)" },
      { type: "feat", text: "Supabase iha_operations.paftalar kolonu (fallback ile backwards compat)" },
      { type: "feat", text: "QuickCreateForm + OperationForm: Paftalar alanı, chip görünümü, autocomplete" },
      { type: "feat", text: "Harita tıklama → pending pin popup'unda 'Pafta: H21C02C' otomatik görünür" },
      { type: "feat", text: "PaftaLayer: paftaya tıkla → o paftadaki operasyonlar modal'da listelenir" },
      { type: "feat", text: "Operasyonu olan paftalar durum rengine göre (saha=yeşil, teslim=mavi vb.) boyanır" },
    ],
  },
  {
    version: "0.8.62",
    date: "2026-04-10",
    summary: "Harita kontrol çakışması düzeltildi — arama/filtre harita dışına çıkarıldı",
    changes: [
      { type: "fix", text: "Arama ve Filtre butonu Leaflet zoom ve katman ikonlarıyla çakışıyordu" },
      { type: "refactor", text: "Arama + Filtre bar'ı haritanın dışına, üstüne alındı — çakışma yok" },
      { type: "refactor", text: "Alt sayaç haritanın içinde sol altta kaldı (z-[400] ile Leaflet üstünde)" },
    ],
  },
  {
    version: "0.8.61",
    date: "2026-04-10",
    summary: "2 kritik harita bug'ı düzeltildi — pin takılı kalma + marker click çakışması",
    changes: [
      { type: "fix", text: "Popup eventHandlers hatası: pin onay balonu kapanınca pin kaldırılıyordu ama pin takılı kalıyordu — PendingPinMarker ref ile popup yönetiliyor" },
      { type: "fix", text: "Marker click: var olan operasyona tıklayınca yanlışlıkla yeni pin düşüyordu — L.DomEvent.stopPropagation eklendi" },
      { type: "refactor", text: "PendingPinMarker ayrı bileşen olarak çıkarıldı — popupclose event ile temiz state yönetimi" },
    ],
  },
  {
    version: "0.8.60",
    date: "2026-04-10",
    summary: "Harita ekranı sadeleştirildi + UX düzeltmesi",
    changes: [
      { type: "refactor", text: "Üstteki 4 satır filtre tek satıra indirildi: arama + [Filtre] butonu" },
      { type: "refactor", text: "Tip filtresi (7 ikon) tamamen kaldırıldı — yeterince kullanılmıyordu" },
      { type: "refactor", text: "Alttaki renkli legend kaldırıldı — ikonlar zaten renkli" },
      { type: "feat", text: "[Filtre] butonu → modal panel (Gösterilen + Durum), aktif filtre sayacı" },
      { type: "feat", text: "Harita alanı büyüdü: 45vh → 60vh (mobilde)" },
      { type: "refactor", text: "Popup içeriği sadeleştirildi — gereksiz alanlar kaldırıldı" },
      { type: "fix", text: "UX: haritaya tıklayınca direkt modal açılmıyor — önce pin düşer, popup'tan [Ekle] onayı ile modal açılır" },
    ],
  },
  {
    version: "0.8.59",
    date: "2026-04-10",
    summary: "Pafta katmanı görünmeme sorunu düzeltildi — 2 kritik hata",
    changes: [
      { type: "fix", text: "next.config.ts'e NEXT_PUBLIC_BASE_PATH eklendi — fetch artık /spherical prefix'ini kullanır (404 hatası çözüldü)" },
      { type: "fix", text: "PaftaLayer: null return yerine FeatureGroup ile sarıldı — overlay checkbox katmanlar menüsünde her zaman görünür" },
      { type: "fix", text: "Fetch hatası artık console'a yazılır (sessiz başarısızlık kaldırıldı)" },
    ],
  },
  {
    version: "0.8.58",
    date: "2026-04-10",
    summary: "Bursa paftaları haritaya eklendi — 2301 pafta, tam hassasiyet",
    changes: [
      { type: "feat", text: "public/vector/pafta_index/ klasörü: shp, kmz, dbf, DGN vb. dosyalar" },
      { type: "feat", text: "bursa-paftalar.geojson: 2301 pafta, TUREF TM30 → WGS84 dönüştürüldü" },
      { type: "feat", text: "PaftaLayer bileşeni: harita katmanlar menüsünden açılabilir (lazy load)" },
      { type: "feat", text: "Her paftanın üzerine gelince adı tooltip olarak görünür" },
      { type: "chore", text: "Koordinat hassasiyeti: 14 hane (0.1mm altı — gerekenin 100x üstünde)" },
    ],
  },
  {
    version: "0.8.57",
    date: "2026-04-09",
    summary: "Wingtra Excel içe aktarma — ilk 13 kayıt için import ekranı",
    changes: [
      { type: "feat", text: "WingtraImportModal: Operasyonlar sekmesine 📥 Excel butonu eklendi" },
      { type: "feat", text: "13 kayıt için önizleme tablosu, özet kartları, ilerleme çubuğu" },
      { type: "feat", text: "Operatör isimleri personel listesiyle otomatik eşleştirilir" },
      { type: "feat", text: "Mükerrer pafta koruması — mevcut kayıtlar atlanır" },
      { type: "feat", text: "GSD/Rüzgar/Yazılım bilgileri notlara yazılır" },
    ],
  },
  {
    version: "0.8.56",
    date: "2026-04-09",
    summary: "Operasyon bitiş saati + haftalık takvimde saat bazlı sürükleme",
    changes: [
      { type: "feat", text: "QuickCreateForm: bitiş saati alanı eklendi (varsayılan 08:00-09:00)" },
      { type: "feat", text: "Haftalık takvim: operasyonlar sürüklenince saat de güncelleniyor (30dk snap)" },
      { type: "feat", text: "Sürüklemede operasyon süresi korunuyor (ör: 2 saatlik operasyon 2 saat kalır)" },
    ],
  },
  {
    version: "0.8.55",
    date: "2026-04-09",
    summary: "Saha Hazırlığı paneli yenilendi — dinamik checklist, Supabase entegrasyonu, Sahaya Hazırız butonu",
    changes: [
      { type: "feat", text: "Panel her zaman görünür — gün seçilmese bile bugünü otomatik gösterir" },
      { type: "feat", text: "Operasyon yoksa panel tam genişlik alır (sol boş → sağa yasla)" },
      { type: "feat", text: "Ekipman kategorisine göre alt maddeler: drone → batarya/SD/pervane, GPS → pil/tripod, araç → yakıt/navigasyon" },
      { type: "feat", text: "Checklist Supabase'e taşındı (iha_field_prep tablosu) — cihaz bağımsız" },
      { type: "feat", text: "Tüm maddeler tamamlanınca 'Sahaya Hazırız' butonu aktif → durumu otomatik 'saha'ya çevirir" },
      { type: "fix", text: "localStorage fallback korundu — tablo yoksa sessizce localStorage kullanır" },
    ],
  },
  {
    version: "0.8.54",
    date: "2026-04-09",
    summary: "Operasyon paneli sadeleştirildi — 3 adım → 2 adım, mobil iyileştirmeler",
    changes: [
      { type: "refactor", text: "Operasyon tıkla → direkt düzenleme formu (detay görünümü kaldırıldı)" },
      { type: "refactor", text: "Form + alt bölümler (izin, kayıt, çıktı, checklist, ek) tek panelde birleştirildi" },
      { type: "fix", text: "Kırmızı 'Gizli Alanlar' debug bölümü kaldırıldı" },
      { type: "fix", text: "OperationForm iç scroll kaldırıldı — Modal scroll'u yönetiyor" },
      { type: "chore", text: "OperationTimeline ölü kod silindi (hiçbir yerde kullanılmıyordu)" },
      { type: "fix", text: "Mobil: 3 sütunlu gridler sm: breakpoint ile responsive yapıldı" },
      { type: "fix", text: "Mobil: ekip/ekipman butonları min-h-[44px] dokunma alanına yükseltildi" },
    ],
  },
  {
    version: "0.8.52",
    date: "2026-04-09",
    summary: "Mükerrer kayıt koruması — seed mekanizması güçlendirildi",
    changes: [
      { type: "fix", text: "Seed fonksiyonları: maybeSingle() → limit(1) ile mükerrer kayıt önleme" },
      { type: "fix", text: "Seed: deleted kayıtlar dahil kontrol — soft delete sonrası tekrar ekleme engellendi" },
      { type: "fix", text: "Wingtra Gen2 mükerrer 7 kayıt DB'den temizlendi" },
    ],
  },
  {
    version: "0.8.51",
    date: "2026-04-09",
    summary: "Veri güvenliği katmanı — soft delete, silme onayı, hardcode renk düzeltmesi, güvenlik güncellemeleri",
    changes: [
      { type: "feat", text: "ConfirmDialog: tüm silme işlemlerinde profesyonel onay modal'ı (12 silme noktası)" },
      { type: "feat", text: "Soft Delete: 13 tabloya deleted_at kolonu — silinen veriler geri getirilebilir" },
      { type: "refactor", text: "12 delete fonksiyonu .delete() → .update({ deleted_at }) olarak güncellendi" },
      { type: "refactor", text: "14 fetch fonksiyonuna .is('deleted_at', null) filtresi eklendi" },
      { type: "fix", text: "7 hardcode hex renk tokens.ts'e taşındı (CLAUDE.md §4.2.5 uyumu)" },
      { type: "fix", text: "mapColors genişletildi: permissionPending, permissionRejected, newMarker, contrastText" },
      { type: "chore", text: "npm audit fix: brace-expansion ve picomatch güvenlik açıkları kapatıldı" },
      { type: "fix", text: "Mevcut 3 browser confirm() dialog'u profesyonel ConfirmDialog'a geçirildi" },
    ],
  },
  {
    version: "0.8.50",
    date: "2026-04-09",
    summary: "Lucide Icons entegrasyonu + design token tamamlama",
    changes: [
      { type: "feat", text: "Lucide Icons entegrasyonu — merkezi ikon yönetimi (src/config/icons.ts)" },
      { type: "feat", text: "Priority token'ları eklendi (acil/yüksek/normal/düşük)" },
      { type: "feat", text: "Feedback token'ları eklendi (success/error/info/warning)" },
      { type: "refactor", text: "StatusBoard: emoji → Lucide ikonları" },
      { type: "refactor", text: "Button/Toast/Badge: hardcode Tailwind → design token'ları" },
      { type: "refactor", text: "Icons.tsx: SVG → Lucide re-export (GitHub hariç)" },
    ],
  },
  {
    version: "0.8.49",
    date: "2026-04-09",
    summary: "DB kaydetme fallback güçlendirildi — sub_types kolonu yoksa da çalışır",
    changes: [
      { type: "fix", text: "upsertOperation: sub_types kolonu henüz eklenmemişse fallback ile kaydetme devam eder" },
      { type: "fix", text: "4 kademeli fallback: tüm alanlar → sub_types → time → sadece temel alanlar" },
    ],
  },
  {
    version: "0.8.48",
    date: "2026-04-09",
    summary: "Saha Hazırlığı paneli — takvimde gün seçildiğinde ekipman/ekip checklist'i",
    changes: [
      { type: "feat", text: "FieldPrepPanel: takvimde gün seçilince sağ 2/3'te saha hazırlığı paneli açılır" },
      { type: "feat", text: "Envantere eklenen her ekipman operasyona atandığında otomatik listede görünür" },
      { type: "feat", text: "Operasyona atanmış ekip üyeleri kontrol listesinde gösterilir" },
      { type: "feat", text: "Checkbox'lar localStorage ile kalıcı — gün bazlı hazırlık takibi" },
      { type: "feat", text: "İlerleme çubuğu: kaç item tamamlandı göstergesi" },
      { type: "feat", text: "Masaüstünde 1/3 + 2/3 grid layout, mobilde alt alta" },
    ],
  },
  {
    version: "0.8.47",
    date: "2026-04-09",
    summary: "Takvim çizgileri belirginleştirildi — aylık ve haftalık görünüm",
    changes: [
      { type: "feat", text: "Yeni --border-strong CSS değişkeni eklendi (takvim grid çizgileri için)" },
      { type: "fix", text: "Aylık takvim: gün hücreleri ve başlık çizgileri daha belirgin" },
      { type: "fix", text: "Haftalık takvim: saat ızgara çizgileri, gün başlıkları ve dikey ayırıcılar belirginleştirildi" },
    ],
  },
  {
    version: "0.8.46",
    date: "2026-04-09",
    summary: "Operasyon tipi 2 aşamalı seçim — İHA/LİDAR ana kategori + çoklu alt kategori",
    changes: [
      { type: "feat", text: "Operasyon oluşturma: 2 büyük butonla İHA/LİDAR seçimi, ardından çoklu alt kategori (Ortofoto, Oblik, 360°, El Tarama, Araç Tarama)" },
      { type: "feat", text: "TypeSelector bileşeni oluşturuldu — QuickCreateForm ve OperationForm'da ortak kullanım" },
      { type: "feat", text: "subTypes alanı eklendi — operasyonda birden fazla iş tipi seçilebilir" },
      { type: "feat", text: "Geriye uyumluluk: eski tip değerleri (drone_fotogrametri vb.) otomatik dönüştürülür" },
      { type: "refactor", text: "Tüm gösterim bileşenleri formatOperationType() helper ile güncellendi" },
    ],
  },
  {
    version: "0.8.45",
    date: "2026-04-09",
    summary: "Design System referans altyapısı + Tasarım Rehberi sayfası",
    changes: [
      { type: "feat", text: "Design System: canlı style guide sayfası eklendi (/design)" },
      { type: "docs", text: "docs/design-system.md oluşturuldu — tek tasarım referans dokümanı" },
      { type: "feat", text: "Navigasyona Tasarım linki eklendi (header + hamburger menü)" },
      { type: "docs", text: "CLAUDE.md §4 genişletildi — tasarım koruma kuralları eklendi" },
    ],
  },
  {
    version: "0.8.44",
    date: "2026-04-09",
    summary: "Darboğaz temizliği — ölü kod silindi, memoization, seed optimizasyonu",
    changes: [
      { type: "chore", text: "Ölü kod silindi: StatCard, AlertsList, QuickFlightLog (320 satır)" },
      { type: "perf", text: "StatusBoard: useMemo ile operasyon filtreleme optimize edildi" },
      { type: "perf", text: "Seed sonrası sadece değişen tablolar yenileniyor (full fetchAll yerine)" },
    ],
  },
  {
    version: "0.8.43",
    date: "2026-04-08",
    summary: "StatusBoard mobil desteği + dashboard modal düzenleme/silme aktif",
    changes: [
      { type: "fix", text: "StatusBoard: Mobilde dokunmatik sürükle-bırak alternatifi — ⋮ menüsüyle hızlı durum değişikliği" },
      { type: "fix", text: "Dashboard: OperationModal'da düzenleme ve silme artık çalışıyor (boş callback düzeltildi)" },
      { type: "feat", text: "StatusBoard: Mobilde sütun isimleri kısaltılmış (Yap → Yapılacak)" },
      { type: "chore", text: "Kullanılmayan OPERATION_TYPE_LABELS import'u kaldırıldı" },
    ],
  },
  {
    version: "0.8.42",
    date: "2026-04-08",
    summary: "Genel Bakış: KPI kartları yerine Mini Kart Listesi (Yapılacak/Yapılıyor/Yapıldı)",
    changes: [
      { type: "feat", text: "StatusBoard: 3 sütunlu mini kart listesi — Yapılacak, Yapılıyor, Yapıldı" },
      { type: "feat", text: "Sürükle-bırak ile operasyon durumu değiştirme (sütunlar arası)" },
      { type: "feat", text: "Operasyon ismine tıklayınca detay modalı açılır" },
      { type: "feat", text: "Yapıldı sütununda iptal operasyonlar soluk + üstü çizili" },
      { type: "feat", text: "Yapıldı sütunu max 5 operasyon + fazlası için '+X daha...' notu" },
      { type: "refactor", text: "4 StatCard KPI kartı kaldırıldı — StatusBoard ile değiştirildi" },
    ],
  },
  {
    version: "0.8.41",
    date: "2026-04-08",
    summary: "Araç Takip yeniden tasarım — mükerrer tab kaldırıldı, araçlar direkt kartla görünür, hata toleransı artırıldı",
    changes: [
      { type: "refactor", text: "Bilgi Bankası: mükerrer 'Araç Bilgileri' tabı kaldırıldı — tüm araç işlemleri 'Araç Takip' altında" },
      { type: "feat", text: "Araç Takip: Mevcut araçlar direkt kart olarak görünür — dropdown kaldırıldı" },
      { type: "feat", text: "Araç kartlarında bekleyen/gecikmiş etkinlik sayısı, sonraki etkinlik tarihi gösterilir" },
      { type: "fix", text: "Araç etkinlik formunda araç seçimi zorunlu yapıldı — validasyon eklendi" },
      { type: "fix", text: "iha_vehicle_events tablosu yoksa anlaşılır hata mesajı gösterilir" },
      { type: "chore", text: "Supabase schema SQL'e iha_vehicle_events tablo tanımı eklendi" },
    ],
  },
  {
    version: "0.8.40",
    date: "2026-04-08",
    summary: "Kaydetme hatası düzeltmesi, haftalık takvim overlap fix, Bilgi Bankası tüm kategoriler tab",
    changes: [
      { type: "fix", text: "Operasyon kaydetme hatası düzeltildi — start_time/end_time Supabase uyumluluğu" },
      { type: "fix", text: "Haftalık takvimde operasyonların üst üste binme sorunu düzeltildi — overlap layout algoritması" },
      { type: "feat", text: "Bilgi Bankası: TÜM kategoriler ayrı tab olarak gösterilir (Hesaplar, Lisanslar, Ağ, Sigorta, Araçlar, Diğer, Araç Takip)" },
      { type: "fix", text: "Haftalık takvim saat gösterimi düzeltildi (hourToStr fonksiyonu)" },
    ],
  },
  {
    version: "0.8.39",
    date: "2026-04-08",
    summary: "Bilgi Bankası tab yapısı + Araç etkinlik form bug fix'leri",
    changes: [
      { type: "feat", text: "Bilgi Bankası tab yapısına çevrildi: Bilgi Kayıtları | Araç Takip (Envanter pattern)" },
      { type: "fix", text: "Araç etkinlik form validation: boş başlık/tarih toast ile uyarı veriyor" },
      { type: "fix", text: "Tarih hesaplama timezone sorunu düzeltildi (local timezone kullanılıyor)" },
      { type: "fix", text: "Varsayılan araç seçimi: form açılınca ilk araç otomatik seçili" },
    ],
  },
  {
    version: "0.8.38",
    date: "2026-04-08",
    summary: "Google Calendar tarzı haftalık görünüm + operasyona saat alanı",
    changes: [
      { type: "feat", text: "Operation'a startTime/endTime alanları eklendi (varsayılan 08:00)" },
      { type: "feat", text: "QuickCreateForm'a saat seçici eklendi" },
      { type: "feat", text: "Haftalık takvim tamamen yeniden yazıldı: saat ızgarasında operasyonlar pozisyonlanıyor" },
      { type: "feat", text: "Şu anki saat kırmızı çizgiyle gösteriliyor (Google Calendar tarzı)" },
      { type: "feat", text: "Haftalık takvimde sürükle-bırak ile tarih değiştirme" },
    ],
  },
  {
    version: "0.8.34",
    date: "2026-04-08",
    summary: "Build hatası düzeltildi (ringColor → CSS variable)",
    changes: [
      { type: "fix", text: "CalendarDayDetail ringColor build hatası düzeltildi — geçersiz CSS property yerine Tailwind CSS variable kullanıldı" },
    ],
  },
  {
    version: "0.8.33",
    date: "2026-04-08",
    summary: "Takvim 4 büyük geliştirme: tip renkleri, hızlı durum, saat bloğu, sürükle-bırak",
    changes: [
      { type: "feat", text: "Operasyon tipi renkleri: LiDAR=mavi, Drone=mor, Oblik=pembe, Panorama=turkuaz — her tip farklı renk" },
      { type: "feat", text: "Takvimden direkt durum değiştirme: gün detayında 4 durum butonu (Talep/Saha/İşleme/Teslim)" },
      { type: "feat", text: "Haftalık görünümde saat ızgarası: 07:00-18:00 dekoratif saat çizgileri, üstte tüm gün etkinlikleri" },
      { type: "feat", text: "Sürükle-bırak: aylık takvimde operasyonları bir günden diğerine sürükleyip tarih değiştirme" },
      { type: "feat", text: "Takvim legend'ında tip renkleri tüm 5 operasyon tipi için gösteriliyor" },
    ],
  },
  {
    version: "0.8.32",
    date: "2026-04-08",
    summary: "Takvimden operasyon oluşturma tarih hatası düzeltildi",
    changes: [
      { type: "fix", text: "Takvimde güne tıklayıp operasyon oluşturulduğunda seçilen tarih kullanılıyor (eskiden her zaman bugünü alıyordu)" },
    ],
  },
  {
    version: "0.8.31",
    date: "2026-04-08",
    summary: "Bug fix: kullanılmayan prop temizliği",
    changes: [
      { type: "fix", text: "WeeklyCalendar'dan kullanılmayan 'operations' prop kaldırıldı" },
    ],
  },
  {
    version: "0.8.30",
    date: "2026-04-08",
    summary: "Araç takip sistemi — Bilgi Bankası + Takvim entegrasyonu",
    changes: [
      { type: "feat", text: "Araç etkinlik yönetimi: muayene, bakım, sigorta, lastik tarih takibi (VehicleEventsPanel)" },
      { type: "feat", text: "Bilgi Bankası'na 'Araç Bilgileri' kategorisi eklendi" },
      { type: "feat", text: "Araç etkinlikleri takvimde görünür — aylık ve haftalık modda" },
      { type: "feat", text: "Takvimde güne tıklanınca araç etkinlikleri ayrı bölümde listelenir" },
      { type: "feat", text: "Yaklaşan tarih uyarıları: 7 gün içinde sarı, geçmiş kırmızı" },
      { type: "feat", text: "Tamamlandı toggle: tek tıkla etkinlik durumu değiştir" },
      { type: "feat", text: "Envanter bağlantısı: etkinlikler araç ekipmanına equipment_id ile bağlı" },
    ],
  },
  {
    version: "0.8.29",
    date: "2026-04-08",
    summary: "Dashboard tam genişlik — masaüstünde sol-sağ boşluk kaldırıldı",
    changes: [
      { type: "feat", text: "Dashboard Container full genişliğe geçirildi — ekranın tamamını kullanır" },
    ],
  },
  {
    version: "0.8.28",
    date: "2026-04-08",
    summary: "Takvime haftalık görünüm eklendi + aylık takvim görsel iyileştirmesi",
    changes: [
      { type: "feat", text: "Haftalık takvim modu: Google Calendar tarzı 7 günlük görünüm, operasyon kartları, gün başlıkları" },
      { type: "feat", text: "Aylık/Haftalık geçiş toggle: header'da pill-style mod seçici" },
      { type: "feat", text: "Aylık takvimde gün numaraları büyütüldü, operasyonlu günler bold + renkli" },
      { type: "feat", text: "Operasyon sayısı badge: durum renginde yuvarlak sayı göstergesi" },
      { type: "feat", text: "Bugün göstergesi: accent renkli yuvarlak arka plan" },
      { type: "feat", text: "Operasyonlu günlerde renkli sol border (baskın durum rengi)" },
      { type: "refactor", text: "Takvim modüler yapıya bölündü: calendarConstants, MonthlyCalendar, WeeklyCalendar, CalendarLegend, CalendarDayDetail" },
    ],
  },
  {
    version: "0.8.27",
    date: "2026-04-08",
    summary: "Tüm backend alanları UI'a taşındı + form/UX iyileştirmeleri + hydration fix",
    changes: [
      { type: "feat", text: "Tüm Supabase alanları formlarda görünür: konum (mahalle/pafta/ada/parsel/alan), ekipman (durum/bakım/kalibrasyon/firmware), depolama (ip/path/tip), uçuş kaydı (tarama süresi/görüş), yazılım (yüklü bilgisayarlar)" },
      { type: "feat", text: "Bakım kayıtları UI (MaintenanceList) — ekipman detayında CRUD" },
      { type: "feat", text: "Dosya ekleri UI (AttachmentList) — operasyon + ekipman modalında yükleme/silme" },
      { type: "feat", text: "İşlem geçmişi UI (AuditLogList) — ayarlar sekmesinde audit log görüntüleme" },
      { type: "feat", text: "Uçuş izni: poligon/daire bölge tipi seçimi + daire merkez/yarıçap alanları" },
      { type: "feat", text: "Personel: profil fotoğrafı yükleme, pilot lisans belgesi yükleme" },
      { type: "feat", text: "Personel ayrı sekme oldu (8 sekme yapısı)" },
      { type: "feat", text: "Bilgi Bankası sekme + CRUD (hesap/lisans/ağ/sigorta)" },
      { type: "fix", text: "Tüm formlar <form> tag'ına dönüştürüldü — Enter tuşu çalışıyor" },
      { type: "fix", text: "Header hydration hatası düzeltildi (mounted guard)" },
      { type: "fix", text: "Personel ekleme hatası düzeltildi (role NOT NULL constraint)" },
      { type: "fix", text: "iha_team DB sütun eşleşmesi düzeltildi (specialties/certifications/skills)" },
      { type: "fix", text: "Store'da auditLog initialize'da yükleniyor" },
      { type: "refactor", text: "Dashboard sadeleştirildi: QuickAddForm ve ActiveOperations kaldırıldı" },
      { type: "chore", text: "Dead code temizliği: QuickAddForm, ActiveOperations, CheckoutList silindi" },
      { type: "chore", text: "Hata mesajları detaylandırıldı (onError gerçek Supabase hatası gösteriyor)" },
      { type: "docs", text: "CLAUDE.md: 8 sekme, 13 tablo, ekipman/operasyon detay yapısı güncellendi" },
    ],
  },
  {
    version: "0.8.26",
    date: "2026-04-07",
    summary: "CLAUDE.md tam güncelleme — sistem gerçek durumu kayıt altında",
    changes: [
      { type: "docs", text: "CLAUDE.md: Sistem Mimarisi bölümü tamamen yeniden yazıldı — gerçek durumu yansıtıyor" },
      { type: "docs", text: "CLAUDE.md: 6 sekme yapısı, Supabase entegrasyonu, operasyon detay modal yapısı belgelendi" },
      { type: "docs", text: "CLAUDE.md: §17 'Claude İçin Zorunlu Kurallar' bölümü eklendi — varsayım yapma, kontrol et, güncelle" },
      { type: "chore", text: "Eski/yanlış bilgiler temizlendi: 'localStorage', '9 tab', 'v0.7.x', 'SADECE İSKELET'" },
    ],
  },
  {
    version: "0.8.25",
    date: "2026-04-07",
    summary: "Profesyonel changelog sistemi + hamburger menü entegrasyonu",
    changes: [
      { type: "feat", text: "Changelog endüstri standardına yükseltildi: kategori rozetleri (feat/fix/refactor/perf/docs/chore)" },
      { type: "feat", text: "Changelog filtre sistemi: kategoriye göre değişiklik filtreleme" },
      { type: "feat", text: "Changelog istatistikleri: toplam sürüm, değişiklik sayısı, gün sayısı, kategori dağılımı çubuğu" },
      { type: "feat", text: "Changelog timeline görünümü: sol çizgi, genişletilebilir sürümler, güncel badge" },
      { type: "feat", text: "Hamburger menüye versiyon kartı: son güncelleme, sürüm sayısı, changelog'a geçiş" },
      { type: "refactor", text: "ChangelogEntry veri yapısı genişletildi: ChangeItem tipi, normalizeChange yardımcısı" },
    ],
  },
  {
    version: "0.8.24",
    date: "2026-04-07",
    changes: [
      "P1: Mobilde operasyon kartları (tablo yerine parmakla kullanılabilir kartlar)",
      "P1: Tek tıkla durum değiştirme (modal + kart üzerinde hızlı ilerleme butonları)",
      "P1: Operasyon arama çubuğu (başlık, talep eden, konum ile filtreleme)",
      "P1: Takvim mobil uyumluluk (büyük hücreler, gün tıklayınca detay paneli, noktalar)",
      "P2: Hızlı saha modu (9 alan → 3 alan: operasyon + pilot + GPS)",
      "P2: Operasyon formu sadeleştirme (14 → 6 temel alan + detaylar akordeonu)",
      "P2: Dashboard KPI iyileştirme (gecikmiş iş sayısı, haftalık özet)",
      "P3: Operasyon bitiş tarihi eklendi + takvimde tarih aralığı gösterimi",
      "P3: Tamamlanma yüzdesi otomatik hesaplama (duruma göre 0-100%)",
      "P3: Pagination (20 operasyon/sayfa, büyük veri setleri için)",
    ],
  },
  {
    version: "0.8.23",
    date: "2026-04-07",
    changes: [
      "Operasyonlar sekmesi sadece tablo görünümü (kanban/harita kaldırıldı)",
      "Harita ayrı sekme olarak geri eklendi (operasyonlar + izin bölgeleri + katman filtresi)",
      "Genel Bakış'a operasyon takvimi eklendi (aylık görünüm, duruma göre renkli)",
      "Sekme yapısı: Genel Bakış · Operasyonlar · Harita · Envanter · Raporlar · Ayarlar",
    ],
  },
  {
    version: "0.8.22",
    date: "2026-04-07",
    changes: [
      "Büyük yapı değişikliği: 9 sekme → 5 sekme",
      "Harita sekmesi Operasyonlar harita görünümüne birleştirildi (katman filtresi + legend + haritadan oluşturma)",
      "Uçuş İzinleri operasyon detayı içine taşındı — izin ekleme/düzenleme/silme inline",
      "Uçuş Defteri operasyon detayı içine taşındı — kayıt ekleme inline",
      "Personel + Depolama yeni Ayarlar sekmesinde birleştirildi",
      "Takvim görünümü kaldırıldı (kanban + tablo + harita yeterli)",
      "Konum formu 10 alandan 4'e sadeleştirildi",
      "6 eski sekme dosyası silindi (MapTab, PermissionsPanel, FlightLogTab, PersonnelTab, StorageTab, OperationsCalendar)",
    ],
  },
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
