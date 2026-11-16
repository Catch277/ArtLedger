import { NextResponse } from 'next/server';
import { apiErrorResponse } from '../_lib/apiErrorResponse';
import { parseJsonRequest } from '../_lib/parseJsonRequest';
import { parsePublishedProfile } from '@/lib/domain/schemas/profile';
import { pinataJwt } from '@/lib/infrastructure/config/env';
import { PinataProfilePublisher } from '@/lib/infrastructure/ipfs/PinataProfilePublisher';
import { PinProfileUseCase } from '@/lib/usecases/PinProfileUseCase';

/**
 * Pins a profile document and returns its CID. Nothing is stored server-side:
 * the caller keeps the pointer, which is why this is a publisher, not a store.
 */
export async function POST(request: Request) {
  const parsed = await parseJsonRequest(request);
  if (!parsed.ok) return parsed.response;

  try {
    const document = parsePublishedProfile(parsed.value);
    const publisher = new PinataProfilePublisher(pinataJwt());
    const result = await new PinProfileUseCase(publisher).execute(document);
    return NextResponse.json({ cid: result.cid, uri: result.uri }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'pin-profile');
  }
}

