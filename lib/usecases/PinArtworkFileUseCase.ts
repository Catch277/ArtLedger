import { toIpfsUri } from '@/lib/domain/config/ipfs';
import type { PinFileInput } from '@/lib/domain/entities/PinFileInput';
import type { IIpfsPinner } from '@/lib/domain/ports/IIpfsPinner';

export interface PinArtworkFileOutput {
  cid: string;
  uri: string;
}

export class PinArtworkFileUseCase {
  constructor(private readonly pinner: IIpfsPinner) {}

  async execute(file: PinFileInput): Promise<PinArtworkFileOutput> {
    const cid = await this.pinner.pinFile(file);
    return { cid, uri: toIpfsUri(cid) };
  }
}