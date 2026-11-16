import { cidFromUri } from '@/lib/domain/config/ipfs';
import { ProfileValidationError } from '@/lib/domain/errors/ProfileValidationError';
import { parsePublishedProfile } from '@/lib/domain/schemas/profile';
import type { PublishedProfile } from '@/lib/domain/schemas/profile';
import type { IIpfsReader } from '@/lib/domain/ports/IIpfsReader';

/** Reads a shared profile link. The document is validated on the way out of IPFS. */
export class ReadPublishedProfileUseCase {
  constructor(private readonly ipfs: IIpfsReader) {}

  async execute(uri: string): Promise<PublishedProfile> {
    const cid = cidFromUri(uri);
    if (!cid) throw new ProfileValidationError('Liên kết hồ sơ phải có dạng ipfs://<cid>.');
    return parsePublishedProfile(await this.ipfs.readJson(cid));
  }
}
