import type { ArtworkMetadata } from '../entities/ArtworkMetadata';
import type { PinFileInput } from '../entities/PinFileInput';
import type { IpfsCid } from '../types/eth';

export interface IIpfsPinner {
  pinFile(file: PinFileInput): Promise<IpfsCid>;
  pinJson(metadata: ArtworkMetadata): Promise<IpfsCid>;
}