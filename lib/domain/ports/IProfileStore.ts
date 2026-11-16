import type { Profile } from '../entities/Profile';
import type { WalletAddress } from '../types/eth';

/**
 * Where a draft profile lives between visits. The device is the only store this
 * demo has, so the adapter is expected to be local; publishing is a separate port.
 */
export interface IProfileStore {
  read(address: WalletAddress): Promise<Profile | null>;
  write(profile: Profile): Promise<void>;
  clear(address: WalletAddress): Promise<void>;
}
