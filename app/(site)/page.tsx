import Link from 'next/link';
import { ArrowRight, BadgeCheck, FlaskConical, Images, PenLine, ScanSearch, Send } from 'lucide-react';
import { LandingStats } from '@/components/artwork/LandingStats';
import { MarketPreview } from '@/components/artwork/MarketPreview';
import { ChainMarquee } from '@/components/brand/ChainMarquee';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';

const MODULES = [
  {
    href: '/library',
    title: 'Thư viện',
    description: 'Xem mọi tác phẩm đã đăng ký, đọc thẳng từ hợp đồng, không cần ví.',
    Icon: Images,
    verification: false,
  },
  {
    href: '/register',
    title: 'Đăng ký tác phẩm',
    description: 'Tải ảnh lên IPFS, tính SHA-256, mô phỏng rồi đúc NFT (mint).',
    Icon: PenLine,
    verification: false,
  },
  {
    href: '/transfer',
    title: 'Chuyển nhượng',
    description: 'Chủ sở hữu chuyển NFT cho ví khác; lịch sử do chuỗi ghi lại.',
    Icon: Send,
    verification: false,
  },
  {
    href: '/verify',
    title: 'Tra cứu & xác thực',
    description: 'Nhập Token ID để xem chủ sở hữu, metadata và timeline chuyển nhượng.',
    Icon: ScanSearch,
    verification: true,
  },
  {
    href: '/check',
    title: 'Kiểm tra ảnh',
    description: 'So mã băm của tệp với dấu vân tay đã đăng ký để phát hiện bản sửa.',
    Icon: BadgeCheck,
    verification: true,
  },
  {
    href: '/lab',
    title: 'Phòng thí nghiệm',
    description: 'Chạy eth_call để thấy hợp đồng từ chối mint trùng và chuyển nhượng trái phép.',
    Icon: FlaskConical,
    verification: true,
  },
] as const;

const STEPS = [
  {
    index: '01',
    title: 'Tải ảnh lên IPFS',
    body: 'Pinata giữ tệp gốc và trả về một CID - địa chỉ của nội dung, không phải của máy chủ.',
  },
  {
    index: '02',
    title: 'Băm SHA-256',
    body: 'Máy bạn tự tính dấu vân tay của tệp. Mã băm nằm trong metadata, không đi lên chuỗi.',
  },
  {
    index: '03',
    title: 'Mô phỏng rồi mint',
    body: 'eth_call chạy trước để chắc chắn hợp đồng không revert, rồi MetaMask mới hỏi chữ ký.',
  },
  {
    index: '04',
    title: 'Ai cũng xác minh',
    body: 'Người xem không cần ví: ownerOf và tokenURI đọc qua RPC công khai của Sepolia.',
  },
] as const;

export default function HomePage() {
  return (
    <>
      {/* Full-bleed chain ticker, flush against the sticky header (DESIGN.md 7.27). */}
      <ChainMarquee />

      {/* Hero: centered single column, the way primereact.dev opens. */}
      <section className='relative overflow-hidden border-b border-hairline'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-accent-wash to-transparent'
        />
        <div className='relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24'>
          <p className='inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 font-mono text-[11px] tracking-wide text-ink-muted'>
            <span aria-hidden className='h-1.5 w-1.5 rounded-full bg-accent' />
            artledger · erc-721 · sepolia
          </p>

          <h1 className='mt-8 text-4xl font-normal leading-[1.05] tracking-tighter text-ink sm:text-5xl lg:text-6xl'>
            Quyền sở hữu tác phẩm, ghi lại vĩnh viễn trên blockchain.
          </h1>

          <p className='mt-6 max-w-xl text-base leading-7 text-ink-muted sm:text-lg'>
            Mỗi tác phẩm là một NFT ERC-721 trên Sepolia. Tệp gốc nằm trên IPFS, mã băm SHA-256 giúp phát hiện bản
            chỉnh sửa. Không cơ sở dữ liệu, không máy chủ trung gian.
          </p>

          <div className='mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row'>
            <Button as={Link} href='/register' size='lg' className='w-full sm:w-auto'>
              Đăng ký tác phẩm
            </Button>
            <Button as={Link} href='/verify' variant='accentPage' size='lg' className='w-full sm:w-auto'>
              Tra cứu không cần ví
            </Button>
          </div>

          <p className='mt-4 font-mono text-[11px] text-ink-muted'>xem không cần ví · chỉ ký khi ghi lên chuỗi</p>
        </div>
      </section>

      {/* Product panel: a framed screenshot, not a floating card. */}
      <section className='mx-auto w-full max-w-5xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16'>
        <div className='overflow-hidden rounded-panel border border-hairline bg-surface shadow-overlay'>
          <div className='flex items-center justify-between gap-3 border-b border-hairline bg-surface-muted px-4 py-2.5'>
            <span aria-hidden className='flex items-center gap-1.5'>
              <span className='h-2.5 w-2.5 rounded-full bg-hairline-strong' />
              <span className='h-2.5 w-2.5 rounded-full bg-hairline-strong' />
              <span className='h-2.5 w-2.5 rounded-full bg-hairline-strong' />
            </span>
            <span className='flex min-w-0 items-center gap-2'>
              {/* DESIGN.md §10: the sample record must never look like a real verification. */}
              <span className='hidden shrink-0 rounded-full border border-hairline bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-muted sm:inline'>
                Mẫu minh hoạ
              </span>
              <span className='truncate font-mono text-[11px] text-ink-muted'>/verify?tokenId=128</span>
            </span>
          </div>
          <div className='grid gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_220px] sm:gap-8 sm:p-8'>
            <div className='min-w-0'>
              <div className='flex items-center justify-between gap-3'>
                <p className='eyebrow'>Bản ghi trên chuỗi</p>
                <span className='font-mono text-[11px] text-ink-muted'>token #128</span>
              </div>
              <p className='mt-3 text-2xl font-normal tracking-tight text-ink'>Mùa hè ở Hội An</p>
              <p className='mt-1 text-sm text-ink-muted'>Nguyễn Minh Anh · 2024</p>

              <dl className='mt-6 grid gap-4 sm:grid-cols-2'>
                <div>
                  <dt className='eyebrow'>Chủ sở hữu</dt>
                  <dd className='mt-1 truncate font-mono text-xs text-ink'>0x0000…0000</dd>
                </div>
                <div>
                  <dt className='eyebrow'>Chuẩn</dt>
                  <dd className='mt-1 font-mono text-xs text-ink'>ERC-721 · 11155111</dd>
                </div>
              </dl>

              <div className='mt-5 border-t border-hairline pt-4'>
                <p className='eyebrow'>sha256</p>
                <p className='mt-1 break-all font-mono text-[11px] leading-5 text-ink-muted'>
                  9f2c41d7b0a8e6f3c5d19a2b4e8f7c60d3a5b1e9f4c7d2a8b6e0f3c1d9a7b5e2
                </p>
              </div>
            </div>

            <div className='rounded-card border border-accent/40 bg-accent-wash p-4'>
              <span className='inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-ink'>
                <BadgeCheck aria-hidden size={14} strokeWidth={2} />
                Đã xác thực
              </span>
              <p className='mt-3 text-xs leading-5 text-ink'>
                Mã băm của tệp trùng khớp với dấu vân tay đã đăng ký trong metadata.
              </p>
              <Link
                href='/check'
                className='mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent-ink underline-offset-4 hover:underline'
              >
                Kiểm tra ảnh của bạn
                <ArrowRight aria-hidden size={14} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className='mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24'>
        <LandingStats />
      </section>

      {/* Real tokens first: the shop window is the fastest way to understand the product. */}
      <section className='mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24'>
        <MarketPreview />
      </section>

      <section className='border-y border-hairline bg-surface'>
        <div className='mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24'>
          <SectionHeader
            eyebrow='Sáu nghiệp vụ'
            title='Một vòng đời, sáu màn hình'
            description='Từ đăng ký tới xác minh, mỗi bước đều đọc hoặc ghi trực tiếp lên Sepolia. Ba nghiệp vụ xác thực được đánh dấu bằng màu xanh lá.'
          />
          <div className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {MODULES.map(({ href, title, description, Icon, verification }) => (
              <Link
                key={href}
                href={href}
                className='rounded-card border border-hairline bg-surface p-6 shadow-card transition-colors hover:border-ink/20'
              >
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
                    verification ? 'bg-accent-soft text-accent-ink' : 'bg-brand-soft text-brand'
                  }`}
                >
                  <Icon aria-hidden size={20} strokeWidth={2} />
                </span>
                <h3 className='mt-4 flex items-center gap-2 text-base font-semibold tracking-tight text-ink'>
                  {title}
                  {verification ? <span aria-hidden className='h-1.5 w-1.5 rounded-full bg-accent' /> : null}
                </h3>
                <p className='mt-2 text-sm leading-6 text-ink-muted'>{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* The proof band: soft green, because this section is about verification. */}
      <section className='bg-accent-wash'>
        <div className='mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24'>
          <SectionHeader
            eyebrow='Cách hoạt động'
            title='Bốn bước, không bước nào cần tin ai'
            description='Mỗi bước để lại một dấu vết kiểm tra được: một CID, một mã băm, hoặc một giao dịch trên Sepolia.'
          />
          <ol className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {STEPS.map((step) => (
              <li key={step.index} className='rounded-card border border-accent/30 bg-surface p-6'>
                <span className='font-mono text-[11px] font-semibold tracking-wide text-accent-ink'>{step.index}</span>
                <h3 className='mt-3 text-base font-semibold tracking-tight text-ink'>{step.title}</h3>
                <p className='mt-2 text-sm leading-6 text-ink-muted'>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className='border-t border-hairline bg-surface'>
        <div className='mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24'>
          <p className='eyebrow'>Bắt đầu</p>
          <h2 className='mt-3 text-3xl font-normal tracking-tight text-ink sm:text-4xl'>
            Đăng ký tác phẩm đầu tiên trong bốn bước.
          </h2>
          <p className='mt-4 max-w-xl text-sm leading-6 text-ink-muted sm:text-base'>
            Bạn cần MetaMask và một ít ETH Sepolia cho phí gas. Không cần tài khoản, không cần thẻ.
          </p>
          <div className='mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row'>
            <Button as={Link} href='/register' size='lg' className='w-full sm:w-auto'>
              Đăng ký tác phẩm
            </Button>
            <Button as={Link} href='/library' variant='accentPage' size='lg' className='w-full sm:w-auto'>
              Xem thư viện
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}





