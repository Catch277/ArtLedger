export interface TransferRecord {
  from: string;
  to: string;
  tokenId: string;
  txHash: string;
  blockNumber: number;
  blockTimestamp: number | null;
}