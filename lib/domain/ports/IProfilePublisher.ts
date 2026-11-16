import type { PublishedProfile } from '../schemas/profile';
import type { IpfsCid } from '../types/eth';

/**
 * Pins a profile document so it has an addressable, immutable identity.
 * Separate from IIpfsPinner because an artwork payload is not a profile payload.
 */
export interface IProfilePublisher {
  publish(profile: PublishedProfile): Promise<IpfsCid>;
}
