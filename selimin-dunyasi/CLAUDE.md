# Selim'in Dünyası — Beyin Dosyası

## Proje
- **Amaç**: 5. sınıf eğitim platformu (Selim için)
- **Hedef kitle**: 11 yaş, tek kullanıcı
- **Site**: https://ahmetguner74.github.io/selimin-dunyasi
- **Tema**: Minecraft/oyun tarzı, koyu arka plan, yeşil/sarı accent
- **Dil**: Türkçe

## Teknik
- Next.js 16 + TypeScript + Tailwind CSS
- GitHub Pages (static export)
- localStorage (veri saklama)
- Şifre: SHA-256 hash, 7 gün oturum

## Yapı
- `/` → Ana sayfa (hoş geldin + ders kartları + XP)
- `/matematik` → Matematik bölümü (quiz listesi)
- `/matematik/quiz` → Matematik quiz (20 soru)
- `/profilim` → Profil (XP, seviye, istatistikler)
- `/turkce` → (ileride)
- `/fen` → (ileride)

## Kurallar
- Mobile-first tasarım
- Çocuk dostu UI (büyük butonlar, net yazılar)
- XP her quiz sonunda kaydedilir
- Seviye sistemi: Çırak → Savaşçı → Şövalye → Büyücü → Efsane
