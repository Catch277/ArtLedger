'use client';

import Link from 'next/link';
import { ImageUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { StepProgress } from '@/components/flow/StepProgress';
import { PageHeader } from '@/components/layout/PageHeader';
import { useWallet } from '@/components/providers/WalletProvider';
import { Banner } from '@/components/ui/Banner';
import { NETWORK_BANNER_ID } from '@/components/wallet/NetworkBanner';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { HashChip } from '@/components/ui/HashChip';
import { explorerTxUrl } from '@/lib/domain/config/sepolia';
import { IMAGE_ACCEPT, validateImageFile } from '@/lib/domain/config/upload';
import { ArtworkUriAlreadyUsedError } from '@/lib/domain/errors/ArtworkUriAlreadyUsedError';
import type { RegistrationStep } from '@/lib/domain/entities/RegistrationStep';
import { shortenAddress } from '@/lib/domain/types/address';
import { contractAddress, deployBlock, sepoliaRpcUrl } from '@/lib/infrastructure/config/env';
import { WebCryptoSha256 } from '@/lib/infrastructure/crypto/WebCryptoSha256';
import { ApiRouteIpfsPinner } from '@/lib/infrastructure/ipfs/ApiRouteIpfsPinner';
import { JsonRpcArtworkQueryGateway } from '@/lib/infrastructure/web3/JsonRpcArtworkQueryGateway';
import { MetamaskArtworkWriteGateway } from '@/lib/infrastructure/web3/MetamaskArtworkWriteGateway';
import { RegisterArtworkUseCase } from '@/lib/usecases/RegisterArtworkUseCase';
import type { RegisterArtworkOutput } from '@/lib/usecases/RegisterArtworkUseCase';

const CONTROL =
  'mt-1 w-full rounded-control border border-hairline-strong bg-surface px-3 shadow-card text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

export default function RegisterPage() {
  const { address, isSepolia, isInstalled } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [sha256, setSha256] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<RegistrationStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicateToken, setDuplicateToken] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterArtworkOutput | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    void (async () => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const hash = await new WebCryptoSha256().sha256(bytes);
      if (!cancelled) setSha256(hash);
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  function handleFile(next: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setFileError(null);
    setResult(null);
    setError(null);
    setSha256(null);
    setPreview(null);
    if (!next) {
      setFile(null);
      return;
    }
    const problem = validateImageFile(next);
    if (problem) {
      setFileError(problem);
      setFile(null);
      return;
    }
    const objectUrl = URL.createObjectURL(next);
    previewUrlRef.current = objectUrl;
    setPreview(objectUrl);
    setFile(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDuplicateToken(null);
    setResult(null);
    if (!file) {
      setFileError('Chọn một ảnh trước khi đăng ký.');
      return;
    }
    if (!address || !isSepolia) {
      setError('Kết nối ví trên Sepolia để đăng ký tác phẩm.');
      return;
    }
    setBusy(true);
    setStep(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const useCase = new RegisterArtworkUseCase(
        new WebCryptoSha256(),
        new ApiRouteIpfsPinner(),
        new MetamaskArtworkWriteGateway(sepoliaRpcUrl(), contractAddress()),
        new JsonRpcArtworkQueryGateway(sepoliaRpcUrl(), contractAddress(), deployBlock()),
      );
      const output = await useCase.execute(
        {
          file: { bytes, filename: file.name, contentType: file.type },
          name,
          author,
          description: description.trim().length > 0 ? description : undefined,
          year: year.trim().length > 0 ? Number(year) : undefined,
          from: address,
        },
        setStep,
      );
      setResult(output);
    } catch (caught) {
      if (caught instanceof ArtworkUriAlreadyUsedError && caught.tokenId) setDuplicateToken(caught.tokenId);
      setError(caught instanceof Error ? caught.message : 'Không đăng ký được tác phẩm.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow='Đăng ký'
        title='Đăng ký tác phẩm'
        description='Tải ảnh lên, lưu IPFS và đúc NFT (mint) trong bốn bước. Giao dịch luôn được mô phỏng trước khi mở MetaMask.'
      />

      {!isInstalled ? (
        <Banner variant='pending'>
          <span className='font-semibold'>Chưa tìm thấy MetaMask.</span> Cài tiện ích để kết nối ví và đăng ký tác phẩm.
        </Banner>
      ) : null}

      <div className='mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12'>
        <div className='space-y-6'>
          <div className='lg:hidden'>
            <StepProgress step={step} failed={Boolean(error)} />
          </div>

          <Card>
            <CardHeader title='Thông tin tác phẩm' action={sha256 ? <HashChip label='SHA-256' value={sha256} /> : undefined} />

            <form onSubmit={submit} className='space-y-5'>
              <div>
                <label className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-hairline bg-surface-muted px-4 py-8 text-center focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand'>
                  <ImageUp aria-hidden size={24} strokeWidth={2} className='text-brand' />
                  <span className='text-sm font-semibold text-ink'>{file ? file.name : 'Chọn ảnh tác phẩm'}</span>
                  <span className='text-xs text-ink-muted'>PNG, JPG, WEBP hoặc GIF · tối đa 4 MB</span>
                  <input
                    type='file'
                    accept={IMAGE_ACCEPT}
                    onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                    className='sr-only'
                  />
                </label>
                {fileError ? (
                  <p className='mt-2 rounded-control bg-danger-soft px-3 py-2 text-xs text-ink' role='alert'>
                    {fileError}
                  </p>
                ) : null}
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <label className='block'>
                  <span className='text-xs font-semibold text-ink'>Tên tác phẩm</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={100}
                    required
                    className={`${CONTROL} h-11`}
                  />
                  <span className='mt-1 block text-xs text-ink-muted'>Tối đa 100 ký tự.</span>
                </label>
                <label className='block'>
                  <span className='text-xs font-semibold text-ink'>Tác giả</span>
                  <input
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                    maxLength={100}
                    required
                    className={`${CONTROL} h-11`}
                  />
                  <span className='mt-1 block text-xs text-ink-muted'>Tên hiển thị trong metadata.</span>
                </label>
              </div>

              <label className='block'>
                <span className='text-xs font-semibold text-ink'>Năm sáng tác</span>
                <input
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  inputMode='numeric'
                  placeholder='2026'
                  className={`${CONTROL} h-11`}
                />
              </label>

              <label className='block'>
                <span className='text-xs font-semibold text-ink'>Mô tả</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={500}
                  rows={3}
                  className={`${CONTROL} p-3`}
                />
                <span className='mt-1 block text-xs text-ink-muted'>{description.length}/500 ký tự.</span>
              </label>

              {error ? (
                <Banner variant='failed'>
                  <span className='font-semibold'>Không đăng ký được tác phẩm.</span> {error}
                  {duplicateToken ? (
                    <p className='mt-2'>
                      <Link href={`/verify?tokenId=${duplicateToken}`} className='font-semibold underline underline-offset-4'>
                        Mở Token #{duplicateToken}
                      </Link>
                    </p>
                  ) : null}
                </Banner>
              ) : null}

              {result ? (
                <Banner variant='verified'>
                  <span className='font-semibold'>Đã ghi lên chuỗi.</span> Token #{result.tokenId ?? '—'} đã được đúc trên Sepolia.
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {result.tokenId ? (
                      <Button as={Link} href={`/verify?tokenId=${result.tokenId}`} size='sm'>
                        Xem tác phẩm
                      </Button>
                    ) : null}
                    <Button as='a' href={explorerTxUrl(result.txHash)} target='_blank' rel='noreferrer' variant='secondary' size='sm'>
                      Xem trên Etherscan
                    </Button>
                  </div>
                  <div className='mt-3 flex flex-col gap-2'>
                    <HashChip label='tokenURI' value={result.tokenUri} />
                    <HashChip label='SHA-256' value={result.sha256} />
                  </div>
                </Banner>
              ) : null}

              <div className='mt-6 flex flex-wrap justify-end gap-3 border-t border-hairline pt-4'>
                <Button type='submit' disabled={busy || !address || !isSepolia} aria-describedby={!isSepolia ? NETWORK_BANNER_ID : undefined}>
                  {busy ? 'Đang xử lý…' : 'Đăng ký tác phẩm'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <aside className='space-y-4 lg:sticky lg:top-[calc(5rem+env(safe-area-inset-top))] lg:self-start'>
          <Card>
            <CardHeader title='Tiến trình' />
            <div className='hidden lg:block'>
              <StepProgress step={step} failed={Boolean(error)} orientation='vertical' />
            </div>
            <div className='mt-4 flex min-h-32 items-center justify-center overflow-hidden rounded-control bg-surface-muted p-3'>
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt='Xem trước tác phẩm' className='max-h-56 w-full rounded-control object-cover' />
              ) : (
                <p className='px-4 text-center text-xs text-ink-muted'>Ảnh xem trước sẽ hiện ở đây.</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title='Tóm tắt' />
            <dl className='space-y-2 text-sm'>
              <div className='flex justify-between gap-3'>
                <dt className='text-ink-muted'>Tên</dt>
                <dd className='truncate font-semibold'>{name || '—'}</dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-ink-muted'>Tác giả</dt>
                <dd className='truncate font-semibold'>{author || '—'}</dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-ink-muted'>Năm</dt>
                <dd className='font-semibold tabular-nums'>{year || '—'}</dd>
              </div>
              <div className='flex justify-between gap-3'>
                <dt className='text-ink-muted'>Ví nhận</dt>
                <dd className='font-mono text-xs'>{address ? shortenAddress(address) : '—'}</dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>
    </>
  );
}