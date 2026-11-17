'use client';

import { FlaskConical, ShieldCheck, ShieldX } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useWallet } from '@/components/providers/WalletProvider';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';
import { Tooltip } from '@/components/ui/Tooltip';
import { isWalletAddress } from '@/lib/domain/types/address';
import type { ViolationScenario } from '@/lib/domain/entities/ViolationScenario';
import { contractAddress, deployBlock, sepoliaRpcUrl } from '@/lib/infrastructure/config/env';
import { JsonRpcArtworkQueryGateway } from '@/lib/infrastructure/web3/JsonRpcArtworkQueryGateway';
import { MetamaskArtworkWriteGateway } from '@/lib/infrastructure/web3/MetamaskArtworkWriteGateway';
import { SimulateViolationUseCase } from '@/lib/usecases/SimulateViolationUseCase';

const CONTROL =
  'mt-1 h-10 w-full rounded-control border border-hairline-strong bg-surface px-3 shadow-card font-mono text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

interface LogEntry {
  id: number;
  at: number;
  scenario: ViolationScenario;
  applicable: boolean;
  blocked: boolean;
  reason: string | null;
  tokenId: string | null;
}

function makeQuery(): JsonRpcArtworkQueryGateway {
  return new JsonRpcArtworkQueryGateway(sepoliaRpcUrl(), contractAddress(), deployBlock());
}

function formatTime(at: number): string {
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(at));
}

export default function LabPage() {
  const { address } = useWallet();
  const [actor, setActor] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [busy, setBusy] = useState<ViolationScenario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  const effectiveActor = actor.length > 0 ? actor : (address ?? '');

  async function run(scenario: ViolationScenario) {
    setError(null);
    if (!isWalletAddress(effectiveActor)) {
      setError('Nhập địa chỉ ví hợp lệ (0x… gồm 40 ký tự hex) để mô phỏng.');
      return;
    }
    setBusy(scenario);
    try {
      const result = await new SimulateViolationUseCase(
        makeQuery(),
        new MetamaskArtworkWriteGateway(sepoliaRpcUrl(), contractAddress()),
      ).execute({ scenario, actor: effectiveActor, tokenId: tokenId.trim().length > 0 ? tokenId.trim() : undefined });
      setLog((previous) =>
        [
          {
            id: Date.now(),
            at: Date.now(),
            scenario: result.scenario,
            applicable: result.applicable,
            blocked: result.blocked,
            reason: result.reason,
            tokenId: result.tokenId,
          },
          ...previous,
        ].slice(0, 50),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không mô phỏng được.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow='Phòng thí nghiệm'
        title='Mô phỏng vi phạm'
        description='Hai kịch bản dưới đây chỉ gọi eth_call: không tốn gas, không cần chữ ký và không thay đổi gì trên chuỗi.'
      />

      <div className='mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12'>
        <div className='space-y-6'>
          <Card>
            <CardHeader title='Đối tượng mô phỏng' />
            <div className='grid gap-4 sm:grid-cols-2'>
              <label className='block'>
                <span className='text-xs font-semibold text-ink'>Ví đóng vai người thực hiện</span>
                <input
                  value={effectiveActor}
                  onChange={(event) => setActor(event.target.value)}
                  placeholder='0x…'
                  className={CONTROL}
                />
              </label>
              <label className='block'>
                <span className='text-xs font-semibold text-ink'>Token ID (tuỳ chọn)</span>
                <input
                  value={tokenId}
                  onChange={(event) => setTokenId(event.target.value)}
                  inputMode='numeric'
                  placeholder='Mặc định: token mới nhất'
                  className={CONTROL}
                />
              </label>
            </div>
            <p className='mt-3 text-xs leading-6 text-ink-muted'>
              Mỗi lần chạy là một{' '}
              <Tooltip label='eth_call đọc kết quả của hợp đồng mà không ghi giao dịch, nên không tốn gas.'>
                <code className='rounded-sm bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] text-ink'>eth_call</code>
              </Tooltip>{' '}
              — không ghi gì lên chuỗi.
            </p>
          </Card>

          {error ? (
            <Banner variant='failed'>
              <span className='font-semibold'>Không mô phỏng được.</span> {error}
            </Banner>
          ) : null}

          <div className='grid gap-4 sm:grid-cols-2'>
            <Card>
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-control bg-brand-soft text-brand'>
                <FlaskConical aria-hidden size={20} strokeWidth={2} />
              </span>
              <p className='mt-4 font-mono text-xs text-ink-muted'>S1 · Mint trùng</p>
              <h2 className='mt-1 text-lg leading-tight'>Đăng ký lại một tokenURI đã tồn tại</h2>
              <p className='mt-2 text-sm leading-6 text-ink-muted'>
                Hợp đồng phải từ chối trước khi ví mở hộp thoại ký, nên bản trùng không tốn gas.
              </p>
              <Button className='mt-4' variant='secondary' onClick={() => void run('duplicate-mint')} disabled={busy !== null}>
                {busy === 'duplicate-mint' ? 'Đang mô phỏng…' : 'Chạy kịch bản S1'}
              </Button>
            </Card>

            <Card>
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-control bg-brand-soft text-brand'>
                <ShieldX aria-hidden size={20} strokeWidth={2} />
              </span>
              <p className='mt-4 font-mono text-xs text-ink-muted'>S2 · Chuyển nhượng trái phép</p>
              <h2 className='mt-1 text-lg leading-tight'>Chuyển NFT từ ví không phải chủ sở hữu</h2>
              <p className='mt-2 text-sm leading-6 text-ink-muted'>
                Nếu ví đóng vai là chủ sở hữu thật, lệnh sẽ hợp lệ và hệ thống báo “được chấp nhận”.
              </p>
              <Button className='mt-4' variant='secondary' onClick={() => void run('unauthorized-transfer')} disabled={busy !== null}>
                {busy === 'unauthorized-transfer' ? 'Đang mô phỏng…' : 'Chạy kịch bản S2'}
              </Button>
            </Card>
          </div>
        </div>

        <aside className='lg:sticky lg:top-[calc(5rem+env(safe-area-inset-top))] lg:self-start'>
          <Card>
            <CardHeader
              title='Nhật ký revert'
              action={
                log.length > 0 ? (
                  <Button variant='ghost' size='sm' onClick={() => setLog([])}>
                    Xóa nhật ký
                  </Button>
                ) : undefined
              }
            />
            <div role='log' aria-live='polite' className='rounded-control bg-surface-muted p-3 font-mono text-xs'>
              {log.length === 0 ? (
                <p className='font-sans text-sm text-ink-muted'>Chưa có lần mô phỏng nào.</p>
              ) : (
                <ol className='space-y-2'>
                  {log.map((entry) => (
                    <li key={entry.id} className='rounded bg-surface p-2'>
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <span className='tabular-nums text-ink-muted'>{formatTime(entry.at)}</span>
                        <StatusPill tone={entry.blocked ? 'failed' : 'verified'}>
                          {entry.blocked ? 'Bị từ chối' : 'Được chấp nhận'}
                        </StatusPill>
                      </div>
                      <p className='mt-1 font-sans text-xs font-semibold text-ink'>
                        {entry.scenario === 'duplicate-mint' ? 'S1 · Mint trùng' : 'S2 · Chuyển nhượng trái phép'}
                        {entry.tokenId ? <span className='ml-1 font-mono font-normal text-ink-muted'>#{entry.tokenId}</span> : null}
                      </p>
                      <p className='mt-1 break-words text-[11px] leading-5 text-ink-muted'>
                        {entry.applicable ? (entry.reason ?? 'Không có lý do revert từ hợp đồng.') : 'Chưa có tác phẩm nào để mô phỏng.'}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <p className='mt-3 flex items-center gap-2 text-xs text-ink-muted'>
              <ShieldCheck aria-hidden size={16} strokeWidth={2} />
              Mọi kết quả ở đây chỉ là kết quả eth_call, không ghi lên chuỗi.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}