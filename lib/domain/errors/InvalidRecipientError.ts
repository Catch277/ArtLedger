export class InvalidRecipientError extends Error {
  constructor(message = 'Địa chỉ ví nhận không hợp lệ. Dùng địa chỉ 0x… gồm 40 ký tự hex.') {
    super(message);
    this.name = 'InvalidRecipientError';
  }
}