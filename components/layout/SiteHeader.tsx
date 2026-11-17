'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, FlaskConical, Images, PenLine, Search, Send, UserRound, Wrench } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { NetworkBanner } from '@/components/wallet/NetworkBanner';
import { WalletButton } from '@/components/wallet/WalletButton';

const PRIMARY = [
  { href: '/library', label: 'Thư viện', Icon: Images },
  { href: '/register', label: 'Đăng ký', Icon: PenLine },
  { href: '/transfer', label: 'Chuyển nhượng', Icon: Send },
  { href: '/verify', label: 'Tra cứu', Icon: Search },
] as const;

const TOOLS = [
  // The profile lives with the tools, not in the primary row: six pills overflow at md.
  { href: '/profile', label: 'Hồ sơ', Icon: UserRound },
  { href: '/check', label: 'Kiểm tra ảnh', Icon: Images },
  { href: '/lab', label: 'Phòng thí nghiệm', Icon: FlaskConical },
] as const;

// Five slots of ~78px on a 393px phone leave ~66px inside the current-route tile, which the longest
// primary label ("Chuyển nhượng") cannot fit. The bar shows the short form; `aria-label` keeps the
// full name for screen readers (WCAG 2.5.3 holds because the name contains the visible text).
const TAB_LABELS: Partial<Record<(typeof PRIMARY)[number]['href'], string>> = {
  '/transfer': 'Chuyển',
};

// The shell is the one large blue surface (DESIGN.md 2.1, 7.11): white text, white/80 for muted.
// The current segment is a solid #33D387 pill with a white label. White on that green is 1.94:1, so the
// label is semibold and the pill is redundant with aria-current; DESIGN.md 2.5 records it as a known
// failure accepted for this one element (swap to `bg-accent-ink` for 5.39:1 if readability wins).
const NAV_LINK =
  'inline-flex h-8 items-center rounded-full px-3 text-sm font-medium text-ink-inverse/80 transition-colors hover:bg-surface/15 hover:text-ink-inverse focus-visible:text-ink-inverse focus-visible:outline-ink-inverse aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-ink-inverse';

export function SiteHeader() {
  const pathname = usePathname();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const toolsButtonRef = useRef<HTMLButtonElement>(null);

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const toolsCurrent = TOOLS.some((tool) => isCurrent(tool.href));

  useEffect(() => {
    if (!toolsOpen) return;

    function onPointerDown(event: PointerEvent) {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) setToolsOpen(false);
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setToolsOpen(false);
      toolsButtonRef.current?.focus();
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [toolsOpen]);

  return (
    <>
      {/* The top padding is the safe-area inset: with `viewport-fit: cover` (see app/layout.tsx) it holds
          the bar's contents below the notch, and in a normal browser tab it resolves to 0. */}
      <header className='sticky top-0 z-10 border-b border-brand-strong bg-brand pt-[env(safe-area-inset-top)] text-ink-inverse'>
        <a
          href='#main'
          className='sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-[calc(1rem+env(safe-area-inset-top))] focus:z-40 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink focus:outline-ink'
        >
          Bỏ qua điều hướng
        </a>

        <div className='mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6'>
          <Link href='/' className='flex shrink-0 items-center gap-2'>
            <span className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-surface'>
              <Image src='/brand/art-ledger-mark.png' alt='' width={256} height={222} priority className='h-5 w-auto' />
            </span>
            <span className='text-[17px] font-semibold tracking-tight text-ink-inverse'>ArtLedger</span>
          </Link>

          {/* The flat bar only appears from `lg`: five pills plus the wallet cluster need ~840px
              with a connected wallet, which `md` (768px) does not have. Tablets keep the tab bar. */}
          <nav aria-label='Chính' className='hidden min-w-0 flex-1 items-center gap-1 lg:flex'>
            {PRIMARY.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={isCurrent(href) ? 'page' : undefined} className={NAV_LINK}>
                {label}
              </Link>
            ))}

            <div ref={toolsRef} className='relative'>
              <button
                ref={toolsButtonRef}
                type='button'
                aria-expanded={toolsOpen}
                aria-haspopup='true'
                onClick={() => setToolsOpen((open) => !open)}
                className={`inline-flex h-8 items-center gap-1 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-ink-inverse ${
                  toolsCurrent
                    ? 'bg-accent font-semibold text-ink-inverse'
                    : 'text-ink-inverse/80 hover:bg-surface/15 hover:text-ink-inverse focus-visible:text-ink-inverse'
                }`}
              >
                Công cụ
                <ChevronDown aria-hidden size={16} strokeWidth={2} />
              </button>

              {toolsOpen ? (
                <div className='absolute left-0 top-full z-30 mt-1.5 w-60 rounded-card border border-hairline bg-surface p-1.5 shadow-overlay'>
                  {TOOLS.map(({ href, label, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setToolsOpen(false)}
                      aria-current={isCurrent(href) ? 'page' : undefined}
                      className='flex h-9 items-center gap-2.5 rounded-control px-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-ink-inverse'
                    >
                      <Icon aria-hidden size={16} strokeWidth={2} />
                      {label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </nav>

          <div className='ml-auto flex min-w-0 items-center gap-2'>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Outside the sticky bar on purpose: the header must stay exactly 56px so the sticky toolbar
          (`top-14`) and the sticky asides (`lg:top-20`) still clear it while this banner is shown.
          DESIGN.md 7.8 already places the banner in the flow rather than in the sticky layer. */}
      <NetworkBanner />

      <nav
        aria-label='Chính'
        className='fixed inset-x-0 bottom-0 z-10 border-t border-brand-strong bg-brand pb-[env(safe-area-inset-bottom)] lg:hidden'
      >
        <ul className='grid grid-cols-5'>
          {PRIMARY.map(({ href, label, Icon }) => {
            const tabLabel = TAB_LABELS[href] ?? label;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isCurrent(href) ? 'page' : undefined}
                  aria-label={tabLabel === label ? undefined : label}
                  className='flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium leading-tight text-ink-inverse/80 transition-colors focus-visible:text-ink-inverse focus-visible:outline-ink-inverse aria-[current=page]:m-1.5 aria-[current=page]:h-11 aria-[current=page]:rounded-control aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-ink-inverse'
                >
                  <Icon aria-hidden size={24} strokeWidth={2} />
                  <span className='whitespace-nowrap'>{tabLabel}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type='button'
              onClick={() => setSheetOpen(true)}
              aria-haspopup='dialog'
              className='flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-ink-inverse/80 transition-colors focus-visible:text-ink-inverse focus-visible:outline-ink-inverse'
            >
              <Wrench aria-hidden size={24} strokeWidth={2} />
              Thêm
            </button>
          </li>
        </ul>
      </nav>

      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} title='Thêm'>
        <ul className='divide-y divide-hairline'>
          {TOOLS.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link href={href} onClick={() => setSheetOpen(false)} className='flex min-h-14 items-center gap-3 text-sm font-medium text-ink'>
                <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand'>
                  <Icon aria-hidden size={20} strokeWidth={2} />
                </span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}