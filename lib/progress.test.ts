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
