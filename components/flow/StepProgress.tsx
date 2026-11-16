import { Check, Loader, X } from 'lucide-react';
import type { RegistrationStep } from '@/lib/domain/entities/RegistrationStep';

const STAGES = [
  { id: 'pick', label: 'Đã chọn ảnh' },
  { id: 'pin', label: 'Đã lưu lên IPFS' },
  { id: 'sign', label: 'Chờ ký giao dịch' },
  { id: 'done', label: 'Hoàn tất' },
] as const;

/** Maps the six domain steps onto the four stages the brand asks for. */
function stageIndex(step: RegistrationStep | null): number {
  if (step === null) return -1;
  if (step === 'hashing') return 0;
  if (step === 'pinning-image' || step === 'pinning-metadata') return 1;
  if (step === 'simulating' || step === 'signing') return 2;
  return 3;
}

/* A finished stage is a confirmed stage: green, not a second blue. */
function markerTone(state: 'done' | 'active' | 'upcoming' | 'failed'): string {
  if (state === 'failed') return 'bg-danger text-ink';
  if (state === 'done') return 'bg-accent text-ink';
  if (state === 'active') return 'bg-brand text-ink-inverse';
  return 'bg-surface-muted text-ink-muted';
}

export function StepProgress({
  step,
  failed = false,
  orientation = 'horizontal',
}: {
  step: RegistrationStep | null;
  failed?: boolean;
  orientation?: 'horizontal' | 'vertical';
}) {
  const active = stageIndex(step);
  const vertical = orientation === 'vertical';

  return (
    <ol
      role='status'
      aria-label='Tiến trình đăng ký'
      className={vertical ? 'flex flex-col' : 'grid grid-cols-4 gap-1'}
    >
      {STAGES.map((stage, index) => {
        const complete = active > index;
        const isActive = active === index;
        const isError = failed && isActive;
        const state = isError ? 'failed' : complete ? 'done' : isActive ? 'active' : 'upcoming';

        return (
          <li
            key={stage.id}
            aria-current={isActive ? 'step' : undefined}
            data-step-active={isActive}
            data-step-visited={complete || isActive}
            data-step-complete={complete}
            data-step-error={isError}
            className={`relative flex ${vertical ? 'gap-3 pb-6 last:pb-0' : 'flex-col items-center gap-2 text-center'}`}
          >
            {index < STAGES.length - 1 ? (
              <span
                aria-hidden
                className={`absolute ${vertical ? 'left-3.5 top-7 h-full w-0.5' : 'left-1/2 top-3.5 h-0.5 w-full'} ${
                  complete ? 'bg-accent' : 'bg-hairline'
                }`}
              />
            ) : null}
            <span
              className={`relative z-[1] inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${markerTone(state)}`}
            >
              {state === 'done' ? <Check aria-hidden size={16} strokeWidth={2} /> : null}
              {state === 'active' ? <Loader aria-hidden size={16} strokeWidth={2} className='animate-spin' /> : null}
              {state === 'failed' ? <X aria-hidden size={16} strokeWidth={2} /> : null}
              {state === 'upcoming' ? <span className='tabular-nums'>{index + 1}</span> : null}
            </span>
            <span className={`text-xs leading-tight ${vertical ? 'pt-1' : ''} ${complete || isActive ? 'font-medium text-ink' : 'text-ink-muted'}`}>
              {stage.label}
              {isError ? <span className='sr-only'>Thất bại</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}