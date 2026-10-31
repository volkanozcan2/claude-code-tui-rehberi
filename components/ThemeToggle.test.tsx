import { render, screen, fireEvent } from '@testing-library/react';
import { it, expect, beforeEach, vi } from 'vitest';
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

it('localStorage erişimi hata fırlatsa bile çökmeden render edilir ve tıklanabilir', () => {
  const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('gizli mod kotası');
  });
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('gizli mod kotası');
  });

  expect(() => render(<ThemeToggle />)).not.toThrow();
  const btn = screen.getByRole('button');
  expect(() => fireEvent.click(btn)).not.toThrow();

  getItemSpy.mockRestore();
  setItemSpy.mockRestore();
});
