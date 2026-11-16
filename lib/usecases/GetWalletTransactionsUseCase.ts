import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import type { WalletTransaction } from '@/lib/domain/entities/WalletTransaction';
import type { IArtworkQueryGateway } from '@/lib/domain/ports/IArtworkQueryGateway';
import type { WalletAddress } from '@/lib/domain/types/eth';

export interface GetWalletTransactionsOutput {
  /** Newest first. */
  transactions: WalletTransaction[];
  /** Sum of the fees this wallet paid, in wei, as a decimal string. */
  totalFeeWei: string;
  /** How many rows the wallet paid for; rows it received are someone else's cost. */
  paidCount: number;
  /** How many rows carry a fee at all, so the UI can say when receipts were missing. */
  feeCount: number;
}

export class GetWalletTransactionsUseCase {
  constructor(private readonly query: IArtworkQueryGateway) {}

  async execute(address: WalletAddress): Promise<GetWalletTransactionsOutput> {
    if (!this.query.isConfigured()) throw new ContractNotConfiguredError();
    const transactions = await this.query.getAccountTransactions(address);

    let total = 0n;
    let paidCount = 0;
    let feeCount = 0;
    for (const transaction of transactions) {
      if (transaction.feeWei === null) continue;
      feeCount += 1;
      if (!transaction.feePaidByWallet) continue;
      total += BigInt(transaction.feeWei);
      paidCount += 1;
    }

    return { transactions, totalFeeWei: total.toString(), paidCount, feeCount };
  }
}
