'use client';

import type { KeyboardEvent } from 'react';

export function Tabs<T extends string>({ tabs, active, label }: { tabs: { id: T; label: string }[]; active: T; label: string }) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>('[role="tab"]'));
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (index === -1) return;
    event.preventDefault();
    const next = event.key === 'ArrowRight' ? links[(index + 1) % links.length] : links[(index - 1 + links.length) % links.length];
    next.focus();
    window.location.hash = next.getAttribute('href') ?? '';
  }

  return (
    <div
      role='tablist'
      aria-label={label}
      onKeyDown={onKeyDown}
      className='inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-ink/[0.04] p-1'
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <a
            key={tab.id}
            role='tab'
            id={`tab-${tab.id}`}
            aria-controls={tab.id}
            href={`#${tab.id}`}
            aria-selected={selected}
            className={`inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors pointer-coarse:h-11 ${
              selected ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </a>
        );
      })}
    </div>
  );
}