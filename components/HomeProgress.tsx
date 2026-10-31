'use client';

/**
 * Ana sayfadaki ilerleme yüzdelerini client tarafında hesaplayan bileşenler.
 *
 * `app/page.tsx` statik export altında bir Server Component olarak derleme
 * anında render edilir; o anda `window`/`localStorage` mevcut değildir, bu
 * yüzden Server Component içinde hesaplanan bir ilerleme değeri sonsuza dek
 * %0'da donar (statik HTML'e gömülür ve bir daha güncellenmez — Server
 * Component'ler tarayıcıda yeniden çalıştırılmaz).
 *
 * Bunu çözmek için ders/bölüm yapısı (statik, localStorage'a bağlı değil)
 * sunucuda hesaplanıp bu client component'lere prop olarak geçirilir;
 * gerçek ilerleme yüzdeleri ise burada, mount olduktan SONRA bir
 * `useEffect` içinde `lib/progress`'ten okunur ve state güncellenir. İlk
 * render'da (hem sunucuda hem tarayıcıdaki hydration anında) gösterilen
 * değer hep aynı güvenli varsayılandır, böylece hydration uyuşmazlığı
 * oluşmaz; mount sonrası gerçek değerlerle güncellenir.
 */

import { useEffect, useMemo, useState } from 'react';
import ModuleCard from '@/components/ModuleCard';
import { dersTamamlanmaOrani, genelIlerleme } from '@/lib/progress';
// Not: `@/lib/dersler` değil `@/lib/bolumler`'dan içe aktarılıyor — bu
// component 'use client' olduğu için `lib/dersler.ts`'in Node `fs`/`path`
// bağımlılığını client bundle'ına sızdırmamak gerekir (statik export
// build'i bu yüzden webpack hatasıyla başarısız olurdu).
import { getBolumBaslik } from '@/lib/bolumler';
import type { Bolum, Ders } from '@/lib/types';

export function GenelIlerlemeRozeti({ tumDersler }: { tumDersler: Ders[] }) {
  // Başlangıç değeri sabit %0'dır (sunucu render'ıyla birebir aynı) — gerçek
  // değer yalnızca aşağıdaki effect içinde okunur. `genelIlerleme`'yi burada
  // doğrudan çağırmak hydration uyuşmazlığına yol açar: fonksiyon sadece
  // build-time Node ortamında "window yok" der, tarayıcıdaki İLK (hydration)
  // render'ında window zaten vardır, yani gerçek değer sunucunun bastığı
  // %0'dan hemen farklı çıkıp React'ı uyuşmazlık hatasına düşürür.
  const [yuzde, setYuzde] = useState(0);

  useEffect(() => {
    setYuzde(Math.round(genelIlerleme(tumDersler) * 100));
  }, [tumDersler]);

  return (
    <span className="inline-block rounded-full border border-card-border bg-card-bg px-4 py-1.5 text-sm font-medium text-accent">
      Genel ilerleme: %{yuzde}
    </span>
  );
}

function gercekIlerlemeHaritasi(tumDersler: Ders[]): Record<string, number> {
  const harita: Record<string, number> = {};
  for (const ders of tumDersler) {
    harita[ders.slug] = dersTamamlanmaOrani(ders.slug, ders.alistirmalar.length);
  }
  return harita;
}

export function ModulKartlari({ gruplar }: { gruplar: Array<[Bolum, Ders[]]> }) {
  // `useMemo` ile sabit bir referans tutuyoruz; aksi halde her render'da
  // yeni bir dizi üretilir ve bu, aşağıdaki effect'i sonsuz döngüye sokar.
  const tumDersler = useMemo(() => gruplar.flatMap(([, dersler]) => dersler), [gruplar]);
  // Başlangıçta boş harita (tüm kartlar %0 gösterir, sunucu render'ıyla
  // aynı) — gerçek değerler yalnızca effect içinde okunur. Bkz. yukarıdaki
  // `GenelIlerlemeRozeti` yorumu: lazy initializer'da gerçek fonksiyonu
  // çağırmak hydration uyuşmazlığına yol açar.
  const [ilerlemeHaritasi, setIlerlemeHaritasi] = useState<Record<string, number>>({});

  useEffect(() => {
    setIlerlemeHaritasi(gercekIlerlemeHaritasi(tumDersler));
  }, [tumDersler]);

  return (
    <main>
      {gruplar.map(([bolum, bolumDersleri]) => (
        <section key={bolum} className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-fg">{getBolumBaslik(bolum)}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bolumDersleri.map((ders) => (
              <ModuleCard
                key={ders.slug}
                ders={ders}
                ilerlemeOrani={ilerlemeHaritasi[ders.slug] ?? 0}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
