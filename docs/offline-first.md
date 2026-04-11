# Çevrimdışı Mod (Offline-First)

> Sahada (tabletten) kullanılabilir bir sistem için çevrimdışı strateji.
> Son güncelleme: 2026-04-11 (v0.8.82)

## 1. Kurallar

- Her kritik ekran salt-okunur çevrimdışı açılabilmeli (operasyon listesi, takvim, harita)
- Değişiklikler offline queue'ya yazılır, bağlantı gelince senkronize edilir
- Supabase yanıtları IndexedDB'de cache'lenir (stale-while-revalidate)
- Kullanıcıya bağlantı durumu her zaman görünür olmalı (üst bar indicator)
- Çakışma politikası: last-write-wins + `iha_audit_log`'a kayıt
- Service Worker sadece platform (auth sonrası) sayfalarını cache'ler — marketing ve admin hariç
- Pafta geojson (`public/vector/pafta_index/bursa-paftalar.geojson`) ve Leaflet tile cache zorunlu

## 2. Mevcut Durum (v0.8.82)

- ❌ Service Worker yok
- ❌ IndexedDB cache katmanı yok
- ❌ Offline indicator yok
- ❌ Offline queue yok
- ✅ Tüm CRUD tek noktadan geçiyor: `src/components/features/iha/shared/ihaStorage.ts` (cache wrapper buraya eklenecek)
- ✅ Pafta geojson statik — CDN/PWA cache'e hazır

## 3. Yol Haritası

- [ ] 1. `useOnlineStatus` hook + üst bar bağlantı indicator'ı
- [ ] 2. IndexedDB cache wrapper (ihaStorage.ts'nin önüne geçer, read-through)
- [ ] 3. Offline write queue + retry mekanizması
- [ ] 4. Next.js PWA + Service Worker entegrasyonu (platform sayfaları)
- [ ] 5. Çakışma çözüm UI (audit log'a bağlı geri alma)
