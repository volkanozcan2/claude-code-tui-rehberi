/**
 * Egzersiz cevap doğrulama mantığı.
 *
 * `kabulKurallari` dizisindeki her eleman iki biçimden biri olabilir:
 * - Düz metin: karşılaştırma öncesi her iki taraf da `trim()` edilir ve iç
 *   boşluklar tek boşluğa indirilir (büyük/küçük harf duyarlı eşleşme).
 * - `re:` önekli regex: önek çıkarılıp kalan metin `new RegExp(...)` ile
 *   derlenir ve girdiye karşı test edilir.
 *
 * Girdi, kurallardan herhangi biriyle eşleşirse `true` döner.
 */

const REGEX_PREFIX = 're:';

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function cevapEslesiyorMu(girdi: string, kabulKurallari: string[]): boolean {
  if (girdi.trim() === '') {
    return false;
  }

  const normalizedGirdi = normalize(girdi);

  return kabulKurallari.some((kural) => {
    if (kural.startsWith(REGEX_PREFIX)) {
      const pattern = kural.slice(REGEX_PREFIX.length);
      return new RegExp(pattern).test(girdi);
    }
    return normalizedGirdi === normalize(kural);
  });
}
