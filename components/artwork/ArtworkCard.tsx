import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { ArtworkImage } from './ArtworkImage';
import type { LibraryItem } from '@/lib/domain/entities/LibraryItem';

export function ArtworkCard({ item }: { item: LibraryItem }) {
  const title = item.metadata?.name ?? `Token #${item.tokenId}`;
  return (
    <Link
      href={`/verify?tokenId=${item.tokenId}`}
      className='block overflow-hidden rounded-card border border-hairline bg-surface shadow-card transition-colors hover:border-ink/20'
    >
      <div className='relative aspect-[4/3] bg-surface-muted'>
        {item.metadata ? (
          <ArtworkImage
            uri={item.metadata.image}
            alt={title}
            sizes='(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'
          />
        ) : (
          <div className='flex h-full items-center justify-center px-4 text-center text-xs text-ink-muted'>
            Không tải được ảnh
          </div>
        )}
        {/* Saturated green on top of a photo: floats above any artwork, ink stays readable. */}
        <span className='absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-ink'>
          <BadgeCheck aria-hidden size={14} strokeWidth={2} />
          Đã xác thực
        </span>
        <span aria-hidden className='absolute inset-x-0 bottom-0 h-0.5 bg-accent' />
      </div>
      <div className='p-4'>
        <h3 className='text-base font-semibold leading-tight tracking-tight'>{item.metadata?.name ?? 'Không đọc được metadata'}</h3>
        <div className='mt-2 flex items-center justify-between gap-2 text-xs'>
          <span className='font-mono tabular-nums'>#{item.tokenId}</span>
          <span className='truncate font-mono text-ink-muted' title={item.metadata?.author}>
            {item.metadata?.author ?? item.metadataError ?? '—'}
          </span>
        </div>
      </div>
    </Link>
  );
}