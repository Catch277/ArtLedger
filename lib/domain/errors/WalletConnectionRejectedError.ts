export class WalletConnectionRejectedError extends Error {
  constructor(message = 'Bạn đã từ chối kết nối ví.') {
    super(message);
    this.name = 'WalletConnectionRejectedError';
  }
}