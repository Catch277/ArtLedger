import { explorerTxUrl } from '@/lib/domain/config/sepolia';
import { formatMoment } from '@/lib/domain/format/moment';
import { ZERO_ADDRESS, shortenAddress } from '@/lib/domain/types/address';
import type { TransferRecord } from '@/lib/domain/entities/TransferRecord';

export function TransferTimeline({ transfers, emptyLabel }: { transfers: TransferRecord[]; emptyLabel: string }) {
  if (transfers.length === 0) {
    return <p className='text-sm text-ink-muted'>{emptyLabel}</p>;
  }

  return (
    <ol className='relative ml-2 border-l-2 border-hairline pl-5'>
      {transfers.map((transfer, index) => {
        const isMint = transfer.from.toLowerCase() === ZERO_ADDRESS;
        const isCurrent = index === transfers.length - 1;

        return (
          <li key={`${transfer.txHash}-${index}`} className='relative pb-5 last:pb-0'>
            <span
              aria-hidden
              className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full ${isMint ? 'bg-brand' : 'bg-accent'} ${
                isCurrent ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : ''
              }`}
            />
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <p className='text-sm font-medium'>
                {isMint ? 'Mint' : 'Chuyển nhượng'}
                {isCurrent ? <span className='ml-2 font-mono text-[11px] font-normal text-accent-ink'>chủ hiện tại</span> : null}
              </p>
              <p className='font-mono text-xs tabular-nums text-ink-muted'>{formatMoment(transfer.blockTimestamp)}</p>
            </div>
            <p className='mt-1 text-xs text-ink-muted'>
              {isMint ? 'Tạo mới' : `Từ ${shortenAddress(transfer.from)}`} →{' '}
              <span className='font-mono'>{shortenAddress(transfer.to)}</span>
            </p>
            <a
              href={explorerTxUrl(transfer.txHash)}
              target='_blank'
              rel='noreferrer'
              className='mt-1 inline-block text-xs font-medium text-brand underline-offset-4 hover:underline'
            >
              Xem trên Etherscan
            </a>
          </li>
        );
      })}
    </ol>
  );
}