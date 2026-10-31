import { render, screen, fireEvent } from '@testing-library/react';
import { it, expect } from 'vitest';
import LessonNav from './LessonNav';
import type { Ders } from '@/lib/types';

const dersler: Ders[] = [
  { slug: 'a', baslik: 'A Dersi', bolum: 'temeller', siraNo: 1, ozet: '', icerik: '', alistirmalar: [] },
  { slug: 'b', baslik: 'B Dersi', bolum: 'temeller', siraNo: 2, ozet: '', icerik: '', alistirmalar: [] },
];

it('bölüm başlığı ve tüm dersleri listeler', () => {
  render(<LessonNav dersler={[...dersler]} aktifSlug="a" />);
  expect(screen.getByText('Temeller')).toBeInTheDocument();
  expect(screen.getByText('A Dersi')).toBeInTheDocument();
  expect(screen.getByText('B Dersi')).toBeInTheDocument();
});

it('mobil drawer açıldıktan sonra bir derse tıklayınca kapanır', () => {
  render(<LessonNav dersler={[...dersler]} aktifSlug="a" />);
  fireEvent.click(screen.getByRole('button', { name: /menü/i }));
  expect(screen.getByTestId('lesson-nav-drawer')).toHaveClass('open');
  fireEvent.click(screen.getByText('B Dersi'));
  expect(screen.getByTestId('lesson-nav-drawer')).not.toHaveClass('open');
});

it('drawer açıldığında bir "Kapat" düğmesi gösterir ve tıklanınca drawer kapanır', () => {
  render(<LessonNav dersler={[...dersler]} aktifSlug="a" />);
  fireEvent.click(screen.getByRole('button', { name: /menü/i }));
  expect(screen.getByTestId('lesson-nav-drawer')).toHaveClass('open');
  fireEvent.click(screen.getByRole('button', { name: /kapat/i }));
  expect(screen.getByTestId('lesson-nav-drawer')).not.toHaveClass('open');
});

it('drawer açıkken Escape tuşuna basınca kapanır', () => {
  render(<LessonNav dersler={[...dersler]} aktifSlug="a" />);
  fireEvent.click(screen.getByRole('button', { name: /menü/i }));
  expect(screen.getByTestId('lesson-nav-drawer')).toHaveClass('open');
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.getByTestId('lesson-nav-drawer')).not.toHaveClass('open');
});
