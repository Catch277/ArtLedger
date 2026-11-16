import type { SimulationResult } from '../entities/SimulationResult';
import type { TransactionResult } from '../entities/TransactionResult';
import type { TokenId, WalletAddress } from '../types/eth';

export interface IArtworkWriteGateway {
  simulateMint(tokenUri: string, from: WalletAddress): Promise<SimulationResult>;
  mint(tokenUri: string): Promise<TransactionResult>;
  simulateTransfer(tokenId: TokenId, from: WalletAddress): Promise<SimulationResult>;
  transfer(tokenId: TokenId, to: WalletAddress): Promise<TransactionResult>;
}