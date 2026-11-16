import { Contract, Interface, JsonRpcProvider, id } from 'ethers';
import type { Log } from 'ethers';
import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import { TokenNotFoundError } from '@/lib/domain/errors/TokenNotFoundError';
import { ZERO_ADDRESS, isWalletAddress, sameAddress } from '@/lib/domain/types/address';
import type { TransferRecord } from '@/lib/domain/entities/TransferRecord';
import type { WalletTransaction } from '@/lib/domain/entities/WalletTransaction';
import type { IArtworkQueryGateway } from '@/lib/domain/ports/IArtworkQueryGateway';
import type { TokenId, WalletAddress } from '@/lib/domain/types/eth';
import { ERC721_ABI, TRANSFER_EVENT } from './erc721Abi';

/**
 * Public RPCs reject wide `eth_getLogs` ranges (publicnode and Alchemy both cap far
 * below 500k), so the scan walks the chain in 10k-block windows instead of one call.
 */
const BLOCK_CHUNK = 10_000;

/** Windows run in small batches: a wide scan must not look like a burst to the public RPC. */
const SCAN_CONCURRENCY = 5;

/** One receipt per row, so the fee column is capped instead of turning a long history into 100 calls. */
const MAX_FEE_ROWS = 25;

export class JsonRpcArtworkQueryGateway implements IArtworkQueryGateway {
  private readonly provider: JsonRpcProvider | null;
  private readonly iface = new Interface(ERC721_ABI);
  private readonly transferTopic = id(TRANSFER_EVENT);

  constructor(rpcUrl: string, private readonly address: string, private readonly fromBlock: number) {
    this.provider = rpcUrl.length > 0 ? new JsonRpcProvider(rpcUrl) : null;
  }

  isConfigured(): boolean {
    return this.provider !== null && isWalletAddress(this.address);
  }

  private contract(): Contract {
    if (!this.provider || !isWalletAddress(this.address)) throw new ContractNotConfiguredError();
    return new Contract(this.address, ERC721_ABI, this.provider);
  }

  async getTotalSupply(): Promise<number> {
    const total = (await this.contract().tongSoTacPham()) as bigint;
    return Number(total);
  }

  async getOwnerOf(tokenId: TokenId): Promise<WalletAddress> {
    // Resolve the contract first so a missing address surfaces as 503, not as 'token not found'.
    const contract = this.contract();
    try {
      return (await contract.ownerOf(BigInt(tokenId))) as WalletAddress;
    } catch {
      throw new TokenNotFoundError(tokenId);
    }
  }

  async getTokenUri(tokenId: TokenId): Promise<string> {
    const contract = this.contract();
    try {
      return (await contract.tokenURI(BigInt(tokenId))) as string;
    } catch {
      throw new TokenNotFoundError(tokenId);
    }
  }

  /** No indexer exists, so a duplicate URI can only be found by comparing every registered tokenURI. */
  async findTokenIdByTokenUri(tokenUri: string): Promise<TokenId | null> {
    const total = await this.getTotalSupply();
    for (let tokenId = total; tokenId >= 1; tokenId -= 1) {
      const uri = await this.getTokenUri(String(tokenId)).catch(() => null);
      if (uri === tokenUri) return String(tokenId);
    }
    return null;
  }

  async getTransferHistory(tokenId: TokenId): Promise<TransferRecord[]> {
    const provider = this.provider;
    if (!provider) throw new ContractNotConfiguredError();

    const latest = await provider.getBlockNumber();
    const tokenTopic = `0x${BigInt(tokenId).toString(16).padStart(64, '0')}`;
    const logs: Log[] = [];

    for (let from = this.fromBlock; from <= latest; from += BLOCK_CHUNK) {
      const toBlock = Math.min(from + BLOCK_CHUNK - 1, latest);
      const chunk = await provider.getLogs({
        address: this.address,
        topics: [this.transferTopic, null, null, tokenTopic],
        fromBlock: from,
        toBlock,
      });
      logs.push(...chunk);
    }

    const timestamps = new Map<number, number>();
    for (const log of logs) {
      if (timestamps.has(log.blockNumber)) continue;
      const block = await provider.getBlock(log.blockNumber);
      if (block) timestamps.set(log.blockNumber, block.timestamp);
    }

    const records: TransferRecord[] = [];
    for (const log of logs) {
      const parsed = this.iface.parseLog({ topics: [...log.topics], data: log.data });
      if (!parsed) continue;
      records.push({
        from: String(parsed.args[0]),
        to: String(parsed.args[1]),
        tokenId,
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        blockTimestamp: timestamps.get(log.blockNumber) ?? null,
      });
    }
    return records.sort((a, b) => a.blockNumber - b.blockNumber);
  }

  /**
   * The wallet's history has to be mined out of the contract's own Transfer logs: there is
   * no indexer, and `eth_getLogs` cannot ask two topic positions for one address at once.
   * Scanning the contract unfiltered and matching locally keeps this to one call per window.
   * The fee comes from the receipt (gasUsed x effectiveGasPrice), never from an estimate.
   */
  async getAccountTransactions(address: WalletAddress): Promise<WalletTransaction[]> {
    const provider = this.provider;
    if (!provider) throw new ContractNotConfiguredError();

    const latest = await provider.getBlockNumber();
    const windows: Array<[number, number]> = [];
    for (let from = this.fromBlock; from <= latest; from += BLOCK_CHUNK) {
      windows.push([from, Math.min(from + BLOCK_CHUNK - 1, latest)]);
    }

    const logs: Log[] = [];
    for (let index = 0; index < windows.length; index += SCAN_CONCURRENCY) {
      const batch = windows.slice(index, index + SCAN_CONCURRENCY);
      const results = await Promise.all(
        batch.map(([fromBlock, toBlock]) =>
          provider.getLogs({ address: this.address, topics: [this.transferTopic], fromBlock, toBlock }),
        ),
      );
      for (const chunk of results) logs.push(...chunk);
    }

    const rows: Array<{ from: string; to: string; tokenId: string; txHash: string; blockNumber: number }> = [];
    for (const log of logs) {
      const parsed = this.iface.parseLog({ topics: [...log.topics], data: log.data });
      if (!parsed) continue;
      const from = String(parsed.args[0]);
      const to = String(parsed.args[1]);
      if (!sameAddress(from, address) && !sameAddress(to, address)) continue;
      rows.push({ from, to, tokenId: String(parsed.args[2]), txHash: log.transactionHash, blockNumber: log.blockNumber });
    }
    if (rows.length === 0) return [];

    const timestamps = new Map<number, number>();
    for (const row of rows) {
      if (timestamps.has(row.blockNumber)) continue;
      const block = await provider.getBlock(row.blockNumber);
      if (block) timestamps.set(row.blockNumber, block.timestamp);
    }

    const newestFirst = [...rows].sort((a, b) => b.blockNumber - a.blockNumber);
    const fees = new Map<string, { feeWei: string; paidByWallet: boolean }>();
    for (const row of newestFirst.slice(0, MAX_FEE_ROWS)) {
      const receipt = await provider.getTransactionReceipt(row.txHash).catch(() => null);
      if (!receipt) continue;
      fees.set(row.txHash, {
        feeWei: (receipt.gasUsed * receipt.gasPrice).toString(),
        paidByWallet: sameAddress(receipt.from, address),
      });
    }

    return newestFirst.map((row) => {
      const fee = fees.get(row.txHash) ?? null;
      return {
        kind: this.kindOf(row.from, row.to, address),
        tokenId: row.tokenId,
        counterparty: sameAddress(row.from, address) ? row.to : row.from,
        txHash: row.txHash,
        blockNumber: row.blockNumber,
        blockTimestamp: timestamps.get(row.blockNumber) ?? null,
        feeWei: fee?.feeWei ?? null,
        feePaidByWallet: fee?.paidByWallet ?? false,
      };
    });
  }

  private kindOf(from: string, to: string, address: WalletAddress): WalletTransaction['kind'] {
    if (sameAddress(from, ZERO_ADDRESS)) return 'mint';
    if (sameAddress(from, address) && sameAddress(to, address)) return 'self';
    return sameAddress(from, address) ? 'sent' : 'received';
  }
}