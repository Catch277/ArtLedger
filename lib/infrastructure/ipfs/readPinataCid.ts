import { IpfsUploadError } from '@/lib/domain/errors/IpfsUploadError';
import type { IpfsCid } from '@/lib/domain/types/eth';

/** Pinata answers 200 with `{ IpfsHash }`; every other shape has to become a typed error. */
export async function readPinataCid(response: Response): Promise<IpfsCid> {
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const suffix = detail.length > 0 ? ` ${detail.slice(0, 160)}` : '';
    throw new IpfsUploadError(`Pinata từ chối yêu cầu (HTTP ${response.status}).${suffix}`.trim());
  }
  const payload: unknown = await response.json().catch(() => null);
  const cid = typeof payload === 'object' && payload !== null && 'IpfsHash' in payload ? (payload as { IpfsHash?: unknown }).IpfsHash : null;
  if (typeof cid !== 'string' || cid.length === 0) {
    throw new IpfsUploadError('Pinata không trả về CID hợp lệ.');
  }
  return cid;
}
