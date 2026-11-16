import { BrowserProvider } from 'ethers';
import { SEPOLIA_CHAIN_ID_HEX, SEPOLIA_CHAIN_NAME, SEPOLIA_EXPLORER_URL } from '@/lib/domain/config/sepolia';
import { TransactionFailedError } from '@/lib/domain/errors/TransactionFailedError';
import { WalletNotInstalledError } from '@/lib/domain/errors/WalletNotInstalledError';
import type { WalletConnection } from '@/lib/domain/entities/WalletConnection';
import type { IWalletGateway } from '@/lib/domain/ports/IWalletGateway';
import type { WalletAddress } from '@/lib/domain/types/eth';
import { getEthereum } from './ethereumProvider';
import type { Eip1193Provider } from './Eip1193Provider';
import { mapWalletError, providerErrorCode } from './providerErrors';

const FALLBACK_SEPOLIA_RPC = 'https://rpc.sepolia.org';

export class MetamaskWalletGateway implements IWalletGateway {
  constructor(private readonly rpcUrl: string) {}

  isAvailable(): boolean {
    return getEthereum() !== null;
  }

  private requireEthereum(): Eip1193Provider {
    const ethereum = getEthereum();
    if (!ethereum) throw new WalletNotInstalledError();
    return ethereum;
  }

  async connect(): Promise<WalletConnection> {
    const ethereum = this.requireEthereum();
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = (await signer.getAddress()) as WalletAddress;
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);
      return { address, chainId: Number(network.chainId), balanceWei: balance.toString() };
    } catch (error) {
      throw mapWalletError(error, 'connect');
    }
  }

  async disconnect(): Promise<void> {
    const ethereum = getEthereum();
    if (!ethereum) return;
    try {
      await ethereum.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] });
    } catch {
      // Older MetaMask builds do not support revoking; disconnecting is then a UI-only action.
    }
  }

  async getAddress(): Promise<WalletAddress | null> {
    const ethereum = getEthereum();
    if (!ethereum) return null;
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (!Array.isArray(accounts)) return null;
    const first: unknown = accounts[0];
    return typeof first === 'string' ? (first as WalletAddress) : null;
  }

  async getChainId(): Promise<number> {
    const ethereum = this.requireEthereum();
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    if (typeof chainId !== 'string') throw new TransactionFailedError('Không đọc được chainId từ ví.');
    return Number.parseInt(chainId, 16);
  }

  async getBalance(address: WalletAddress): Promise<string> {
    const provider = new BrowserProvider(this.requireEthereum());
    const balance = await provider.getBalance(address);
    return balance.toString();
  }

  async switchToSepolia(): Promise<void> {
    const ethereum = this.requireEthereum();
    try {
      await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }] });
    } catch (error) {
      if (providerErrorCode(error) !== 4902) throw mapWalletError(error, 'write');
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID_HEX,
            chainName: SEPOLIA_CHAIN_NAME,
            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: [this.rpcUrl.length > 0 ? this.rpcUrl : FALLBACK_SEPOLIA_RPC],
            blockExplorerUrls: [SEPOLIA_EXPLORER_URL],
          },
        ],
      });
    }
  }

  onAccountsChanged(listener: (address: WalletAddress | null) => void): () => void {
    const ethereum = getEthereum();
    if (!ethereum?.on) return () => undefined;
    const handler = (...args: unknown[]) => {
      const accounts: unknown = args[0];
      const first: unknown = Array.isArray(accounts) ? accounts[0] : null;
      listener(typeof first === 'string' ? (first as WalletAddress) : null);
    };
    ethereum.on('accountsChanged', handler);
    return () => ethereum.removeListener?.('accountsChanged', handler);
  }

  onChainChanged(listener: (chainId: number) => void): () => void {
    const ethereum = getEthereum();
    if (!ethereum?.on) return () => undefined;
    const handler = (...args: unknown[]) => {
      const value: unknown = args[0];
      if (typeof value === 'string') listener(Number.parseInt(value, 16));
    };
    ethereum.on('chainChanged', handler);
    return () => ethereum.removeListener?.('chainChanged', handler);
  }
}