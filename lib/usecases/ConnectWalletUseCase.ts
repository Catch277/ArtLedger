import { SEPOLIA_CHAIN_ID } from '@/lib/domain/config/sepolia';
import { WalletNotInstalledError } from '@/lib/domain/errors/WalletNotInstalledError';
import { WrongNetworkError } from '@/lib/domain/errors/WrongNetworkError';
import { formatWeiToEth } from '@/lib/domain/format/wei';
import type { IWalletGateway } from '@/lib/domain/ports/IWalletGateway';
import type { WalletAddress } from '@/lib/domain/types/eth';

export interface ConnectWalletOutput {
  address: WalletAddress;
  chainId: number;
  balanceEth: string;
}

export class ConnectWalletUseCase {
  constructor(private readonly wallet: IWalletGateway) {}

  async execute(): Promise<ConnectWalletOutput> {
    if (!this.wallet.isAvailable()) throw new WalletNotInstalledError();
    const connection = await this.wallet.connect();
    if (connection.chainId !== SEPOLIA_CHAIN_ID) throw new WrongNetworkError(connection.chainId);
    return {
      address: connection.address,
      chainId: connection.chainId,
      balanceEth: formatWeiToEth(connection.balanceWei),
    };
  }
}