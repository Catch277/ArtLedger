import { NextResponse } from 'next/server';
import { apiErrorResponse } from '../_lib/apiErrorResponse';
import { contractAddress, deployBlock, sepoliaRpcUrl } from '@/lib/infrastructure/config/env';
import { JsonRpcArtworkQueryGateway } from '@/lib/infrastructure/web3/JsonRpcArtworkQueryGateway';
import { GetTransferHistoryUseCase } from '@/lib/usecases/GetTransferHistoryUseCase';

export async function GET(request: Request) {
  const tokenId = new URL(request.url).searchParams.get('tokenId') ?? '';
  try {
    const gateway = new JsonRpcArtworkQueryGateway(sepoliaRpcUrl(), contractAddress(), deployBlock());
    const result = await new GetTransferHistoryUseCase(gateway).execute(tokenId);
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error, 'history');
  }
}