import { toIpfsUri } from '@/lib/domain/config/ipfs';
import type { ArtworkMetadata } from '@/lib/domain/entities/ArtworkMetadata';
import type { IIpfsPinner } from '@/lib/domain/ports/IIpfsPinner';

export interface PinArtworkMetadataOutput {
  cid: string;
  tokenUri: string;
}

export class PinArtworkMetadataUseCase {
  constructor(private readonly pinner: IIpfsPinner) {}

  async execute(metadata: ArtworkMetadata): Promise<PinArtworkMetadataOutput> {
    const cid = await this.pinner.pinJson(metadata);
    return { cid, tokenUri: toIpfsUri(cid) };
  }
}