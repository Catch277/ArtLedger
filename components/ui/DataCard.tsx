import type { ReactNode } from 'react';

export function DataCard({ label, value, hint, loading = false }: { label: string; value: ReactNode; hint?: string; loading?: boolean }) {
  return (
    <article className='rounded-card border border-hairline bg-surface p-5 shadow-card sm:p-6'>
      <p className='text-xs font-medium text-ink-muted'>{label}</p>
      {loading ? (
        <div className='mt-3 h-9 w-24 animate-pulse rounded-md bg-surface-muted' aria-hidden />
      ) : (
        <p className='mt-2 text-3xl font-normal tracking-tight tabular-nums text-ink'>{value}</p>
      )}
      {hint ? <p className='mt-2 font-mono text-[11px] text-ink-muted'>{hint}</p> : null}
    </article>
  );
}