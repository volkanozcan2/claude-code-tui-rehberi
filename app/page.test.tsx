import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import HomePage from './page';
import { dersTamamlanmaOrani } from '@/lib/progress';

// `lib/progress`'in SSR/build-time davranışını taklit ediyoruz: bir ders
// slug'ı için ilk çağrı "build-time" değerini (0) döner, aynı slug için
// sonraki her çağrı ise "mount sonrası, tarayıcıda gerçek localStorage
// okunmuş" değerini (0.5) döner. Bu, app/page.tsx'in statik export altında
// SADECE BİR KEZ (derleme anında) hesaplayıp sonsuza dek %0'da donması
// yerine, mount olduktan sonra GERÇEKTEN TEKRAR hesaplayıp güncellediğini
// kanıtlar — localStorage'ı doğrudan seed etmek bunu kanıtlamaz, çünkü
// jsdom test ortamında `window` zaten her zaman tanımlıdır ve eski
// (hatalı) kod da bu durumda yanlışlıkla doğru sonucu üretebilir.
vi.mock('@/lib/progress', () => ({
  dersTamamlanmaOrani: vi.fn(),
  genelIlerleme: vi.fn(() => 0),
  alistirmaTamamlandiMi: vi.fn(() => false),
  alistirmaTamamlandiIsaretle: vi.fn(),
}));

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear();
    // Her test için "görülen slug" takibini sıfırla, böylece testler
    // arasında mock durumu sızmaz (ilk çağrı %0, aynı slug için sonraki
    // her çağrı %50 döner).
    const gorulenSluglar = new Set<string>();
    vi.mocked(dersTamamlanmaOrani).mockReset().mockImplementation(
      (slug: string, toplamAlistirma: number) => {
        if (toplamAlistirma === 0) return 1;
        if (!gorulenSluglar.has(slug)) {
          gorulenSluglar.add(slug);
          return 0;
        }
        return 0.5;
      }
    );
  });

  it('4 bölüm başlığını ve 14 ders kartını gösterir', () => {
    render(<HomePage />);
    ['Temeller', 'Günlük Kullanım', 'İleri Düzey', 'Uzmanlık'].forEach((b) =>
      expect(screen.getByText(b)).toBeInTheDocument()
    );
    expect(screen.getAllByTestId('module-card')).toHaveLength(14);
  });

  it('mount sonrası ilerleme yeniden hesaplanır ve %0 ile kalıcı kalmaz', async () => {
    render(<HomePage />);

    // Build-time/SSR varsayılanı %0'dır; mount sonrası client-side effect
    // gerçek değeri yeniden hesaplayıp göstermelidir (%0 yerine %50).
    await waitFor(() => {
      expect(screen.getAllByText('%50').length).toBeGreaterThan(0);
    });
  });
});
