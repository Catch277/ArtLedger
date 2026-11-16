import type { WalletAddress } from '../types/eth';

export interface WalletConnection {
  address: WalletAddress;
  chainId: number;
  balanceWei: string;
}