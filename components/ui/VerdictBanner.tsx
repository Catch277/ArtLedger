import { BadgeCheck, Clock3, FileQuestion, ShieldX } from 'lucide-react';
import type { ReactNode } from 'react';

export type VerdictState = 'verified' | 'pending' | 'failed' | 'unregistered';

const CONFIG = {
  verified: { surface: 'bg-accent-soft', chip: 'bg-accent text-ink', dot: 'bg-accent', label: 'Đã xác thực', labelTone: 'text-accent-ink', icon: BadgeCheck },
  pending: { surface: 'bg-warn-soft', chip: 'bg-warn text-ink', dot: 'bg-warn', label: 'Đang chờ xác nhận', labelTone: 'text-ink', icon: Clock3 },
  failed: { surface: 'bg-danger-soft', chip: 'bg-danger text-ink', dot: 'bg-danger', label: 'Không khớp', labelTone: 'text-ink', icon: ShieldX },
  unregistered: {
    surface: 'bg-surface-muted',
    chip: 'bg-surface text-ink-muted',
    dot: 'bg-hairline-strong',
    label: 'Chưa đăng ký',
    labelTone: 'text-ink-muted',
    icon: FileQuestion,
  },
} as const;

/** The answer before the evidence: first block on /verify and the result strip on /check. */
export function VerdictBanner({ state, title, children }: { state: VerdictState; title: string; children?: ReactNode }) {
  const config = CONFIG[state];
  const Icon = config.icon;
  return (
    <section
      role={state === 'failed' ? 'alert' : 'status'}
      className={`flex flex-col gap-4 rounded-panel border border-hairline p-6 shadow-card sm:flex-row sm:items-center sm:p-7 ${config.surface}`}
    >
      <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${config.chip}`}>
        <Icon aria-hidden size={24} strokeWidth={2} />
      </span>
      <div className='min-w-0 flex-1'>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium ${config.labelTone}`}
        >
          <span aria-hidden className={`h-2 w-2 rounded-full ${config.dot}`} />
          {config.label}
        </span>
        <p className='mt-2 text-sm leading-6 text-ink'>{title}</p>
        {children ? <div className='mt-2 text-sm leading-6 text-ink'>{children}</div> : null}
      </div>
    </section>
  );
}