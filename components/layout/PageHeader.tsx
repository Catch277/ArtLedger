import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className='border-b border-hairline bg-surface'>
      <div className='mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-12'>
        <div className='max-w-2xl'>
          <p className='eyebrow'>{eyebrow}</p>
          <h1 className='mt-3 text-2xl font-normal tracking-tight sm:text-3xl'>{title}</h1>
          {description ? <p className='mt-3 text-sm leading-6 text-ink-muted sm:text-base'>{description}</p> : null}
        </div>
        {actions ? <div className='flex flex-wrap items-center gap-3'>{actions}</div> : null}
      </div>
    </header>
  );
}