'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArtworkCard } from '@/components/artwork/ArtworkCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import type { LibraryItem } from '@/lib/domain/entities/LibraryItem';
import { contractAddress, deployBlock, sepoliaRpcUrl } from '@/lib/infrastructure/config/env';
import { GatewayIpfsReader } from '@/lib/infrastructure/ipfs/GatewayIpfsReader';
import { JsonRpcArtworkQueryGateway } from '@/lib/infrastructure/web3/JsonRpcArtworkQueryGateway';
import { ListLibraryUseCase } from '@/lib/usecases/ListLibraryUseCase';

const PREVIEW_SIZE = 4;

type LoadState = 'loading' | 'ready' | 'error';

/**
 * The registry's shop window: the newest real tokens, read from Sepolia.
 * There is no price on chain, so this is a preview of the library, never a listing.
 */
export function MarketPreview() {
  const gateway = useMemo(
    () => new JsonRpcArtworkQueryGateway(sepoliaRpcUrl(), contractAddress(), deployBlock()),
    [],
  );
  const ipfs = useMemo(() => new GatewayIpfsReader(), []);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [needsSetup, setNeedsSetup] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    setNeedsSetup(false);
    try {
      const result = await new ListLibraryUseCase(gateway, ipfs).execute({ limit: PREVIEW_SIZE });
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

  return (
    <div>
      <SectionHeader
        eyebrow='Chợ tác phẩm'
        title='Tác phẩm vừa lên sổ'
        description='Bốn tác phẩm mới nhất trong sổ đăng ký, đọc thẳng từ hợp đồng trên Sepolia. Đây là bản xem trước thư viện: hợp đồng chưa có giá hay lệnh bán, nên không có giao dịch mua bán nào ở đây.'
        action={
          <Button as={Link} href='/library' variant='secondary'>
            Xem cả thư viện
          </Button>
        }
      />

      {state === 'loading' ? (
        <div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className='h-72 animate-pulse rounded-card border border-hairline bg-surface-muted' />
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
        <div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {items.map((item) => (
            <ArtworkCard key={item.tokenId} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
