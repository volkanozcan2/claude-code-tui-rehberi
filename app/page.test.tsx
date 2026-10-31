import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import HomePage from './page';
import { dersTamamlanmaOrani, genelIlerleme } from '@/lib/progress';

// `lib/progress`'i mock'luyoruz: gerçek değer %50 dönsün. Bileşenler artık
// başlangıç state'ini SABİT %0 ile kurup gerçek değeri SADECE mount
// sonrası bir `useEffect` içinde okuyor (bkz. components/HomeProgress.tsx
// tepesindeki yorum) — bu yüzden mock'ın "ilk çağrı farklı, sonraki çağrı
// farklı" taklit etmesine gerek yok: fonksiyon zaten yalnızca effect
// içinde, mount sonrası bir defa çağrılıyor.
vi.mock('@/lib/progress', () => ({
  dersTamamlanmaOrani: vi.fn(),
  genelIlerleme: vi.fn(),
  alistirmaTamamlandiMi: vi.fn(() => false),
  alistirmaTamamlandiIsaretle: vi.fn(),
}));

describe('HomePage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(dersTamamlanmaOrani).mockReset().mockImplementation(
      (_slug: string, toplamAlistirma: number) => (toplamAlistirma === 0 ? 1 : 0.5)
    );
    vi.mocked(genelIlerleme).mockReset().mockReturnValue(0.5);
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
