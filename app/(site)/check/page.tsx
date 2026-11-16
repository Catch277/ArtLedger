'use client';

import Link from 'next/link';
import { ScanLine } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { HashChip } from '@/components/ui/HashChip';
import { VerdictBanner } from '@/components/ui/VerdictBanner';
import { IMAGE_ACCEPT, validateImageFile } from '@/lib/domain/config/upload';
import { contractAddress, deployBlock, sepoliaRpcUrl } from '@/lib/infrastructure/config/env';
import { WebCryptoSha256 } from '@/lib/infrastructure/crypto/WebCryptoSha256';
import { GatewayIpfsReader } from '@/lib/infrastructure/ipfs/GatewayIpfsReader';
import { JsonRpcArtworkQueryGateway } from '@/lib/infrastructure/web3/JsonRpcArtworkQueryGateway';
import { CheckImageIntegrityUseCase } from '@/lib/usecases/CheckImageIntegrityUseCase';
import type { CheckImageIntegrityOutput } from '@/lib/usecases/CheckImageIntegrityUseCase';

function groupHash(value: string): string[] {
  return value.match(/.{1,8}/g) ?? [];
}

function Fingerprint({ title, value, compareTo }: { title: string; value: string | null; compareTo?: string | null }) {
  const groups = value ? groupHash(value) : [];
  const other = compareTo ? groupHash(compareTo) : [];
  const diffs = groups.filter((group, index) => other[index] !== undefined && group !== other[index]).length;

  return (
    <section className='rounded-card border border-hairline bg-surface p-6 shadow-card'>
      <div className='flex items-center justify-between gap-3'>
        <h2 className='text-base font-semibold leading-tight'>{title}</h2>
        {compareTo ? (
          <span className='font-mono text-[11px] tabular-nums text-ink-muted'>
            {diffs}/{groups.length} nhóm lệch
          </span>
        ) : null}
      </div>
      {value ? (
        <>
          <div className='mt-4 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-xs tabular-nums sm:grid-cols-4'>
            {groups.map((group, index) => {
              const differs = other[index] !== undefined && group !== other[index];
              return (
                <span key={`${group}-${index}`} className={differs ? 'rounded-sm bg-danger-soft font-semibold' : undefined}>
                  {group}
                  {differs ? <span className='sr-only'> lệch</span> : null}
                </span>
              );
            })}
          </div>
          <div className='mt-3'>
            <HashChip value={value} />
          </div>
        </>
      ) : (
        <p className='mt-4 text-sm text-ink-muted'>Chưa có dấu vân tay để so sánh.</p>
      )}
    </section>
  );
}

export default function CheckPage() {
  const gateway = useMemo(
    () => new JsonRpcArtworkQueryGateway(sepoliaRpcUrl(), contractAddress(), deployBlock()),
    [],
  );
  const ipfs = useMemo(() => new GatewayIpfsReader(), []);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckImageIntegrityOutput | null>(null);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    void (async () => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const digest = await new WebCryptoSha256().sha256(bytes);
      if (!cancelled) setHash(digest);
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  function handleFile(next: File | null) {
    setFileError(null);
    setError(null);
    setResult(null);
    setHash(null);
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
    setFile(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    if (!file) {
      setFileError('Chọn một ảnh để kiểm tra.');
      return;
    }
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      setResult(await new CheckImageIntegrityUseCase(new WebCryptoSha256(), gateway, ipfs).execute(bytes));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không kiểm tra được ảnh.');
    } finally {
      setBusy(false);
    }
  }

  const matched = result?.matches[0] ?? null;

  return (
    <>
      <PageHeader
        eyebrow='Kiểm tra ảnh'
        title='Kiểm tra tính toàn vẹn'
        description='Ảnh được băm ngay trên máy bạn rồi so với dấu vân tay SHA-256 trong metadata của các tác phẩm đã đăng ký.'
      />

      <div className='mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-12'>
        <div className='space-y-6'>
          <Card>
            <CardHeader title='Tệp cần kiểm tra' />
            <form onSubmit={submit} className='space-y-4'>
              <label className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-panel border-2 border-dashed border-hairline bg-surface-muted px-4 py-12 text-center transition-colors hover:border-hairline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand'>
                <ScanLine aria-hidden size={24} strokeWidth={2} className='text-brand' />
                <span className='text-sm font-medium text-ink'>{file ? file.name : 'Chọn ảnh'}</span>
                <span className='text-xs text-ink-muted'>PNG, JPG, WEBP hoặc GIF · tối đa 4 MB</span>
                <input
                  type='file'
                  accept={IMAGE_ACCEPT}
                  onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                  className='sr-only'
                />
              </label>

              {fileError ? (
                <p role='alert' className='rounded-control bg-danger-soft px-3 py-2 text-xs text-ink'>
                  {fileError}
                </p>
              ) : null}

              {hash ? <HashChip label='SHA-256' value={hash} /> : null}

              <div className='flex justify-end border-t border-hairline pt-4'>
                <Button type='submit' disabled={busy}>
                  {busy ? 'Đang đối chiếu…' : 'Đối chiếu với sổ đăng ký'}
                </Button>
              </div>
            </form>
          </Card>

          {error ? (
            <Banner variant='failed'>
              <span className='font-semibold'>Không kiểm tra được ảnh.</span> {error}
            </Banner>
          ) : null}
        </div>

        <div className='space-y-4'>
          {result ? (
            <VerdictBanner
              state={matched ? 'verified' : 'failed'}
              title={
                matched
                  ? `Mã băm khớp với Token #${matched.tokenId} — ${matched.name}.`
                  : 'Mã băm không khớp với bản đã đăng ký — tệp có thể đã bị chỉnh sửa.'
              }
            >
              {matched ? (
                <Link
                  href={`/verify?tokenId=${matched.tokenId}`}
                  className='font-semibold text-brand underline underline-offset-4'
                >
                  Mở Token #{matched.tokenId}
                </Link>
              ) : (
                <span>Đã so với {result.checked} tác phẩm trên chuỗi.</span>
              )}
            </VerdictBanner>
          ) : null}

          {result ? (
            <div className='grid gap-4'>
              <Fingerprint
                title='Bản đã đăng ký'
                value={matched ? result.sha256 : null}
                compareTo={matched ? result.sha256 : null}
              />
              <Fingerprint title='Tệp bạn tải lên' value={result.sha256} compareTo={matched ? result.sha256 : null} />
            </div>
          ) : (
            <Card>
              <p className='text-sm leading-6 text-ink-muted'>
                Kết quả đối chiếu sẽ hiện ở đây: kết luận trước, hai dấu vân tay chia thành 8 nhóm để bạn tự kiểm tra.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}