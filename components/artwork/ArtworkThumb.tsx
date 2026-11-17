import { ImageOff } from 'lucide-react';
import { ArtworkImage } from './ArtworkImage';
import type { LibraryItem } from '@/lib/domain/entities/LibraryItem';

/**
 * One artwork frame for the previews on a screen: same square, same gateway retry, same fallback.
 * The frame is always drawn, so a missing or not-yet-read image never shifts the layout around it.
 * The caller owns the state (skeleton while loading, this frame once the read settled) because the
 * four async states belong to the screen, not to a picture.
 */
export function ArtworkThumb({
  item,
  alt,
  sizes,
  className = '',
}: {
  item: LibraryItem | null;
  alt: string;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-control bg-surface-muted ${className}`}>
      {item?.metadata ? (
        <ArtworkImage uri={item.metadata.image} alt={alt} sizes={sizes} />
      ) : (
        <span className='flex h-full items-center justify-center px-2 text-center text-ink-muted'>
          <ImageOff aria-hidden size={16} strokeWidth={2} />
          <span className='sr-only'>Không tải được ảnh</span>
        </span>
      )}
    </div>
  );
}
