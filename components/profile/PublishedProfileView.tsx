'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProfileCard } from './ProfileCard';
import { Button } from '@/components/ui/Button';
import { HashChip } from '@/components/ui/HashChip';
import { cidFromUri } from '@/lib/domain/config/ipfs';
import type { PublishedProfile } from '@/lib/domain/schemas/profile';
import { GatewayIpfsReader } from '@/lib/infrastructure/ipfs/GatewayIpfsReader';
import { ReadPublishedProfileUseCase } from '@/lib/usecases/ReadPublishedProfileUseCase';

type LoadState = 'loading' | 'ready' | 'error';

/** The read-only view behind a shared `/profile?uri=ipfs://…` link. */
export function PublishedProfileView({ uri }: { uri: string }) {
  const ipfs = useMemo(() => new GatewayIpfsReader(), []);
  const [profile, setProfile] = useState<PublishedProfile | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const cid = cidFromUri(uri);

  const load = useCallback(async () => {
    try {
      // Nothing is set before the first await: state changes stay async, no cascade.
      const loaded = await new ReadPublishedProfileUseCase(ipfs).execute(uri);
      setProfile(loaded);
      setError(null);
      setState('ready');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không đọc được hồ sơ trên IPFS.');
      setState('error');
    }
  }, [ipfs, uri]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12'>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
        <p className='font-mono text-[11px] text-ink-muted'>hồ sơ công bố · đọc từ IPFS</p>
        {cid ? <HashChip label='ipfs' value={uri} display={cid} /> : null}
      </div>

      {state === 'loading' ? (
        <div className='h-56 animate-pulse rounded-card border border-hairline bg-surface-muted' />
      ) : null}

      {state === 'error' ? (
        <div className='rounded-card border border-hairline bg-surface p-6'>
          <p className='text-base font-semibold text-ink'>Không đọc được hồ sơ.</p>
          <p className='mt-2 text-sm leading-6 text-ink-muted'>
            {error ?? 'Liên kết có thể sai hoặc CID chưa được gateway trả về.'}
          </p>
          <Button as={Link} href='/profile' variant='secondary' size='sm' className='mt-4'>
            Về hồ sơ của tôi
          </Button>
        </div>
      ) : null}

      {state === 'ready' && profile ? (
        <>
          <ProfileCard
            address={profile.address}
            displayName={profile.displayName}
            bio={profile.bio}
            avatar={profile.avatar}
            links={profile.links}
            footer={
              <p className='text-xs leading-5 text-ink-muted'>
                Tài liệu này nằm trên IPFS nên không sửa được. Nó khai báo địa chỉ{' '}
                <span className='font-mono'>{profile.address}</span> nhưng không kèm chữ ký, nên đây là lời khai
                chứ chưa phải bằng chứng.
              </p>
            }
          />
          <div className='mt-6 flex flex-wrap gap-3'>
            <Button as={Link} href={`/library`} variant='secondary'>
              Xem thư viện
            </Button>
            <Button as={Link} href='/profile' variant='ghost'>
              Hồ sơ của tôi
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
