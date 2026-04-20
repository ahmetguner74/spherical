# İHA Birimi Projesi - Versiyon Kontrol (Git) Kuralları

Bu doküman, projede çalışan tüm geliştiricilerin ve yapay zeka (AI) asistanlarının kod yazarken, commit atarken ve uzak sunucuya (origin) pushlarken uyması gereken temel standartları belirler.

## 1. Branch (Dal) İsimlendirme Standartları

Sürekli ana dalda (main/master) çalışmaktan ziyade, her iş için ayrı bir branch açılması tavsiye edilir.

*   `feat/kisa-aciklama`: Yeni bir özellik geliştiriliyorsa (Örn: `feat/audit-log-ekrani`)
*   `fix/kisa-aciklama`: Bir hata/bug düzeltiliyorsa (Örn: `fix/rls-policy-acigi`)
*   `docs/kisa-aciklama`: Sadece dökümantasyon değiştiyse.
*   `refactor/kisa-aciklama`: Kodun işleyişi değişmeden yapısı iyileştiriliyorsa.

## 2. Commit Mesajı Standartları (Conventional Commits)

Commit mesajları tüm ekibin okuyabileceği ve neyin değiştiğini anlayabileceği dille, net ve standart bir formatta olmalıdır. 

**Format:**
```text
<tip>: <Kısa ve net bir açıklama (Mümkünse emir kipinde)>

[Opsiyonel: Detaylı paragraf halinde neden bu değişikliğin yapıldığını açıklayan bağlam]
```

**Kullanılacak Tipler (Types):**
*   `feat:` Yeni bir özellik eklendiğinde. *(Örn: feat: ekipman bakım bildirimleri eklendi)*
*   `fix:` Mevcut bir kodda düzeltme yapıldığında. *(Örn: fix: audit log silinme güvenlik açığı giderildi)*
*   `docs:` Dökümantasyon değişikliklerinde (README, markdown vb.)
*   `style:` Kod çalışmasını etkilemeyen formatlamalar (Girinti, boşluk, noktalı virgül ekleme vb.)
*   `refactor:` Yeni bir özellik eklemeyen ve bug düzeltmeyen kod iyileştirmesi.
*   `perf:` Performans artırıcı kod güncellemeleri.
*   `chore:` Derleme süreçleri, dış paket güncellemeleri veya build aracı ayarları.

**Örnek İyi Commit Mesajları:**
> `fix: audit_log tablosundaki auth_delete kuralı tamamen kaldırıldı`
> `feat: IhaDashboard paneline undo(geri alma) butonu eklendi`

## 3. Commit Büyüklüğü (Atoimc Commits)

*   Her bir commit, **mümkün olan en küçük ve kendi içinde çalışan** bir bütün olmalıdır (Atomic).
*   Çok fazla dosyayı, alakasız çok fazla özelliği tek bir commit haline getirip "güncellemeler yapıldı" gibi ne olduğu belirsiz commitler atmaktan kaçınılmalıdır.
*   Bir problemi çözerken 10 dosya değiştiyse, hepsiyle birlikte mantıklı tek bir commit atılır; ama aynı anda bir de tasarımda bambaşka bir tuş düzeltildiyse o ikinci bir commit olmalıdır.

## 4. Push Etmeden Önce Yapılması Gerekenler

Sisteme (GitHub/GitLab vb.) `git push` yapmadan önce şunlardan emin olunmalıdır:

1.  **Hatasız Derleme:** Projede `npm run build` komutu başarıyla, kırmızı hata (error) vermeden tamamlanabilmektedir. (Bu çok önemlidir, production patlamamalıdır).
2.  **Lint Kontrolü:** Ortamda lint / type hataları olabildiğince giderilmiş olmalıdır.
3.  **Çalışan Proje:** İlgili değişiklik sonrasında sistem (eklenen/çıkarılan yer itibariyle) çökmemektedir. En azından ana sayfasına ve değiştirilen menüsüne girilebiliyordur.
4.  **Gizli Veriler:** Gelişmiş API anahtarları, şifreler, `.env.local` gibi sadece özel olan dosyalar git'e pushlanmamalıdır. Eklendiyse `.gitignore` kontrol edilmelidir.

## 5. AI Asistanları İçin Özel Not:

AI (Cursor, Claude, Gemini vb. agentlar) otonom veya kullanıcı emriyle commit atacağında **mutlaka** yukarıdaki "Conventional Commits" kurallarına uymalıdır. Kullanıcının attığı "hadi kaydet, commit at" emrini direkt mesaj olarak yazmamalı, yapılan yazılımsal değişikliği kendisi analiz ederek düzgün formatlanmış bir mesaj halinde kaydetmelidir.
