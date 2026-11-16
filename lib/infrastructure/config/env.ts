import { IpfsUploadError } from '@/lib/domain/errors/IpfsUploadError';

/** Public values are read through static member access so Next can inline them at build time. */
export function sepoliaRpcUrl(): string {
  return process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? '';
}

export function contractAddress(): string {
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '';
}

export function deployBlock(): number {
  const raw = process.env.NEXT_PUBLIC_DEPLOY_BLOCK;
  const parsed = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function pinataJwt(): string {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new IpfsUploadError('Chưa cấu hình PINATA_JWT trên máy chủ. Thêm biến môi trường rồi thử lại.');
  }
  return jwt;
}