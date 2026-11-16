'use client';

import { useWallet } from '@/components/providers/WalletProvider';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';

export const NETWORK_BANNER_ID = 'network-banner';

export function NetworkBanner() {
  const { isInstalled, address, isSepolia, switchToSepolia } = useWallet();

  if (!isInstalled) {
    return (
      <Banner
        variant='pending'
        id={NETWORK_BANNER_ID}
        action={
          <Button as='a' href='https://metamask.io/download/' target='_blank' rel='noreferrer' variant='link' size='sm'>
            Cài MetaMask
          </Button>
        }
      >
        <span className='font-semibold'>Chưa tìm thấy MetaMask.</span> Cài tiện ích để kết nối ví và đăng ký tác phẩm.
      </Banner>
    );
  }

  if (address && !isSepolia) {
    return (
      <Banner
        variant='pending'
        id={NETWORK_BANNER_ID}
        action={
          <Button size='sm' onClick={() => void switchToSepolia()}>
            Chuyển sang Sepolia
          </Button>
        }
      >
        <span className='font-semibold'>Ví đang ở mạng khác.</span> Chuyển sang Sepolia để tiếp tục.
      </Banner>
    );
  }

  return null;
}