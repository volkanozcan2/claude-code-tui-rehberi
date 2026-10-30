/**
 * Ders içerik veri modeli.
 *
 * Bu tipler `content/dersler/*.mdx` dosyalarının frontmatter şeklini ve
 * `lib/dersler.ts` yükleyicisinin döndürdüğü biçimi tanımlar.
 */

export interface Alistirma {
  id: string;
  gorev: string;
  kabulKurallari: string[];
  ipucu: string;
  basariliMesaj?: string;
}

export type Bolum = 'temeller' | 'gunluk-kullanim' | 'ileri-duzey' | 'uzmanlik';

export interface Ders {
  slug: string;
  baslik: string;
  bolum: Bolum;
  siraNo: number;
  ozet: string;
  icerik: string;
  alistirmalar: Alistirma[];
}
