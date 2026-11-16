import { toIpfsUri } from '@/lib/domain/config/ipfs';
import { ArtworkUriAlreadyUsedError } from '@/lib/domain/errors/ArtworkUriAlreadyUsedError';
import { TransactionFailedError } from '@/lib/domain/errors/TransactionFailedError';
import { parseArtworkMetadata } from '@/lib/domain/schemas/artworkMetadata';
import type { PinFileInput } from '@/lib/domain/entities/PinFileInput';
import type { RegistrationStep } from '@/lib/domain/entities/RegistrationStep';
import type { IArtworkQueryGateway } from '@/lib/domain/ports/IArtworkQueryGateway';
import type { IArtworkWriteGateway } from '@/lib/domain/ports/IArtworkWriteGateway';
import type { IHashingGateway } from '@/lib/domain/ports/IHashingGateway';
import type { IIpfsPinner } from '@/lib/domain/ports/IIpfsPinner';
import type { WalletAddress } from '@/lib/domain/types/eth';

export interface RegisterArtworkInput {
  file: PinFileInput;
  name: string;
  author: string;
  description?: string;
  year?: number;
  from: WalletAddress;
}

export interface RegisterArtworkOutput {
  tokenId: string | null;
  tokenUri: string;
  txHash: string;
  imageCid: string;
  metadataCid: string;
  sha256: string;
}

export type RegistrationProgress = (step: RegistrationStep) => void;

export class RegisterArtworkUseCase {
  constructor(
    private readonly hasher: IHashingGateway,
    private readonly pinner: IIpfsPinner,
    private readonly writer: IArtworkWriteGateway,
    private readonly query: IArtworkQueryGateway,
  ) {}

  async execute(input: RegisterArtworkInput, onProgress?: RegistrationProgress): Promise<RegisterArtworkOutput> {
    onProgress?.('hashing');
    const sha256 = await this.hasher.sha256(input.file.bytes);

    onProgress?.('pinning-image');
    const imageCid = await this.pinner.pinFile(input.file);

    const metadata = parseArtworkMetadata({
      name: input.name,
      author: input.author,
      description: input.description,
      year: input.year,
      image: toIpfsUri(imageCid),
      sha256,
    });

    onProgress?.('pinning-metadata');
    const metadataCid = await this.pinner.pinJson(metadata);
    const tokenUri = toIpfsUri(metadataCid);

    // Simulate first: a duplicate URI must cost no gas and open no MetaMask prompt.
    onProgress?.('simulating');
    const simulation = await this.writer.simulateMint(tokenUri, input.from);
    if (!simulation.ok) {
      const existing = await this.query.findTokenIdByTokenUri(tokenUri).catch(() => null);
      if (existing) throw new ArtworkUriAlreadyUsedError(existing);
      throw new TransactionFailedError(simulation.revertReason);
    }

    onProgress?.('signing');
    const result = await this.writer.mint(tokenUri);

    onProgress?.('confirmed');
    return { tokenId: result.tokenId, tokenUri, txHash: result.txHash, imageCid, metadataCid, sha256 };
  }
}