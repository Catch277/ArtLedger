export class TransactionFailedError extends Error {
  constructor(reason?: string | null) {
    super(reason ? `Giao dịch thất bại: ${reason}` : 'Giao dịch thất bại. Vui lòng thử lại.');
    this.name = 'TransactionFailedError';
  }
}