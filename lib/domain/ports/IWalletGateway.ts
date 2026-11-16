import type { WalletConnection } from '../entities/WalletConnection';
import type { WalletAddress } from '../types/eth';

export interface IWalletGateway {
  isAvailable(): boolean;
  connect(): Promise<WalletConnection>;
  disconnect(): Promise<void>;
  getAddress(): Promise<WalletAddress | null>;
  getChainId(): Promise<number>;
  getBalance(address: WalletAddress): Promise<string>;
  switchToSepolia(): Promise<void>;
  onAccountsChanged(listener: (address: WalletAddress | null) => void): () => void;
  onChainChanged(listener: (chainId: number) => void): () => void;
}