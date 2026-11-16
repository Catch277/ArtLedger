/**
 * Ordered gateways. The first one is used for `src` and links; the rest are fallbacks
 * for reads and images. Public gateways rate-limit aggressively (ipfs.io and dweb.link
 * answer 429, Pinata asks for credentials once an IP exceeds its anonymous quota), so a
 * single host is a single point of failure for every artwork on the page.
 */
export const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://w3s.link/ipfs/',
  'https://dweb.link/ipfs/',
] as const;

export const IPFS_GATEWAY = IPFS_GATEWAYS[0];

export function toIpfsUri(cid: string): `ipfs://${string}` {
  return `ipfs://${cid}`;
}

export function cidFromUri(uri: string): string | null {
  if (!uri.startsWith('ipfs://')) return null;
  const cid = uri.slice('ipfs://'.length).replace(/^\/+/, '');
  return cid.length > 0 ? cid : null;
}

export function toGatewayUrl(uri: string, gateway: string = IPFS_GATEWAY): string {
  const cid = cidFromUri(uri);
  if (!cid) return uri;
  const base = gateway.endsWith('/') ? gateway : `${gateway}/`;
  return `${base}${cid}`;
}

/** Every gateway that may serve this URI, primary first. Non-IPFS URIs pass through. */
export function gatewayCandidatesFor(uri: string, gateways: readonly string[] = IPFS_GATEWAYS): string[] {
  if (!cidFromUri(uri)) return [uri];
  return gateways.map((gateway) => toGatewayUrl(uri, gateway));
}
