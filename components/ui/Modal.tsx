'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

/** One overlay concept: a modal from sm up, a bottom tray below (DESIGN.md 7.19). */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  blocking = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  blocking?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent | globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-30 flex items-end justify-center sm:items-center' role='dialog' aria-modal='true' aria-label={title}>
      <div className='absolute inset-0 bg-ink/40' onClick={blocking ? undefined : onClose} aria-hidden />
      <div
        ref={panelRef}
        tabIndex={-1}
        className='relative max-h-[85dvh] w-full overflow-y-auto rounded-t-panel border border-hairline bg-surface p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-overlay outline-none sm:max-w-md sm:pb-6'
      >
        <div aria-hidden className='mx-auto mb-3 h-1 w-10 rounded-full bg-hairline-strong sm:hidden' />
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className='text-base font-semibold leading-tight'>{title}</h2>
            {description ? <p className='mt-1 text-sm leading-6 text-ink-muted'>{description}</p> : null}
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Đóng'
            className='hit-area-44 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink'
          >
            <X aria-hidden size={18} strokeWidth={2} />
          </button>
        </div>
        {children ? <div className='mt-4'>{children}</div> : null}
        {footer ? <div className='mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end'>{footer}</div> : null}
      </div>
    </div>
  );
}