export class TransactionRejectedError extends Error {
  constructor(message = 'Bạn đã hủy giao dịch. Không có thay đổi nào được ghi lên chuỗi.') {
    super(message);
    this.name = 'TransactionRejectedError';
  }
}