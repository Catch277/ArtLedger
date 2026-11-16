'use client';

import { useEffect, useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { contractAddress, deployBlock, sepoliaRpcUrl } from '@/lib/infrastructure/config/env';
import { JsonRpcArtworkQueryGateway } from '@/lib/infrastructure/web3/JsonRpcArtworkQueryGateway';

type LoadState = 'loading' | 'ready' | 'error';

export function LandingStats() {
  const [total, setTotal] = useState<number | null>(null);
  const [state, setState] = useState<LoadState>('loading');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const gateway = new JsonRpcArtworkQueryGateway(sepoliaRpcUrl(), contractAddress(), deployBlock());
        const value = await gateway.getTotalSupply();
        if (cancelled) return;
        setTotal(value);
        setState('ready');
      } catch {
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className='grid gap-4 sm:grid-cols-3'>
      <DataCard
        label='Tác phẩm đã đăng ký'
        value={state === 'ready' && total !== null ? total.toLocaleString('vi-VN') : '—'}
        hint={state === 'error' ? 'Chưa đọc được hợp đồng' : 'Đọc trực tiếp từ Sepolia'}
        loading={state === 'loading'}
      />
      <DataCard label='Mạng' value='Sepolia' hint='chainId 11155111' />
      <DataCard label='Tiêu chuẩn' value='ERC-721' hint='Metadata lưu trên IPFS' />
    </div>
  );
}