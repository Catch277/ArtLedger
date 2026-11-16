import { IPFS_GATEWAYS, toGatewayUrl, toIpfsUri } from '@/lib/domain/config/ipfs';
import { IpfsReadError } from '@/lib/domain/errors/IpfsReadError';
import type { IIpfsReader } from '@/lib/domain/ports/IIpfsReader';

export class GatewayIpfsReader implements IIpfsReader {
  constructor(private readonly gateways: readonly string[] = IPFS_GATEWAYS) {}

  toGatewayUrl(uri: string): string {
    return toGatewayUrl(uri, this.gateways[0]);
  }

  /** Tries each gateway in order: one host being rate-limited must not empty the library. */
  async readJson(cid: string): Promise<unknown> {
    const uri = toIpfsUri(cid);
    let lastStatus: number | null = null;

    for (const gateway of this.gateways) {
      let response: Response;
      try {
        response = await fetch(toGatewayUrl(uri, gateway));
      } catch {
        continue; // Network error on this host: try the next one.
      }
      if (!response.ok) {
        lastStatus = response.status;
        continue;
      }
      try {
        return await response.json();
      } catch {
        // A 200 that is not JSON is a real problem with the content, not the gateway.
        throw new IpfsReadError('Metadata trên IPFS không phải JSON hợp lệ.');
      }
    }

    throw new IpfsReadError(
      lastStatus === null
        ? 'Không kết nối được gateway IPFS nào. Kiểm tra mạng rồi thử lại.'
        : `Không gateway nào trả về nội dung (HTTP ${lastStatus} từ gateway đầu tiên).`,
    );
  }
}
