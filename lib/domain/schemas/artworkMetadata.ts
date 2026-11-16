import { z } from 'zod';
import type { ArtworkMetadata } from '../entities/ArtworkMetadata';
import { MetadataValidationError } from '../errors/MetadataValidationError';

const attributeSchema = z.object({
  trait_type: z.string(),
  value: z.union([z.string(), z.number()]),
});

/**
 * Two metadata dialects exist in the wild: this app writes flat `author` / `year`,
 * while the deployed collection writes ERC-721 `attributes` (`tac_gia`,
 * `Nam sang tac`). Both are accepted here and normalised into one domain shape —
 * otherwise every token minted by the other client reads as broken.
 */
export const artworkMetadataSchema = z.object({
  name: z
    .string()
    .max(100, 'Tên tác phẩm tối đa 100 ký tự.')
    .refine((value) => value.trim().length > 0, 'Tên tác phẩm là bắt buộc.'),
  author: z.string().max(100, 'Tên tác giả tối đa 100 ký tự.').optional(),
  tac_gia: z.string().max(100, 'Tên tác giả tối đa 100 ký tự.').optional(),
  description: z.string().max(500, 'Mô tả tối đa 500 ký tự.').optional(),
  year: z.number().int().optional(),
  image: z.string().regex(/^ipfs:\/\/[A-Za-z0-9]+/, 'Ảnh phải có dạng ipfs://<cid>.'),
  sha256: z.string().regex(/^[a-f0-9]{64}$/, 'SHA-256 phải gồm 64 ký tự hex.').optional(),
  attributes: z.array(attributeSchema).optional(),
});

export type ArtworkMetadataInput = z.infer<typeof artworkMetadataSchema>;

const AUTHOR_TRAIT = /tac.?gia|author/i;
const YEAR_TRAIT = /nam.?sang.?tac|year/i;

const FIELD_LABELS: Record<string, string> = {
  name: 'Tên tác phẩm',
  author: 'Tác giả',
  tac_gia: 'Tác giả',
  description: 'Mô tả',
  year: 'Năm sáng tác',
  image: 'Ảnh',
  sha256: 'SHA-256',
  attributes: 'Thuộc tính',
};

/** Zod's built-in messages are English; every sentence the UI shows must be Vietnamese. */
function vietnameseIssueMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'Thông tin tác phẩm không hợp lệ.';
  const field = issue.path.length > 0 ? String(issue.path[0]) : '';
  const label = FIELD_LABELS[field];
  if (label && /^(Invalid|Required|Expected|Too |Unrecognized)/.test(issue.message)) {
    return label + ' là bắt buộc hoặc không hợp lệ.';
  }
  return issue.message;
}

function findTrait(
  attributes: { trait_type: string; value: string | number }[] | undefined,
  pattern: RegExp,
): string | number | undefined {
  return attributes?.find((attribute) => pattern.test(attribute.trait_type))?.value;
}

function toYear(value: string | number | undefined): number | undefined {
  if (typeof value === 'number') return Number.isInteger(value) ? value : undefined;
  if (typeof value === 'string' && /^\d{4}$/.test(value.trim())) return Number(value.trim());
  return undefined;
}

export function parseArtworkMetadata(value: unknown): ArtworkMetadata {
  const result = artworkMetadataSchema.safeParse(value);
  if (!result.success) throw new MetadataValidationError(vietnameseIssueMessage(result.error));

  const data = result.data;
  const traitAuthor = findTrait(data.attributes, AUTHOR_TRAIT);
  const author = (data.author ?? data.tac_gia ?? (typeof traitAuthor === 'string' ? traitAuthor : '')).trim();
  if (author.length === 0) throw new MetadataValidationError('Tác giả là bắt buộc.');

  const year = toYear(data.year ?? findTrait(data.attributes, YEAR_TRAIT));
  if (year !== undefined && (year < 1900 || year > new Date().getFullYear())) {
    throw new MetadataValidationError('Năm sáng tác phải từ 1900 tới năm hiện tại.');
  }

  return {
    name: data.name.trim(),
    author,
    description: data.description?.trim() || undefined,
    year,
    image: data.image,
    sha256: data.sha256,
  };
}
