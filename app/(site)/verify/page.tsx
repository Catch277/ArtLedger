'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArtworkImage } from '@/components/artwork/ArtworkImage';
import { TransferTimeline } from '@/components/artwork/TransferTimeline';
import { PageHeader } from '@/components/layout/PageHeader';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { HashChip } from '@/components/ui/HashChip';
import { StatusPill } from '@/components/ui/StatusPill';
import { Tabs } from '@/components/ui/Tabs';
import { VerdictBanner } from '@/components/ui/VerdictBanner';
import { useHash } from '@/components/ui/useHash';
import { explorerAddressUrl, explorerTokenUrl } from '@/lib/domain/config/sepolia';
import { contractAddress, deployBlock, sepoliaRpcUrl } from '@/lib/infrastructure/config/env';
import { GatewayIpfsReader } from '@/lib/infrastructure/ipfs/GatewayIpfsReader';
import { JsonRpcArtworkQueryGateway } from '@/lib/infrastructure/web3/JsonRpcArtworkQueryGateway';
import { VerifyArtworkUseCase } from '@/lib/usecases/VerifyArtworkUseCase';
import type { VerifyArtworkOutput } from '@/lib/usecases/VerifyArtworkUseCase';

const TABS = [
  { id: 'metadata', label: 'Siêu dữ liệu' },
  { id: 'lich-su', label: 'Lịch sử chuyển nhượng' },
] as const;

export default function VerifyPage() {
  const gateway = useMemo(
    () => new JsonRpcArtworkQueryGateway(sepoliaRpcUrl(), contractAddress(), deployBlock()),
    [],
  );
  const ipfs = useMemo(() => new GatewayIpfsReader(), []);
  const hash = useHash();
  const active = hash === '#lich-su' ? 'lich-su' : 'metadata';
  const [input, setInput] = useState('');
  const [result, setResult] = useState<VerifyArtworkOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(
    async (rawTokenId: string) => {
      const tokenId = rawTokenId.trim();
      if (tokenId.length === 0) {
        setError('Nhập Token ID để tra cứu.');
        return;
      }
      setBusy(true);
      setError(null);
      setResult(null);
      try {
        setResult(await new VerifyArtworkUseCase(gateway, ipfs).execute(tokenId));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Không tra cứu được tác phẩm.');
      } finally {
        setBusy(false);
      }
    },
    [gateway, ipfs],
  );

  useEffect(() => {
    const tokenId = new URLSearchParams(window.location.search).get('tokenId');
    if (!tokenId) return;
    void (async () => {
      setInput(tokenId);
      await lookup(tokenId);
    })();
  }, [lookup]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void lookup(input);
  }

  const notRegistered = error !== null && error.includes('chưa được đăng ký');

  return (
    <>
      <PageHeader
        eyebrow='Tra cứu'
        title='Tra cứu & xác thực'
        description='Nhập Token ID để đọc chủ sở hữu, metadata IPFS và toàn bộ lịch sử chuyển nhượng. Không cần kết nối ví.'
        actions={
          <form onSubmit={submit} className='flex items-end gap-2'>
            <label className='block'>
              <span className='text-xs font-semibold text-ink'>Token ID</span>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                inputMode='numeric'
                placeholder='1'
                className='mt-1 h-10 w-40 rounded-control border border-hairline-strong bg-surface px-3 shadow-card font-mono text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
              />
            </label>
            <Button type='submit' disabled={busy}>
              {busy ? 'Đang tra cứu…' : 'Tra cứu'}
            </Button>
          </form>
        }
      />

      <div className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12'>
        {notRegistered ? <VerdictBanner state='unregistered' title={error ?? ''} /> : null}

        {error && !notRegistered ? (
          <Banner variant='failed'>
            <span className='font-semibold'>Không tra cứu được.</span> {error}
          </Banner>
        ) : null}

        {busy ? <div className='mt-6 h-40 animate-pulse rounded-card border border-hairline bg-surface-muted' /> : null}

        {!result && !error && !busy ? (
          <EmptyState
            title='Nhập Token ID để bắt đầu'
            description='Kết quả hiển thị chủ sở hữu hiện tại, metadata trên IPFS và timeline chuyển nhượng.'
            action={
              <Button as={Link} href='/library' variant='secondary'>
                Xem thư viện
              </Button>
            }
          />
        ) : null}

        {result ? (
          <div className='space-y-6'>
            <VerdictBanner
              state='verified'
              title={`Token #${result.tokenId} thuộc về ví bên dưới, ghi nhận bởi hợp đồng trên Sepolia.`}
            >
              <HashChip label='chủ sở hữu' value={result.owner} />
            </VerdictBanner>

            <div className='grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start'>
              <div className='space-y-4 lg:sticky lg:top-20'>
                <article className='overflow-hidden rounded-card border border-hairline bg-surface shadow-card'>
                  <div className='relative aspect-square bg-surface-muted'>
                    {result.metadata ? (
                      <ArtworkImage
                        uri={result.metadata.image}
                        alt={result.metadata.name ?? `Token #${result.tokenId}`}
                        sizes='360px'
                      />
                    ) : (
                      <div className='flex h-full items-center justify-center px-4 text-center text-xs text-ink-muted'>
                        Không tải được ảnh
                      </div>
                    )}
                  </div>
                  <div className='p-4'>
                    <h2 className='text-lg leading-tight'>
                      {result.metadata?.name ?? 'Không đọc được metadata'}
                    </h2>
                    <p className='mt-1 text-xs text-ink-muted'>{result.metadata?.author ?? '—'}</p>
                    <div className='mt-3 flex items-center justify-between gap-2'>
                      <span className='font-mono text-xs tabular-nums text-ink-muted'>#{result.tokenId}</span>
                      <StatusPill tone='verified'>Đã xác thực</StatusPill>
                    </div>
                  </div>
                </article>

                <Card>
                  <CardHeader title='Chủ sở hữu' />
                  <a
                    href={explorerAddressUrl(result.owner)}
                    target='_blank'
                    rel='noreferrer'
                    className='break-all font-mono text-xs text-brand underline-offset-4 hover:underline'
                  >
                    {result.owner}
                  </a>
                  <div className='mt-3'>
                    <HashChip label='ví' value={result.owner} />
                  </div>
                </Card>
              </div>

              <div>
                <Tabs tabs={[...TABS]} active={active} label='Chi tiết tác phẩm' />

                <div id={active} role='tabpanel' aria-labelledby={'tab-' + active} className='mt-4'>
                  {active === 'metadata' ? (
                    <Card>
                      <dl className='grid gap-4 sm:grid-cols-2'>
                        <div>
                          <dt className='text-xs font-semibold text-ink-muted'>Tên tác phẩm</dt>
                          <dd className='mt-1 text-sm'>{result.metadata?.name ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className='text-xs font-semibold text-ink-muted'>Tác giả</dt>
                          <dd className='mt-1 text-sm'>{result.metadata?.author ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className='text-xs font-semibold text-ink-muted'>Năm sáng tác</dt>
                          <dd className='mt-1 text-sm tabular-nums'>{result.metadata?.year ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className='text-xs font-semibold text-ink-muted'>tokenURI</dt>
                          <dd className='mt-1'><HashChip value={result.tokenUri} /></dd>
                        </div>
                        <div className='sm:col-span-2'>
                          <dt className='text-xs font-semibold text-ink-muted'>Mô tả</dt>
                          <dd className='mt-1 text-sm leading-6'>{result.metadata?.description ?? '—'}</dd>
                        </div>
                        <div className='sm:col-span-2'>
                          <dt className='text-xs font-semibold text-ink-muted'>Dấu vân tay SHA-256</dt>
                          <dd className='mt-1'>
                            {result.metadata?.sha256 ? (
                              <HashChip value={result.metadata.sha256} />
                            ) : (
                              <span className='text-sm text-ink-muted'>Không có trong metadata.</span>
                            )}
                          </dd>
                        </div>
                      </dl>

                      {result.metadataError ? (
                        <div id={active} role='tabpanel' aria-labelledby={'tab-' + active} className='mt-4'>
                          <Banner variant='pending'>
                            <span className='font-semibold'>Metadata chưa đọc được.</span> {result.metadataError}
                          </Banner>
                        </div>
                      ) : null}
                    </Card>
                  ) : (
                    <Card>
                      {result.transfersError ? (
                        <Banner variant='pending'>
                          <span className='font-semibold'>Không tải được lịch sử.</span> {result.transfersError}
                        </Banner>
                      ) : (
                        <TransferTimeline transfers={result.transfers} emptyLabel='Chưa có giao dịch chuyển nhượng.' />
                      )}
                    </Card>
                  )}
                </div>

                <div className='mt-4 flex flex-wrap gap-4 text-xs font-semibold text-brand'>
                  <a
                    href={explorerTokenUrl(contractAddress(), result.tokenId)}
                    target='_blank'
                    rel='noreferrer'
                    className='underline-offset-4 hover:underline'
                  >
                    Xem trên Etherscan
                  </a>
                  <a href={result.metadataUrl} target='_blank' rel='noreferrer' className='underline-offset-4 hover:underline'>
                    Metadata trên IPFS
                  </a>
                  <Link href='/transfer' className='underline-offset-4 hover:underline'>
                    Chuyển nhượng
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}