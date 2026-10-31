import { render, screen, fireEvent } from '@testing-library/react';
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
    // Başlık hem sayfa <h1>'inde hem de LessonNav'daki aktif bağlantıda
    // göründüğü için (kasıtlı — her sayfanın tam olarak bir h1'i olmalı),
    // sorguyu başlık rolüyle sınırlıyoruz.
    expect(
      screen.getByRole('heading', { level: 1, name: 'Slash Komutları' })
    ).toBeInTheDocument();
  });

  it('olmayan bir slug için notFound() tetikler', async () => {
    await expect(
      LessonPage({ params: Promise.resolve({ slug: 'yok-boyle-bir-sey' }) })
    ).rejects.toThrow();
  });

  it('ders 1 iki egzersizi de içerir ve ikinci egzersiz npm i kısaltmasını da kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'kurulum-ilk-calistirma' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'npm i -g @anthropic-ai/claude-code' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 2 egzersizi iptal kısayolu için ^C varyantını da kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'repl-ve-arayuz' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '^C' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });
});
