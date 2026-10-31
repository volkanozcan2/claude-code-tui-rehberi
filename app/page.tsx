import { GenelIlerlemeRozeti, ModulKartlari } from '@/components/HomeProgress';
import { getAllDersler } from '@/lib/dersler';
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
        <GenelIlerlemeRozeti tumDersler={dersler} />
      </header>

      <ModulKartlari gruplar={gruplar} />
    </div>
  );
}
