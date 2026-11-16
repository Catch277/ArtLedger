import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex flex-1 flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0'>
      <SiteHeader />
      <main id='main' tabIndex={-1} className='flex-1 outline-none'>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}