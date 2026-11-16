import { z } from 'zod';
import { InvalidTokenIdError } from '../errors/InvalidTokenIdError';

export const tokenIdSchema = z.string().regex(/^[1-9]\d*$/, 'Token ID phải là số nguyên dương.');

export function parseTokenId(value: string): string {
  const result = tokenIdSchema.safeParse(value.trim());
  if (!result.success) {
    throw new InvalidTokenIdError();
  }
  return result.data;
}