import ModuleCard from '@/components/ModuleCard';
import { getAllDersler, getBolumBaslik } from '@/lib/dersler';
import { dersTamamlanmaOrani, genelIlerleme } from '@/lib/progress';
import type { Bolum, Ders } from '@/lib/types';

const BOLUM_SIRASI: Bolum[] = ['temeller', 'gunluk-kullanim', 'ileri-duzey', 'uzmanlik'];

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

  return BOLUM_SIRASI.filter((bolum) => gruplar.has(bolum)).map((bolum) => [
    bolum,
    gruplar.get(bolum)!,
  ]);
}

export default function HomePage() {
  const dersler = getAllDersler();
  const gruplar = dersleriBolumeGoreGrupla(dersler);
  const genelYuzde = Math.round(genelIlerleme(dersler) * 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold text-fg sm:text-4xl">
          Claude Code&apos;un Terminal Arayüzünü Öğren
        </h1>
        <p className="mx-auto mb-4 max-w-2xl text-fg/80">
          Terminal tabanlı yapay zeka kodlama asistanı Claude Code&apos;u
          günlük iş akışınıza katmak için adım adım, Türkçe bir kurs.
        </p>
        <span className="inline-block rounded-full border border-card-border bg-card-bg px-4 py-1.5 text-sm font-medium text-accent">
          Genel ilerleme: %{genelYuzde}
        </span>
      </header>

      <main>
        {gruplar.map(([bolum, bolumDersleri]) => (
          <section key={bolum} className="mb-10">
            <h2 className="mb-4 text-xl font-semibold text-fg">
              {getBolumBaslik(bolum)}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bolumDersleri.map((ders) => (
                <ModuleCard
                  key={ders.slug}
                  ders={ders}
                  ilerlemeOrani={dersTamamlanmaOrani(ders.slug, ders.alistirmalar.length)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
