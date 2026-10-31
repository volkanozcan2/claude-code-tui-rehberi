import type { MDXRemoteProps } from 'next-mdx-remote/rsc';

/**
 * Ders içeriğindeki (MDX) öğeleri sitenin stiliyle eşleyen bileşen haritası.
 */
const mdxComponents: NonNullable<MDXRemoteProps['components']> = {
  h2: (props) => <h2 className="mb-4 mt-8 text-2xl font-semibold text-fg" {...props} />,
  h3: (props) => <h3 className="mb-3 mt-6 text-xl font-semibold text-fg" {...props} />,
  p: (props) => <p className="mb-4 leading-relaxed text-fg/90" {...props} />,
  ul: (props) => <ul className="mb-4 list-disc space-y-1 pl-6 text-fg/90" {...props} />,
  ol: (props) => <ol className="mb-4 list-decimal space-y-1 pl-6 text-fg/90" {...props} />,
  code: (props) => (
    <code className="rounded bg-card-bg px-1.5 py-0.5 font-mono text-sm text-accent" {...props} />
  ),
  pre: (props) => (
    <pre
      className="mb-4 overflow-x-auto rounded-lg border border-card-border bg-card-bg p-4 font-mono text-sm"
      {...props}
    />
  ),
};

export default mdxComponents;
