import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default function SiteLayout({ children }: { children: ReactNode }) {
  // The tab bar is `lg:hidden`, so the reserved space and its breakpoint have to match it.
  return (
    <div className='flex flex-1 flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:pb-0'>
      <SiteHeader />
      <main id='main' tabIndex={-1} className='flex-1 outline-none'>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}