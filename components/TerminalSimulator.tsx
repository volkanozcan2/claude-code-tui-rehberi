'use client';

import { useState } from 'react';
import type { Alistirma } from '@/lib/types';
import { cevapEslesiyorMu } from '@/lib/exercise-validator';
import { alistirmaTamamlandiIsaretle } from '@/lib/progress';

interface TerminalSimulatorProps {
  dersSlug: string;
  alistirmalar: Alistirma[];
}

type Durum = 'bekliyor' | 'basarili' | 'basarisiz';

export default function TerminalSimulator({ dersSlug, alistirmalar }: TerminalSimulatorProps) {
  return (
    <div className="space-y-4">
      {alistirmalar.map((alistirma) => (
        <AlistirmaTerminali key={alistirma.id} dersSlug={dersSlug} alistirma={alistirma} />
      ))}
    </div>
  );
}

function AlistirmaTerminali({
  dersSlug,
  alistirma,
}: {
  dersSlug: string;
  alistirma: Alistirma;
}) {
  const [girdi, setGirdi] = useState('');
  const [durum, setDurum] = useState<Durum>('bekliyor');

  function kontrolEt() {
    if (girdi.trim() === '') {
      return;
    }

    if (cevapEslesiyorMu(girdi, alistirma.kabulKurallari)) {
      setDurum('basarili');
      alistirmaTamamlandiIsaretle(dersSlug, alistirma.id);
    } else {
      setDurum('basarisiz');
    }
  }

  return (
    <div className="rounded-lg border border-card-border bg-card-bg p-4 font-mono text-sm text-fg">
      <p className="mb-3">{alistirma.gorev}</p>
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-accent">
          $
        </span>
        <input
          type="text"
          value={girdi}
          onChange={(olay) => setGirdi(olay.target.value)}
          aria-label={alistirma.gorev}
          className="flex-1 rounded border border-card-border bg-transparent px-2 py-1 text-fg outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={kontrolEt}
          className="rounded border border-card-border px-3 py-1 text-fg transition-colors hover:border-accent"
        >
          Kontrol Et
        </button>
      </div>
      {durum === 'basarili' && (
        <p className="mt-3 text-green-600 dark:text-green-400">
          ✓ Doğru{alistirma.basariliMesaj ? ` — ${alistirma.basariliMesaj}` : ''}
        </p>
      )}
      {durum === 'basarisiz' && (
        <p className="mt-3 text-amber-600 dark:text-amber-400">{alistirma.ipucu}</p>
      )}
    </div>
  );
}
