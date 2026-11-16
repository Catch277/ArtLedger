import type { ReactNode } from 'react';

export type StatusTone = 'verified' | 'pending' | 'failed' | 'neutral';

const TONES: Record<StatusTone, string> = {
  verified: 'bg-accent-soft text-ink',
  pending: 'bg-warn-soft text-ink',
  failed: 'bg-danger-soft text-ink',
  neutral: 'border border-hairline bg-surface text-ink-muted',
};

export function StatusPill({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}>
      {tone === 'verified' ? <span aria-hidden className='h-2 w-2 rounded-full bg-accent' /> : null}
      {children}
    </span>
  );
}