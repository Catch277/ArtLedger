import { cidFromUri } from '@/lib/domain/config/ipfs';
import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import { sameAddress } from '@/lib/domain/types/address';
import { parseArtworkMetadata } from '@/lib/domain/schemas/artworkMetadata';
import type { LibraryItem } from '@/lib/domain/entities/LibraryItem';
import type { IArtworkQueryGateway } from '@/lib/domain/ports/IArtworkQueryGateway';
import type { IIpfsReader } from '@/lib/domain/ports/IIpfsReader';
import type { WalletAddress } from '@/lib/domain/types/eth';

export interface ListLibraryOptions {
  /**
   * Only return tokens this wallet holds. There is no enumeration extension, so
   * the filter costs one ownerOf per id — fine for a demo collection.
   */
  owner?: WalletAddress;
}

export class ListLibraryUseCase {
  constructor(
    private readonly query: IArtworkQueryGateway,
    private readonly ipfs: IIpfsReader,
  ) {}

  async execute(options: ListLibraryOptions = {}): Promise<LibraryItem[]> {
    if (!this.query.isConfigured()) throw new ContractNotConfiguredError();
    const total = await this.query.getTotalSupply();
    const items: LibraryItem[] = [];

    // A demo collection holds a handful of tokens, so one metadata fetch per token beats an indexer.
    for (let index = total; index >= 1; index -= 1) {
      const tokenId = String(index);
      if (options.owner) {
        const holder = await this.query.getOwnerOf(tokenId).catch(() => null);
        if (!holder || !sameAddress(holder, options.owner)) continue;
      }

      const tokenUri = await this.query.getTokenUri(tokenId).catch(() => '');
      if (!tokenUri) continue;
      const cid = cidFromUri(tokenUri);
      if (!cid) {
        items.push({ tokenId, tokenUri, imageUrl: null, metadata: null, metadataError: 'tokenURI không phải ipfs://.' });
        continue;
      }
      try {
        const metadata = parseArtworkMetadata(await this.ipfs.readJson(cid));
        items.push({
          tokenId,
          tokenUri,
          imageUrl: this.ipfs.toGatewayUrl(metadata.image),
          metadata,
          metadataError: null,
        });
      } catch (error) {
        items.push({
          tokenId,
          tokenUri,
          imageUrl: null,
          metadata: null,
          metadataError: error instanceof Error ? error.message : 'Không đọc được metadata.',
        });
      }
    }
    return items;
  }
}
