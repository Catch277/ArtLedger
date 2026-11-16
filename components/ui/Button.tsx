import type { ComponentPropsWithoutRef, ElementType } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'inverse' | 'accent' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs pointer-coarse:h-11',
  md: 'h-10 px-4 text-sm pointer-coarse:h-11',
  lg: 'h-11 px-5 text-sm sm:h-12 sm:text-base',
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-ink-inverse hover:bg-brand-strong',
  secondary: 'border border-hairline bg-surface text-ink hover:bg-ink/5',
  // For the blue shell: the global focus ring is brand blue, so it is re-pointed to white here.
  inverse: 'border border-ink-inverse/25 text-ink-inverse hover:bg-surface/15 focus-visible:outline-ink-inverse',
  // The shell's connect action. `secondary` is the light-page variant and reads ink-on-blue up there, so the
  // header's only filled pill is green; DESIGN.md 2.5 records the white-on-green ratio it costs.
  accent: 'bg-accent text-ink-inverse hover:bg-accent-deep focus-visible:opacity-90 focus-visible:outline-ink-inverse',
  ghost: 'text-ink-muted hover:bg-ink/5 hover:text-ink',
  destructive: 'border border-danger/40 bg-danger-soft text-ink hover:bg-danger',
  link: 'px-0 text-brand underline-offset-4 hover:underline',
};

export function buttonClasses(options: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  const { variant = 'primary', size = 'md', className = '' } = options;
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`.trim();
}

type ButtonOwnProps = { variant?: ButtonVariant; size?: ButtonSize; className?: string };

export type ButtonProps<T extends ElementType> = ButtonOwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps | 'as'>;

/** Renders a button by default; pass `as={Link}` (or `as="a"`) for navigation. */
export function Button<T extends ElementType = 'button'>({ as, variant, size, className, ...rest }: ButtonProps<T>) {
  const Component = (as ?? 'button') as ElementType;
  const typeProp = Component === 'button' ? { type: 'button' as const } : {};
  return <Component className={buttonClasses({ variant, size, className })} {...typeProp} {...rest} />;
}