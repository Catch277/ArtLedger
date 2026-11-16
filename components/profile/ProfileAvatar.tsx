import Image from 'next/image';
import { toGatewayUrl } from '@/lib/domain/config/ipfs';
import type { ProfileAvatar as ProfileAvatarValue } from '@/lib/domain/entities/Profile';

/** Two initials at most: a monogram is a fallback, not a name display. */
function initials(displayName: string, address: string): string {
  const words = displayName.trim().split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) return address.slice(2, 4).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0].slice(0, 1) + words[words.length - 1].slice(0, 1)).toUpperCase();
}

export function ProfileAvatar({
  avatar,
  displayName,
  address,
  size = 64,
}: {
  avatar: ProfileAvatarValue;
  displayName: string;
  address: string;
  size?: number;
}) {
  if (avatar.kind === 'image' && avatar.uri) {
    return (
      <span
        className='relative block shrink-0 overflow-hidden rounded-full border border-hairline bg-surface-muted'
        style={{ width: size, height: size }}
      >
        <Image src={toGatewayUrl(avatar.uri)} alt='' fill unoptimized sizes={`${size}px`} className='object-cover' />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className='inline-flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold tracking-tight text-brand'
      style={{ width: size, height: size, fontSize: Math.round(size / 2.6) }}
    >
      {initials(displayName, address)}
    </span>
  );
}
