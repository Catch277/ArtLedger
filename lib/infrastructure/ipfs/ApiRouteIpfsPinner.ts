import { IpfsUploadError } from '@/lib/domain/errors/IpfsUploadError';
import type { ArtworkMetadata } from '@/lib/domain/entities/ArtworkMetadata';
import type { PinFileInput } from '@/lib/domain/entities/PinFileInput';
import type { IIpfsPinner } from '@/lib/domain/ports/IIpfsPinner';
import type { IpfsCid } from '@/lib/domain/types/eth';

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function readCid(response: Response): Promise<IpfsCid> {
  const payload: unknown = await response.json().catch(() => null);
  const record = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};
  if (!response.ok) {
    const message = typeof record.error === 'string' ? record.error : 'Không tải được tệp lên IPFS. Thử lại.';
    throw new IpfsUploadError(message);
  }
  if (typeof record.cid !== 'string' || record.cid.length === 0) {
    throw new IpfsUploadError('Máy chủ không trả về CID hợp lệ.');
  }
  return record.cid;
}

/** Browser adapter: keeps the Pinata JWT on the server. */
export class ApiRouteIpfsPinner implements IIpfsPinner {
  async pinFile(file: PinFileInput): Promise<IpfsCid> {
    const form = new FormData();
    form.append('file', new Blob([toArrayBuffer(file.bytes)], { type: file.contentType }), file.filename);
    const response = await fetch('/api/pin-file', { method: 'POST', body: form });
    return readCid(response);
  }

  async pinJson(metadata: ArtworkMetadata): Promise<IpfsCid> {
    const response = await fetch('/api/pin-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata),
    });
    return readCid(response);
  }
}