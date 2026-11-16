import { toIpfsUri } from '@/lib/domain/config/ipfs';
import { toPublishedProfile } from '@/lib/domain/schemas/profile';
import type { Profile } from '@/lib/domain/entities/Profile';
import type { IProfilePublisher } from '@/lib/domain/ports/IProfilePublisher';
import type { IProfileStore } from '@/lib/domain/ports/IProfileStore';
import type { PinProfileOutput } from './PinProfileUseCase';

/**
 * Client-side action: publish the current draft, then remember where it went.
 * The CID is the only new fact, so the store keeps the rest of the profile as is.
 */
export class PublishProfileUseCase {
  constructor(
    private readonly publisher: IProfilePublisher,
    private readonly store: IProfileStore,
  ) {}

  async execute(profile: Profile): Promise<PinProfileOutput> {
    const cid = await this.publisher.publish(toPublishedProfile(profile));
    await this.store.write({ ...profile, publishedCid: cid });
    return { cid, uri: toIpfsUri(cid) };
  }
}
