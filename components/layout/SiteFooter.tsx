import Image from 'next/image';
import Link from 'next/link';
import { contractAddress } from '@/lib/infrastructure/config/env';
import { SEPOLIA_CHAIN_ID, explorerAddressUrl } from '@/lib/domain/config/sepolia';

const LINKS = [
  { href: '/library', label: 'Thư viện' },
  { href: '/register', label: 'Đăng ký' },
  { href: '/transfer', label: 'Chuyển nhượng' },
  { href: '/verify', label: 'Tra cứu' },
  { href: '/profile', label: 'Hồ sơ' },
  { href: '/check', label: 'Kiểm tra ảnh' },
  { href: '/lab', label: 'Phòng thí nghiệm' },
] as const;

export function SiteFooter() {
  const address = contractAddress();

  return (
    <footer className='border-t border-brand-strong bg-brand text-ink-inverse'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between'>
        <div className='max-w-xs'>
          <Link href='/' className='inline-flex items-center gap-2'>
            <span className='inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-surface'>
              <Image src='/brand/art-ledger-mark.png' alt='' width={256} height={222} className='h-4 w-auto' />
            </span>
            <span className='text-sm font-semibold tracking-tight text-ink-inverse'>ArtLedger</span>
          </Link>
          <p className='mt-3 flex items-center gap-2 font-mono text-[11px] text-ink-inverse/80'>
            <span aria-hidden className='h-1.5 w-1.5 rounded-full bg-accent' />
            sepolia · chainId {SEPOLIA_CHAIN_ID}
          </p>
          <p className='mt-2 text-xs leading-5 text-ink-inverse/80'>
            Sổ đăng ký tác phẩm số: NFT ERC-721 trên Sepolia, tệp và metadata lưu trên IPFS.
          </p>
        </div>

        <nav aria-label='Chân trang' className='flex flex-wrap gap-x-5 gap-y-2'>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className='text-sm text-ink-inverse/80 transition-colors hover:text-ink-inverse focus-visible:text-ink-inverse focus-visible:outline-ink-inverse pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center'
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className='space-y-2 text-xs text-ink-inverse/80'>
          {address.length > 0 ? (
            <a
              className='block font-mono text-ink-inverse underline-offset-4 hover:underline focus-visible:outline-ink-inverse'
              href={explorerAddressUrl(address)}
              target='_blank'
              rel='noreferrer'
            >
              {address.slice(0, 10)}…{address.slice(-6)}
            </a>
          ) : null}
          <p>Demo học tập · không lưu khoá bí mật.</p>
        </div>
      </div>
    </footer>
  );
}