export class TokenNotFoundError extends Error {
  constructor(public readonly tokenId: string) {
    super(`Tác phẩm chưa được đăng ký: không tìm thấy Token #${tokenId}.`);
    this.name = 'TokenNotFoundError';
  }
}