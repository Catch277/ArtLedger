'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { gatewayCandidatesFor } from '@/lib/domain/config/ipfs';

/**
 * Artwork thumbnails are fetched from IPFS by the browser. One gateway refusing
 * (429 or a credential prompt) would blank the whole grid, so a failure retries
 * the same CID on the next gateway instead of giving up on the artwork.
 */
export function ArtworkImage({ uri, alt, sizes }: { uri: string; alt: string; sizes: string }) {
  const candidates = useMemo(() => gatewayCandidatesFor(uri), [uri]);
  const [index, setIndex] = useState(0);
  const src = candidates[Math.min(index, candidates.length - 1)];

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      className='object-cover'
      onError={() => setIndex((current) => (current + 1 < candidates.length ? current + 1 : current))}
    />
  );
}
