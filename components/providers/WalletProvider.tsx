'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { SEPOLIA_CHAIN_ID } from '@/lib/domain/config/sepolia';
import { WalletNotInstalledError } from '@/lib/domain/errors/WalletNotInstalledError';
import { WrongNetworkError } from '@/lib/domain/errors/WrongNetworkError';
import { formatWeiToEth } from '@/lib/domain/format/wei';
import type { WalletAddress } from '@/lib/domain/types/eth';
import { sepoliaRpcUrl } from '@/lib/infrastructure/config/env';
import { MetamaskWalletGateway } from '@/lib/infrastructure/web3/MetamaskWalletGateway';
import { ConnectWalletUseCase } from '@/lib/usecases/ConnectWalletUseCase';

export interface WalletContextValue {
  address: WalletAddress | null;
  chainId: number | null;
  balanceEth: string | null;
  isInstalled: boolean;
  isConnecting: boolean;
  error: string | null;
  isSepolia: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchToSepolia: () => Promise<void>;
  /** Re-reads the balance for the current address (after a mint, a transfer or a faucet top-up). */
  refreshBalance: () => Promise<void>;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const gateway = useMemo(() => new MetamaskWalletGateway(sepoliaRpcUrl()), []);
  const [address, setAddress] = useState<WalletAddress | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balanceEth, setBalanceEth] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = useCallback(
    async (next: WalletAddress | null) => {
      if (!next) {
        setBalanceEth(null);
        return;
      }
      try {
        setBalanceEth(formatWeiToEth(await gateway.getBalance(next)));
      } catch {
        setBalanceEth(null);
      }
    },
    [gateway],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsInstalled(gateway.isAvailable());
      try {
        const [existing, currentChain] = await Promise.all([gateway.getAddress(), gateway.getChainId()]);
        if (cancelled) return;
        setAddress(existing);
        setChainId(currentChain);
        await loadBalance(existing);
      } catch {
        // No injected wallet: the app stays in read-only mode.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gateway, loadBalance]);

  useEffect(() => {
    const offAccounts = gateway.onAccountsChanged((next) => {
      setAddress(next);
      void loadBalance(next);
    });
    const offChain = gateway.onChainChanged((next) => setChainId(next));
    return () => {
      offAccounts();
      offChain();
    };
  }, [gateway, loadBalance]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const result = await new ConnectWalletUseCase(gateway).execute();
      setAddress(result.address);
      setChainId(result.chainId);
      setBalanceEth(result.balanceEth);
    } catch (caught) {
      if (caught instanceof WrongNetworkError) {
        setChainId(caught.chainId);
        const existing = await gateway.getAddress().catch(() => null);
        setAddress(existing);
        await loadBalance(existing);
      }
      if (caught instanceof WalletNotInstalledError) setIsInstalled(false);
      setError(caught instanceof Error ? caught.message : 'Không kết nối được ví.');
    } finally {
      setIsConnecting(false);
    }
  }, [gateway, loadBalance]);

  const disconnect = useCallback(async () => {
    await gateway.disconnect();
    setAddress(null);
    setChainId(null);
    setBalanceEth(null);
    setError(null);
  }, [gateway]);

  const switchToSepolia = useCallback(async () => {
    setError(null);
    try {
      await gateway.switchToSepolia();
      setChainId(await gateway.getChainId());
      await loadBalance(address);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không chuyển được mạng.');
    }
  }, [gateway, loadBalance, address]);

  const refreshBalance = useCallback(async () => {
    await loadBalance(address);
  }, [loadBalance, address]);

  const value: WalletContextValue = {
    address,
    chainId,
    balanceEth,
    isInstalled,
    isConnecting,
    error,
    isSepolia: chainId === null ? true : chainId === SEPOLIA_CHAIN_ID,
    connect,
    disconnect,
    switchToSepolia,
    refreshBalance,
    clearError: () => setError(null),
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet phải dùng bên trong WalletProvider.');
  return context;
}