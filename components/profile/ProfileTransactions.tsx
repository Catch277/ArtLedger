'use client';

import Link from 'next/link';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { explorerTxUrl } from '@/lib/domain/config/sepolia';
import { formatMoment } from '@/lib/domain/format/moment';
import { formatWeiToEth } from '@/lib/domain/format/wei';
import { shortenAddress } from '@/lib/domain/types/address';
import type { WalletTransaction } from '@/lib/domain/entities/WalletTransaction';

type TransactionsState = 'loading' | 'ready' | 'error';

const KIND_LABEL: Record<WalletTransaction['kind'], string> = {
  mint: 'Đăng ký',
  received: 'Nhận',
  sent: 'Chuyển đi',
  self: 'Tự chuyển',
};

const KIND_ICON: Record<WalletTransaction['kind'], typeof Plus> = {
  mint: Plus,
  received: ArrowDownLeft,
  sent: ArrowUpRight,
  self: ArrowRight,
};

/** Fees are a few hundred-thousandths of an ETH; four digits would round every row to 0. */
function formatFee(transaction: WalletTransaction): string {
  if (transaction.feeWei === null) return '—';
  return formatWeiToEth(transaction.feeWei, 6);
}

function counterpartyLabel(transaction: WalletTransaction): string {
  return transaction.kind === 'mint' ? 'Tạo mới' : shortenAddress(transaction.counterparty);
}

function feeHint(transaction: WalletTransaction): string | null {
  if (transaction.feeWei === null) return 'Không đọc được biên lai.';
  return transaction.feePaidByWallet ? null : 'người gửi trả';
}

export function ProfileTransactions({
  transactions,
  totalFeeWei,
  paidCount,
  feeCount,
  state,
  error,
  needsSetup,
  onRefresh,
}: {
  transactions: WalletTransaction[];
  totalFeeWei: string;
  paidCount: number;
  feeCount: number;
  state: TransactionsState;
  error: string | null;
  needsSetup: boolean;
  onRefresh: () => void;
}) {
  return (
    <section className='mt-12'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <p className='eyebrow'>Hoạt động</p>
          <h2 className='mt-3 text-2xl font-normal tracking-tight sm:text-3xl'>Giao dịch của ví này</h2>
          <p className='mt-2 text-sm text-ink-muted'>
            {state === 'ready'
              ? `${transactions.length} giao dịch · ${
                  paidCount > 0
                    ? `tổng phí đã trả ${formatWeiToEth(totalFeeWei, 6)} ETH`
                    : 'ví chưa tự trả phí giao dịch nào'
                }`
              : 'Đọc từ log Transfer của hợp đồng trên Sepolia; phí gas lấy từ biên lai, không phải ước lượng.'}
          </p>
          {state === 'ready' && feeCount < transactions.length ? (
            <p className='mt-2 text-xs text-ink-muted'>
              Chỉ đọc phí của 25 giao dịch mới nhất; các dòng cũ hơn không có số phí.
            </p>
          ) : null}
        </div>
        <Button variant='secondary' size='sm' onClick={onRefresh} disabled={state === 'loading'}>
          <RefreshCw aria-hidden size={16} strokeWidth={2} />
          {state === 'loading' ? 'Đang tải…' : 'Làm mới'}
        </Button>
      </div>

      {state === 'loading' ? (
        <div className='mt-6 overflow-hidden rounded-card border border-hairline bg-surface'>
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className='h-14 animate-pulse border-t border-hairline bg-surface-muted first:border-t-0' />
          ))}
        </div>
      ) : null}

      {state === 'error' ? (
        <div className='mt-6 rounded-card border border-hairline bg-surface p-6'>
          <p className='text-base font-semibold text-ink'>
            {needsSetup ? 'Chưa cấu hình hợp đồng.' : 'Không đọc được giao dịch.'}
          </p>
          <p className='mt-2 text-sm leading-6 text-ink-muted'>
            {needsSetup
              ? 'Đặt NEXT_PUBLIC_CONTRACT_ADDRESS trong .env.local rồi tải lại trang.'
              : error ?? 'Sepolia có thể đang bận. Thử lại sau vài giây.'}
          </p>
          <Button variant='secondary' size='sm' className='mt-4' onClick={onRefresh}>
            <RefreshCw aria-hidden size={16} strokeWidth={2} />
            Thử lại
          </Button>
        </div>
      ) : null}

      {state === 'ready' && transactions.length === 0 ? (
        <div className='mt-6'>
          <EmptyState
            title='Ví này chưa có giao dịch nào'
            description='Đăng ký hoặc nhận chuyển nhượng một tác phẩm để lịch sử xuất hiện ở đây.'
            action={
              <Button as={Link} href='/register'>
                Đăng ký tác phẩm
              </Button>
            }
          />
        </div>
      ) : null}

      {state === 'ready' && transactions.length > 0 ? (
        <div className='mt-6 overflow-x-auto rounded-card border border-hairline bg-surface shadow-card'>
          <table className='hidden w-full text-left md:table'>
            <caption className='sr-only'>Giao dịch của ví với hợp đồng TacPhamNFT trên Sepolia</caption>
            <thead className='bg-surface-muted text-xs font-bold text-ink-muted'>
              <tr>
                <th scope='col' className='px-4 py-2.5'>Giao dịch</th>
                <th scope='col' className='px-4 py-2.5'>Đối tác</th>
                <th scope='col' className='px-4 py-2.5'>Thời điểm</th>
                <th scope='col' className='px-4 py-2.5 text-right'>Phí (ETH)</th>
                <th scope='col' className='px-4 py-2.5 text-right'>Mã tx</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const Icon = KIND_ICON[transaction.kind];
                const hint = feeHint(transaction);
                return (
                  <tr key={transaction.txHash} className='h-14 border-t border-hairline hover:bg-canvas'>
                    <td className='px-4'>
                      <Link
                        href={`/verify?tokenId=${transaction.tokenId}`}
                        className='inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-offset-4 hover:underline'
                      >
                        <Icon aria-hidden size={16} strokeWidth={2} className='text-ink-muted' />
                        {KIND_LABEL[transaction.kind]}
                        <span className='font-mono text-xs text-ink-muted'>#{transaction.tokenId}</span>
                      </Link>
                    </td>
                    <td className='px-4 font-mono text-xs text-ink-muted'>{counterpartyLabel(transaction)}</td>
                    <td className='px-4 font-mono text-xs tabular-nums text-ink-muted'>
                      {formatMoment(transaction.blockTimestamp)}
                    </td>
                    <td className='px-4 text-right'>
                      <span className='font-mono text-sm tabular-nums'>{formatFee(transaction)}</span>
                      {hint ? <span className='block text-[11px] text-ink-muted'>{hint}</span> : null}
                    </td>
                    <td className='px-4 text-right'>
                      <a
                        href={explorerTxUrl(transaction.txHash)}
                        target='_blank'
                        rel='noreferrer'
                        className='font-mono text-xs text-brand underline-offset-4 hover:underline'
                      >
                        {shortenAddress(transaction.txHash)}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <ul className='md:hidden'>
            {transactions.map((transaction) => {
              const Icon = KIND_ICON[transaction.kind];
              const hint = feeHint(transaction);
              return (
                <li key={transaction.txHash} className='border-t border-hairline px-4 py-3 first:border-t-0'>
                  <div className='flex items-start justify-between gap-3'>
                    <Link
                      href={`/verify?tokenId=${transaction.tokenId}`}
                      className='inline-flex items-center gap-1.5 text-sm font-medium text-ink'
                    >
                      <Icon aria-hidden size={16} strokeWidth={2} className='text-ink-muted' />
                      {KIND_LABEL[transaction.kind]}
                      <span className='font-mono text-xs text-ink-muted'>#{transaction.tokenId}</span>
                    </Link>
                    <span className='shrink-0 text-right'>
                      <span className='block font-mono text-sm tabular-nums'>{formatFee(transaction)}</span>
                      {hint ? <span className='block text-[11px] text-ink-muted'>{hint}</span> : null}
                    </span>
                  </div>
                  <p className='mt-1 text-xs text-ink-muted'>
                    {formatMoment(transaction.blockTimestamp)} ·{' '}
                    <span className='font-mono'>{counterpartyLabel(transaction)}</span>
                  </p>
                  <a
                    href={explorerTxUrl(transaction.txHash)}
                    target='_blank'
                    rel='noreferrer'
                    className='mt-1 inline-block text-xs font-medium text-brand underline-offset-4 hover:underline'
                  >
                    Xem trên Etherscan
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

    </section>
  );
}
