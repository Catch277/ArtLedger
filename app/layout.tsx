import type { Metadata, Viewport } from 'next';
import { geistMono, inter } from '@/app/fonts';
import { WalletProvider } from '@/components/providers/WalletProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArtLedger · Sổ đăng ký tác phẩm số',
  description:
    'Đăng ký, chuyển nhượng và tra cứu tác phẩm số trên Sepolia: NFT ERC-721 làm sổ đăng ký, tệp lưu trên IPFS, ai cũng có thể xác minh.',
};

/**
 * `viewportFit: 'cover'` is what makes the safe-area insets real: without it every
 * `env(safe-area-inset-*)` in the shell resolves to 0, so the mobile tab bar would sit under the
 * home indicator and the tray would lose its bottom padding. The theme colour paints the iOS
 * status bar in the brand blue; the metadata API cannot read CSS variables, so this hex mirrors
 * `--color-brand` in globals.css.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0144db',
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