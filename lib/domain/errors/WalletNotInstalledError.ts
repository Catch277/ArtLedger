export class WalletNotInstalledError extends Error {
  constructor(message = 'Chưa tìm thấy MetaMask. Cài tiện ích để kết nối ví và đăng ký tác phẩm.') {
    super(message);
    this.name = 'WalletNotInstalledError';
  }
}