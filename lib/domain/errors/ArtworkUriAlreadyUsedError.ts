export class ArtworkUriAlreadyUsedError extends Error {
  constructor(public readonly tokenId?: string) {
    super(
      tokenId
        ? `Ảnh này đã được đăng ký ở Token #${tokenId}. Mỗi tệp chỉ tương ứng một tác phẩm.`
        : 'Tệp này đã được đăng ký trước đó. Mỗi tệp chỉ tương ứng một tác phẩm.',
    );
    this.name = 'ArtworkUriAlreadyUsedError';
  }
}