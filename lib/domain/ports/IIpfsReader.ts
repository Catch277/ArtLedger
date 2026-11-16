export interface IIpfsReader {
  toGatewayUrl(uri: string): string;
  readJson(cid: string): Promise<unknown>;
}