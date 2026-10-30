# Claude Code TUI Rehberi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Türkçe, 14 derslik, simüle terminal egzersizleriyle Claude Code'un
terminal (TUI) versiyonunu sıfırdan öğreten, statik olarak yayınlanabilir bir
Next.js eğitim sitesi kurmak.

**Architecture:** Next.js (App Router, TypeScript) + Tailwind CSS, backend
yok. Ders içerikleri `content/dersler/*.mdx` dosyalarında frontmatter (yapısal
veri: başlık, bölüm, egzersizler) + MDX gövdesi (anlatım metni) olarak tutulur.
`lib/dersler.ts` bunları build-time'da okuyup React bileşenlerine verir.
Egzersiz doğrulama saf fonksiyon (`lib/exercise-validator.ts`), ilerleme
`localStorage` (`lib/progress.ts`). Site tamamen statik export edilir
(`next export`) — API route veya server action yok.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS,
`gray-matter` (frontmatter ayrıştırma), `next-mdx-remote/rsc` (MDX render),
Vitest + @testing-library/react + jsdom (test).

**Spec:** `docs/superpowers/specs/2026-10-31-claude-code-tui-course-design.md`

## Global Constraints

- İçerik dili: **Türkçe**, her yerde (UI metinleri, ders içerikleri, commit
  mesajları hariç kod/README İngilizce kalabilir).
- Backend/veritabanı **yok**; tüm ilerleme tarayıcıda `localStorage`'da.
- Proje **statik export uyumlu** olmalı (`next.config.ts` → `output: 'export'`);
  API route, server action, middleware kullanılmaz.
- Tema "Sıcak Kil Tonu": açık modda zemin `#fbf4e8` ailesi, metin `#3a332a`,
  vurgu `#d97757` ailesi; koyu mod aynı paletin koyu kahve/antrasit varyantı,
  aynı turuncu vurgu korunur. İkincil tonların kesin hex değerleri builder'ın
  kararı (bu aile içinde kalmak kaydıyla).
- Responsive: dar ekranda (`<768px`) ders sayfasındaki yan nav bir çekmeceye
  (drawer) döner; iki panel yerleşimi tek sütuna düşer.
- Egzersizler **gerçek shell çalıştırmaz** — yalnızca metin eşleştirme ve
  önceden tanımlı "sahte çıktı" simülasyonu.
- Sabit yapı: **4 bölüm, 14 ders** (Temeller / Günlük Kullanım / İleri Düzey /
  Uzmanlık) — spec'teki sırayla.
- Lisans: MIT. Her ders sayfasının altında "İçerik, Claude Code'un
  [sürüm/tarih] versiyonuna göre doğrulanmıştır" notu.
- Faz 1 (Task 1-9) tamamlanınca **kullanıcı onayı alınmadan** Faz 2'ye
  (Task 11+) geçilmez — spec'in "Yapım Sırası" bölümü.

## Review Focus

- **Boş girdiyle egzersiz gönderme:** kullanıcı hiçbir şey yazmadan "Kontrol
  Et"e basarsa ne doğru ne de sahte-başarı sonucu dönmemeli, sessizce yok
  sayılmalı. → Task 5.
- **Boşluk/fazla boşluk farklılıkları:** `  /compact ` gibi baştaki/sondaki
  veya araya sıkışmış çift boşluklu girdiler, aynı komutun temiz hâliyle
  eşleşmeli (gerçek terminalde shell bunu zaten temizler). → Task 1.
- **SSR/build sırasında `localStorage` erişimi:** `window` olmayan ortamda
  (Next.js build/SSR adımı) ilerleme fonksiyonları patlamamalı, güvenli
  varsayılan (false/0) dönmeli. → Task 3.
- **Bir komutun birden fazla geçerli yazım biçimi:** bazı görevlerde birden
  fazla doğru cevap kabul edilmeli (örn. hem kısaltma hem tam biçim); sadece
  ilk kabul kuralını değil, listedeki tüm kuralları kontrol etmeli. → Task 9.
- **Mobilde nav drawer'ın açık kalması:** bir ders linkine tıklandığında
  drawer otomatik kapanmalı, yoksa dar ekranda içerik erişilemez olur. →
  Task 6.

---

## Dosya Yapısı (özet)

```
content/dersler/*.mdx            # 14 ders — frontmatter + MDX gövde
lib/types.ts                     # Ders, Alistirma tipleri
lib/dersler.ts                   # getAllDersler, getDersBySlug, getBolumBaslik
lib/exercise-validator.ts        # cevapEslesiyorMu
lib/progress.ts                  # localStorage ilerleme fonksiyonları
components/TerminalSimulator.tsx # egzersiz bileşeni (client)
components/LessonNav.tsx         # sol nav / drawer (client)
components/ModuleCard.tsx        # ana sayfa ders kartı
components/ThemeToggle.tsx       # açık/koyu mod anahtarı (client)
app/layout.tsx, app/globals.css  # kök layout + tema CSS değişkenleri
app/page.tsx                     # ana sayfa
app/dersler/[slug]/page.tsx       # ders sayfası
app/mdx-components.tsx           # MDX için özel bileşen eşlemesi
```

---

### Task 1: Proje İskeleti & Egzersiz Doğrulama Mantığı

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`,
  `tailwind.config.ts`, `postcss.config.js`, `vitest.config.ts`, `.gitignore`
- Create: `lib/exercise-validator.ts`
- Test: `lib/exercise-validator.test.ts`

**Interfaces:**
- Produces: `cevapEslesiyorMu(girdi: string, kabulKurallari: string[]): boolean`
  — `kabulKurallari` elemanları düz metin (trim + iç boşlukları tek boşluğa
  indirerek karşılaştırılır, büyük/küçük harf duyarlı) veya `re:` önekiyle
  regex (`re:^/compact$` → `new RegExp('^/compact$')`) olabilir.

- [ ] **Step 1: Next.js + TypeScript + Tailwind + Vitest iskeletini kur**

`npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --eslint` çalıştır (mevcut `docs/` klasörünü koru), ardından `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `gray-matter`, `next-mdx-remote` paketlerini dev/normal bağımlılık olarak ekle. `next.config.ts`'e `output: 'export'` ekle. `package.json` script'lerine `"test": "vitest run"` ekle.

- [ ] **Step 2: Doğrulama testini yaz**

```ts
import { describe, it, expect } from 'vitest';
import { cevapEslesiyorMu } from './exercise-validator';

describe('cevapEslesiyorMu', () => {
  it('tam metin eşleşmesini kabul eder', () => {
    expect(cevapEslesiyorMu('/compact', ['/compact'])).toBe(true);
  });
  it('baştaki/sondaki ve çift boşlukları normalize eder', () => {
    expect(cevapEslesiyorMu('  /compact   now ', ['/compact now'])).toBe(true);
  });
  it('regex kuralını (re: öneki) destekler', () => {
    expect(cevapEslesiyorMu('npm install -g @anthropic-ai/claude-code', ['re:^npm install -g @anthropic-ai/claude-code$'])).toBe(true);
  });
  it('listedeki herhangi bir kuralla eşleşirse true döner', () => {
    expect(cevapEslesiyorMu('/exit', ['/quit', '/exit'])).toBe(true);
  });
  it('eşleşmeyen girdi için false döner', () => {
    expect(cevapEslesiyorMu('/wrong', ['/compact'])).toBe(false);
  });
  it('boş girdi için false döner', () => {
    expect(cevapEslesiyorMu('', ['/compact'])).toBe(false);
  });
});
```

- [ ] **Step 3: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npm run test`
Expected: FAIL (`exercise-validator` modülü yok)

- [ ] **Step 4: `cevapEslesiyorMu`'yu `lib/exercise-validator.ts` içinde implemente et**

Boş/whitespace-only girdi her zaman `false`. Düz kurallar için her iki tarafı
`trim()` + `replace(/\s+/g, ' ')` ile normalize edip karşılaştır; `re:`
önekli kurallar için regex testi yap.

- [ ] **Step 5: Testi çalıştır, geçtiğini doğrula**

Run: `npm run test`
Expected: PASS (6/6)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: proje iskeleti ve egzersiz doğrulama mantığı"
```

---

### Task 2: Ders Veri Modeli, Yükleyici ve 14 Ders İskeleti

**Files:**
- Create: `lib/types.ts`
- Create: `content/dersler/01-kurulum-ilk-calistirma.mdx` … `14-worktree-ide-maliyet-sorun-giderme.mdx` (14 dosya, bkz. aşağıdaki tablo — her biri sadece frontmatter + `İçerik yakında.` gövdesiyle)
- Create: `lib/dersler.ts`
- Test: `lib/dersler.test.ts`

**Interfaces:**
- Consumes: yok (ilk veri katmanı)
- Produces:
  - `interface Alistirma { id: string; gorev: string; kabulKurallari: string[]; ipucu: string; basariliMesaj?: string }`
  - `type Bolum = 'temeller' | 'gunluk-kullanim' | 'ileri-duzey' | 'uzmanlik'`
  - `interface Ders { slug: string; baslik: string; bolum: Bolum; siraNo: number; ozet: string; icerik: string; alistirmalar: Alistirma[] }`
  - `getAllDersler(): Ders[]` (siraNo'ya göre sıralı)
  - `getDersBySlug(slug: string): Ders | undefined`
  - `getBolumBaslik(bolum: Bolum): string` → `'Temeller' | 'Günlük Kullanım' | 'İleri Düzey' | 'Uzmanlık'`

**14 ders dosyası (slug, bölüm, siraNo, başlık) — frontmatter'a bu değerleri yaz, `alistirmalar: []`:**

| # | slug | bölüm | başlık |
|---|------|-------|--------|
| 1 | kurulum-ilk-calistirma | temeller | Kurulum & İlk Çalıştırma |
| 2 | repl-ve-arayuz | temeller | REPL ve Arayüz |
| 3 | konusma-akisi | temeller | Konuşma Akışı |
| 4 | araclar-ve-izinler | gunluk-kullanim | Araçlar & İzin Modları |
| 5 | slash-komutlari | gunluk-kullanim | Slash Komutları |
| 6 | plan-modu | gunluk-kullanim | Plan Modu |
| 7 | context-ve-compaction | gunluk-kullanim | Context Yönetimi & Compaction |
| 8 | claude-md-ve-hafiza | ileri-duzey | CLAUDE.md ve Proje Hafızası |
| 9 | custom-komutlar-settings | ileri-duzey | Custom Slash Komutları & settings.json |
| 10 | subagentlar-ve-task | ileri-duzey | Subagent'lar & Task Aracı |
| 11 | hooklar | ileri-duzey | Hook'lar |
| 12 | mcp-sunuculari | ileri-duzey | MCP Sunucuları |
| 13 | headless-mod-scriptleme | uzmanlik | Headless Mod & Script'leme |
| 14 | worktree-ide-maliyet-sorun-giderme | uzmanlik | Worktree'ler, IDE, Maliyet & Sorun Giderme |

Frontmatter örneği (`01-kurulum-ilk-calistirma.mdx`):
```yaml
---
slug: kurulum-ilk-calistirma
baslik: "Kurulum & İlk Çalıştırma"
bolum: temeller
siraNo: 1
ozet: "Claude Code'u kurup ilk kez çalıştırma."
alistirmalar: []
---
İçerik yakında.
```

- [ ] **Step 1: `lib/types.ts`'i yukarıdaki tiplerle oluştur**

- [ ] **Step 2: 14 MDX dosyasını tablodaki değerlerle oluştur** (hepsi `alistirmalar: []`, gövde `İçerik yakında.`)

- [ ] **Step 3: Yükleyici testini yaz**

```ts
import { describe, it, expect } from 'vitest';
import { getAllDersler, getDersBySlug, getBolumBaslik } from './dersler';

describe('getAllDersler', () => {
  it('14 dersi siraNo artan sırada döner', () => {
    const dersler = getAllDersler();
    expect(dersler).toHaveLength(14);
    expect(dersler.map(d => d.siraNo)).toEqual([...Array(14)].map((_, i) => i + 1));
  });
});

describe('getDersBySlug', () => {
  it('var olan slug için doğru dersi döner', () => {
    expect(getDersBySlug('slash-komutlari')?.baslik).toBe('Slash Komutları');
  });
  it('olmayan slug için undefined döner', () => {
    expect(getDersBySlug('yok-boyle-bir-sey')).toBeUndefined();
  });
});

describe('getBolumBaslik', () => {
  it('her bölüm kodunu Türkçe başlığa çevirir', () => {
    expect(getBolumBaslik('gunluk-kullanim')).toBe('Günlük Kullanım');
  });
});
```

- [ ] **Step 4: Testi çalıştır, başarısız olduğunu doğrula** — Run: `npm run test` — Expected: FAIL

- [ ] **Step 5: `lib/dersler.ts`'i implemente et**

`content/dersler/*.mdx` dosyalarını `fs.readdirSync` ile oku, her birini
`gray-matter` ile ayrıştır (`data` → frontmatter alanları, `content` →
`icerik`), `Ders[]` döndür, `siraNo` ile sırala. `getBolumBaslik` için sabit
bir eşleme tablosu kullan.

- [ ] **Step 6: Testi çalıştır, geçtiğini doğrula** — Run: `npm run test` — Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: ders veri modeli, yükleyici ve 14 ders iskeleti"
```

---

### Task 3: İlerleme Takibi (localStorage)

**Files:**
- Create: `lib/progress.ts`
- Test: `lib/progress.test.ts` (ortam: jsdom, `localStorage` taklit edilebilir)

**Interfaces:**
- Consumes: `Ders` tipi (Task 2)
- Produces:
  - `alistirmaTamamlandiIsaretle(dersSlug: string, alistirmaId: string): void`
  - `alistirmaTamamlandiMi(dersSlug: string, alistirmaId: string): boolean`
  - `dersTamamlanmaOrani(dersSlug: string, toplamAlistirma: number): number` (0–1, `toplamAlistirma === 0` için `1`)
  - `genelIlerleme(tumDersler: Ders[]): number` (0–1, tüm derslerin ortalama tamamlanma oranı)

- [ ] **Step 1: Testleri yaz**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { alistirmaTamamlandiIsaretle, alistirmaTamamlandiMi, dersTamamlanmaOrani, genelIlerleme } from './progress';

beforeEach(() => localStorage.clear());

it('işaretlenmemiş egzersiz tamamlanmamış sayılır', () => {
  expect(alistirmaTamamlandiMi('slash-komutlari', 'a1')).toBe(false);
});

it('işaretlenen egzersiz tamamlanmış sayılır', () => {
  alistirmaTamamlandiIsaretle('slash-komutlari', 'a1');
  expect(alistirmaTamamlandiMi('slash-komutlari', 'a1')).toBe(true);
});

it('ders tamamlanma oranını doğru hesaplar', () => {
  alistirmaTamamlandiIsaretle('slash-komutlari', 'a1');
  expect(dersTamamlanmaOrani('slash-komutlari', 2)).toBeCloseTo(0.5);
});

it('egzersizi olmayan ders için oran 1 döner', () => {
  expect(dersTamamlanmaOrani('bos-ders', 0)).toBe(1);
});

it('window tanımsızken (SSR) patlamadan false/0 döner', () => {
  const original = globalThis.window;
  // @ts-expect-error - SSR koşulunu simüle ediyoruz
  delete globalThis.window;
  expect(alistirmaTamamlandiMi('slash-komutlari', 'a1')).toBe(false);
  globalThis.window = original;
});
```

- [ ] **Step 2: Çalıştır, başarısız olduğunu doğrula** — `npm run test` — FAIL

- [ ] **Step 3: `lib/progress.ts`'i implemente et**

`typeof window === 'undefined'` ise tüm okuma fonksiyonları güvenli
varsayılan (`false`/`0`) döner, yazma fonksiyonu no-op olur. Veri
`localStorage['cc-tui-ilerleme']` altında `{ [dersSlug]: string[] }` (tamamlanan
alistirmaId'leri) şeklinde JSON olarak saklanır.

- [ ] **Step 4: Çalıştır, geçtiğini doğrula** — `npm run test` — PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: localStorage tabanlı ilerleme takibi"
```

---

### Task 4: Tema Sistemi (Sıcak Kil) & Tema Anahtarı

**Files:**
- Modify: `app/globals.css` (CSS değişkenleri: açık/koyu `--bg`, `--fg`, `--accent`, `--card-bg`, `--card-border`)
- Modify: `tailwind.config.ts` (bu değişkenlere referans veren renk token'ları)
- Create: `components/ThemeToggle.tsx`
- Test: `components/ThemeToggle.test.tsx`

**Interfaces:**
- Produces: `<ThemeToggle />` — iç state, prop almaz; tıklandığında
  `document.documentElement.classList` üzerinde `dark` sınıfını açar/kapatır
  ve `localStorage['cc-tui-tema']`'ya `'acik' | 'koyu'` yazar. İlk yüklemede
  kayıtlı tema yoksa `window.matchMedia('(prefers-color-scheme: dark)')`
  sonucunu kullanır.

- [ ] **Step 1: Test yaz**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import ThemeToggle from './ThemeToggle';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

it('tıklandığında dark sınıfını ekler ve localStorage güncellenir', () => {
  render(<ThemeToggle />);
  fireEvent.click(screen.getByRole('button'));
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(localStorage.getItem('cc-tui-tema')).toBe('koyu');
});

it('ikinci tıklama açık moda geri döner', () => {
  render(<ThemeToggle />);
  const btn = screen.getByRole('button');
  fireEvent.click(btn);
  fireEvent.click(btn);
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  expect(localStorage.getItem('cc-tui-tema')).toBe('acik');
});
```

- [ ] **Step 2: Çalıştır, başarısız olduğunu doğrula** — FAIL

- [ ] **Step 3: `app/globals.css` ve `tailwind.config.ts`'i Sıcak Kil token'larıyla doldur**

Açık: `--bg:#fbf4e8; --fg:#3a332a; --accent:#d97757; --card-bg:#fff9ee; --card-border:#e9d9ba`.
Koyu (`.dark` altında): aynı ailenin koyu kahve/antrasit varyantı, `--accent`
aynı turuncu kalır (tam hex builder'ın kararı).

- [ ] **Step 4: `components/ThemeToggle.tsx`'i implemente et**

- [ ] **Step 5: Çalıştır, geçtiğini doğrula** — PASS

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: sıcak kil tema sistemi ve tema anahtarı"
```

---

### Task 5: TerminalSimulator Bileşeni

**Files:**
- Create: `components/TerminalSimulator.tsx`
- Test: `components/TerminalSimulator.test.tsx`

**Interfaces:**
- Consumes: `Alistirma` (Task 2), `cevapEslesiyorMu` (Task 1),
  `alistirmaTamamlandiIsaretle` (Task 3)
- Produces: `<TerminalSimulator dersSlug={string} alistirmalar={Alistirma[]} />`
  (client component)

- [ ] **Step 1: Test yaz**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import TerminalSimulator from './TerminalSimulator';

const alistirma = {
  id: 'a1',
  gorev: 'Context özetleyen komutu yaz',
  kabulKurallari: ['/compact'],
  ipucu: '/ ile başlayan bir komut dene',
};

beforeEach(() => localStorage.clear());

it('boş girdi ile kontrol edildiğinde ne başarı ne ipucu gösterir', () => {
  render(<TerminalSimulator dersSlug="test-ders" alistirmalar={[alistirma]} />);
  fireEvent.click(screen.getByRole('button', { name: /kontrol et/i }));
  expect(screen.queryByText(/doğru/i)).not.toBeInTheDocument();
  expect(screen.queryByText(alistirma.ipucu)).not.toBeInTheDocument();
});

it('yanlış girdide ipucunu gösterir', () => {
  render(<TerminalSimulator dersSlug="test-ders" alistirmalar={[alistirma]} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '/yanlis' } });
  fireEvent.click(screen.getByRole('button', { name: /kontrol et/i }));
  expect(screen.getByText(alistirma.ipucu)).toBeInTheDocument();
});

it('doğru girdide başarıyı gösterir ve ilerlemeyi işaretler', () => {
  render(<TerminalSimulator dersSlug="test-ders" alistirmalar={[alistirma]} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '/compact' } });
  fireEvent.click(screen.getByRole('button', { name: /kontrol et/i }));
  expect(screen.getByText(/doğru/i)).toBeInTheDocument();
  expect(localStorage.getItem('cc-tui-ilerleme')).toContain('a1');
});
```

- [ ] **Step 2: Çalıştır, başarısız olduğunu doğrula** — FAIL

- [ ] **Step 3: `components/TerminalSimulator.tsx`'i implemente et**

Her `alistirma` için: görev metni, `<input>` (textbox), "Kontrol Et" butonu.
Boş/whitespace-only girdide tıklama no-op. Doğruysa yeşil "✓ Doğru" +
`basariliMesaj` (varsa) göster ve `alistirmaTamamlandiIsaretle` çağır;
yanlışsa `ipucu`yu göster, tekrar denemeye izin ver.

- [ ] **Step 4: Çalıştır, geçtiğini doğrula** — PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: simüle terminal egzersiz bileşeni"
```

---

### Task 6: LessonNav Bileşeni (Sol Nav / Drawer)

**Files:**
- Create: `components/LessonNav.tsx`
- Test: `components/LessonNav.test.tsx`

**Interfaces:**
- Consumes: `Ders[]`, `getBolumBaslik` (Task 2)
- Produces: `<LessonNav dersler={Ders[]} aktifSlug={string} />` (client
  component)

- [ ] **Step 1: Test yaz**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LessonNav from './LessonNav';

const dersler = [
  { slug: 'a', baslik: 'A Dersi', bolum: 'temeller', siraNo: 1, ozet: '', icerik: '', alistirmalar: [] },
  { slug: 'b', baslik: 'B Dersi', bolum: 'temeller', siraNo: 2, ozet: '', icerik: '', alistirmalar: [] },
] as const;

it('bölüm başlığı ve tüm dersleri listeler', () => {
  render(<LessonNav dersler={[...dersler]} aktifSlug="a" />);
  expect(screen.getByText('Temeller')).toBeInTheDocument();
  expect(screen.getByText('A Dersi')).toBeInTheDocument();
  expect(screen.getByText('B Dersi')).toBeInTheDocument();
});

it('mobil drawer açıldıktan sonra bir derse tıklayınca kapanır', () => {
  render(<LessonNav dersler={[...dersler]} aktifSlug="a" />);
  fireEvent.click(screen.getByRole('button', { name: /menü/i }));
  expect(screen.getByTestId('lesson-nav-drawer')).toHaveClass('open');
  fireEvent.click(screen.getByText('B Dersi'));
  expect(screen.getByTestId('lesson-nav-drawer')).not.toHaveClass('open');
});
```

- [ ] **Step 2: Çalıştır, başarısız olduğunu doğrula** — FAIL

- [ ] **Step 3: `components/LessonNav.tsx`'i implemente et**

Dersleri `bolum`'a göre grupla (`getBolumBaslik` ile başlıklandır), `aktifSlug`
ile eşleşeni vurgula. `<768px` için "Menü" butonu drawer'ı açar
(`data-testid="lesson-nav-drawer"`, açıkken `open` sınıfı); bir ders linkine
tıklama drawer'ı kapatır.

- [ ] **Step 4: Çalıştır, geçtiğini doğrula** — PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: ders nav bileşeni ve mobil drawer"
```

---

### Task 7: Ana Sayfa (Hero + Modül Grid)

**Files:**
- Create: `components/ModuleCard.tsx`
- Modify: `app/page.tsx`
- Test: `components/ModuleCard.test.tsx`, `app/page.test.tsx`

**Interfaces:**
- Consumes: `getAllDersler`, `getBolumBaslik` (Task 2), `genelIlerleme`,
  `dersTamamlanmaOrani` (Task 3)
- Produces: `<ModuleCard ders={Ders} ilerlemeOrani={number} />`

- [ ] **Step 1: `ModuleCard` testini yaz**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ModuleCard from './ModuleCard';

const ders = { slug: 'a', baslik: 'A Dersi', bolum: 'temeller', siraNo: 1, ozet: 'Özet', icerik: '', alistirmalar: [] } as const;

it('ders başlığını, özetini ve ilerleme yüzdesini gösterir', () => {
  render(<ModuleCard ders={{ ...ders }} ilerlemeOrani={0.5} />);
  expect(screen.getByText('A Dersi')).toBeInTheDocument();
  expect(screen.getByText('Özet')).toBeInTheDocument();
  expect(screen.getByText('%50')).toBeInTheDocument();
});
```

- [ ] **Step 2: Çalıştır, başarısız olduğunu doğrula** — FAIL

- [ ] **Step 3: `ModuleCard.tsx`'i implemente et** (başlık, özet, `%<yüzde>` etiketi, ilerleme çubuğu)

- [ ] **Step 4: Çalıştır, geçtiğini doğrula** — PASS

- [ ] **Step 5: `app/page.test.tsx` yaz**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from './page';

it('4 bölüm başlığını ve 14 ders kartını gösterir', () => {
  render(<HomePage />);
  ['Temeller', 'Günlük Kullanım', 'İleri Düzey', 'Uzmanlık'].forEach(b =>
    expect(screen.getByText(b)).toBeInTheDocument()
  );
  expect(screen.getAllByTestId('module-card')).toHaveLength(14);
});
```

- [ ] **Step 6: Çalıştır, başarısız olduğunu doğrula** — FAIL

- [ ] **Step 7: `app/page.tsx`'i implemente et**

Hero başlığı/alt başlığı, genel ilerleme rozeti (`genelIlerleme` ile), 4
bölüm başlığı altında gruplanmış `ModuleCard` grid'i (`data-testid="module-card"`).

- [ ] **Step 8: Çalıştır, geçtiğini doğrula** — PASS

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: ana sayfa hero ve modül grid'i"
```

---

### Task 8: Ders Sayfası Route'u

**Files:**
- Create: `app/dersler/[slug]/page.tsx`
- Create: `app/mdx-components.tsx`
- Test: `app/dersler/[slug]/page.test.tsx`

**Interfaces:**
- Consumes: `getAllDersler`, `getDersBySlug` (Task 2), `<LessonNav>` (Task 6),
  `<TerminalSimulator>` (Task 5)
- Produces: `generateStaticParams(): { slug: string }[]` (14 eleman)

- [ ] **Step 1: Test yaz**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LessonPage, { generateStaticParams } from './page';

it('14 slug için static param üretir', async () => {
  const params = await generateStaticParams();
  expect(params).toHaveLength(14);
});

it('geçerli bir slug için nav ve içeriği render eder', async () => {
  const el = await LessonPage({ params: Promise.resolve({ slug: 'slash-komutlari' }) });
  render(el as React.ReactElement);
  expect(screen.getByText('Slash Komutları')).toBeInTheDocument();
});
```

- [ ] **Step 2: Çalıştır, başarısız olduğunu doğrula** — FAIL

- [ ] **Step 3: `app/mdx-components.tsx` ve `app/dersler/[slug]/page.tsx`'i implemente et**

`getDersBySlug(slug)` ile dersi al (yoksa `notFound()`), `<LessonNav
dersler={getAllDersler()} aktifSlug={slug} />` + `next-mdx-remote/rsc`
`<MDXRemote source={ders.icerik} components={mdxComponents} />` +
`<TerminalSimulator dersSlug={slug} alistirmalar={ders.alistirmalar} />` +
sayfa altında sürüm doğrulama notu render et.

- [ ] **Step 4: Çalıştır, geçtiğini doğrula** — PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: ders sayfası route'u ve MDX render"
```

---

### Task 9: Ders 1 — Tam İçerik ("Kurulum & İlk Çalıştırma")

**Files:**
- Modify: `content/dersler/01-kurulum-ilk-calistirma.mdx`
- Test: `app/dersler/[slug]/page.test.tsx` (genişlet)

**Interfaces:**
- Consumes: Task 1-8'deki tüm arayüzler (ilk uçtan uca gerçek içerik)

**İçerik noktaları (Ders 1'in kapsaması gerekenler):**
- Claude Code'un ne olduğu (sıfırdan, ön bilgi varsaymadan — spec'teki
  "Ders 1'in varsayımı" kararı).
- Kurulum: `npm install -g @anthropic-ai/claude-code`.
- İlk çalıştırma: bir proje klasöründe `claude` komutu, ilk girişte hesap
  bağlama (`/login`) akışı.
- REPL'e ilk mesajın yazılması ve `Enter` ile gönderilmesi.

**Egzersizler (`alistirmalar`, en az 2 — Review Focus "birden fazla doğru
biçim" burada test edilir):**
1. `gorev: "Claude Code'u global olarak kuran npm komutunu yaz"`,
   `kabulKurallari: ["npm install -g @anthropic-ai/claude-code", "npm i -g @anthropic-ai/claude-code"]`,
   `ipucu: "npm install -g <paket-adı> biçiminde bir komut"`.
2. `gorev: "Kurulduktan sonra Claude Code'u başlatan komutu yaz"`,
   `kabulKurallari: ["claude"]`, `ipucu: "Paketin kendi adını tek kelime olarak çalıştır"`.

- [ ] **Step 1: `app/dersler/[slug]/page.test.tsx`'e Ders 1'e özel test ekle**

```tsx
it('ders 1 iki egzersizi de içerir ve ikinci egzersiz npm i kısaltmasını da kabul eder', async () => {
  const el = await LessonPage({ params: Promise.resolve({ slug: 'kurulum-ilk-calistirma' }) });
  render(el as React.ReactElement);
  const inputs = screen.getAllByRole('textbox');
  fireEvent.change(inputs[0], { target: { value: 'npm i -g @anthropic-ai/claude-code' } });
  fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
  expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Çalıştır, başarısız olduğunu doğrula** — FAIL

- [ ] **Step 3: `01-kurulum-ilk-calistirma.mdx`'i yukarıdaki içerik noktaları ve 2 egzersizle doldur**

(Gövde: yukarıdaki içerik noktalarını Türkçe, akıcı anlatım + örnek
terminal çıktısı bloklarıyla yaz. Frontmatter'daki `alistirmalar` dizisini
yukarıdaki 2 egzersizle doldur.)

- [ ] **Step 4: Çalıştır, geçtiğini doğrula** — PASS

- [ ] **Step 5: `npm run build` ile statik export'un hata vermediğini doğrula**

Run: `npm run build`
Expected: başarılı build, 14 ders rotası + ana sayfa statik olarak üretilir.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: ders 1 tam içerik — kurulum ve ilk çalıştırma"
```

---

## ⏸ CHECKPOINT — Faz 1 Sonu

Burada dur. Kullanıcıya `npm run dev` ile siteyi göster (ana sayfa + Ders 1,
tema, mobil görünüm dahil). **Faz 2'ye (Task 11+) ancak kullanıcı görsel
tasarımı ve akışı onayladıktan sonra geçilir** — spec'in "Yapım Sırası"
kararı. Onay gelmeden Task 11+ başlatılmaz.

---

### Task 10: Kalan Dersler İçin İçerik Üretim Kalıbı

Bu task kod üretmez; Task 11-23'ün hepsi aşağıdaki adımları kendi
dosyasına ve kendi içerik noktalarına uygulayarak tekrarlar (Task 9 ile
birebir aynı kalıp):

1. İlgili `content/dersler/<NN-slug>.mdx` dosyasını, o task'ta verilen
   içerik noktalarını kapsayan Türkçe anlatım + örnek terminal çıktısı
   bloklarıyla doldur.
2. Frontmatter'daki `alistirmalar` dizisini o task'ta verilen egzersiz(ler)le
   doldur (her biri `id`, `gorev`, `kabulKurallari`, `ipucu` içerir).
3. `app/dersler/[slug]/page.test.tsx`'e o dersin en az bir egzersizini
   doğrulayan bir test ekle (Task 9'daki test şablonunun aynısı, slug ve
   beklenen girdi/çıktı değiştirilerek).
4. Testi çalıştır → FAIL → içerik+egzersizi tamamla → testi çalıştır → PASS.
5. `git commit -m "feat: ders <NN> tam içerik — <başlık>"`.

Her lesson task'ının kendi egzersiz `kabulKurallari` değerleri, gerçek
Claude Code CLI davranışını yansıtacak şekilde aşağıda verilmiştir; task'ı
üstlenen kişi bu değerleri birebir kullanır, icerik metnini kendi yazar.

---

### Task 11: Ders 2 — REPL ve Arayüz

**Files:** Modify: `content/dersler/02-repl-ve-arayuz.mdx`

**İçerik noktaları:** TUI'nin ekran yapısı (girdi kutusu, mesaj geçmişi,
durum çubuğu); temel klavye kısayolları: `Ctrl+C` (iptal/çıkış), `Ctrl+R`
(geçmişte ara), `Shift+Tab` (izin modu döngüsü: normal → otomatik-kabul →
plan), çoklu satır girdi için `\` veya `Option/Alt+Enter`.

**Egzersiz:** `gorev: "Oturumu/komutu iptal etmek için kullanılan kısayolu yaz"`,
`kabulKurallari: ["Ctrl+C", "Ctrl-C", "^C"]`, `ipucu: "Terminal programlarında evrensel 'kes' kısayolu"`.

---

### Task 12: Ders 3 — Konuşma Akışı

**Files:** Modify: `content/dersler/03-konusma-akisi.mdx`

**İçerik noktaları:** Mesaj gönderme ve yanıt bekleme döngüsü; oturum
(session) kavramı — bir `claude` çalıştırması boyunca geçmişin korunması;
`/resume` ile önceki bir oturuma geri dönme; `/clear` ile geçmişi sıfırlama.

**Egzersiz:** `gorev: "Konuşma geçmişini tamamen temizleyen komutu yaz"`,
`kabulKurallari: ["/clear"]`, `ipucu: "/ ile başlar, 'temizle' anlamına gelen İngilizce kelime"`.

---

### Task 13: Ders 4 — Araçlar & İzin Modları

**Files:** Modify: `content/dersler/04-araclar-ve-izinler.mdx`

**İçerik noktaları:** Claude Code'un kullandığı temel araçlar (dosya okuma,
düzenleme, yeni dosya yazma, shell komutu çalıştırma); izin modları:
`default` (her değişiklik için onay ister), `acceptEdits` (düzenlemeleri
otomatik kabul eder), `plan` (hiçbir değişiklik yapmadan sadece plan sunar),
`bypassPermissions` (hiçbir onay istemez — dikkatli kullanılmalı); mod
değişimi `Shift+Tab` veya `/permissions` ile.

**Egzersiz:** `gorev: "İzin modunu değiştirmek için kullanılan slash komutunu yaz"`,
`kabulKurallari: ["/permissions"]`, `ipucu: "/permissions"`.

---

### Task 14: Ders 5 — Slash Komutları

**Files:** Modify: `content/dersler/05-slash-komutlari.mdx`

**İçerik noktaları:** `/help` (komut listesi), `/model` (model değiştirme),
`/cost` (token/maliyet özeti), `/status` (oturum bilgisi), `/doctor`
(kurulum teşhisi), `/init` (proje için CLAUDE.md oluşturma).

**Egzersiz:** `gorev: "O oturumda harcanan token/maliyeti gösteren komutu yaz"`,
`kabulKurallari: ["/cost"]`, `ipucu: "İngilizce 'maliyet' kelimesi"`.

---

### Task 15: Ders 6 — Plan Modu

**Files:** Modify: `content/dersler/06-plan-modu.mdx`

**İçerik noktaları:** Plan modunun amacı (değişiklik yapmadan önce onay
almak); plan moduna girme (`Shift+Tab` döngüsü veya `/permissions` üzerinden
`plan` seçimi); planın sunulup kullanıcı onayı beklenmesi; ne zaman
kullanılması gerektiği (riskli/büyük değişikliklerden önce).

**Egzersiz:** `gorev: "İzin modunu doğrudan 'plan' olarak ayarlamak için kullanılan komutu yaz"`,
`kabulKurallari: ["/permissions"]`, `ipucu: "Ders 4'teki izin komutunu hatırla"`.

---

### Task 16: Ders 7 — Context Yönetimi & Compaction

**Files:** Modify: `content/dersler/07-context-ve-compaction.mdx`

**İçerik noktaları:** Context penceresi kavramı; conversation büyüdükçe
otomatik özetleme (auto-compact); manuel `/compact` ile context'i
özetletme; `/clear` ile `/compact` arasındaki fark (biri özetler, biri
tamamen siler).

**Egzersiz:** `gorev: "Context'i silmeden özetleyen komutu yaz"`,
`kabulKurallari: ["/compact"]`, `ipucu: "Sıkıştırmak/özetlemek anlamına gelen İngilizce kelime"`.

---

### Task 17: Ders 8 — CLAUDE.md ve Proje Hafızası

**Files:** Modify: `content/dersler/08-claude-md-ve-hafiza.mdx`

**İçerik noktaları:** Proje kök dizinindeki `CLAUDE.md` dosyasının her
oturumda otomatik okunması; kullanıcı seviyesinde `~/.claude/CLAUDE.md`;
`/init` ile otomatik `CLAUDE.md` taslağı oluşturma; `/memory` ile düzenleme.

**Egzersiz:** `gorev: "Mevcut projeye otomatik bir CLAUDE.md taslağı oluşturan komutu yaz"`,
`kabulKurallari: ["/init"]`, `ipucu: "Başlatmak anlamına gelen İngilizce kelime"`.

---

### Task 18: Ders 9 — Custom Slash Komutları & settings.json

**Files:** Modify: `content/dersler/09-custom-komutlar-settings.mdx`

**İçerik noktaları:** `.claude/commands/` altına eklenen Markdown
dosyalarının özel slash komutuna dönüşmesi; proje/kullanıcı seviyesinde
`settings.json` ile izin kuralları, ortam değişkenleri, hook ayarlarının
yapılandırılması.

**Egzersiz:** `gorev: "Özel slash komutlarının tanımlandığı klasörün yolunu yaz"`,
`kabulKurallari: [".claude/commands", ".claude/commands/"]`, `ipucu: "Gizli bir klasör (. ile başlar) içinde 'commands' adlı alt klasör"`.

---

### Task 19: Ders 10 — Subagent'lar & Task Aracı

**Files:** Modify: `content/dersler/10-subagentlar-ve-task.mdx`

**İçerik noktaları:** Task aracının bağımsız bir alt-agent başlatması;
`.claude/agents/` altında özel agent tanımları; neden kullanılır
(bağlamı kirletmeden araştırma/arama yaptırmak).

**Egzersiz:** `gorev: "Özel subagent tanımlarının bulunduğu klasörün yolunu yaz"`,
`kabulKurallari: [".claude/agents", ".claude/agents/"]`, `ipucu: "Ders 9'daki commands klasörüne paralel bir klasör"`.

---

### Task 20: Ders 11 — Hook'lar

**Files:** Modify: `content/dersler/11-hooklar.mdx`

**İçerik noktaları:** Hook'ların yaşam döngüsü olayları (`PreToolUse`,
`PostToolUse`, `Notification`, `Stop` vb.); `settings.json` içinde
tanımlanması; bir araç çalışmadan önce/sonra otomatik komut çalıştırma
örneği (örn. formatlayıcı çalıştırma).

**Egzersiz:** `gorev: "Bir aracın ÇALIŞTIRILMASINDAN ÖNCE tetiklenen hook olayının adını yaz"`,
`kabulKurallari: ["PreToolUse"]`, `ipucu: "'Pre' = önce, 'ToolUse' = araç kullanımı"`.

---

### Task 21: Ders 12 — MCP Sunucuları

**Files:** Modify: `content/dersler/12-mcp-sunuculari.mdx`

**İçerik noktaları:** MCP (Model Context Protocol) sunucularının dış
araç/veri kaynaklarını Claude Code'a bağlaması; `claude mcp add` ile sunucu
ekleme; `/mcp` ile bağlı sunucuları görüntüleme.

**Egzersiz:** `gorev: "Bağlı MCP sunucularını listeleyen slash komutunu yaz"`,
`kabulKurallari: ["/mcp"]`, `ipucu: "Protokolün kısaltmasıyla aynı"`.

---

### Task 22: Ders 13 — Headless Mod & Script'leme

**Files:** Modify: `content/dersler/13-headless-mod-scriptleme.mdx`

**İçerik noktaları:** `claude -p "<prompt>"` ile etkileşimsiz/tek seferlik
çalıştırma; `--output-format json` / `stream-json` ile makine-okunur çıktı;
CI/CD boru hattında kullanım örneği.

**Egzersiz:** `gorev: "Claude Code'u etkileşimli olmayan (tek seferlik) modda çalıştıran bayrağı yaz"`,
`kabulKurallari: ["-p", "--print"]`, `ipucu: "Tek harfli bir bayrak, 'print' kelimesinin kısaltması"`.

---

### Task 23: Ders 14 — Worktree'ler, IDE, Maliyet & Sorun Giderme

**Files:** Modify: `content/dersler/14-worktree-ide-maliyet-sorun-giderme.mdx`

**İçerik noktaları:** Git worktree'lerle paralel/izole çalışma; VS
Code/JetBrains IDE entegrasyonu; `/cost` ile maliyet takibi (Ders 5'e
referansla derinleştir); `/doctor` ile kurulum sorunlarını teşhis etme.

**Egzersiz:** `gorev: "Kurulum/yapılandırma sorunlarını teşhis eden komutu yaz"`,
`kabulKurallari: ["/doctor"]`, `ipucu: "İngilizce 'doktor' kelimesi"`.

---

### Task 24: Repo Tamamlama — README, LICENSE, Son Kontrol

**Files:**
- Create: `README.md`, `LICENSE` (MIT)
- Modify: `.gitignore` (gerekirse `.superpowers/` eklenmemişse ekle)

**Interfaces:** yok (dokümantasyon + son doğrulama)

- [ ] **Step 1: `LICENSE`'ı MIT metniyle oluştur** (telif hakkı sahibi: kullanıcı)

- [ ] **Step 2: `README.md`'yi yaz**

İçerik: proje açıklaması (Türkçe), `npm install` + `npm run dev` ile yerel
çalıştırma, `npm run build` ile statik export, "komutlar zamanla
değişebilir, PR açarak güncelleyin" uyarısı, lisans notu.

- [ ] **Step 3: Tüm test paketini çalıştır**

Run: `npm run test`
Expected: tüm testler PASS

- [ ] **Step 4: Statik export'u doğrula**

Run: `npm run build`
Expected: 14 ders rotası + ana sayfa hatasız üretilir, `out/` klasörü oluşur

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: README, LICENSE ve repo son hali"
```

---

## Self-Review Notları

- **Spec kapsaması:** Tasarım dokümanındaki her bölüm (teknoloji, görsel
  tasarım, bilgi mimarisi, egzersiz mekaniği, 14 ders listesi, yapım sırası,
  builder'a bırakılanlar) yukarıdaki task'larda karşılığını buluyor;
  içerik/egzersiz ayrıntıları Task 9 ve 11-23'te somutlaştırıldı.
- **Oran:** Lesson içerik task'larının (11-23) tam Türkçe metni plana
  yazılmadı — sadece içerik noktaları ve egzersiz kabul kuralları; nesir
  metni implementer'ın işi.
- **Review Focus eşlemesi:** 5 maddenin hepsi ilgili task'a test olarak
  bağlandı (Task 1, 3, 5, 6, 9).
