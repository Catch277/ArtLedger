import { NextResponse } from 'next/server';
import { apiErrorResponse } from '../_lib/apiErrorResponse';
import { parseJsonRequest } from '../_lib/parseJsonRequest';
import { pinataJwt } from '@/lib/infrastructure/config/env';
import { PinataIpfsPinner } from '@/lib/infrastructure/ipfs/PinataIpfsPinner';
import { parseArtworkMetadata } from '@/lib/domain/schemas/artworkMetadata';
import { PinArtworkMetadataUseCase } from '@/lib/usecases/PinArtworkMetadataUseCase';

export async function POST(request: Request) {
  const parsed = await parseJsonRequest(request);
  if (!parsed.ok) return parsed.response;

  try {
    const metadata = parseArtworkMetadata(parsed.value);
    const pinner = new PinataIpfsPinner(pinataJwt());
    const result = await new PinArtworkMetadataUseCase(pinner).execute(metadata);
    return NextResponse.json({ cid: result.cid, tokenUri: result.tokenUri }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, 'pin-json');
  }
}