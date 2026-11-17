'use client';

import Link from 'next/link';
import { Button } from './Button';

/**
 * The pager from DESIGN.md 7.14. `numbers` turns the page into a real link (so `?page=2` stays
 * shareable and middle-click works); without it the bar drops to `Trước · Trang x/y · Sau`, which is
 * what a teaser strip wants.
 */
export function Pagination({
  page,
  pageCount,
  onChange,
  label = 'Phân trang',
  summary,
  numbers,
  className = '',
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  label?: string;
  /** Left-hand text, for example `Hiển thị 1–24 / 128`. */
  summary?: string;
  /** Href for a page number. Omitted → compact bar without numbered links. */
  numbers?: (page: number) => string;
  className?: string;
}) {
  const numbered = numbers !== undefined;
  return (
    <nav
      aria-label={label}
      className={`flex flex-wrap items-center gap-3 ${summary ? 'justify-between' : 'justify-center'} ${className}`}
    >
      {summary ? <p className='text-xs tabular-nums text-ink-muted'>{summary}</p> : null}
      <div
        className={`flex flex-wrap items-center justify-center gap-2 ${
          summary ? 'w-full sm:w-auto sm:justify-end' : ''
        }`}
      >
        <Button variant='secondary' size='sm' onClick={() => onChange(page - 1)} disabled={page <= 1}>
          Trước
        </Button>
        {/* Seven numbered pills plus two buttons need ~412px of a 361px content box on a 393px phone,
            so the phone keeps the two buttons and a counter instead. */}
        <p
          aria-live='polite'
          className={`text-xs tabular-nums text-ink-muted ${numbered ? 'sm:hidden' : ''}`}
        >
          Trang {page}/{pageCount}
        </p>
        {numbers ? (
          <div className='hidden items-center gap-2 sm:flex'>
            {Array.from({ length: pageCount }, (_, index) => index + 1)
              .slice(0, 7)
              .map((number) => (
                <Link
                  key={number}
                  href={numbers(number)}
                  onClick={(event) => {
                    event.preventDefault();
                    onChange(number);
                  }}
                  aria-current={number === page ? 'page' : undefined}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-xs font-medium tabular-nums transition-colors pointer-coarse:h-11 pointer-coarse:min-w-11 ${
                    number === page ? 'bg-ink/[0.06] text-ink' : 'text-ink-muted hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  {number}
                </Link>
              ))}
          </div>
        ) : null}
        <Button variant='secondary' size='sm' onClick={() => onChange(page + 1)} disabled={page >= pageCount}>
          Sau
        </Button>
      </div>
    </nav>
  );
}
