'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArtworkCard } from '@/components/artwork/ArtworkCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import type { LibraryItem } from '@/lib/domain/entities/LibraryItem';
import { contractAddress, deployBlock, sepoliaRpcUrl } from '@/lib/infrastructure/config/env';
import { GatewayIpfsReader } from '@/lib/infrastructure/ipfs/GatewayIpfsReader';
import { JsonRpcArtworkQueryGateway } from '@/lib/infrastructure/web3/JsonRpcArtworkQueryGateway';
import { ListLibraryUseCase } from '@/lib/usecases/ListLibraryUseCase';

const PAGE_SIZE = 8;

type LoadState = 'loading' | 'ready' | 'error';

/**
 * The registry's shop window: the newest real tokens, read from Sepolia, eight per page.
 * There is no price on chain, so this is a preview of the library, never a listing.
 */
export function MarketPreview() {
  const gateway = useMemo(
    () => new JsonRpcArtworkQueryGateway(sepoliaRpcUrl(), contractAddress(), deployBlock()),
    [],
  );
  const ipfs = useMemo(() => new GatewayIpfsReader(), []);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [needsSetup, setNeedsSetup] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setState('loading');
    setNeedsSetup(false);
    setPage(1);
    try {
      const result = await new ListLibraryUseCase(gateway, ipfs).execute();
      setItems(result);
      setState('ready');
    } catch (caught) {
      setNeedsSetup(caught instanceof ContractNotConfiguredError);
      setState('error');
    }
  }, [gateway, ipfs]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  const visible = items.slice(start, start + PAGE_SIZE);

  function goTo(next: number) {
    const clamped = Math.min(Math.max(1, next), pageCount);
    if (clamped === page) return;
    setPage(clamped);
    // Eight cards are taller than a phone screen, so the next page has to start at the section top
    // instead of leaving the reader at the footer. `scroll-mt` on the root clears the sticky header.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sectionRef.current?.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  return (
    <div ref={sectionRef} className='scroll-mt-[calc(3.5rem+env(safe-area-inset-top))]'>
      <SectionHeader
        eyebrow='Chợ tác phẩm'
        title='Tác phẩm vừa lên sổ'
        description='Tám tác phẩm mới nhất mỗi trang, đọc thẳng từ hợp đồng trên Sepolia. Đây là bản xem trước thư viện: hợp đồng chưa có giá hay lệnh bán, nên không có giao dịch mua bán nào ở đây.'
        action={
          <Button as={Link} href='/library' variant='secondary'>
            Xem cả thư viện
          </Button>
        }
      />

      {state === 'loading' ? (
        <div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Eight tiles make a 2 400px grey wall on a phone; the four visible ones match what a
              narrow viewport shows of the real grid. */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((key) => (
            <div
              key={key}
              className={`h-72 animate-pulse rounded-card border border-hairline bg-surface-muted ${
                key >= 4 ? 'hidden sm:block' : ''
              }`}
            />
          ))}
        </div>
      ) : null}

      {state === 'error' ? (
        <div className='mt-8 rounded-card border border-hairline bg-surface p-6'>
          <p className='text-base font-semibold text-ink'>
            {needsSetup ? 'Chưa cấu hình hợp đồng.' : 'Không tải được tác phẩm.'}
          </p>
          <p className='mt-2 text-sm leading-6 text-ink-muted'>
            {needsSetup
              ? 'Đặt NEXT_PUBLIC_CONTRACT_ADDRESS trong .env.local rồi tải lại trang.'
              : 'Sepolia có thể đang bận hoặc RPC đã hết lượt gọi. Thử lại sau vài giây.'}
          </p>
          <Button variant='secondary' size='sm' onClick={() => void load()} className='mt-4'>
            Thử lại
          </Button>
        </div>
      ) : null}

      {state === 'ready' && items.length === 0 ? (
        <div className='mt-8'>
          <EmptyState
            title='Sổ đăng ký đang trống'
            description='Tác phẩm đầu tiên được đăng ký sẽ xuất hiện ngay ở đây, kèm ảnh và mã băm của nó.'
            action={
              <Button as={Link} href='/register'>
                Đăng ký tác phẩm
              </Button>
            }
          />
        </div>
      ) : null}

      {state === 'ready' && items.length > 0 ? (
        <>
          <div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {visible.map((item) => (
              <ArtworkCard key={item.tokenId} item={item} />
            ))}
          </div>
          {pageCount > 1 ? (
            <Pagination className='mt-8' page={safePage} pageCount={pageCount} onChange={goTo} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
