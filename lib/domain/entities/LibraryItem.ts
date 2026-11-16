import type { ArtworkMetadata } from './ArtworkMetadata';

export interface LibraryItem {
  tokenId: string;
  tokenUri: string;
  imageUrl: string | null;
  metadata: ArtworkMetadata | null;
  metadataError: string | null;
}