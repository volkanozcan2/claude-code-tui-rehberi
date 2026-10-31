import { describe, it, expect } from 'vitest';
import { cevapEslesiyorMu } from './exercise-validator';

describe('cevapEslesiyorMu', () => {
  it('tam metin eşleşmesini kabul eder', () => {
    expect(cevapEslesiyorMu('/compact', ['/compact'])).toBe(true);
  });
  it('baştaki/sondaki ve çift boşlukları normalize eder', () => {
    expect(cevapEslesiyorMu('  /compact   now ', ['/compact now'])).toBe(true);
  });
  it('regex kuralını (re: öneki) destekler', () => {
    expect(cevapEslesiyorMu('npm install -g @anthropic-ai/claude-code', ['re:^npm install -g @anthropic-ai/claude-code$'])).toBe(true);
  });
  it('listedeki herhangi bir kuralla eşleşirse true döner', () => {
    expect(cevapEslesiyorMu('/exit', ['/quit', '/exit'])).toBe(true);
  });
  it('eşleşmeyen girdi için false döner', () => {
    expect(cevapEslesiyorMu('/wrong', ['/compact'])).toBe(false);
  });
  it('boş girdi için false döner', () => {
    expect(cevapEslesiyorMu('', ['/compact'])).toBe(false);
  });
  it('bozuk (geçersiz) regex kuralı hata fırlatmaz, false döner', () => {
    expect(cevapEslesiyorMu('/compact', ['re:(eksik-parantez'])).toBe(false);
  });
});
