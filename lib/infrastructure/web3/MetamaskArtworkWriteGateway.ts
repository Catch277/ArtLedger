import { BrowserProvider, Contract, Interface, JsonRpcProvider } from 'ethers';
import type { TransactionReceipt } from 'ethers';
import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import { TransactionFailedError } from '@/lib/domain/errors/TransactionFailedError';
import { WalletNotInstalledError } from '@/lib/domain/errors/WalletNotInstalledError';
import { ZERO_ADDRESS, isWalletAddress } from '@/lib/domain/types/address';
import type { SimulationResult } from '@/lib/domain/entities/SimulationResult';
import type { TransactionResult } from '@/lib/domain/entities/TransactionResult';
import type { IArtworkWriteGateway } from '@/lib/domain/ports/IArtworkWriteGateway';
import type { TokenId, WalletAddress } from '@/lib/domain/types/eth';
import { ERC721_ABI } from './erc721Abi';
import { getEthereum } from './ethereumProvider';
import { mapWalletError, providerErrorMessage } from './providerErrors';

export class MetamaskArtworkWriteGateway implements IArtworkWriteGateway {
  private readonly iface = new Interface(ERC721_ABI);
  private readonly reader: JsonRpcProvider | null;

  constructor(rpcUrl: string, private readonly address: string) {
    this.reader = rpcUrl.length > 0 ? new JsonRpcProvider(rpcUrl) : null;
  }

  private requireAddress(): string {
    if (!isWalletAddress(this.address)) throw new ContractNotConfiguredError();
    return this.address;
  }

  private async signerContract(): Promise<{ contract: Contract; signerAddress: WalletAddress }> {
    const contractAddress = this.requireAddress();
    const ethereum = getEthereum();
    if (!ethereum) throw new WalletNotInstalledError();
    const provider = new BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const signerAddress = (await signer.getAddress()) as WalletAddress;
    return { contract: new Contract(contractAddress, ERC721_ABI, signer), signerAddress };
  }

  /** eth_call against the public RPC: no wallet, no gas, no signature. */
  private async simulate(functionName: string, args: unknown[], from: WalletAddress): Promise<SimulationResult> {
    const address = this.requireAddress();
    const reader = this.reader;
    if (!reader) throw new ContractNotConfiguredError();
    const data = this.iface.encodeFunctionData(functionName, args);
    try {
      await reader.call({ from, to: address, data });
      return { ok: true, revertReason: null };
    } catch (error) {
      return { ok: false, revertReason: providerErrorMessage(error) };
    }
  }

  simulateMint(tokenUri: string, from: WalletAddress): Promise<SimulationResult> {
    // The contract mints to an explicit recipient, so the artist mints to themself.
    return this.simulate('mintTacPham', [from, tokenUri], from);
  }

  /** A self-transfer succeeds for the owner and reverts for anyone else - the check S2 needs. */
  simulateTransfer(tokenId: TokenId, from: WalletAddress): Promise<SimulationResult> {
    return this.simulate('transferFrom', [from, from, BigInt(tokenId)], from);
  }

  async mint(tokenUri: string): Promise<TransactionResult> {
    const { contract, signerAddress } = await this.signerContract();
    try {
      const tx = await contract.mintTacPham(signerAddress, tokenUri);
      const receipt = (await tx.wait()) as TransactionReceipt | null;
      if (!receipt) throw new TransactionFailedError();
      return { txHash: receipt.hash, tokenId: this.readMintedTokenId(receipt), blockNumber: receipt.blockNumber };
    } catch (error) {
      if (error instanceof TransactionFailedError) throw error;
      throw mapWalletError(error, 'write');
    }
  }

  async transfer(tokenId: TokenId, to: WalletAddress): Promise<TransactionResult> {
    const { contract, signerAddress } = await this.signerContract();
    try {
      const tx = await contract.transferFrom(signerAddress, to, BigInt(tokenId));
      const receipt = (await tx.wait()) as TransactionReceipt | null;
      if (!receipt) throw new TransactionFailedError();
      return { txHash: receipt.hash, tokenId, blockNumber: receipt.blockNumber };
    } catch (error) {
      if (error instanceof TransactionFailedError) throw error;
      throw mapWalletError(error, 'write');
    }
  }

  private readMintedTokenId(receipt: TransactionReceipt): string | null {
    for (const log of receipt.logs) {
      try {
        const parsed = this.iface.parseLog({ topics: [...log.topics], data: log.data });
        if (!parsed || parsed.name !== 'Transfer') continue;
        if (String(parsed.args[0]).toLowerCase() !== ZERO_ADDRESS) continue;
        const value: unknown = parsed.args[2];
        return typeof value === 'bigint' ? value.toString() : String(value);
      } catch {
        continue;
      }
    }
    return null;
  }
}