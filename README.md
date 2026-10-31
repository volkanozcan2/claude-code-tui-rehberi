# Claude Code TUI Rehberi

Claude Code'un terminalde çalışan TUI (metin arayüzü) sürümünü sıfırdan,
en ince ayrıntısına kadar öğreten, Türkçe dilinde, egzersizli bir eğitim
sitesi. Kurulumdan başlayıp REPL/klavye kısayolları, izin modları, slash
komutları, plan modu, context/compaction, `CLAUDE.md` ve proje hafızası,
custom komutlar, subagent'lar, hook'lar, MCP sunucuları, headless/script
modu, worktree'ler, IDE entegrasyonu ve maliyet/sorun giderme konularına
kadar 14 dersten oluşur.

Her ders, gerçek bir terminal veya API anahtarı gerektirmeyen, site
içinde çalışan **simüle bir terminalde** pratik yapılan egzersizlerle
sonlanır. İlerleme tarayıcıda `localStorage` ile tutulur; sunucu taraflı
bir hesap veya veritabanı yoktur.

## Teknoloji

- [Next.js](https://nextjs.org) (App Router), statik export (`output: "export"`)
  modunda çalışacak şekilde yazılmıştır — sunucu tarafı API route veya
  server action kullanılmaz.
- Ders içerikleri MDX (`next-mdx-remote`) ile yazılır, `content/dersler/`
  klasöründe tutulur.
- Stil için Tailwind CSS; "Sıcak Kil Tonu" adlı özgün bir açık/koyu tema.

## Yerel Çalıştırma

Bağımlılıkları kurun ve geliştirme sunucusunu başlatın:

```bash
npm install
npm run dev
```

Site varsayılan olarak [http://localhost:3000](http://localhost:3000)
adresinde açılır.

## Statik Export (Production Build)

Proje tamamen statik export uyumludur; bu sayede Vercel, Netlify veya
GitHub Pages gibi herhangi bir statik barındırma hizmetine değişiklik
yapmadan deploy edilebilir:

```bash
npm run build
```

Build, `out/` klasörü altında ana sayfa ve 14 ders sayfasının tamamını
statik HTML olarak üretir.

## Testler

```bash
npm run test
```

> **Not:** Yukarıdaki komutlar bu dokümanın yazıldığı an itibariyle
> geçerlidir; `package.json` zaman içinde değişebilir ve bu komutlar
> güncelliğini kaybedebilir. Bir tutarsızlık fark ederseniz lütfen bir PR
> açarak bu README'yi güncel tutmaya yardımcı olun.

## Lisans

Bu proje [MIT Lisansı](./LICENSE) ile lisanslanmıştır.
