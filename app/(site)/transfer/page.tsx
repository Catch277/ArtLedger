'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArtworkThumb } from '@/components/artwork/ArtworkThumb';
import { PageHeader } from '@/components/layout/PageHeader';
import { useWallet } from '@/components/providers/WalletProvider';
import { Banner } from '@/components/ui/Banner';
import { NETWORK_BANNER_ID } from '@/components/wallet/NetworkBanner';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { HashChip } from '@/components/ui/HashChip';
import { Modal } from '@/components/ui/Modal';
import { StatusPill } from '@/components/ui/StatusPill';
import { explorerTxUrl } from '@/lib/domain/config/sepolia';
import type { LibraryItem } from '@/lib/domain/entities/LibraryItem';
import { isWalletAddress, sameAddress, shortenAddress } from '@/lib/domain/types/address';
import { contractAddress, deployBlock, sepoliaRpcUrl } from '@/lib/infrastructure/config/env';
import { GatewayIpfsReader } from '@/lib/infrastructure/ipfs/GatewayIpfsReader';
import { JsonRpcArtworkQueryGateway } from '@/lib/infrastructure/web3/JsonRpcArtworkQueryGateway';
import { MetamaskArtworkWriteGateway } from '@/lib/infrastructure/web3/MetamaskArtworkWriteGateway';
import { GetArtworkOwnerUseCase } from '@/lib/usecases/GetArtworkOwnerUseCase';
import { GetArtworkPreviewUseCase } from '@/lib/usecases/GetArtworkPreviewUseCase';
import { TransferArtworkUseCase } from '@/lib/usecases/TransferArtworkUseCase';

const CONTROL =
  'mt-1 h-10 w-full rounded-control border border-hairline-strong bg-surface px-3 shadow-card text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

function makeQuery(): JsonRpcArtworkQueryGateway {
  return new JsonRpcArtworkQueryGateway(sepoliaRpcUrl(), contractAddress(), deployBlock());
}

export default function TransferPage() {
  const { address, isSepolia, isInstalled } = useWallet();
  const [tokenInput, setTokenInput] = useState('');
  const [checked, setChecked] = useState<{ tokenId: string; owner: string } | null>(null);
  const [preview, setPreview] = useState<LibraryItem | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<{ tokenId: string; txHash: string; recipient: string } | null>(null);

  // Bumped on every check: a slow IPFS read for an older token id must never land on a newer one.
  const lookupSeq = useRef(0);
  const isOwner = Boolean(checked && address && sameAddress(checked.owner, address));

  // The artwork is decoration and the verdict is the decision, so this runs after `checkOwner` and never
  // feeds back into `checking`. `seq` guards the state: a read for an older token id must not land later.
  function loadPreview(tokenId: string) {
    const seq = ++lookupSeq.current;
    setPreview(null);
    setPreviewLoading(true);
    void new GetArtworkPreviewUseCase(makeQuery(), new GatewayIpfsReader())
      .execute(tokenId)
      .then((item) => {
        if (seq === lookupSeq.current) setPreview(item);
      })
      .catch(() => {
        if (seq === lookupSeq.current) setPreview(null);
      })
      .finally(() => {
        if (seq === lookupSeq.current) setPreviewLoading(false);
      });
  }

  async function checkOwner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const seq = ++lookupSeq.current;
    setChecking(true);
    setLookupError(null);
    setChecked(null);
    setPreview(null);
    setPreviewLoading(false);
    setResult(null);
    try {
      // Verdict first, artwork second: the gate on the transfer button must not wait on an IPFS gateway.
      const output = await new GetArtworkOwnerUseCase(makeQuery()).execute(tokenInput);
      if (seq !== lookupSeq.current) return;
      setChecked({ tokenId: output.tokenId, owner: output.owner });
      loadPreview(output.tokenId);
    } catch (caught) {
      if (seq === lookupSeq.current) {
        setLookupError(caught instanceof Error ? caught.message : 'Không đọc được chủ sở hữu.');
      }
    } finally {
      setChecking(false);
    }
  }

  function requestTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    if (!checked) {
      setError('Kiểm tra Token ID trước khi chuyển nhượng.');
      return;
    }
    if (!address || !isSepolia) {
      setError('Kết nối ví trên Sepolia để chuyển nhượng.');
      return;
    }
    if (!isWalletAddress(recipient.trim())) {
      setError('Địa chỉ ví nhận không hợp lệ. Dùng địa chỉ 0x… gồm 40 ký tự hex.');
      return;
    }
    setConfirmOpen(true);
  }

  async function runTransfer() {
    if (!checked || !address) return;
    setBusy(true);
    setError(null);
    try {
      const output = await new TransferArtworkUseCase(
        makeQuery(),
        new MetamaskArtworkWriteGateway(sepoliaRpcUrl(), contractAddress()),
      ).execute({ tokenId: checked.tokenId, recipient, from: address });
      setResult({ tokenId: output.tokenId, txHash: output.txHash, recipient: output.recipient });
      setConfirmOpen(false);
      setRecipient('');
      const refreshed = await new GetArtworkOwnerUseCase(makeQuery()).execute(checked.tokenId).catch(() => null);
      if (refreshed) setChecked({ tokenId: refreshed.tokenId, owner: refreshed.owner });
    } catch (caught) {
      setConfirmOpen(false);
      setError(caught instanceof Error ? caught.message : 'Không chuyển nhượng được.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow='Chuyển nhượng'
        title='Chuyển nhượng tác phẩm'
        description='Chỉ chủ sở hữu mới chuyển được NFT. Giao dịch được mô phỏng trước, và không thể hoàn tác sau khi ký.'
      />

      {!isInstalled ? (
        <Banner variant='pending'>
          <span className='font-semibold'>Chưa tìm thấy MetaMask.</span> Cài tiện ích để chuyển nhượng tác phẩm.
        </Banner>
      ) : null}

      <div className='mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12'>
        <div className='space-y-6'>
          <Card>
            <CardHeader title='Bước 1 · Tìm tác phẩm' />
            <form onSubmit={checkOwner} className='flex flex-wrap items-end gap-3'>
              <label className='block grow'>
                <span className='text-xs font-semibold text-ink'>Token ID</span>
                <input
                  value={tokenInput}
                  onChange={(event) => setTokenInput(event.target.value)}
                  inputMode='numeric'
                  placeholder='1'
                  className={`${CONTROL} font-mono`}
                />
              </label>
              <Button type='submit' variant='secondary' disabled={checking}>
                {checking ? 'Đang kiểm tra…' : 'Kiểm tra chủ sở hữu'}
              </Button>
            </form>

            {lookupError ? (
              <div className='mt-4'>
                <Banner variant='failed'>
                  <span className='font-semibold'>Không đọc được tác phẩm.</span> {lookupError}
                </Banner>
              </div>
            ) : null}

            {checked ? (
              <div className='mt-4 flex items-start gap-4 rounded-control bg-surface-muted p-4'>
                {previewLoading ? (
                  <div aria-hidden className='h-20 w-20 shrink-0 animate-pulse rounded-control bg-surface' />
                ) : (
                  <ArtworkThumb
                    item={preview}
                    alt={preview?.metadata?.name ?? `Token #${checked.tokenId}`}
                    sizes='80px'
                    className='h-20 w-20 shrink-0'
                  />
                )}
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='font-mono text-xs text-ink-muted'>Token #{checked.tokenId}</span>
                    <StatusPill tone={isOwner ? 'verified' : 'pending'}>
                      {isOwner ? 'Bạn là chủ sở hữu' : 'Không phải chủ sở hữu'}
                    </StatusPill>
                  </div>
                  {preview?.metadata ? (
                    <p className='mt-1 truncate text-sm font-semibold' title={preview.metadata.name}>
                      {preview.metadata.name}
                    </p>
                  ) : null}
                  <p className='mt-1 text-sm text-ink-muted'>
                    Chủ sở hữu hiện tại: <span className='font-mono text-ink'>{shortenAddress(checked.owner)}</span>
                  </p>
                </div>
              </div>
            ) : null}
          </Card>

          <Card>
            <CardHeader title='Bước 2 · Người nhận' />
            <form onSubmit={requestTransfer} className='space-y-4'>
              <label className='block'>
                <span className='text-xs font-semibold text-ink'>Địa chỉ ví nhận</span>
                <input
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  placeholder='0x…'
                  className={`${CONTROL} font-mono`}
                />
                <span className='mt-1 block text-xs text-ink-muted'>
                  Kiểm tra kỹ: giao dịch chuyển nhượng không thể hoàn tác.
                </span>
              </label>

              {error ? (
                <Banner variant='failed'>
                  <span className='font-semibold'>Không chuyển nhượng được.</span> {error}
                </Banner>
              ) : null}

              {result ? (
                <Banner variant='verified'>
                  <span className='font-semibold'>Đã ghi lên chuỗi.</span> Token #{result.tokenId} đã thuộc về{' '}
                  <span className='font-mono'>{shortenAddress(result.recipient)}</span>.
                  <div className='mt-3'>
                    <HashChip label='tx' value={result.txHash} />
                  </div>
                  <a
                    href={explorerTxUrl(result.txHash)}
                    target='_blank'
                    rel='noreferrer'
                    className='mt-2 inline-block text-xs font-semibold text-brand underline-offset-4 hover:underline'
                  >
                    Xem trên Etherscan
                  </a>
                </Banner>
              ) : null}

              <div className='mt-6 flex flex-wrap justify-end gap-3 border-t border-hairline pt-4'>
                <Button type='submit' disabled={!isOwner || !isSepolia || busy} aria-describedby={!isSepolia ? NETWORK_BANNER_ID : undefined}>
                  Chuyển nhượng
                </Button>
              </div>
              {checked && !isOwner ? (
                <p className='text-right text-xs text-ink-muted'>Nút bị khoá vì ví hiện tại không phải chủ sở hữu.</p>
              ) : null}
            </form>
          </Card>
        </div>

        <aside className='space-y-4 lg:sticky lg:top-[calc(5rem+env(safe-area-inset-top))] lg:self-start'>
          <Card>
            <CardHeader title='Tác phẩm' />
            {checked && previewLoading ? (
              <div aria-hidden className='aspect-square w-full animate-pulse rounded-control bg-surface-muted' />
            ) : checked ? (
              <ArtworkThumb
                item={preview}
                alt={preview?.metadata?.name ?? `Token #${checked.tokenId}`}
                sizes='(min-width: 1024px) 312px, 100vw'
                className='aspect-square w-full'
              />
            ) : (
              <div className='flex aspect-square w-full items-center justify-center rounded-control bg-surface-muted px-6 text-center text-xs text-ink-muted'>
                Ảnh tác phẩm sẽ hiện ở đây.
              </div>
            )}

            <p className='mt-4 text-base font-semibold leading-tight tracking-tight'>
              {!checked
                ? '—'
                : preview?.metadata?.name ?? (previewLoading ? 'Đang tải tác phẩm…' : `Token #${checked.tokenId}`)}
            </p>
            {preview?.metadata ? <p className='mt-0.5 text-xs text-ink-muted'>{preview.metadata.author}</p> : null}
            {preview?.metadataError ? (
              <div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1'>
                <p className='text-xs text-ink-muted'>{preview.metadataError}</p>
                <Button
                  type='button'
                  variant='link'
                  size='sm'
                  onClick={() => {
                    if (checked) loadPreview(checked.tokenId);
                  }}
                >
                  Tải lại ảnh
                </Button>
              </div>
            ) : null}
            <p className='mt-3 font-mono text-sm tabular-nums'>#{checked?.tokenId ?? '—'}</p>
            <p className='mt-1 text-xs text-ink-muted'>Token ERC-721 trên Sepolia</p>
            {checked ? (
              <div className='mt-3 space-y-3'>
                <HashChip label='chủ' value={checked.owner} display={shortenAddress(checked.owner)} />
                <Link
                  href={`/verify?tokenId=${checked.tokenId}`}
                  className='inline-block text-xs font-semibold text-brand underline-offset-4 hover:underline'
                >
                  Xem chi tiết trên trang tra cứu
                </Link>
              </div>
            ) : null}
          </Card>

          <Card>
            <CardHeader title='Thay đổi' />
            <dl className='space-y-2 text-sm'>
              <div>
                <dt className='text-xs font-semibold text-ink-muted'>Từ</dt>
                <dd className='font-mono text-xs'>{address ? shortenAddress(address) : '—'}</dd>
              </div>
              <div>
                <dt className='text-xs font-semibold text-ink-muted'>Đến</dt>
                <dd className='font-mono text-xs'>{recipient ? shortenAddress(recipient) : '—'}</dd>
              </div>
            </dl>
            <p className='mt-4 rounded-control bg-warn-soft px-3 py-2 text-xs text-ink'>
              Sau khi xác nhận, quyền sở hữu chuyển vĩnh viễn và không thể hoàn tác.
            </p>
          </Card>
        </aside>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title='Xác nhận chuyển nhượng'
        description='Giao dịch này không thể hoàn tác.'
        blocking
        footer={
          <>
            <Button variant='secondary' onClick={() => setConfirmOpen(false)} disabled={busy}>
              Hủy
            </Button>
            <Button variant='destructive' onClick={() => void runTransfer()} disabled={busy}>
              {busy ? 'Đang xử lý…' : 'Ký và chuyển'}
            </Button>
          </>
        }
      >
        <div className='flex items-center gap-3'>
          {previewLoading ? (
            <div aria-hidden className='h-14 w-14 shrink-0 animate-pulse rounded-control bg-surface-muted' />
          ) : (
            <ArtworkThumb
              item={preview}
              alt={preview?.metadata?.name ?? `Token #${checked?.tokenId ?? '—'}`}
              sizes='56px'
              className='h-14 w-14 shrink-0'
            />
          )}
          <div className='min-w-0'>
            <p className='truncate text-sm font-semibold'>
              {preview?.metadata?.name ?? `Token #${checked?.tokenId ?? '—'}`}
            </p>
            <p className='font-mono text-xs tabular-nums text-ink-muted'>#{checked?.tokenId ?? '—'}</p>
          </div>
        </div>
        <dl className='mt-4 space-y-2 text-sm'>
          <div className='flex justify-between gap-3'>
            <dt className='text-ink-muted'>Người nhận</dt>
            <dd className='font-mono text-xs'>{recipient ? shortenAddress(recipient) : '—'}</dd>
          </div>
        </dl>
      </Modal>
    </>
  );
}