import type { Metadata } from 'next';
import { geistMono, inter } from '@/app/fonts';
import { WalletProvider } from '@/components/providers/WalletProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArtLedger · Sổ đăng ký tác phẩm số',
  description:
    'Đăng ký, chuyển nhượng và tra cứu tác phẩm số trên Sepolia: NFT ERC-721 làm sổ đăng ký, tệp lưu trên IPFS, ai cũng có thể xác minh.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang='vi'
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className='flex min-h-full flex-col bg-canvas font-sans text-ink'>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}