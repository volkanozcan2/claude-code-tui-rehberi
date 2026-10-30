/**
 * localStorage tabanlı ilerleme takibi.
 *
 * SSR/statik dışa aktarım sırasında `window`/`localStorage` mevcut değildir.
 * Bu modüldeki tüm fonksiyonlar bu ortamda güvenli varsayılan değerler
 * döner (okuma fonksiyonları için `false`/`0`, yazma fonksiyonu için no-op)
 * ve asla hata fırlatmaz.
 *
 * Veri `localStorage['cc-tui-ilerleme']` altında şu şekilde saklanır:
 *   { [dersSlug: string]: string[] }  // tamamlanan alistirmaId'leri
 */

import type { Ders } from './types';

const DEPO_ANAHTARI = 'cc-tui-ilerleme';

type IlerlemeDeposu = Record<string, string[]>;

function depoyuOku(): IlerlemeDeposu {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const ham = window.localStorage.getItem(DEPO_ANAHTARI);
    if (!ham) {
      return {};
    }
    const ayristirilmis = JSON.parse(ham);
    if (ayristirilmis && typeof ayristirilmis === 'object') {
      return ayristirilmis as IlerlemeDeposu;
    }
    return {};
  } catch {
    return {};
  }
}

function depoyuYaz(depo: IlerlemeDeposu): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(DEPO_ANAHTARI, JSON.stringify(depo));
  } catch {
    // localStorage kullanılamıyorsa (örn. gizli mod kotası) sessizce yok say.
  }
}

/**
 * Bir egzersizi tamamlandı olarak işaretler. SSR'da no-op.
 */
export function alistirmaTamamlandiIsaretle(dersSlug: string, alistirmaId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const depo = depoyuOku();
  const tamamlananlar = depo[dersSlug] ?? [];

  if (!tamamlananlar.includes(alistirmaId)) {
    depo[dersSlug] = [...tamamlananlar, alistirmaId];
    depoyuYaz(depo);
  }
}

/**
 * Bir egzersizin tamamlanıp tamamlanmadığını döner. SSR'da `false`.
 */
export function alistirmaTamamlandiMi(dersSlug: string, alistirmaId: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const depo = depoyuOku();
  return (depo[dersSlug] ?? []).includes(alistirmaId);
}

/**
 * Bir dersin tamamlanma oranını (0-1) döner.
 * `toplamAlistirma === 0` ise `1` döner (egzersizi olmayan ders tamamlanmış sayılır).
 * SSR'da `0` döner.
 */
export function dersTamamlanmaOrani(dersSlug: string, toplamAlistirma: number): number {
  if (toplamAlistirma === 0) {
    return 1;
  }

  if (typeof window === 'undefined') {
    return 0;
  }

  const depo = depoyuOku();
  const tamamlananSayisi = (depo[dersSlug] ?? []).length;
  return tamamlananSayisi / toplamAlistirma;
}

/**
 * Tüm derslerin ortalama tamamlanma oranını (0-1) döner.
 * Ders listesi boşsa `1` döner. SSR'da `0` döner.
 */
export function genelIlerleme(tumDersler: Ders[]): number {
  if (tumDersler.length === 0) {
    return 1;
  }

  if (typeof window === 'undefined') {
    return 0;
  }

  const toplamOran = tumDersler.reduce(
    (toplam, ders) => toplam + dersTamamlanmaOrani(ders.slug, ders.alistirmalar.length),
    0,
  );
  return toplamOran / tumDersler.length;
}
