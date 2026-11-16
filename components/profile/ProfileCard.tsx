import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { HashChip } from '@/components/ui/HashChip';
import { ProfileAvatar } from './ProfileAvatar';
import { shortenAddress } from '@/lib/domain/types/address';
import type { ProfileAvatar as ProfileAvatarValue } from '@/lib/domain/entities/Profile';
import type { ProfileLink, ProfileLinkLabel } from '@/lib/domain/entities/ProfileLink';
import type { WalletAddress } from '@/lib/domain/types/eth';

const LINK_LABELS: Record<ProfileLinkLabel, string> = {
  website: 'Website',
  x: 'X',
  instagram: 'Instagram',
};

export function ProfileCard({
  address,
  displayName,
  bio,
  avatar,
  links,
  status,
  actions,
  footer,
}: {
  address: WalletAddress;
  displayName: string;
  bio: string;
  avatar: ProfileAvatarValue;
  links: ProfileLink[];
  status?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <article className='rounded-card border border-hairline bg-surface p-6 shadow-card sm:p-7'>
      <div className='flex flex-wrap items-start gap-4'>
        <ProfileAvatar avatar={avatar} displayName={displayName} address={address} />
        <div className='min-w-0 flex-1'>
          <h2 className='text-xl font-semibold leading-tight tracking-tight text-ink'>{displayName}</h2>
          <div className='mt-2 flex flex-wrap items-center gap-2'>
            <HashChip value={address} display={shortenAddress(address)} />
            {status}
          </div>
        </div>
        {actions ? <div className='flex flex-wrap gap-2'>{actions}</div> : null}
      </div>

      {bio.trim().length > 0 ? (
        <p className='mt-5 whitespace-pre-line text-sm leading-6 text-ink-muted'>{bio}</p>
      ) : (
        <p className='mt-5 text-sm leading-6 text-ink-muted'>
          Chưa có giới thiệu. Thêm một dòng để người xem biết bạn là ai.
        </p>
      )}

      {links.length > 0 ? (
        <ul className='mt-4 flex flex-wrap gap-x-4 gap-y-2'>
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.url}
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center gap-1 text-xs font-medium text-brand underline-offset-4 hover:underline'
              >
                {LINK_LABELS[link.label]}
                <ExternalLink aria-hidden size={12} strokeWidth={2} />
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {footer ? <div className='mt-5 border-t border-hairline pt-4'>{footer}</div> : null}
    </article>
  );
}
