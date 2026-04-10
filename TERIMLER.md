# TERIMLER (Yazılım Dünyası Sözlüğü)

> Bu dosya Spherical projesinde kullanılan yazılım/UX terimlerinin Türkçe açıklamaları ve somut örnekleridir.
> Claude'a "terimler" sorulduğunda bu dosyayı gösterir.

---

## 1. Kullanıcı Deneyimi (UX — User Experience)

| Türkçe | İngilizce | Ne Demek | Spherical Örneği |
|--------|-----------|----------|------------------|
| **Sıkıntı noktası** | Pain point | Kullanıcının zorlandığı yer | "Operasyona tıklayınca 3 farklı panel açılıyordu — sıkıntı noktasıydı" |
| **Sürtünme noktası** | Friction point | Kullanıcıyı yavaşlatan küçük engel | "Yeni operasyon için pin onay balonu gereksiz sürtünmeydi" |
| **Bilişsel yük** | Cognitive load | Aynı anda akla sığmayacak kadar çok bilgi | "Haritada 7 filtre butonu, 5 katman — bilişsel yük yüksek" |
| **Görsel ipucu** | Affordance | "Burası tıklanabilir" mesajını gözle vermek | "Zorunlu alan için kırmızı * görsel ipucudur" |
| **Ana eylem** | Primary CTA (Call to Action) | "+ Yeni Operasyon", "Kaydet" gibi öne çıkan buton | "Mavi 'Kaydet' butonu primary CTA'dır" |
| **İkincil eylem** | Secondary action | "İptal", "Kapat" gibi yan buton | "Modal'da 'İptal' ikincil eylem butonudur" |
| **Boş durum** | Empty state | Liste boş olduğunda gösterilen ekran | "Operasyon yoksa 'Henüz operasyon yok + Yeni Ekle' boş durum" |
| **İlk kullanım** | Onboarding | Yeni kullanıcıya nasıl kullanacağını öğretmek | "İlk açılışta 3 adım ipucu — onboarding" |
| **Aydınlanma anı** | Aha moment | Kullanıcının "anladım!" dediği an | "Pafta tıklayınca o paftadaki operasyonları görmek aydınlanma anıdır" |
| **Körlük** | Banner blindness | Sürekli görülen şeyleri artık görmemek | "Üstte sabit uyarı çok durunca banner körlüğü oluşur" |

---

## 2. Arayüz Tasarımı (UI — User Interface)

| Türkçe | İngilizce | Ne Demek | Spherical Örneği |
|--------|-----------|----------|------------------|
| **Tutarlılık** | Consistency | Her yerde aynı şeyin aynı şekilde görünmesi | "Her sekmede arama kutusu aynı yerde — tutarlılık" |
| **Desen uyumu** | Pattern consistency | Benzer ihtiyaçlara aynı çözümü uygulamak | "Tüm filtreler açılır modal — desen uyumu" |
| **Görsel hiyerarşi** | Visual hierarchy | Hangi şeyin ön planda olduğu | "Primary mavi, ghost gri — görsel hiyerarşi" |
| **Bilgi mimarisi** | Information architecture (IA) | Hangi bilgi nerede duracak | "9 sekme → 4 ana + 'Daha' — bilgi mimarisi düzeltmesi" |
| **Dokunma hedefi** | Touch target | Parmakla basılabilecek alan (min 44x44px) | "Butonları `min-h-[44px]` — dokunma hedefi" |
| **Erişilebilirlik** | Accessibility (a11y) | Engelli dostu tasarım | "Ekran okuyucu için ARIA etiketi — a11y" |
| **Tasarım tokenı** | Design token | Renk/ölçü sabiti (merkezi) | "tokens.ts içindeki `statusColors` tasarım tokenıdır" |
| **Parmak dostu** | Thumb-friendly | Mobilde tek elle erişilebilir | "Alt tab bar thumb-friendly" |
| **Alt sayfa** | Bottom sheet | Alttan yukarı kayarak açılan panel | "'Daha' butonu bottom sheet açar" |

---

## 3. Kod Kalitesi

| Türkçe | İngilizce | Ne Demek | Spherical Örneği |
|--------|-----------|----------|------------------|
| **Darboğaz** | Bottleneck | Sistemi yavaşlatan tek nokta | "2301 pafta tooltip'i mobilde darboğazdı" |
| **Performans sorunu** | Performance issue | Yavaş çalışan şey | "Büyük liste render performans sorunu" |
| **Teknik borç** | Technical debt | Hızlıca yapıldı, sonra düzeltilmesi gerek | "Ham buttonlar teknik borçtu — v0.8.67'de ödendi" |
| **Kod kokusu** | Code smell | Kodda "kötü gibi duran" şey | "`: any` tipi kod kokusudur" |
| **Ölü kod** | Dead code | Hiçbir yerde kullanılmayan kod | "OperationTimeline.tsx ölü koddu, silindi" |
| **Regresyon** | Regression | Eskiden çalışan bir şeyin bozulması | "Pafta sütunu eklendi, eski fetch bozuldu — regresyon" |
| **Refaktör** | Refactoring | Davranışı aynı, yapıyı yeniden düzenleme | "Modal'ı sekmelere böldük — refaktör" |
| **Cila** | Polish | Son görsel iyileştirmeler | "Butonlara hover animasyonu — cila" |
| **Temizlik** | Cleanup | Gereksizleri kaldırma | "Kullanılmayan importları sildik — temizlik" |
| **Birleştirme** | Unification | Farklı parçaları tek standart altında toplama | "Emoji → Lucide ikon birleştirmesi" |
| **Ayrıştırma** | Separation of concerns | Her bir kodu kendi işini yapmaya ayırmak | "usePaftaData hook'u ayrıştırma örneğidir" |
| **Tekrar kullanım** | Reusability | Aynı bileşenin çok yerde kullanılması | "EmptyState tekrar kullanım için yapıldı" |

---

## 4. Mimari ve Yapı

| Türkçe | İngilizce | Ne Demek | Spherical Örneği |
|--------|-----------|----------|------------------|
| **Bileşen** | Component | Tek bir UI parçası | "Button, Modal, EmptyState bileşenlerdir" |
| **Atom tasarımı** | Atomic design | UI'ı atom/molekül/organizma olarak bölme | "ui/ = atom, layout/ = molekül, features/ = organizma" |
| **Barrel export** | Barrel export | index.ts'den toplu dışarı açma | "src/components/ui/index.ts barrel'dir" |
| **Hook** | Hook | React'ta durum yöneten fonksiyon | "useIhaStore, usePaftaData hook'tur" |
| **Durum yönetimi** | State management | Verinin nerede/nasıl tutulduğu | "Zustand ile state management" |
| **Kalıcılık** | Persistence | Veriyi sayfa yenilense de saklamak | "Supabase kalıcılık sağlar" |
| **Yumuşak silme** | Soft delete | Veriyi silme, gizleme | "deleted_at kolonu soft delete için" |
| **Önbellek** | Cache | Bir kez çekilip saklanan veri | "usePaftaData cache'li — tek fetch" |
| **Tembel yükleme** | Lazy loading | Gerektiğinde yükleme | "Pafta GeoJSON lazy load" |
| **Gecikmeli yükleme** | Deferred loading | İhtiyaç oldukça yükleme | "Modal içindeki harita deferred" |
| **Görünürlük kırpma** | Viewport culling | Sadece ekranda görüneni render et | "2301 pafta viewport culling ile hızlanır" |

---

## 5. Kullanıcı Akışı

| Türkçe | İngilizce | Ne Demek | Spherical Örneği |
|--------|-----------|----------|------------------|
| **Kullanıcı akışı** | User flow | Bir görevi tamamlama yolu | "Yeni operasyon oluşturma kullanıcı akışı" |
| **Dönüşüm kaybı** | Drop-off | Kullanıcının yarıda bıraktığı yer | "3 adımlık formda 2. adımda drop-off" |
| **Yanlış tıklama** | Mis-click / mis-tap | İstemsiz dokunma | "Haritaya yanlış tıklama sorunu" |
| **Onay penceresi** | Confirmation dialog | "Emin misin?" sorusu | "Silme öncesi ConfirmDialog" |
| **Aşama sayısı** | Step count | Bir işi tamamlamak için gereken adım | "3 adım → 2 adım (pending pin kaldırıldı)" |
| **İlerleme göstergesi** | Progress indicator | "%40 tamamlandı" çubuğu | "Excel import progress bar" |
| **Geri bildirim** | Feedback | "Kaydedildi!" toast mesajı | "Toast geri bildirimdir" |

---

## 6. Veri ve API

| Türkçe | İngilizce | Ne Demek | Spherical Örneği |
|--------|-----------|----------|------------------|
| **Son nokta** | Endpoint | API'nin bir adres noktası | "/api/wms-proxy endpoint'idir" |
| **İstek/Yanıt** | Request/Response | Sunucuya soru ve cevap | "Supabase request/response" |
| **Ham veri** | Raw data | İşlenmemiş veri | "Excel ham verisidir" |
| **Normalize** | Normalization | Veriyi standart forma çevirme | "Shapefile → GeoJSON normalizasyonu" |
| **Dönüşüm** | Transformation | Formatı değiştirme | "TUREF → WGS84 dönüşümü" |
| **Göç** | Migration | Şema/veri taşıma | "Soft delete SQL migration" |
| **İmza** | Signature | Bir fonksiyonun parametreleri | "upsertOperation(op) imzası" |
| **Sözleşme** | Contract | İki sistem arası anlaşma | "TypeScript tipleri contract'tır" |

---

## 7. Süreç ve Çalışma

| Türkçe | İngilizce | Ne Demek | Spherical Örneği |
|--------|-----------|----------|------------------|
| **Denetim** | Audit | Kapsamlı inceleme | "UX audit yaptırdık" |
| **Sezgisel değerlendirme** | Heuristic evaluation | 10 kural üzerinden denetim | "Nielsen heuristic evaluation" |
| **İtimatnamenin testi** | Dogfooding | Kendi ürününü kullanmak | "Sen mobilden kullanıyorsun — dogfooding" |
| **Önce hazırla, sonra yayınla** | Ship it mindset | Mükemmel değil, iyi ve hızlı | "v0.8.x ship it — sonra iyileştir" |
| **Aşamalı yayınlama** | Phased rollout | Azar azar yayınlama | "Faz 1 → Faz 2 → Faz 3 aşamalı" |
| **Küçük artımlar** | Incremental changes | Küçük parçalar halinde değişiklik | "Her commit küçük artımdır" |
| **Orkestrasyon** | Orchestration | Paralel işleri koordine etme | "3 ajan paralel — orkestrasyon" |

---

## 8. Kullanım Kılavuzu

### Sıkça Karşılaşılan Durumlar

**Soru:** "Burası yavaş, ne diyelim?"
**Cevap:** "Burada bir **darboğaz (bottleneck)** var" veya "**Performans sorunu**"

**Soru:** "Arayüz tutarsız, nasıl tanımlarız?"
**Cevap:** "**Desen uyumu (pattern consistency)** sorunu" veya "**Tutarlılık eksik**"

**Soru:** "Kullanıcı yanlışlıkla butona bastı, ne diyelim?"
**Cevap:** "**Yanlış dokunma (mis-tap)** oluyor" veya "**Sürtünme (friction)**"

**Soru:** "Kod kötü ama çalışıyor, ne diyelim?"
**Cevap:** "**Teknik borç (technical debt)**" veya "**Kod kokusu (code smell)**"

**Soru:** "Kullanılmayan kod var, ne diyelim?"
**Cevap:** "**Ölü kod (dead code)**"

**Soru:** "Aynı şeyi her yerde aynı şekilde yapalım"
**Cevap:** "**Tutarlılık (consistency)** sağlıyoruz" veya "**Desen uyumu**"

**Soru:** "Hızlıca yapıp sonra düzelteyim diyoruz"
**Cevap:** "**Teknik borç (technical debt)** biriktiriyoruz"

---

*Son güncelleme: 2026-04-10 (v0.8.72)*
