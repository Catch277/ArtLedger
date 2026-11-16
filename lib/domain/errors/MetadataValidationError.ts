export class MetadataValidationError extends Error {
  constructor(message = 'Thông tin tác phẩm không hợp lệ.') {
    super(message);
    this.name = 'MetadataValidationError';
  }
}