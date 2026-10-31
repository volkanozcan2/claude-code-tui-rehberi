import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ModuleCard from './ModuleCard';

const ders = { slug: 'a', baslik: 'A Dersi', bolum: 'temeller', siraNo: 1, ozet: 'Özet', icerik: '', alistirmalar: [] } as const;

describe('ModuleCard', () => {
  it('ders başlığını, özetini ve ilerleme yüzdesini gösterir', () => {
    render(<ModuleCard ders={{ ...ders }} ilerlemeOrani={0.5} />);
    expect(screen.getByText('A Dersi')).toBeInTheDocument();
    expect(screen.getByText('Özet')).toBeInTheDocument();
    expect(screen.getByText('%50')).toBeInTheDocument();
  });
});
