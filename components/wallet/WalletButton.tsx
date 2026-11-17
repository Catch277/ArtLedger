'use client';

import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { useState } from 'react';
import { useWallet } from '@/components/providers/WalletProvider';
import { Button } from '@/components/ui/Button';
import { HashChip } from '@/components/ui/HashChip';
import { Modal } from '@/components/ui/Modal';
import { shortenAddress } from '@/lib/domain/types/address';

export function WalletButton() {
  const { address, isInstalled, isConnecting, isSepolia, connect, disconnect } = useWallet();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  async function confirmDisconnect() {
    setDisconnecting(true);
    try {
      await disconnect();
    } finally {
      setDisconnecting(false);
      setConfirmOpen(false);
    }
  }

  if (!isInstalled) {
    return (
      <Button as='a' href='https://metamask.io/download/' target='_blank' rel='noreferrer' variant='accent' size='sm'>
        Cài MetaMask
      </Button>
    );
  }

  if (!address) {
    return (
      <Button variant='accent' size='sm' onClick={() => void connect()} disabled={isConnecting}>
        {isConnecting ? 'Đang kết nối…' : 'Kết nối ví'}
      </Button>
    );
  }

  return (
    <div className='flex min-w-0 items-center gap-2'>
      {isSepolia ? (
        <span className='hidden items-center gap-1.5 rounded-full border border-ink-inverse/25 px-2.5 py-1 font-mono text-[11px] text-ink-inverse/80 sm:inline-flex'>
          <span aria-hidden className='h-1.5 w-1.5 rounded-full bg-accent' />
          sepolia
        </span>
      ) : (
        // On phones the network banner below the bar already says "Ví đang ở mạng khác" with the
        // switch action, so the 85px pill would only duplicate it and push the row past 393px.
        <span className='hidden shrink-0 items-center gap-1.5 rounded-full bg-warn-soft px-2.5 py-1 font-mono text-[11px] text-ink sm:inline-flex'>
          <span aria-hidden className='h-1.5 w-1.5 rounded-full bg-warn' />
          sai mạng
        </span>
      )}
      <HashChip value={address} display={shortenAddress(address)} tone='brand' />
      {/* The identity is the wallet, so the shortcut to its profile sits next to it.
          Hidden below sm because the header row would overflow at 360px. */}
      <Link
        href='/profile'
        aria-label='Mở hồ sơ'
        title='Hồ sơ'
        className='hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-inverse/80 transition-colors hover:bg-surface/15 hover:text-ink-inverse focus-visible:text-ink-inverse focus-visible:outline-ink-inverse pointer-coarse:h-11 pointer-coarse:w-11 sm:inline-flex'
      >
        <UserRound aria-hidden size={18} strokeWidth={2} />
      </Link>
      <Button variant='inverse' size='sm' onClick={() => setConfirmOpen(true)} className='shrink-0'>
        Ngắt
      </Button>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title='Ngắt kết nối ví?'
        description='Bạn có thể kết nối lại bất cứ lúc nào.'
        footer={
          <>
            <Button variant='secondary' onClick={() => setConfirmOpen(false)} disabled={disconnecting}>
              Ở lại
            </Button>
            <Button onClick={() => void confirmDisconnect()} disabled={disconnecting}>
              {disconnecting ? 'Đang ngắt…' : 'Ngắt kết nối'}
            </Button>
          </>
        }
      >
        <dl className='space-y-2 text-sm'>
          <div className='flex items-center justify-between gap-3'>
            <dt className='text-ink-muted'>Ví</dt>
            <dd className='font-mono tabular-nums'>{shortenAddress(address)}</dd>
          </div>
        </dl>
        <ul className='mt-4 space-y-2 text-sm leading-6 text-ink-muted'>
          <li>Không tài sản nào bị chuyển hay xoá: NFT vẫn thuộc địa chỉ này trên chuỗi.</li>
          <li>Hồ sơ đang sửa vẫn nằm trên thiết bị này, không bị mất.</li>
          <li>Các màn hình chỉ đọc (thư viện, tra cứu, kiểm tra ảnh) vẫn dùng được khi chưa kết nối.</li>
        </ul>
      </Modal>
    </div>
  );
}