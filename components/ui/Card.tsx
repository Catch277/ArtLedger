import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export function Card({ className = '', ...props }: ComponentPropsWithoutRef<'article'>) {
  return <article className={`rounded-card border border-hairline bg-surface p-6 shadow-card sm:p-7 ${className}`} {...props} />;
}

export function CardHeader({ title, action, className = '' }: { title: string; action?: ReactNode; className?: string }) {
  return (
    <div className={`mb-4 flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <h2 className='text-base font-semibold leading-tight'>{title}</h2>
      {action}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mt-6 flex flex-wrap justify-end gap-3 border-t border-hairline pt-4 ${className}`}>
      {children}
    </div>
  );
}