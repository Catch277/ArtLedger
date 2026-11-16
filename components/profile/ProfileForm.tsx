'use client';

import { ImageUp, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ProfileAvatar } from './ProfileAvatar';
import { Button } from '@/components/ui/Button';
import { toIpfsUri } from '@/lib/domain/config/ipfs';
import { IMAGE_ACCEPT, validateImageFile } from '@/lib/domain/config/upload';
import type { ProfileAvatar as ProfileAvatarValue } from '@/lib/domain/entities/Profile';
import type { ProfileInput } from '@/lib/domain/schemas/profile';
import type { ProfileLink, ProfileLinkLabel } from '@/lib/domain/entities/ProfileLink';
import { ApiRouteIpfsPinner } from '@/lib/infrastructure/ipfs/ApiRouteIpfsPinner';

const CONTROL =
  'mt-1 w-full rounded-control border border-hairline-strong bg-surface px-3 shadow-card text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

const LINK_FIELDS: { label: ProfileLinkLabel; title: string; placeholder: string; hint: string }[] = [
  { label: 'website', title: 'Website', placeholder: 'https://banve.vn', hint: 'Trang cá nhân hoặc portfolio.' },
  { label: 'x', title: 'X (Twitter)', placeholder: 'https://x.com/tenban', hint: 'Hồ sơ X của bạn.' },
  { label: 'instagram', title: 'Instagram', placeholder: 'https://instagram.com/tenban', hint: 'Trang Instagram.' },
];

function initialUrls(links: ProfileLink[]): Record<ProfileLinkLabel, string> {
  return {
    website: links.find((link) => link.label === 'website')?.url ?? '',
    x: links.find((link) => link.label === 'x')?.url ?? '',
    instagram: links.find((link) => link.label === 'instagram')?.url ?? '',
  };
}

export function ProfileForm({
  initial,
  address,
  submitting,
  error,
  onSubmit,
  onCancel,
}: {
  initial: ProfileInput;
  address: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (input: ProfileInput) => void;
  onCancel: () => void;
}) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [bio, setBio] = useState(initial.bio);
  const [avatar, setAvatar] = useState<ProfileAvatarValue>(initial.avatar);
  const [urls, setUrls] = useState<Record<ProfileLinkLabel, string>>(() => initialUrls(initial.links));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleAvatar(file: File | null) {
    if (!file) return;
    setUploadError(null);
    const problem = validateImageFile(file);
    if (problem) {
      setUploadError(problem);
      return;
    }
    setUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const cid = await new ApiRouteIpfsPinner().pinFile({ bytes, filename: file.name, contentType: file.type });
      setAvatar({ kind: 'image', uri: toIpfsUri(cid) });
    } catch (caught) {
      setUploadError(caught instanceof Error ? caught.message : 'Không tải được ảnh đại diện lên IPFS.');
    } finally {
      setUploading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const links: ProfileLink[] = LINK_FIELDS.map(({ label }) => ({ label, url: urls[label].trim() })).filter(
      (link) => link.url.length > 0,
    );
    // Validity is decided by the domain schema inside the use case, not here.
    onSubmit({ displayName, bio, avatar, links });
  }

  return (
    <form onSubmit={submit} className='space-y-5'>
      <div className='flex flex-wrap items-center gap-4'>
        <ProfileAvatar avatar={avatar} displayName={displayName} address={address} />
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <label className='cursor-pointer'>
              <span className='inline-flex h-8 items-center gap-2 rounded-full border border-hairline bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:bg-ink/5'>
                <ImageUp aria-hidden size={16} strokeWidth={2} />
                {uploading ? 'Đang tải ảnh…' : 'Chọn ảnh đại diện'}
              </span>
              <input
                type='file'
                accept={IMAGE_ACCEPT}
                disabled={uploading}
                onChange={(event) => void handleAvatar(event.target.files?.[0] ?? null)}
                className='sr-only'
              />
            </label>
            {avatar.kind === 'image' ? (
              <Button variant='ghost' size='sm' onClick={() => setAvatar({ kind: 'monogram', uri: null })} disabled={uploading}>
                <RotateCcw aria-hidden size={16} strokeWidth={2} />
                Dùng chữ viết tắt
              </Button>
            ) : null}
          </div>
          <p className='mt-2 text-xs leading-5 text-ink-muted'>PNG, JPG, WEBP hoặc GIF · tối đa 4 MB.</p>
          {uploadError ? (
            <p role='alert' className='mt-2 rounded-control bg-danger-soft px-3 py-2 text-xs text-ink'>
              {uploadError}
            </p>
          ) : null}
        </div>
      </div>

      <label className='block'>
        <span className='text-xs font-semibold text-ink'>Tên hiển thị</span>
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={40}
          required
          className={`${CONTROL} h-10`}
        />
        <span className='mt-1 block text-xs text-ink-muted'>{displayName.length}/40 ký tự.</span>
      </label>

      <label className='block'>
        <span className='text-xs font-semibold text-ink'>Giới thiệu</span>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={160}
          rows={3}
          className={`${CONTROL} p-3`}
        />
        <span className='mt-1 block text-xs text-ink-muted'>{bio.length}/160 ký tự.</span>
      </label>

      <fieldset className='space-y-3'>
        <legend className='text-xs font-semibold text-ink'>Liên kết (tối đa 3)</legend>
        {LINK_FIELDS.map((field) => (
          <label key={field.label} className='block'>
            <span className='text-xs font-medium text-ink-muted'>{field.title}</span>
            <input
              value={urls[field.label]}
              onChange={(event) => setUrls((current) => ({ ...current, [field.label]: event.target.value }))}
              placeholder={field.placeholder}
              inputMode='url'
              className={`${CONTROL} h-10`}
            />
            <span className='mt-1 block text-xs text-ink-muted'>{field.hint}</span>
          </label>
        ))}
      </fieldset>

      {error ? (
        <p role='alert' className='rounded-control bg-danger-soft px-3 py-2 text-sm text-ink'>
          <span className='font-semibold'>Không lưu được hồ sơ.</span> {error}
        </p>
      ) : null}

      <div className='flex flex-wrap justify-end gap-3 border-t border-hairline pt-4'>
        <Button type='button' variant='secondary' onClick={onCancel} disabled={submitting}>
          Hủy
        </Button>
        <Button type='submit' disabled={submitting || uploading}>
          {submitting ? 'Đang lưu…' : 'Lưu hồ sơ'}
        </Button>
      </div>
    </form>
  );
}
