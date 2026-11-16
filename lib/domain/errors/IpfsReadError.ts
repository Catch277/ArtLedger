export class IpfsReadError extends Error {
  constructor(message = 'Không tải được dữ liệu từ IPFS. Thử lại sau ít phút.') {
    super(message);
    this.name = 'IpfsReadError';
  }
}