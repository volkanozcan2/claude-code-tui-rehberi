import { render, screen, fireEvent } from '@testing-library/react';
import { it, expect, beforeEach } from 'vitest';
import TerminalSimulator from './TerminalSimulator';

const alistirma = {
  id: 'a1',
  gorev: 'Context özetleyen komutu yaz',
  kabulKurallari: ['/compact'],
  ipucu: '/ ile başlayan bir komut dene',
};

beforeEach(() => localStorage.clear());

it('boş girdi ile kontrol edildiğinde ne başarı ne ipucu gösterir', () => {
  render(<TerminalSimulator dersSlug="test-ders" alistirmalar={[alistirma]} />);
  fireEvent.click(screen.getByRole('button', { name: /kontrol et/i }));
  expect(screen.queryByText(/doğru/i)).not.toBeInTheDocument();
  expect(screen.queryByText(alistirma.ipucu)).not.toBeInTheDocument();
});

it('yanlış girdide ipucunu gösterir', () => {
  render(<TerminalSimulator dersSlug="test-ders" alistirmalar={[alistirma]} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '/yanlis' } });
  fireEvent.click(screen.getByRole('button', { name: /kontrol et/i }));
  expect(screen.getByText(alistirma.ipucu)).toBeInTheDocument();
});

it('doğru girdide başarıyı gösterir ve ilerlemeyi işaretler', () => {
  render(<TerminalSimulator dersSlug="test-ders" alistirmalar={[alistirma]} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '/compact' } });
  fireEvent.click(screen.getByRole('button', { name: /kontrol et/i }));
  expect(screen.getByText(/doğru/i)).toBeInTheDocument();
  expect(localStorage.getItem('cc-tui-ilerleme')).toContain('a1');
});
