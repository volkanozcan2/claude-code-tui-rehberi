'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getBolumBaslik } from '@/lib/bolumler';
import type { Bolum, Ders } from '@/lib/types';

interface LessonNavProps {
  dersler: Ders[];
  aktifSlug: string;
}

function dersleriBolumeGoreGrupla(dersler: Ders[]): Array<[Bolum, Ders[]]> {
  const gruplar = new Map<Bolum, Ders[]>();

  for (const ders of dersler) {
    const mevcutGrup = gruplar.get(ders.bolum);
    if (mevcutGrup) {
      mevcutGrup.push(ders);
    } else {
      gruplar.set(ders.bolum, [ders]);
    }
  }

  for (const grup of gruplar.values()) {
    grup.sort((a, b) => a.siraNo - b.siraNo);
  }

  return [...gruplar.entries()];
}

export default function LessonNav({ dersler, aktifSlug }: LessonNavProps) {
  const [acik, setAcik] = useState(false);
  const gruplar = dersleriBolumeGoreGrupla(dersler);

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik((onceki) => !onceki)}
        aria-expanded={acik}
        className="rounded-full border border-card-border bg-card-bg px-3 py-1.5 text-sm text-fg md:hidden"
      >
        Menü
      </button>
      <nav
        data-testid="lesson-nav-drawer"
        className={`lesson-nav fixed inset-0 z-40 overflow-y-auto bg-bg p-4 md:static md:z-auto md:block md:bg-transparent md:p-0 ${
          acik ? 'open block' : 'hidden'
        }`}
      >
        {gruplar.map(([bolum, bolumDersleri]) => (
          <div key={bolum} className="mb-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-fg/70">
              {getBolumBaslik(bolum)}
            </h2>
            <ul>
              {bolumDersleri.map((ders) => (
                <li key={ders.slug}>
                  <Link
                    href={`/dersler/${ders.slug}`}
                    aria-current={ders.slug === aktifSlug ? 'page' : undefined}
                    onClick={() => setAcik(false)}
                    className={`block rounded px-2 py-1 text-sm ${
                      ders.slug === aktifSlug
                        ? 'bg-accent/10 font-semibold text-accent'
                        : 'text-fg hover:text-accent'
                    }`}
                  >
                    {ders.baslik}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}
