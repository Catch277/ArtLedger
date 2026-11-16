import { parseProfileInput } from '@/lib/domain/schemas/profile';
import type { Profile } from '@/lib/domain/entities/Profile';
import type { IProfileStore } from '@/lib/domain/ports/IProfileStore';
import type { WalletAddress } from '@/lib/domain/types/eth';

export class SaveProfileUseCase {
  constructor(
    private readonly store: IProfileStore,
    /** Injected so the timestamp is not read from the clock inside the rule. */
    private readonly now: () => Date = () => new Date(),
  ) {}

  /** `input` is unvalidated on purpose: the schema is the boundary, not the form. */
  async execute(address: WalletAddress, input: unknown): Promise<Profile> {
    const parsed = parseProfileInput(input);
    const profile: Profile = {
      address,
      displayName: parsed.displayName,
      bio: parsed.bio,
      avatar: parsed.avatar,
      links: parsed.links,
      updatedAt: this.now().toISOString(),
      // Editing makes a pinned copy stale, so the draft stops claiming to be published.
      publishedCid: null,
    };
    await this.store.write(profile);
    return profile;
  }
}
