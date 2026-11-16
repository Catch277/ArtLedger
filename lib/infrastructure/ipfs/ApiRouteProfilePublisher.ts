import { IpfsUploadError } from '@/lib/domain/errors/IpfsUploadError';
import type { PublishedProfile } from '@/lib/domain/schemas/profile';
import type { IProfilePublisher } from '@/lib/domain/ports/IProfilePublisher';
import type { IpfsCid } from '@/lib/domain/types/eth';

async function readCid(response: Response): Promise<IpfsCid> {
  const payload: unknown = await response.json().catch(() => null);
  const record = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};
  if (!response.ok) {
    const message = typeof record.error === 'string' ? record.error : 'Không công bố được hồ sơ lên IPFS. Thử lại.';
    throw new IpfsUploadError(message);
  }
  if (typeof record.cid !== 'string' || record.cid.length === 0) {
    throw new IpfsUploadError('Máy chủ không trả về CID hợp lệ.');
  }
  return record.cid;
}

/** Browser adapter: the Pinata JWT stays on the server, the client posts the document. */
export class ApiRouteProfilePublisher implements IProfilePublisher {
  async publish(profile: PublishedProfile): Promise<IpfsCid> {
    const response = await fetch('/api/pin-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return readCid(response);
  }
}
