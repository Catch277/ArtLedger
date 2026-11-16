import { cidFromUri } from '@/lib/domain/config/ipfs';
import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import { parseArtworkMetadata } from '@/lib/domain/schemas/artworkMetadata';
import { parseTokenId } from '@/lib/domain/schemas/tokenId';
import type { ArtworkMetadata } from '@/lib/domain/entities/ArtworkMetadata';
import type { TransferRecord } from '@/lib/domain/entities/TransferRecord';
import type { IArtworkQueryGateway } from '@/lib/domain/ports/IArtworkQueryGateway';
import type { IIpfsReader } from '@/lib/domain/ports/IIpfsReader';
import type { WalletAddress } from '@/lib/domain/types/eth';

export interface VerifyArtworkOutput {
  tokenId: string;
  owner: WalletAddress;
  tokenUri: string;
  metadata: ArtworkMetadata | null;
  metadataError: string | null;
  imageUrl: string | null;
  metadataUrl: string;
  transfers: TransferRecord[];
  transfersError: string | null;
}

export class VerifyArtworkUseCase {
  constructor(
    private readonly query: IArtworkQueryGateway,
    private readonly ipfs: IIpfsReader,
  ) {}

  async execute(rawTokenId: string): Promise<VerifyArtworkOutput> {
    const tokenId = parseTokenId(rawTokenId);
    if (!this.query.isConfigured()) throw new ContractNotConfiguredError();

    const owner = await this.query.getOwnerOf(tokenId);
    const tokenUri = await this.query.getTokenUri(tokenId);
    const cid = cidFromUri(tokenUri);

    let metadata: ArtworkMetadata | null = null;
    let metadataError: string | null = null;
    let imageUrl: string | null = null;

    if (cid) {
      try {
        metadata = parseArtworkMetadata(await this.ipfs.readJson(cid));
        imageUrl = this.ipfs.toGatewayUrl(metadata.image);
      } catch (error) {
        metadataError = error instanceof Error ? error.message : 'Không đọc được metadata.';
      }
    } else {
      metadataError = 'tokenURI không phải ipfs://.';
    }

    let transfers: TransferRecord[] = [];
    let transfersError: string | null = null;
    try {
      transfers = await this.query.getTransferHistory(tokenId);
    } catch (error) {
      transfersError = error instanceof Error ? error.message : 'Không tải được lịch sử giao dịch.';
    }

    return {
      tokenId,
      owner,
      tokenUri,
      metadata,
      metadataError,
      imageUrl,
      metadataUrl: this.ipfs.toGatewayUrl(tokenUri),
      transfers,
      transfersError,
    };
  }
}