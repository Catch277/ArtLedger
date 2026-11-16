import type { Profile } from '@/lib/domain/entities/Profile';
import type { IProfileStore } from '@/lib/domain/ports/IProfileStore';
import type { WalletAddress } from '@/lib/domain/types/eth';

/** The draft for one wallet, or null when this device has never seen it. */
export class LoadProfileUseCase {
  constructor(private readonly store: IProfileStore) {}

  async execute(address: WalletAddress): Promise<Profile | null> {
    return this.store.read(address);
  }
}
