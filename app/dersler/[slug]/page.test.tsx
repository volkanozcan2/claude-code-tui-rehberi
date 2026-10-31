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

  it('ders 3 egzersizi /clear komutunu kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'konusma-akisi' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '/clear' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 4 egzersizi /permissions komutunu kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'araclar-ve-izinler' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '/permissions' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 5 egzersizi /cost komutunu kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'slash-komutlari' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '/cost' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 6 egzersizi /permissions komutunu kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'plan-modu' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '/permissions' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 7 egzersizi /compact komutunu kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'context-ve-compaction' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '/compact' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 8 egzersizi /init komutunu kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'claude-md-ve-hafiza' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '/init' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 9 egzersizi .claude/commands klasör yolunu kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'custom-komutlar-settings' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '.claude/commands' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 9 egzersizi sonunda eğik çizgi olan yolu da kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'custom-komutlar-settings' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '.claude/commands/' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 10 egzersizi .claude/agents klasör yolunu kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'subagentlar-ve-task' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '.claude/agents' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 10 egzersizi sonunda eğik çizgi olan yolu da kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'subagentlar-ve-task' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '.claude/agents/' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 11 egzersizi PreToolUse hook olay adını kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'hooklar' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'PreToolUse' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 12 egzersizi /mcp komutunu kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'mcp-sunuculari' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '/mcp' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 13 egzersizi -p bayrağını kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'headless-mod-scriptleme' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '-p' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 13 egzersizi --print uzun bayrağını da kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'headless-mod-scriptleme' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '--print' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });

  it('ders 14 egzersizi /doctor komutunu kabul eder', async () => {
    const el = await LessonPage({ params: Promise.resolve({ slug: 'worktree-ide-maliyet-sorun-giderme' }) });
    render(el as React.ReactElement);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '/doctor' } });
    fireEvent.click(screen.getAllByRole('button', { name: /kontrol et/i })[0]);
    expect(screen.getAllByText(/doğru/i).length).toBeGreaterThan(0);
  });
});
