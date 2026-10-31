import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from './page';

describe('HomePage', () => {
  it('4 bölüm başlığını ve 14 ders kartını gösterir', () => {
    render(<HomePage />);
    ['Temeller', 'Günlük Kullanım', 'İleri Düzey', 'Uzmanlık'].forEach((b) =>
      expect(screen.getByText(b)).toBeInTheDocument()
    );
    expect(screen.getAllByTestId('module-card')).toHaveLength(14);
  });
});
