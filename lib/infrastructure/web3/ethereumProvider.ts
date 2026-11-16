import type { Eip1193Provider } from './Eip1193Provider';

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export function getEthereum(): Eip1193Provider | null {
  if (typeof window === 'undefined') return null;
  return window.ethereum ?? null;
}

export function hasEthereum(): boolean {
  return getEthereum() !== null;
}