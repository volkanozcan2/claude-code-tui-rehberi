# Tasarım: Claude Code TUI Rehberi (Türkçe, Egzersizli Eğitim Sitesi)

**Tarih:** 2026-10-31
**Durum:** Kullanıcı onayı bekleniyor

## Amaç ve Neden

Kullanıcı Claude Code'un GUI versiyonunu kullanıyor ama terminalde çalışan TUI
versiyonuna yabancı. Bu TUI'yi sıfırdan, en ince ayrıntısına kadar öğreten,
egzersizli, görsel olarak özgün (generic/şablon hissi vermeyen) bir Türkçe
eğitim sitesi istiyor. Site, kullanıcının kendi öğrenmesi için başlıyor ama
baştan "public, GitHub'da paylaşılabilir" bir kurs olarak tasarlanacak;
kullanıcı ileride bunu canlıya alıp (Vercel/Netlify/GitHub Pages vb.) internette
yayınlamayı düşünüyor.

## Hedefler

- Claude Code TUI'nin tüm yüzeyini kapsamak: kurulum, REPL/klavye kısayolları,
  izin modları, slash komutları, plan modu, context/compaction, CLAUDE.md ve
  hafıza, custom komutlar, subagent'lar, hook'lar, MCP, headless/script modu,
  worktree'ler, IDE entegrasyonu, maliyet/token yönetimi, sorun giderme.
- Her dersin sonunda, gerçek terminal gerektirmeyen, site içinde **simüle bir
  terminalde** pratik yapılan egzersizler.
- Görsel olarak "vasat/generic" olmayan, kendine has bir tema (kullanıcı
  tarafından onaylanmış yön: **Sıcak Kil Tonu** — bkz. Görsel Tasarım).
- Açık kaynak / public GitHub reposu olarak yayınlanabilir durumda bir kod
  tabanı (README, LICENSE, temiz yapı).
- İçerik dili: Türkçe.

## Kapsam Dışı (Non-goals)

- Gerçek bir Claude Code CLI'ı çalıştırmak veya kullanıcının API anahtarıyla
  canlı komut yürütmek — egzersizler tamamen **simüle** terminal üzerinden.
- Kullanıcı hesabı/login, sunucu taraflı veritabanı — v1'de backend yok.
  İlerleme tarayıcıda `localStorage` ile tutulur.
- Çoklu dil desteği (İngilizce vb.) — v1 sadece Türkçe.
- Claude Code'un kendisini (CLI aracının) geliştirilmesi; bu proje sadece onu
  öğreten bağımsız bir eğitim sitesi.

## Anti-hedefler (başarısızlık sayılır)

- Şablon/"vasat" görünen, herhangi bir kurs sitesine benzeyen bir tasarım.
- Yüzeysel, sadece ekran görüntüsü/komut listesi halinde içerik — "en ince
  ayrıntısına kadar" sözü tutulmazsa.
- Egzersizlerin sahte/anlamsız olması (gerçek TUI davranışını yansıtmayan).

## Kısıtlar

- Boş bir dizinden (`/Users/volkan/Desktop/vps_attack_test`) sıfırdan
  başlanıyor, henüz git reposu yok.
- Kullanıcı ileri seviye değil ama "next js mdx" seçimini kendisi yaptı —
  kod tabanını zaman zaman kendisinin de dokunabileceği kabul ediliyor.

## Kararlaştırılan Seçimler

### Teknoloji
- **Next.js (App Router) + MDX** ders içerikleri için (`@next/mdx` veya
  `next-mdx-remote`). Tailwind CSS ile stil.
- **Deployment (karar):** Backend/DB olmadığı ve tüm ders sayfaları build
  zamanında bilindiği için proje tamamen **statik export uyumlu** (`next
  export`) yazılacak — API route/server action kullanılmayacak. Bu sayede
  Vercel, Netlify veya GitHub Pages'in herhangi birine değişiklik
  yapmadan deploy edilebilir; kullanıcı ilerideki tercihine göre seçer.
  İlerleme `localStorage`'da tutulur.
- Repo: public'e hazır yapı — `README.md`, `LICENSE` (MIT), `.gitignore`,
  anlamlı klasörleme (`content/dersler/...`, `components/`, `lib/`).
- **Responsive (karar):** Site mobil genişlikte de kullanılabilir olacak —
  ders sayfasındaki sol nav/terminal paneli dar ekranda tek sütuna düşer,
  nav bir çekmeceye (drawer) dönüşür. Masaüstü iki-panel yerleşimi ana
  deneyim, mobil ikincil ama çalışır durumda olmalı.

### Görsel Tasarım — "Sıcak Kil Tonu" (kullanıcı onaylı)
- Açık mod: krem/kil arka plan (`#fbf4e8` ailesi), koyu kahve metin
  (`#3a332a`), turuncu-kahve vurgu (`#d97757` ailesi), ikincil vurgular
  hardal/zeytin tonları.
- Koyu mod: aynı paletin koyu kahve/antrasit varyantı, aynı turuncu vurgu
  korunur (marka tutarlılığı).
- Tipografi: gövde metni için okunaklı bir sans-serif, terminal/kod blokları
  için monospace (örn. JetBrains Mono / SF Mono fallback zinciri).
- Terminal pencereleri gerçek bir macOS/Linux terminal hissinde (üstte
  renkli nokta çubuğu) ama kendi palet renkleriyle — jenerik "VS Code dark"
  klonlarından kaçınılacak.

### Bilgi Mimarisi (onaylı yerleşim)
- **Ana sayfa:** hero + genel ilerleme rozeti + bölüm/modül grid'i (kart
  başına ilerleme çubuğu).
- **Ders sayfası:** sol tarafta bölüm/ders ağacı (nav), sağda/altta ders
  metni **ve aynı ekranda** simüle terminal egzersiz kutusu — kullanıcı
  okuyup hemen aynı sayfada deniyor (ayrı sekme/adım değil).

### Egzersiz Mekaniği (Simüle Terminal)
- Her ders sonunda 1-3 görev: kullanıcıdan belirli bir komut/anahtar
  kombinasyonu/flag yazması istenir (örn. "context'i özetleyen komutu yaz").
- Girdi, dersin tanımladığı kabul kriterleriyle (tam eşleşme, regex veya
  "içerir" kontrolü — birden fazla doğru cevap mümkün) karşılaştırılır.
- Anında geri bildirim: doğruysa ✓ ve kısa açıklama, yanlışsa ipucu ve tekrar
  deneme hakkı. Gerçek bir shell çalıştırılmaz, sadece metin eşleştirme ve
  önceden yazılmış "sahte çıktı" simülasyonu.
- Tamamlanan egzersizler/dersler `localStorage`'a yazılır; ana sayfadaki
  ilerleme çubukları buna göre dolar.

### İçerik Kapsamı — Bölümler ve Dersler (14 ders / 4 bölüm)

**Bölüm 1 — Temeller**
1. Kurulum & İlk Çalıştırma (kurulum, giriş/auth, ilk `claude` komutu)
2. REPL ve Arayüz (TUI ekran yapısı, klavye kısayolları, çoklu satır girişi)
3. Konuşma Akışı (mesaj gönderme, geçmiş, oturum kavramı)

**Bölüm 2 — Günlük Kullanım**
4. Araçlar & İzin Modları (Read/Edit/Write/Bash, default/acceptEdits/plan/
   bypassPermissions modları)
5. Slash Komutları (`/clear`, `/compact`, `/help`, `/model`, `/resume` vb.)
6. Plan Modu (plan modunun akışı, ne zaman kullanılır)
7. Context Yönetimi & Compaction (otomatik özetleme, token/limit kavramı)

**Bölüm 3 — İleri Düzey**
8. CLAUDE.md ve Proje Hafızası
9. Custom Slash Komutları & `settings.json`
10. Subagent'lar & Task Aracı
11. Hook'lar (PreToolUse/PostToolUse vb. yaşam döngüsü kancaları)
12. MCP Sunucuları

**Bölüm 4 — Uzmanlık**
13. Headless Mod & Script'leme (`-p`, `--output-format`, CI kullanımı)
14. Worktree'ler, IDE Entegrasyonu, Maliyet/Token Yönetimi, Sorun Giderme

Her ders: kavram anlatımı (Türkçe, örneklerle) + "neden önemli" kısmı +
en az 1-3 simüle terminal egzersizi (bu bir alt sınır, üst sınır değil —
hook'lar/MCP/subagent'lar gibi ağır konular daha fazla egzersiz ve daha
uzun anlatım alabilir; uzunluk konuya göre esner, 14 modül üst seviye
gruplamadır) + kısa özet.

**Ders 1'in varsayımı (karar):** Okuyucunun komut satırına temelde aşina
olduğu (terminal açıp komut çalıştırabildiği) kabul edilir, ama Claude
Code hakkında **hiçbir ön bilgisi olmadığı** varsayılır — "Claude Code
nedir" düzeyinden başlar. GUI deneyimine referans verilmez (kurs tek
başına, yabancı bir okuyucu için de tutarlı olmalı).

**Güncellik notu (karar):** Her ders sayfasının altında "İçerik, Claude
Code'un [sürüm/tarih] versiyonuna göre doğrulanmıştır" şeklinde bir not
ve repo README'sinde kısa bir "komutlar zamanla değişebilir, PR açarak
güncelleyin" uyarısı yer alır — açık kaynak bir kurs olarak güncellik
beklentisini yönetmek için.

## Yapım Sırası (karar)

Risk: tüm 14 dersin içeriği üretildikten sonra görsel uygulamanın hâlâ
"vasat" hissettirmesi — büyük bir geri alım anlamına gelir. Bunu önlemek
için inşa iki fazda yapılır:

1. **Faz 1 — İskelet & onay noktası:** Tema/komponent sistemi (renk
   token'ları, terminal bileşeni, ders sayfası yerleşimi) + ana sayfa +
   **tam dolu bir örnek ders** (Ders 1) gerçek içerik ve çalışan simüle
   terminal egzersiziyle kurulur. Kullanıcıya gösterilir, görsel/akış
   onayı alınır.
2. **Faz 2 — İçerik üretimi:** Onay sonrası kalan 13 ders aynı kalıpla
   üretilir, repo README/LICENSE ile tamamlanır.

## Builder'a Bırakılanlar

- Her dersin tam metin içeriği ve örnek komut/çıktı simülasyonları (bu
  tasarımdaki modül/ders listesi iskelet; ayrıntılı içerik yazım sırasında
  üretilecek).
- Simüle terminal bileşeninin tam React/TypeScript implementasyonu
  (component API, state yönetimi, animasyon detayları).
- Tam Tailwind renk/typography token'larının kesin değerleri (mockup'taki
  renkler başlangıç noktası, ince ayar builder'a bırakılmıştır).
- Tam klasör/dosya yapısı ve MDX içerik şeması.
- Git reposunun ilk kurulumu (init, ilk commit, README/LICENSE metinleri).
