import type { ReactNode } from 'react';

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
}) {
  const centered = align === 'center';
  return (
    <div
      className={`flex flex-col gap-3 ${
        centered ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'
      }`}
    >
      <div className='max-w-2xl'>
        {eyebrow ? <p className='eyebrow'>{eyebrow}</p> : null}
        <h2 className={`${eyebrow ? 'mt-3' : ''} text-2xl font-normal tracking-tight sm:text-3xl`}>{title}</h2>
        {description ? <p className='mt-3 text-sm leading-6 text-ink-muted sm:text-base'>{description}</p> : null}
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
    </div>
  );
}