'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cc-tui-tema';

type Tema = 'acik' | 'koyu';

function depolananTemaOkuyEylemBasinda(): Tema {
  try {
    const depolanan = window.localStorage.getItem(STORAGE_KEY);
    if (depolanan === 'acik' || depolanan === 'koyu') {
      return depolanan;
    }
  } catch {
    // localStorage kullanılamıyorsa (örn. gizli mod kotası) sessizce yok say
    // ve prefers-color-scheme tercihine düş.
  }

  try {
    const koyuTercihEdiliyor =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return koyuTercihEdiliyor ? 'koyu' : 'acik';
  } catch {
    // matchMedia da başarısız olursa güvenli varsayılan: açık tema.
    return 'acik';
  }
}

function temayiUygula(tema: Tema) {
  document.documentElement.classList.toggle('dark', tema === 'koyu');
}

export default function ThemeToggle() {
  const [tema, setTema] = useState<Tema>('acik');

  useEffect(() => {
    const baslangicTemasi = depolananTemaOkuyEylemBasinda();
    setTema(baslangicTemasi);
    temayiUygula(baslangicTemasi);
  }, []);

  function degistir() {
    const yeniTema: Tema = tema === 'koyu' ? 'acik' : 'koyu';
    setTema(yeniTema);
    temayiUygula(yeniTema);
    try {
      window.localStorage.setItem(STORAGE_KEY, yeniTema);
    } catch {
      // localStorage kullanılamıyorsa (örn. gizli mod kotası) sessizce yok
      // say; tema bu oturum için yine de bellek içinde değişmiş olur.
    }
  }

  return (
    <button
      type="button"
      onClick={degistir}
      aria-label={tema === 'koyu' ? 'Açık temaya geç' : 'Koyu temaya geç'}
      className="rounded-full border border-card-border bg-card-bg px-3 py-1.5 text-sm text-fg transition-colors hover:border-accent"
    >
      {tema === 'koyu' ? '☀️ Açık' : '🌙 Koyu'}
    </button>
  );
}
