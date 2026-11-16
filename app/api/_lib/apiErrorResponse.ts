import { NextResponse } from 'next/server';
import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import { InvalidTokenIdError } from '@/lib/domain/errors/InvalidTokenIdError';
import { IpfsReadError } from '@/lib/domain/errors/IpfsReadError';
import { IpfsUploadError } from '@/lib/domain/errors/IpfsUploadError';
import { MetadataValidationError } from '@/lib/domain/errors/MetadataValidationError';
import { ProfileValidationError } from '@/lib/domain/errors/ProfileValidationError';
import { TokenNotFoundError } from '@/lib/domain/errors/TokenNotFoundError';

/** One place that turns a typed domain error into a status code. */
export function apiErrorResponse(error: unknown, action: string): NextResponse {
  if (
    error instanceof MetadataValidationError ||
    error instanceof ProfileValidationError ||
    error instanceof InvalidTokenIdError
  ) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof TokenNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof IpfsUploadError || error instanceof IpfsReadError) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
  if (error instanceof ContractNotConfiguredError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  console.error(action, error);
  return NextResponse.json({ error: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.' }, { status: 500 });
}