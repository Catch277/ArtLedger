export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const;

export const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.webp,.gif';

export function isAllowedImageType(type: string): boolean {
  return ALLOWED_IMAGE_TYPES.some((allowed) => allowed === type);
}

/** Returns a Vietnamese sentence describing the problem, or null when the file is acceptable. */
export function validateImageFile(file: { type: string; size: number }): string | null {
  if (file.size === 0) return 'Tệp rỗng. Chọn ảnh khác.';
  if (!isAllowedImageType(file.type)) return 'Chỉ nhận ảnh PNG, JPG, WEBP hoặc GIF.';
  if (file.size > MAX_IMAGE_BYTES) return 'Ảnh vượt quá 4 MB. Chọn tệp nhỏ hơn.';
  return null;
}