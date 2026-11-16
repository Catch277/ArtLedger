/**
 * One transaction of the artwork contract that touched this wallet. There is no
 * indexer, so mints and transfers are the only activity the chain can enumerate;
 * plain ETH transfers in and out are invisible here by design.
 */
export interface WalletTransaction {
  /** `mint` when the sender is the zero address, `self` when from and to are the same wallet. */
  kind: 'mint' | 'received' | 'sent' | 'self';
  tokenId: string;
  /** The other side of the transfer; the zero address for a mint. */
  counterparty: string;
  txHash: string;
  blockNumber: number;
  blockTimestamp: number | null;
  /** gasUsed x effectiveGasPrice in wei, or null when the receipt could not be read. */
  feeWei: string | null;
  /** True when the receipt names this wallet as sender, so it paid the fee. */
  feePaidByWallet: boolean;
}
