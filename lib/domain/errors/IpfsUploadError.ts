export class IpfsUploadError extends Error {
  constructor(message = 'Không tải được tệp lên IPFS. Kiểm tra kết nối và thử lại.') {
    super(message);
    this.name = 'IpfsUploadError';
  }
}