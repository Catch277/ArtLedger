import { ProfileStorageError } from '@/lib/domain/errors/ProfileStorageError';
import { parseStoredProfile } from '@/lib/domain/schemas/profile';
import type { Profile } from '@/lib/domain/entities/Profile';
import type { IProfileStore } from '@/lib/domain/ports/IProfileStore';
import type { WalletAddress } from '@/lib/domain/types/eth';

const KEY_PREFIX = 'artledger:profile:v1:';

/**
 * Device-local draft. There is no database, so the browser is the store; the
 * value holds display text only, never a key, a signature or a secret.
 */
export class LocalStorageProfileStore implements IProfileStore {
  private key(address: WalletAddress): string {
    // Lowercased so a checksummed address and a plain one share one record.
    return `${KEY_PREFIX}${address.toLowerCase()}`;
  }

  async read(address: WalletAddress): Promise<Profile | null> {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(this.key(address));
      if (!raw) return null;
      const profile = parseStoredProfile(JSON.parse(raw) as unknown);
      // A record that names another wallet is corruption, not a profile.
      return profile && profile.address.toLowerCase() === address.toLowerCase() ? profile : null;
    } catch {
      // Blocked storage or broken JSON must not break the page.
      return null;
    }
  }

  async write(profile: Profile): Promise<void> {
    if (typeof window === 'undefined') {
      throw new ProfileStorageError('Chỉ lưu được hồ sơ trong trình duyệt.');
    }
    try {
      window.localStorage.setItem(this.key(profile.address), JSON.stringify(profile));
    } catch {
      throw new ProfileStorageError('Trình duyệt chặn bộ nhớ cục bộ. Hồ sơ chưa được lưu.');
    }
  }

  async clear(address: WalletAddress): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(this.key(address));
    } catch {
      // Nothing readable to remove; the caller only wanted it gone.
    }
  }
}
