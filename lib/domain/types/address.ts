import type { WalletAddress } from './eth';

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function isWalletAddress(value: string): value is WalletAddress {
  return ADDRESS_PATTERN.test(value);
}

export function sameAddress(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}