'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';

/** Explains a term or reveals a full value on hover and focus; never the only copy of anything. */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <span className='group relative inline-flex'>
      <span
        aria-describedby={id}
        tabIndex={0}
        className='inline-flex rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
      >
        {children}
      </span>
      <span
        id={id}
        role='tooltip'
        className='pointer-events-none absolute left-0 top-full z-40 mt-2 hidden max-w-xs rounded-control border border-hairline bg-surface px-3 py-2 text-xs leading-5 text-ink shadow-overlay group-hover:block group-focus-within:block'
      >
        {label}
      </span>
    </span>
  );
}