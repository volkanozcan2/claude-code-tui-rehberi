import Link from 'next/link';
import type { Ders } from '@/lib/types';

interface ModuleCardProps {
  ders: Ders;
  ilerlemeOrani: number;
}

export default function ModuleCard({ ders, ilerlemeOrani }: ModuleCardProps) {
  const yuzde = Math.round(ilerlemeOrani * 100);

  return (
    <Link
      href={`/dersler/${ders.slug}`}
      data-testid="module-card"
      className="block rounded-lg border border-card-border bg-card-bg p-4 transition-colors hover:border-accent"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-fg">{ders.baslik}</h3>
        <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
          %{yuzde}
        </span>
      </div>
      <p className="mb-3 text-sm text-fg/80">{ders.ozet}</p>
      <div className="h-1.5 w-full rounded-full bg-card-border">
        <div
          className="h-1.5 rounded-full bg-accent"
          style={{ width: `${yuzde}%` }}
        />
      </div>
    </Link>
  );
}
