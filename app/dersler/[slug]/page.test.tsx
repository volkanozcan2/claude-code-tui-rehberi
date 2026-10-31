import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LessonPage, { generateStaticParams } from './page';

describe('generateStaticParams', () => {
  it('14 slug için static param üretir', async () => {
    const params = await generateStaticParams();
    expect(params).toHaveLength(14);
  });
});

describe('LessonPage', () => {
  it('geçerli bir slug için nav ve içeriği render eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'slash-komutlari' }) });
    render(el as React.ReactElement);
    expect(screen.getByText('Slash Komutları')).toBeInTheDocument();
  });

  it('olmayan bir slug için notFound() tetikler', async () => {
    await expect(
      LessonPage({ params: Promise.resolve({ slug: 'yok-boyle-bir-sey' }) })
    ).rejects.toThrow();
  });
});
