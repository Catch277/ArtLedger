'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function HashChip({
  value,
  display,
  label,
  tone = 'surface',
}: {
  value: string;
  display?: string;
  label?: string;
  /** `brand` is for the blue header/footer; every in-page usage keeps the default. */
  tone?: 'surface' | 'brand';
}) {
  const [copied, setCopied] = useState(false);
  const onShell = tone === 'brand';

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be blocked; the value stays selectable either way.
    }
  }

  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-md px-2 py-1 font-mono text-xs tabular-nums ${
        onShell ? 'bg-surface/15 text-ink-inverse' : 'bg-ink/[0.04]'
      }`}
    >
      {label ? <span className={`shrink-0 ${onShell ? 'text-ink-inverse/80' : 'text-ink-muted'}`}>{label}</span> : null}
      {/* `min-w-0` lets the chip shrink inside a flex parent (card header, verdict banner) instead
          of pushing the row wider than the viewport. */}
      <span className='min-w-0 truncate whitespace-nowrap' title={value}>
        {display ?? value}
      </span>
      <button
        type='button'
        onClick={() => void copy()}
        aria-label='Sao chép giá trị'
        className={`hit-area-44 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors ${
          onShell ? 'text-ink-inverse hover:bg-surface/20 focus-visible:outline-ink-inverse' : 'text-brand hover:bg-ink/5'
        }`}
      >
        {copied ? <Check aria-hidden size={16} strokeWidth={2} /> : <Copy aria-hidden size={16} strokeWidth={2} />}
      </button>
      <span role='status' className='sr-only'>
        {copied ? 'Đã sao chép' : ''}
      </span>
    </span>
  );
}