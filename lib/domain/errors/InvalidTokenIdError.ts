export class InvalidTokenIdError extends Error {
  constructor(message = 'Token ID phải là số nguyên dương.') {
    super(message);
    this.name = 'InvalidTokenIdError';
  }
}