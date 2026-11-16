import { z } from 'zod';
import { ProfileValidationError } from '../errors/ProfileValidationError';
import type { Profile } from '../entities/Profile';
import type { WalletAddress } from '../types/eth';

const MAX_LINKS = 3;

const addressSchema = z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Địa chỉ ví không hợp lệ.');

const linkSchema = z.object({
  label: z.enum(['website', 'x', 'instagram']),
  url: z
    .string()
    .max(200, 'Liên kết tối đa 200 ký tự.')
    .regex(/^https?:\/\/\S+$/i, 'Liên kết phải bắt đầu bằng http:// hoặc https://.'),
});

const avatarSchema = z
  .object({
    kind: z.enum(['monogram', 'image']),
    uri: z.string().regex(/^ipfs:\/\/[A-Za-z0-9]+/, 'Ảnh đại diện phải có dạng ipfs://<cid>.').nullable(),
  })
  .refine((avatar) => avatar.kind !== 'image' || avatar.uri !== null, 'Chọn ảnh đại diện trước khi lưu.');

/** The fields a person edits. Address and timestamps belong to the app. */
const fieldsSchema = z.object({
  displayName: z
    .string()
    .max(40, 'Tên hiển thị tối đa 40 ký tự.')
    .refine((value) => value.trim().length > 0, 'Tên hiển thị là bắt buộc.'),
  bio: z.string().max(160, 'Giới thiệu tối đa 160 ký tự.'),
  avatar: avatarSchema,
  links: z.array(linkSchema).max(MAX_LINKS, `Tối đa ${MAX_LINKS} liên kết.`),
});

/** The document that gets pinned: edited fields plus the address they claim. */
export const publishedProfileSchema = fieldsSchema.extend({
  version: z.literal(1),
  address: addressSchema,
  updatedAt: z.string().min(1, 'Thiếu thời điểm cập nhật.'),
});

/** The same document plus the pointer to where it was published. */
export const storedProfileSchema = publishedProfileSchema.extend({
  publishedCid: z.string().nullable(),
});

export type ProfileInput = z.infer<typeof fieldsSchema>;

type PublishedProfileData = z.infer<typeof publishedProfileSchema>;

/** Same document, but the address is narrowed to the domain's WalletAddress. */
export type PublishedProfile = Omit<PublishedProfileData, 'address'> & { address: WalletAddress };

const FIELD_LABELS: Record<string, string> = {
  displayName: 'Tên hiển thị',
  bio: 'Giới thiệu',
  avatar: 'Ảnh đại diện',
  links: 'Liên kết',
  address: 'Địa chỉ ví',
  updatedAt: 'Thời điểm cập nhật',
};

/** Zod speaks English by default; every sentence the UI shows must be Vietnamese. */
function vietnameseIssueMessage(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'Hồ sơ không hợp lệ.';
  const field = issue.path.length > 0 ? String(issue.path[0]) : '';
  const label = FIELD_LABELS[field];
  if (label && /^(Invalid|Required|Expected|Too |Unrecognized)/.test(issue.message)) {
    return `${label} không hợp lệ.`;
  }
  return issue.message;
}

function normalise(data: z.infer<typeof fieldsSchema>) {
  return {
    displayName: data.displayName.trim(),
    bio: data.bio.trim(),
    avatar: data.avatar,
    // A blank URL is a row the person did not fill in, not a broken link.
    links: data.links.filter((link) => link.url.trim().length > 0).map((link) => ({ label: link.label, url: link.url.trim() })),
  };
}

export function parseProfileInput(value: unknown): ProfileInput {
  const result = fieldsSchema.safeParse(value);
  if (!result.success) throw new ProfileValidationError(vietnameseIssueMessage(result.error));
  return normalise(result.data);
}

export function parsePublishedProfile(value: unknown): PublishedProfile {
  const result = publishedProfileSchema.safeParse(value);
  if (!result.success) throw new ProfileValidationError(vietnameseIssueMessage(result.error));
  return {
    ...normalise(result.data),
    version: 1,
    address: result.data.address as WalletAddress,
    updatedAt: result.data.updatedAt,
  };
}

/** Storage reads must never throw: a corrupt record behaves like "no profile yet". */
export function parseStoredProfile(value: unknown): Profile | null {
  const result = storedProfileSchema.safeParse(value);
  if (!result.success) return null;
  return {
    ...normalise(result.data),
    address: result.data.address as WalletAddress,
    updatedAt: result.data.updatedAt,
    publishedCid: result.data.publishedCid,
  };
}

/** Builds the pinned document and re-validates it, so a bad payload never leaves. */
export function toPublishedProfile(profile: Profile): PublishedProfile {
  return parsePublishedProfile({
    version: 1,
    address: profile.address,
    displayName: profile.displayName,
    bio: profile.bio,
    avatar: profile.avatar,
    links: profile.links,
    updatedAt: profile.updatedAt,
  });
}

