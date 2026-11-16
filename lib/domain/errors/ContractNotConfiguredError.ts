export class ContractNotConfiguredError extends Error {
  constructor(message = 'Chưa cấu hình địa chỉ hợp đồng. Điền NEXT_PUBLIC_CONTRACT_ADDRESS trong .env.local rồi tải lại trang.') {
    super(message);
    this.name = 'ContractNotConfiguredError';
  }
}