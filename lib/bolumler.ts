import type { Bolum } from './types';

/**
 * Bölüm başlıkları — Node `fs`/`path` bağımlılığı olmadan, hem sunucu hem
 * istemci bileşenlerinden (örn. `LessonNav`) güvenle içe aktarılabilir.
 */
const BOLUM_BASLIKLARI: Record<Bolum, string> = {
  temeller: 'Temeller',
  'gunluk-kullanim': 'Günlük Kullanım',
  'ileri-duzey': 'İleri Düzey',
  uzmanlik: 'Uzmanlık',
};

export function getBolumBaslik(bolum: Bolum): string {
  return BOLUM_BASLIKLARI[bolum];
}
