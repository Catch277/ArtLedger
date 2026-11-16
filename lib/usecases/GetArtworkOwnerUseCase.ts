import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import { parseTokenId } from '@/lib/domain/schemas/tokenId';
import type { IArtworkQueryGateway } from '@/lib/domain/ports/IArtworkQueryGateway';
import type { WalletAddress } from '@/lib/domain/types/eth';

export interface GetArtworkOwnerOutput {
  tokenId: string;
  owner: WalletAddress;
}

export class GetArtworkOwnerUseCase {
  constructor(private readonly query: IArtworkQueryGateway) {}

  async execute(rawTokenId: string): Promise<GetArtworkOwnerOutput> {
    const tokenId = parseTokenId(rawTokenId);
    if (!this.query.isConfigured()) throw new ContractNotConfiguredError();
    const owner = await this.query.getOwnerOf(tokenId);
    return { tokenId, owner };
  }
}