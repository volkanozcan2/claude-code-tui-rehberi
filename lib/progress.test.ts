import { it, expect, beforeEach } from 'vitest';
import { alistirmaTamamlandiIsaretle, alistirmaTamamlandiMi, dersTamamlanmaOrani, genelIlerleme } from './progress';
import type { Ders } from './types';

beforeEach(() => localStorage.clear());

function ornekDers(slug: string, alistirmaSayisi: number): Ders {
  return {
    slug,
    baslik: slug,
    bolum: 'temeller',
    siraNo: 1,
    ozet: '',
    icerik: '',
    alistirmalar: Array.from({ length: alistirmaSayisi }, (_, i) => ({
      id: `a${i + 1}`,
      gorev: '',
      kabulKurallari: [],
      ipucu: '',
    })),
  };
}

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

it('genel ilerleme, derslerin ortalama tamamlanma oranını doğru hesaplar', () => {
  const dersler: Ders[] = [ornekDers('ders-1', 2), ornekDers('ders-2', 2)];

  // ders-1: 2 egzersizden 1'i tamamlandı -> 0.5
  alistirmaTamamlandiIsaretle('ders-1', 'a1');
  // ders-2: hiçbiri tamamlanmadı -> 0

  expect(genelIlerleme(dersler)).toBeCloseTo(0.25);
});
