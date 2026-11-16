export class WrongNetworkError extends Error {
  constructor(public readonly chainId: number) {
    super('Ví đang ở mạng khác. Chuyển sang Sepolia để tiếp tục.');
    this.name = 'WrongNetworkError';
  }
}