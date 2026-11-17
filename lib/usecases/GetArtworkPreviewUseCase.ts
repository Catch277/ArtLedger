import { cidFromUri } from '@/lib/domain/config/ipfs';
import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import { parseArtworkMetadata } from '@/lib/domain/schemas/artworkMetadata';
import { parseTokenId } from '@/lib/domain/schemas/tokenId';
import type { LibraryItem } from '@/lib/domain/entities/LibraryItem';
import type { IArtworkQueryGateway } from '@/lib/domain/ports/IArtworkQueryGateway';
import type { IIpfsReader } from '@/lib/domain/ports/IIpfsReader';

/**
 * The artwork sitting behind a token id, for a screen that has to show it before acting on it
 * (`/transfer`). Metadata problems are reported in `metadataError` rather than thrown: the ownership
 * verdict is the decision, so a rate-limited gateway must not turn a valid token id into an error.
 * Kept apart from `GetArtworkOwnerUseCase` so the verdict never waits on IPFS.
 */
export class GetArtworkPreviewUseCase {
  constructor(
    private readonly query: IArtworkQueryGateway,
    private readonly ipfs: IIpfsReader,
  ) {}

  async execute(rawTokenId: string): Promise<LibraryItem> {
    const tokenId = parseTokenId(rawTokenId);
    if (!this.query.isConfigured()) throw new ContractNotConfiguredError();

    const tokenUri = await this.query.getTokenUri(tokenId);
    const cid = cidFromUri(tokenUri);
    if (!cid) {
      return { tokenId, tokenUri, imageUrl: null, metadata: null, metadataError: 'tokenURI không phải ipfs://.' };
    }

    try {
      const metadata = parseArtworkMetadata(await this.ipfs.readJson(cid));
      return {
        tokenId,
        tokenUri,
        imageUrl: this.ipfs.toGatewayUrl(metadata.image),
        metadata,
        metadataError: null,
      };
    } catch (error) {
      return {
        tokenId,
        tokenUri,
        imageUrl: null,
        metadata: null,
        metadataError: error instanceof Error ? error.message : 'Không đọc được metadata.',
      };
    }
  }
}
