export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';
export const SEPOLIA_CHAIN_NAME = 'Sepolia';
export const SEPOLIA_EXPLORER_URL = 'https://sepolia.etherscan.io';
/** Test ETH is free; the profile screen links here instead of promising a balance. */
export const SEPOLIA_FAUCET_URL = 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia';


export function explorerTxUrl(txHash: string): string {
  return `${SEPOLIA_EXPLORER_URL}/tx/${txHash}`;
}

export function explorerAddressUrl(address: string): string {
  return `${SEPOLIA_EXPLORER_URL}/address/${address}`;
}

export function explorerTokenUrl(contractAddress: string, tokenId: string): string {
  return `${SEPOLIA_EXPLORER_URL}/token/${contractAddress}?a=${tokenId}`;
}