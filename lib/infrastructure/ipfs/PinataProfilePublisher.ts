import type { PublishedProfile } from '@/lib/domain/schemas/profile';
import type { IProfilePublisher } from '@/lib/domain/ports/IProfilePublisher';
import type { IpfsCid } from '@/lib/domain/types/eth';
import { readPinataCid } from './readPinataCid';

const PIN_JSON_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

/** Server-side adapter: pins the profile document without exposing the JWT. */
export class PinataProfilePublisher implements IProfilePublisher {
  constructor(private readonly jwt: string) {}

  async publish(profile: PublishedProfile): Promise<IpfsCid> {
    const response = await fetch(PIN_JSON_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pinataContent: profile,
        pinataMetadata: { name: `artledger-profile-${profile.address.slice(0, 10)}` },
      }),
    });
    return readPinataCid(response);
  }
}
