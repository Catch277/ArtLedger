import { cidFromUri } from '@/lib/domain/config/ipfs';
import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import { parseArtworkMetadata } from '@/lib/domain/schemas/artworkMetadata';
import type { ArtworkMetadata } from '@/lib/domain/entities/ArtworkMetadata';
import type { IArtworkQueryGateway } from '@/lib/domain/ports/IArtworkQueryGateway';
import type { IHashingGateway } from '@/lib/domain/ports/IHashingGateway';
import type { IIpfsReader } from '@/lib/domain/ports/IIpfsReader';

export interface IntegrityMatch {
  tokenId: string;
  name: string;
  owner: string | null;
}

export interface CheckImageIntegrityOutput {
  sha256: string;
  matches: IntegrityMatch[];
  checked: number;
}

export class CheckImageIntegrityUseCase {
  constructor(
    private readonly hasher: IHashingGateway,
    private readonly query: IArtworkQueryGateway,
    private readonly ipfs: IIpfsReader,
  ) {}

  async execute(bytes: Uint8Array): Promise<CheckImageIntegrityOutput> {
    const sha256 = await this.hasher.sha256(bytes);
    if (!this.query.isConfigured()) throw new ContractNotConfiguredError();

    const total = await this.query.getTotalSupply();
    const matches: IntegrityMatch[] = [];

    for (let index = total; index >= 1; index -= 1) {
      const tokenId = String(index);
      const tokenUri = await this.query.getTokenUri(tokenId).catch(() => null);
      const cid = tokenUri ? cidFromUri(tokenUri) : null;
      if (!cid) continue;

      const metadata: ArtworkMetadata | null = await this.ipfs
        .readJson(cid)
        .then((value) => parseArtworkMetadata(value))
        .catch(() => null);
      if (!metadata?.sha256 || metadata.sha256 !== sha256) continue;

      const owner = await this.query.getOwnerOf(tokenId).catch(() => null);
      matches.push({ tokenId, name: metadata.name, owner });
    }

    return { sha256, matches, checked: total };
  }
}