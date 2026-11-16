import Link from 'next/link';
import type { LinkProps } from 'next/link';
import type { ReactNode } from 'react';

/** The row for compact lists and for tables below sm (DESIGN.md 7.21). */
export function ListCell({
  href,
  media,
  title,
  description,
  detail,
  subdetail,
}: {
  href: LinkProps['href'];
  media?: ReactNode;
  title: string;
  description?: string;
  detail?: ReactNode;
  subdetail?: string;
}) {
  return (
    <Link
      href={href}
      className='flex min-h-14 items-center gap-3 border-t border-hairline px-4 py-3 transition-colors hover:bg-ink/[0.03]'
    >
      {media ? (
        <span className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-soft text-brand'>{media}</span>
      ) : null}
      <span className='min-w-0 flex-1'>
        <span className='block truncate text-sm font-medium'>{title}</span>
        {description ? <span className='block truncate text-xs text-ink-muted'>{description}</span> : null}
      </span>
      <span className='shrink-0 text-right'>
        {detail ? <span className='block text-sm font-medium tabular-nums'>{detail}</span> : null}
        {subdetail ? <span className='block font-mono text-xs text-ink-muted'>{subdetail}</span> : null}
      </span>
    </Link>
  );
}