import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import LessonNav from '@/components/LessonNav';
import TerminalSimulator from '@/components/TerminalSimulator';
import mdxComponents from '@/app/mdx-components';
import { getAllDersler, getDersBySlug } from '@/lib/dersler';

interface LessonPageParams {
  slug: string;
}

interface LessonPageProps {
  params: Promise<LessonPageParams>;
}

export async function generateStaticParams(): Promise<LessonPageParams[]> {
  return getAllDersler().map((ders) => ({ slug: ders.slug }));
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const ders = getDersBySlug(slug);

  if (!ders) {
    notFound();
  }

  const dersler = getAllDersler();
  const icerik = await MDXRemote({ source: ders.icerik, components: mdxComponents });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="md:w-56 md:flex-shrink-0">
          <LessonNav dersler={dersler} aktifSlug={slug} />
        </aside>
        <main className="flex-1">
          <h1 className="mb-4 text-3xl font-bold text-fg">{ders.baslik}</h1>
          <article className="mb-10">{icerik}</article>
          <TerminalSimulator dersSlug={ders.slug} alistirmalar={ders.alistirmalar} />
          <footer className="mt-10 border-t border-card-border pt-4 text-sm text-fg/60">
            İçerik, Claude Code&apos;un 2.0 (Ekim 2026) versiyonuna göre doğrulanmıştır.
          </footer>
        </main>
      </div>
    </div>
  );
}
