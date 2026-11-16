import { toIpfsUri } from '@/lib/domain/config/ipfs';
import type { PublishedProfile } from '@/lib/domain/schemas/profile';
import type { IProfilePublisher } from '@/lib/domain/ports/IProfilePublisher';

export interface PinProfileOutput {
  cid: string;
  uri: string;
}

/** Server-side action: pin an already validated profile document. */
export class PinProfileUseCase {
  constructor(private readonly publisher: IProfilePublisher) {}

  async execute(profile: PublishedProfile): Promise<PinProfileOutput> {
    const cid = await this.publisher.publish(profile);
    return { cid, uri: toIpfsUri(cid) };
  }
}
