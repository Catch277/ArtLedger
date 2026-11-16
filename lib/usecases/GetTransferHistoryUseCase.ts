import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import { parseTokenId } from '@/lib/domain/schemas/tokenId';
import type { TransferRecord } from '@/lib/domain/entities/TransferRecord';
import type { IArtworkQueryGateway } from '@/lib/domain/ports/IArtworkQueryGateway';

export interface GetTransferHistoryOutput {
  tokenId: string;
  transfers: TransferRecord[];
}

export class GetTransferHistoryUseCase {
  constructor(private readonly query: IArtworkQueryGateway) {}

  async execute(rawTokenId: string): Promise<GetTransferHistoryOutput> {
    const tokenId = parseTokenId(rawTokenId);
    if (!this.query.isConfigured()) throw new ContractNotConfiguredError();
    await this.query.getOwnerOf(tokenId);
    const transfers = await this.query.getTransferHistory(tokenId);
    return { tokenId, transfers };
  }
}