import { render, screen, fireEvent } from '@testing-library/react';
import { it, expect, beforeEach } from 'vitest';
import ThemeToggle from './ThemeToggle';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

it('tıklandığında dark sınıfını ekler ve localStorage güncellenir', () => {
  render(<ThemeToggle />);
  fireEvent.click(screen.getByRole('button'));
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(localStorage.getItem('cc-tui-tema')).toBe('koyu');
});

it('ikinci tıklama açık moda geri döner', () => {
  render(<ThemeToggle />);
  const btn = screen.getByRole('button');
  fireEvent.click(btn);
  fireEvent.click(btn);
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  expect(localStorage.getItem('cc-tui-tema')).toBe('acik');
});
