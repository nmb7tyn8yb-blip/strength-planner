import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export default function EmptyState({ title, description, ctaHref, ctaLabel }: EmptyStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-graphite px-6 text-chalk">
      <div className="mx-auto max-w-md text-center">
        {/* Проста визуализация: щанга с дискове, без движение — символ на "нищо не е заредено" */}
        <svg viewBox="0 0 200 60" className="mx-auto h-14 w-auto opacity-40" aria-hidden>
          <rect x="20" y="22" width="10" height="16" fill="#4C6B8A" />
          <rect x="32" y="18" width="7" height="24" fill="#4C6B8A" />
          <rect x="41" y="27" width="118" height="6" fill="#B8B3A8" />
          <rect x="161" y="18" width="7" height="24" fill="#4C6B8A" />
          <rect x="170" y="22" width="10" height="16" fill="#4C6B8A" />
        </svg>

        <h1 className="mt-6 font-display text-2xl font-semibold text-chalk">{title}</h1>
        <p className="mt-3 text-chalkDim">{description}</p>

        {ctaHref && ctaLabel && (
          <Link
            href={ctaHref}
            className="mt-8 inline-flex items-center gap-2 border-2 border-amber bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-graphite transition hover:bg-transparent hover:text-amber"
          >
            {ctaLabel} →
          </Link>
        )}
      </div>
    </main>
  );
}
