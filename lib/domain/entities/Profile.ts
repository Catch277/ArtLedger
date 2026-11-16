import type { WalletAddress } from '../types/eth';
import type { ProfileLink } from './ProfileLink';

export type ProfileAvatarKind = 'monogram' | 'image';

export interface ProfileAvatar {
  kind: ProfileAvatarKind;
  /** `ipfs://<cid>` when kind is 'image'; null for the generated monogram. */
  uri: string | null;
}

/**
 * A display profile: how a wallet wants to be presented, not proof of identity.
 * Nothing here is signed or written on chain, so the UI never calls it verified.
 */
export interface Profile {
  address: WalletAddress;
  displayName: string;
  bio: string;
  avatar: ProfileAvatar;
  links: ProfileLink[];
  /** ISO timestamp of the last local edit. */
  updatedAt: string;
  /** CID of the published document; null once the draft drifts from it. */
  publishedCid: string | null;
}
