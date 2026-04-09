# MEMORY.md — Oturum Hafızası

> Bu dosya oturumlar arası unutulmaması gereken kararları, ertelenen işleri ve notları tutar.
> Her oturum başında CLAUDE.md ile birlikte okunur.

---

## Ertelenen / Kaldırılan Özellikler

### Denetim Günlüğü (Audit Log) — UI kaldırıldı, arka plan aktif
- **Tarih:** 2026-04-09
- **Durum:** UI'dan kaldırıldı (ReportsTab + SettingsTab)
- **Arka plan:** `audit()` fonksiyonu + `iha_audit_log` tablosu çalışmaya devam ediyor
- **Neden kaldırıldı:** Tek kullanıcılı sistemde "kim yaptı" bilgisi anlamsız
- **Ne zaman açılacak:** Auth + çoklu kullanıcı geldiğinde
- **Dosyalar:** `AuditLogList.tsx` hala mevcut (silinmedi), sadece import kaldırıldı

### OperationTimeline — silindi
- **Tarih:** 2026-04-09
- **Durum:** Dosya silindi (`OperationTimeline.tsx`)
- **Neden:** OperationModal sadeleştirildi, 3 panel → 2 panel. Timeline detay görünümüyle birlikte kaldırıldı
- **Not:** İleride operasyon detay sayfası (tam sayfa) yapılırsa tekrar eklenebilir

### OperationDetail (salt okunur detay görünümü) — kaldırıldı
- **Tarih:** 2026-04-09
- **Durum:** OperationModal içinden kaldırıldı
- **Neden:** Kullanıcı 3 farklı panelle karşılaşıyordu (QuickCreate → Detail → Form). 2'ye indirildi
- **Mevcut akış:** Yeni → QuickCreateForm | Var olan → direkt OperationForm + OperationExtras

---

## Aktif Kararlar

### Operasyon Paneli Akışı
- Yeni operasyon: QuickCreateForm (basit, 5-6 alan)
- Var olan operasyona tıkla: Direkt OperationForm + alt bölümler (tek panel)
- Alt bölümler: Uçuş İzni, Uçuş Kayıtları, İş Akışı, Çıktılar, Dosya Ekleri

### Saha Hazırlığı Paneli
- Her zaman görünür (gün seçilmese bile bugünü gösterir)
- Operasyon yoksa tam genişlik alır
- Ekipman kategorisine göre alt maddeler (drone→batarya/SD, GPS→pil/tripod, araç→yakıt)
- Checklist Supabase'de (`iha_field_prep` tablosu), localStorage fallback
- Tüm maddeler tamamlanınca "Sahaya Hazırız" butonu → durum otomatik "saha"ya çevrilir

### Soft Delete
- 14 tablo: `deleted_at` kolonu ile soft delete
- `iha_info_bank` dahil (sonradan eklendi — unutulmuştu!)
- Seed fonksiyonları: `limit(1)` ile mükerrer koruması
- `iha_audit_log` tablosuna soft delete uygulanmaz (log her zaman tam tutulur)

### Saat Yönetimi
- Operasyonlarda `startTime` + `endTime` zorunlu değil
- Varsayılan: 08:00 - 09:00
- Haftalık takvimde saat bazlı sürükle-bırak (30dk snap, süre korunur)
- Aylık takvimde saat gösterilmez

---

## Gelecek İşler (Kullanıcı Onayı Bekliyor)

- [ ] Auth + Supabase Auth + RLS politikaları
- [ ] Denetim günlüğü UI'ını tekrar aç (Auth sonrası)
- [ ] Excel veri aktarımı (519 Wingtra + 20 M300 + 32 Panorama)
- [ ] PDF rapor export
- [ ] Çevrimdışı mod (Service Worker + senkronizasyon)
- [ ] Bildirim sistemi
- [ ] Operasyon detay sayfası (tam sayfa, timeline ile)

---

## Hatalardan Çıkarılan Dersler

### iha_info_bank deleted_at eksikliği (2026-04-09)
- **Hata:** Soft delete SQL'inde `iha_info_bank` tablosu atlandı → bilgi bankası verileri görünmez oldu
- **Sebep:** 14 tablo elle yazıldı, 1'i unutuldu
- **Çözüm:** CLAUDE.md'ye kural 6-7-8 eklendi (kod-SQL eşzamanlılık, tam liste kontrolü, çapraz doğrulama)
- **Ders:** Toplu değişikliklerde grep ile etkilenen tüm yerleri say ve SQL ile karşılaştır

### Wingtra Gen2 mükerrer kayıtlar (2026-04-09)
- **Hata:** 8 adet Wingtra Gen2 kaydı oluştu
- **Sebep:** Seed fonksiyonu `maybeSingle()` ile kontrol yapıyordu, çoklu sonuçta hata veriyordu
- **Çözüm:** `maybeSingle()` → `limit(1)` değiştirildi
- **Ders:** Seed fonksiyonlarında `maybeSingle()` yerine `limit(1)` kullan

---

*Son güncelleme: 2026-04-09*
