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
