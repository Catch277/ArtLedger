export class NotArtworkOwnerError extends Error {
  constructor(public readonly tokenId: string) {
    super(`Ví hiện tại không phải chủ sở hữu Token #${tokenId}.`);
    this.name = 'NotArtworkOwnerError';
  }
}