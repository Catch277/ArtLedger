import { TransactionFailedError } from '@/lib/domain/errors/TransactionFailedError';
import { TransactionRejectedError } from '@/lib/domain/errors/TransactionRejectedError';
import { WalletConnectionRejectedError } from '@/lib/domain/errors/WalletConnectionRejectedError';

interface CodeAndMessage {
  code: number | null;
  message: string | null;
}

/** Walks ethers' nested error envelope (error.info.error.code) without using any. */
function collect(error: unknown, depth = 0): CodeAndMessage {
  if (depth > 4 || typeof error !== 'object' || error === null) {
    return { code: null, message: typeof error === 'string' ? error : null };
  }
  const record = error as Record<string, unknown>;
  const rawCode = record.code;
  const code = typeof rawCode === 'number' ? rawCode : rawCode === 'ACTION_REJECTED' ? 4001 : null;
  const rawMessage = typeof record.message === 'string' ? record.message : typeof record.reason === 'string' ? record.reason : null;

  for (const key of ['info', 'error', 'data', 'cause']) {
    const nested = record[key];
    if (nested === undefined) continue;
    const found = collect(nested, depth + 1);
    if (found.code !== null) return { code: found.code, message: found.message ?? rawMessage };
    if (!rawMessage && found.message) return { code: null, message: found.message };
  }
  return { code, message: rawMessage };
}

export function providerErrorCode(error: unknown): number | null {
  return collect(error).code;
}

export function providerErrorMessage(error: unknown): string | null {
  const message = collect(error).message;
  if (!message) return null;
  // No revert data means the fallback ran (wrong selector) or a bare require failed.
  // Ethers' English phrasing hides that, so it becomes one actionable sentence.
  if (/no data present|likely require\(false\)/i.test(message)) {
    return 'Hợp đồng từ chối mà không kèm lý do: kiểm tra chữ ký hàm trong ABI có khớp hợp đồng đang cấu hình, hoặc điều kiện của hợp đồng không đạt.';
  }
  return message;
}

export function mapWalletError(error: unknown, context: 'connect' | 'write'): Error {
  const { code, message } = collect(error);
  if (code === 4001) {
    return context === 'connect' ? new WalletConnectionRejectedError() : new TransactionRejectedError();
  }
  return new TransactionFailedError(message);
}