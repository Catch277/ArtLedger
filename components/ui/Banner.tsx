import { AlertTriangle, BadgeCheck, Info, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';

export type BannerVariant = 'neutral' | 'pending' | 'failed' | 'verified';

const SURFACE: Record<BannerVariant, string> = {
  neutral: 'bg-surface-muted',
  pending: 'bg-warn-soft',
  failed: 'bg-danger-soft',
  verified: 'bg-accent-soft',
};

/* Verified is the only variant whose icon earns the green ink - never the text. */
const TONE: Record<BannerVariant, string> = {
  neutral: 'text-ink-muted',
  pending: 'text-ink',
  failed: 'text-ink',
  verified: 'text-accent-ink',
};

const ICONS = {
  neutral: Info,
  pending: Wallet,
  failed: AlertTriangle,
  verified: BadgeCheck,
} as const;

/** Page-level notice: in flow, full width, never sticky and never floating. */
export function Banner({
  variant = 'neutral',
  id,
  children,
  action,
}: {
  variant?: BannerVariant;
  id?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const Icon = ICONS[variant];
  return (
    <div
      id={id}
      role={variant === 'failed' ? 'alert' : 'status'}
      className={`border-b border-hairline px-4 py-3 text-sm text-ink ${SURFACE[variant]}`}
    >
      <div className='mx-auto flex max-w-6xl items-start gap-3'>
        <Icon aria-hidden size={18} strokeWidth={2} className={`mt-0.5 shrink-0 ${TONE[variant]}`} />
        {/* `min-w-0 break-words`: an RPC error can carry an unbroken hash, and a flex item defaults
            to `min-width: auto`, which would widen the page instead of wrapping. */}
        <div className='min-w-0 flex-1 break-words leading-6'>{children}</div>
        {action ? <div className='shrink-0'>{action}</div> : null}
      </div>
    </div>
  );
}