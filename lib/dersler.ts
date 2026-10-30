import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { Bolum, Ders } from './types';

const DERSLER_DIZINI = path.join(process.cwd(), 'content', 'dersler');

const BOLUM_BASLIKLARI: Record<Bolum, string> = {
  temeller: 'Temeller',
  'gunluk-kullanim': 'Günlük Kullanım',
  'ileri-duzey': 'İleri Düzey',
  uzmanlik: 'Uzmanlık',
};

function dersDosyalariniOku(): Ders[] {
  const dosyaAdlari = fs
    .readdirSync(DERSLER_DIZINI)
    .filter((dosyaAdi) => dosyaAdi.endsWith('.mdx'));

  return dosyaAdlari.map((dosyaAdi) => {
    const tamYol = path.join(DERSLER_DIZINI, dosyaAdi);
    const dosyaIcerigi = fs.readFileSync(tamYol, 'utf8');
    const { data, content } = matter(dosyaIcerigi);

    return {
      slug: data.slug,
      baslik: data.baslik,
      bolum: data.bolum,
      siraNo: data.siraNo,
      ozet: data.ozet,
      icerik: content.trim(),
      alistirmalar: data.alistirmalar ?? [],
    } satisfies Ders;
  });
}

let onbellek: Ders[] | null = null;

function tumDersDosyalariniYukle(): Ders[] {
  if (onbellek === null) {
    onbellek = dersDosyalariniOku().sort((a, b) => a.siraNo - b.siraNo);
  }
  return onbellek;
}

export function getAllDersler(): Ders[] {
  return tumDersDosyalariniYukle();
}

export function getDersBySlug(slug: string): Ders | undefined {
  return tumDersDosyalariniYukle().find((ders) => ders.slug === slug);
}

export function getBolumBaslik(bolum: Bolum): string {
  return BOLUM_BASLIKLARI[bolum];
}
