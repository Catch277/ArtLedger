export interface IHashingGateway {
  sha256(bytes: Uint8Array): Promise<string>;
}