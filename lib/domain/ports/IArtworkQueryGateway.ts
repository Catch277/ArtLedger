import type { TransferRecord } from '../entities/TransferRecord';
import type { WalletTransaction } from '../entities/WalletTransaction';
import type { TokenId, WalletAddress } from '../types/eth';

export interface IArtworkQueryGateway {
  isConfigured(): boolean;
  getTotalSupply(): Promise<number>;
  getOwnerOf(tokenId: TokenId): Promise<WalletAddress>;
  getTokenUri(tokenId: TokenId): Promise<string>;
  findTokenIdByTokenUri(tokenUri: string): Promise<TokenId | null>;
  getTransferHistory(tokenId: TokenId): Promise<TransferRecord[]>;
  /** Every contract transaction that touched this wallet, newest first. */
  getAccountTransactions(address: WalletAddress): Promise<WalletTransaction[]>;
}