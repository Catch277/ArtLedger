'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Grid2X2, List, RefreshCw } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { ArtworkCard } from '@/components/artwork/ArtworkCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListCell } from '@/components/ui/ListCell';
import { StatusPill } from '@/components/ui/StatusPill';
import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import type { LibraryItem } from '@/lib/domain/entities/LibraryItem';
import { contractAddress, deployBlock, sepoliaRpcUrl } from '@/lib/infrastructure/config/env';
import { GatewayIpfsReader } from '@/lib/infrastructure/ipfs/GatewayIpfsReader';
import { JsonRpcArtworkQueryGateway } from '@/lib/infrastructure/web3/JsonRpcArtworkQueryGateway';
import { ListLibraryUseCase } from '@/lib/usecases/ListLibraryUseCase';

const PAGE_SIZE = 24;

type LoadState = 'loading' | 'ready' | 'error';
type View = 'grid' | 'table';

export default function LibraryPage() {
  return (
    <>
      <PageHeader
        eyebrow='Sổ đăng ký'
        title='Thư viện'
        description='Toàn bộ tác phẩm đã đăng ký trên Sepolia. Đọc trực tiếp từ hợp đồng, không cần kết nối ví.'
      />
      <Suspense fallback={<LibrarySkeleton />}>
        <LibraryBrowser />
      </Suspense>
    </>
  );
}

function LibrarySkeleton() {
  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className='h-72 animate-pulse rounded-card border border-hairline bg-surface-muted' />
        ))}
      </div>
    </div>
  );
}

function LibraryBrowser() {
  const searchParams = useSearchParams();
  const gateway = useMemo(
    () => new JsonRpcArtworkQueryGateway(sepoliaRpcUrl(), contractAddress(), deployBlock()),
    [],
  );
  const ipfs = useMemo(() => new GatewayIpfsReader(), []);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [term, setTerm] = useState('');
  const [view, setView] = useState<View>('grid');
  const [page, setPage] = useState(() => {
    const raw = Number(searchParams.get('page') ?? '1');
    return Number.isInteger(raw) && raw > 0 ? raw : 1;
  });

  const load = useCallback(async () => {
    setState('loading');
    setError(null);
    setNeedsSetup(false);
    try {
      const result = await new ListLibraryUseCase(gateway, ipfs).execute();
      setItems(result);
      setState('ready');
    } catch (caught) {
      setNeedsSetup(caught instanceof ContractNotConfiguredError);
      setError(caught instanceof Error ? caught.message : 'Không tải được thư viện.');
      setState('error');
    }
  }, [gateway, ipfs]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const needle = term.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (needle.length === 0) return true;
    const name = item.metadata?.name.toLowerCase() ?? '';
    const author = item.metadata?.author.toLowerCase() ?? '';
    return item.tokenId.includes(needle) || name.includes(needle) || author.includes(needle);
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  function goTo(next: number) {
    const clamped = Math.min(Math.max(1, next), pageCount);
    setPage(clamped);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(clamped));
    window.history.replaceState(null, '', `/library?${params.toString()}`);
  }

  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12'>
      <section className='sticky top-14 z-[5] -mx-4 border-b border-hairline bg-surface px-4 py-4 sm:-mx-6 sm:px-6'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='font-mono text-[11px] tabular-nums text-ink-muted'>
            {state === 'ready' ? `${filtered.length} tác phẩm` : 'Đang đếm tác phẩm…'}
          </p>
          <div className='flex flex-wrap items-center gap-2'>
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder='Tìm theo tên, tác giả hoặc Token ID'
              aria-label='Tìm tác phẩm'
              className='h-10 w-full rounded-full border border-hairline bg-surface px-4 text-sm shadow-card transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-72'
            />
            <div className='flex items-center gap-1 rounded-full border border-hairline bg-surface p-1'>
              <button
                type='button'
                aria-pressed={view === 'grid'}
                onClick={() => setView('grid')}
                aria-label='Xem dạng lưới'
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  view === 'grid' ? 'bg-ink/[0.06] text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Grid2X2 aria-hidden size={18} strokeWidth={2} />
              </button>
              <button
                type='button'
                aria-pressed={view === 'table'}
                onClick={() => setView('table')}
                aria-label='Xem dạng bảng'
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  view === 'table' ? 'bg-ink/[0.06] text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <List aria-hidden size={18} strokeWidth={2} />
              </button>
            </div>
            <Button variant='secondary' size='sm' onClick={() => void load()} disabled={state === 'loading'}>
              <RefreshCw aria-hidden size={16} strokeWidth={2} />
              {state === 'loading' ? 'Đang tải…' : 'Làm mới'}
            </Button>
          </div>
        </div>
      </section>

      {error ? (
        <div className='mt-6'>
          <Banner variant={needsSetup ? 'neutral' : 'failed'}>
            <span className='font-semibold'>{needsSetup ? 'Chưa cấu hình hợp đồng.' : 'Không tải được thư viện.'}</span> {error}
          </Banner>
        </div>
      ) : null}

      {state === 'loading' ? (
        <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className='h-72 animate-pulse rounded-card border border-hairline bg-surface-muted' />
          ))}
        </div>
      ) : null}

      {state === 'ready' && items.length === 0 ? (
        <div className='mt-6'>
          <EmptyState
            title='Thư viện chưa có tác phẩm nào'
            description='Đăng ký tác phẩm đầu tiên để bắt đầu sổ đăng ký trên Sepolia.'
            action={<Button as={Link} href='/register'>Đăng ký tác phẩm</Button>}
          />
        </div>
      ) : null}

      {state === 'ready' && items.length > 0 && filtered.length === 0 ? (
        <div className='mt-6'>
          <EmptyState title='Không tìm thấy kết quả nào' description='Thử từ khoá khác hoặc xoá ô tìm kiếm.' />
        </div>
      ) : null}

      {visible.length > 0 ? (
        <>
          {view === 'grid' ? (
            <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {visible.map((item) => (
                <ArtworkCard key={item.tokenId} item={item} />
              ))}
            </div>
          ) : (
            <div className='mt-6 overflow-hidden rounded-card border border-hairline bg-surface'>
              <table className='hidden w-full text-left text-sm sm:table'>
                <caption className='sr-only'>Tác phẩm đã đăng ký</caption>
                <thead className='bg-surface-muted font-mono text-[11px] text-ink-muted'>
                  <tr>
                    <th scope='col' className='px-4 py-3'>Tác phẩm</th>
                    <th scope='col' className='px-4 py-3'>Tác giả</th>
                    <th scope='col' className='px-4 py-3 text-right'>Token</th>
                    <th scope='col' className='px-4 py-3'>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => (
                    <tr key={item.tokenId} className='border-t border-hairline transition-colors hover:bg-ink/[0.03]'>
                      <td className='px-4 py-4'>
                        <Link href={`/verify?tokenId=${item.tokenId}`} className='font-medium text-ink hover:text-brand'>
                          {item.metadata?.name ?? 'Không đọc được metadata'}
                        </Link>
                      </td>
                      <td className='px-4 py-4 text-ink-muted'>{item.metadata?.author ?? '—'}</td>
                      <td className='px-4 py-4 text-right font-mono tabular-nums'>#{item.tokenId}</td>
                      <td className='px-4 py-4'><StatusPill tone='verified'>Đã đăng ký</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className='sm:hidden'>
                {visible.map((item) => (
                  <ListCell
                    key={item.tokenId}
                    href={`/verify?tokenId=${item.tokenId}`}
                    title={item.metadata?.name ?? 'Không đọc được metadata'}
                    description={item.metadata?.author ?? item.metadataError ?? '—'}
                    detail={`#${item.tokenId}`}
                    media={<span className='font-mono text-xs'>#{item.tokenId}</span>}
                  />
                ))}
              </div>
            </div>
          )}

          <nav aria-label='Phân trang' className='mt-6 flex flex-wrap items-center justify-between gap-3'>
            <p className='text-xs tabular-nums text-ink-muted'>
              Hiển thị {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} / {filtered.length}
            </p>
            <div className='flex items-center gap-2'>
              <Button variant='secondary' size='sm' onClick={() => goTo(safePage - 1)} disabled={safePage <= 1}>
                Trước
              </Button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).slice(0, 7).map((number) => (
                <Link
                  key={number}
                  href={`/library?page=${number}`}
                  onClick={(event) => {
                    event.preventDefault();
                    goTo(number);
                  }}
                  aria-current={number === safePage ? 'page' : undefined}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-xs font-medium tabular-nums transition-colors ${
                    number === safePage ? 'bg-ink/[0.06] text-ink' : 'text-ink-muted hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  {number}
                </Link>
              ))}
              <Button variant='secondary' size='sm' onClick={() => goTo(safePage + 1)} disabled={safePage >= pageCount}>
                Sau
              </Button>
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}