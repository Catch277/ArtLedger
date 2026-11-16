import type { IHashingGateway } from '@/lib/domain/ports/IHashingGateway';

/** Web Crypto in the browser, node:crypto's WebCrypto implementation when called on the server. */
export class WebCryptoSha256 implements IHashingGateway {
  async sha256(bytes: Uint8Array): Promise<string> {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const digest = await crypto.subtle.digest('SHA-256', copy.buffer);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }
}