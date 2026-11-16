import { InvalidRecipientError } from '@/lib/domain/errors/InvalidRecipientError';
import { NotArtworkOwnerError } from '@/lib/domain/errors/NotArtworkOwnerError';
import { TransactionFailedError } from '@/lib/domain/errors/TransactionFailedError';
import { parseTokenId } from '@/lib/domain/schemas/tokenId';
import { ZERO_ADDRESS, isWalletAddress, sameAddress } from '@/lib/domain/types/address';
import type { IArtworkQueryGateway } from '@/lib/domain/ports/IArtworkQueryGateway';
import type { IArtworkWriteGateway } from '@/lib/domain/ports/IArtworkWriteGateway';
import type { WalletAddress } from '@/lib/domain/types/eth';

export interface TransferArtworkInput {
  tokenId: string;
  recipient: string;
  from: WalletAddress;
}

export interface TransferArtworkOutput {
  tokenId: string;
  txHash: string;
  recipient: WalletAddress;
}

export class TransferArtworkUseCase {
  constructor(
    private readonly query: IArtworkQueryGateway,
    private readonly writer: IArtworkWriteGateway,
  ) {}

  async execute(input: TransferArtworkInput): Promise<TransferArtworkOutput> {
    const tokenId = parseTokenId(input.tokenId);
    const recipient = input.recipient.trim();

    if (!isWalletAddress(recipient)) throw new InvalidRecipientError();
    if (sameAddress(recipient, ZERO_ADDRESS)) throw new InvalidRecipientError('Không thể chuyển tới địa chỉ 0x0.');
    if (sameAddress(recipient, input.from)) throw new InvalidRecipientError('Địa chỉ nhận trùng với ví đang gửi.');

    const owner = await this.query.getOwnerOf(tokenId);
    if (!sameAddress(owner, input.from)) throw new NotArtworkOwnerError(tokenId);

    const simulation = await this.writer.simulateTransfer(tokenId, input.from);
    if (!simulation.ok) throw new TransactionFailedError(simulation.revertReason);

    const result = await this.writer.transfer(tokenId, recipient);
    return { tokenId, txHash: result.txHash, recipient };
  }
}