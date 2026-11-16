import type { ArtworkMetadata } from '@/lib/domain/entities/ArtworkMetadata';
import type { PinFileInput } from '@/lib/domain/entities/PinFileInput';
import type { IIpfsPinner } from '@/lib/domain/ports/IIpfsPinner';
import type { IpfsCid } from '@/lib/domain/types/eth';
import { readPinataCid } from './readPinataCid';

const PIN_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const PIN_JSON_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

/** Server-side adapter: the only place the Pinata JWT is used. */
export class PinataIpfsPinner implements IIpfsPinner {
  constructor(private readonly jwt: string) {}

  async pinFile(file: PinFileInput): Promise<IpfsCid> {
    const form = new FormData();
    form.append('file', new Blob([toArrayBuffer(file.bytes)], { type: file.contentType }), file.filename);
    form.append('pinataMetadata', JSON.stringify({ name: file.filename }));

    const response = await fetch(PIN_FILE_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.jwt}` },
      body: form,
    });
    return readPinataCid(response);
  }

  async pinJson(metadata: ArtworkMetadata): Promise<IpfsCid> {
    const response = await fetch(PIN_JSON_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinataContent: metadata, pinataMetadata: { name: `artledger-${metadata.name}` } }),
    });
    return readPinataCid(response);
  }
}