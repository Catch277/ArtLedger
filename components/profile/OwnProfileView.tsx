'use client';

import Link from 'next/link';
import { ExternalLink, Pencil, RefreshCw, Upload } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArtworkCard } from '@/components/artwork/ArtworkCard';
import { useWallet } from '@/components/providers/WalletProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { HashChip } from '@/components/ui/HashChip';
import { Modal } from '@/components/ui/Modal';
import { StatusPill } from '@/components/ui/StatusPill';
import { ProfileCard } from './ProfileCard';
import { ProfileForm } from './ProfileForm';
import { ProfileTransactions } from './ProfileTransactions';
import { SEPOLIA_FAUCET_URL } from '@/lib/domain/config/sepolia';
import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import type { LibraryItem } from '@/lib/domain/entities/LibraryItem';
import type { WalletTransaction } from '@/lib/domain/entities/WalletTransaction';
import type { Profile } from '@/lib/domain/entities/Profile';
import type { ProfileInput } from '@/lib/domain/schemas/profile';
import { shortenAddress } from '@/lib/domain/types/address';
import type { WalletAddress } from '@/lib/domain/types/eth';
import { contractAddress, deployBlock, sepoliaRpcUrl } from '@/lib/infrastructure/config/env';
import { ApiRouteProfilePublisher } from '@/lib/infrastructure/ipfs/ApiRouteProfilePublisher';
import { GatewayIpfsReader } from '@/lib/infrastructure/ipfs/GatewayIpfsReader';
import { LocalStorageProfileStore } from '@/lib/infrastructure/storage/LocalStorageProfileStore';
import { JsonRpcArtworkQueryGateway } from '@/lib/infrastructure/web3/JsonRpcArtworkQueryGateway';
import { GetWalletTransactionsUseCase } from '@/lib/usecases/GetWalletTransactionsUseCase';
import { ListLibraryUseCase } from '@/lib/usecases/ListLibraryUseCase';
import { LoadProfileUseCase } from '@/lib/usecases/LoadProfileUseCase';
import { PublishProfileUseCase } from '@/lib/usecases/PublishProfileUseCase';
import { SaveProfileUseCase } from '@/lib/usecases/SaveProfileUseCase';

const EMPTY_INPUT: ProfileInput = { displayName: '', bio: '', avatar: { kind: 'monogram', uri: null }, links: [] };

type OwnedState = 'loading' | 'ready' | 'error';

/** A profile only exists once a wallet does, so the guards come first. */
export function OwnProfileView() {
  const { address, isInstalled, isConnecting, connect } = useWallet();

  if (!isInstalled) {
    return (
      <div className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12'>
        <EmptyState
          title='Chưa tìm thấy MetaMask'
          description='Hồ sơ gắn với ví: số dư và tác phẩm đều đọc từ địa chỉ của bạn. Cài MetaMask rồi quay lại trang này.'
          action={
            <Button as='a' href='https://metamask.io/download/' target='_blank' rel='noreferrer'>
              Cài MetaMask
            </Button>
          }
        />
      </div>
    );
  }

  if (!address) {
    return (
      <div className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12'>
        <EmptyState
          title='Kết nối ví để xem hồ sơ'
          description='Không tài khoản, không mật khẩu: ví là danh tính. Kết nối để thấy số dư, tác phẩm đang giữ và sửa hồ sơ của bạn.'
          action={
            <Button onClick={() => void connect()} disabled={isConnecting}>
              {isConnecting ? 'Đang kết nối…' : 'Kết nối ví'}
            </Button>
          }
        />
      </div>
    );
  }

  // Keyed by address: switching wallets drops the old draft, the old NFT list and old messages.
  return <ProfileWorkspace key={address} address={address} />;
}

function ProfileWorkspace({ address }: { address: WalletAddress }) {
  const { balanceEth, isSepolia, refreshBalance } = useWallet();
  const store = useMemo(() => new LocalStorageProfileStore(), []);
  const gateway = useMemo(
    () => new JsonRpcArtworkQueryGateway(sepoliaRpcUrl(), contractAddress(), deployBlock()),
    [],
  );
  const ipfs = useMemo(() => new GatewayIpfsReader(), []);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [owned, setOwned] = useState<LibraryItem[]>([]);
  const [ownedState, setOwnedState] = useState<OwnedState>('loading');
  const [ownedError, setOwnedError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [txTotalFeeWei, setTxTotalFeeWei] = useState('0');
  const [txPaidCount, setTxPaidCount] = useState(0);
  const [txFeeCount, setTxFeeCount] = useState(0);
  const [txState, setTxState] = useState<OwnedState>('loading');
  const [txError, setTxError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const found = await new LoadProfileUseCase(store).execute(address).catch(() => null);
    setProfile(found);
    setLoaded(true);
  }, [address, store]);

  const loadOwned = useCallback(async () => {
    try {
      const items = await new ListLibraryUseCase(gateway, ipfs).execute({ owner: address });
      setOwned(items);
      setNeedsSetup(false);
      setOwnedError(null);
      setOwnedState('ready');
    } catch (caught) {
      setNeedsSetup(caught instanceof ContractNotConfiguredError);
      setOwnedError(caught instanceof Error ? caught.message : 'Không đọc được tác phẩm của ví này.');
      setOwnedState('error');
    }
  }, [address, gateway, ipfs]);

  const loadTransactions = useCallback(async () => {
    try {
      const result = await new GetWalletTransactionsUseCase(gateway).execute(address);
      setTransactions(result.transactions);
      setTxTotalFeeWei(result.totalFeeWei);
      setTxPaidCount(result.paidCount);
      setTxFeeCount(result.feeCount);
      setTxError(null);
      setTxState('ready');
    } catch (caught) {
      setTxError(caught instanceof Error ? caught.message : 'Không đọc được giao dịch của ví này.');
      setTxState('error');
    }
  }, [address, gateway]);

  useEffect(() => {
    // Same shape as /library: the loader runs inside an async IIFE, so nothing is set during render.
    void (async () => {
      await loadProfile();
    })();
  }, [loadProfile]);

  useEffect(() => {
    void (async () => {
      await loadOwned();
    })();
  }, [loadOwned]);

  useEffect(() => {
    void (async () => {
      await loadTransactions();
    })();
  }, [loadTransactions]);

  async function save(input: ProfileInput) {
    setSaving(true);
    setFormError(null);
    try {
      const saved = await new SaveProfileUseCase(store).execute(address, input);
      setProfile(saved);
      setEditing(false);
      setNotice('Đã lưu hồ sơ trên thiết bị này.');
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Không lưu được hồ sơ.');
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!profile) return;
    setPublishing(true);
    setActionError(null);
    setNotice(null);
    try {
      const result = await new PublishProfileUseCase(new ApiRouteProfilePublisher(), store).execute(profile);
      setProfile({ ...profile, publishedCid: result.cid });
      setNotice('Đã công bố hồ sơ lên IPFS. Bản công bố không sửa được: lần chỉnh sửa sau sẽ tạo một CID mới.');
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Không công bố được hồ sơ.');
    } finally {
      setPublishing(false);
    }
  }

  const displayName = profile?.displayName ?? shortenAddress(address);
  const draft: ProfileInput = profile
    ? { displayName: profile.displayName, bio: profile.bio, avatar: profile.avatar, links: profile.links }
    : EMPTY_INPUT;


  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12'>
      {notice ? (
        <p role='status' className='mb-6 rounded-control bg-accent-soft px-3 py-2 text-sm text-ink'>
          {notice}
        </p>
      ) : null}
      {actionError ? (
        <p role='alert' className='mb-6 rounded-control bg-danger-soft px-3 py-2 text-sm text-ink'>
          {actionError}
        </p>
      ) : null}

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8'>
        <ProfileCard
          address={address}
          displayName={displayName}
          bio={profile?.bio ?? ''}
          avatar={profile?.avatar ?? EMPTY_INPUT.avatar}
          links={profile?.links ?? []}
          status={
            profile?.publishedCid ? (
              <StatusPill tone='verified'>Đã công bố</StatusPill>
            ) : (
              <StatusPill tone='neutral'>Bản nháp trên thiết bị</StatusPill>
            )
          }
          actions={
            <>
              <Button
                size='sm'
                onClick={() => {
                  setFormError(null);
                  setEditing(true);
                }}
                disabled={!loaded}
              >
                <Pencil aria-hidden size={16} strokeWidth={2} />
                Sửa hồ sơ
              </Button>
              <Button size='sm' variant='secondary' onClick={() => void publish()} disabled={!profile || publishing}>
                <Upload aria-hidden size={16} strokeWidth={2} />
                {publishing ? 'Đang công bố…' : 'Công bố lên IPFS'}
              </Button>
            </>
          }
          footer={
            profile?.publishedCid ? (
              <div className='flex flex-wrap items-center gap-3'>
                <HashChip label='ipfs' value={`ipfs://${profile.publishedCid}`} display={profile.publishedCid} />
                <Link
                  href={`/profile?uri=ipfs://${profile.publishedCid}`}
                  className='inline-flex items-center gap-1 text-xs font-medium text-brand underline-offset-4 hover:underline'
                >
                  Xem bản công bố
                  <ExternalLink aria-hidden size={12} strokeWidth={2} />
                </Link>
              </div>
            ) : (
              <p className='text-xs leading-5 text-ink-muted'>
                Hồ sơ chỉ nằm trên thiết bị này. Công bố để có một bản cố định trên IPFS mà người khác đọc được.
              </p>
            )
          }
        />
        <Card className='lg:sticky lg:top-20 lg:self-start'>
          <CardHeader
            title='Ví Sepolia'
            action={
              isSepolia ? <StatusPill tone='verified'>sepolia</StatusPill> : <StatusPill tone='pending'>sai mạng</StatusPill>
            }
          />
          <p className='text-xs font-medium text-ink-muted'>Số dư</p>
          <p className='mt-2 text-3xl font-normal tracking-tight tabular-nums text-ink'>
            {balanceEth ?? '—'} <span className='text-sm text-ink-muted'>ETH</span>
          </p>
          <p className='mt-2 font-mono text-[11px] text-ink-muted'>chainId 11155111 · ETH thử, không phải tiền thật</p>

          <div className='mt-4 border-t border-hairline pt-4'>
            <p className='text-xs font-medium text-ink-muted'>Địa chỉ</p>
            <div className='mt-2'>
              <HashChip value={address} display={shortenAddress(address)} />
            </div>
          </div>

          <div className='mt-4 flex flex-wrap items-center gap-3 border-t border-hairline pt-4'>
            <Button variant='secondary' size='sm' onClick={() => void refreshBalance()}>
              <RefreshCw aria-hidden size={16} strokeWidth={2} />
              Cập nhật
            </Button>
            <a
              href={SEPOLIA_FAUCET_URL}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-1 text-xs font-medium text-brand underline-offset-4 hover:underline'
            >
              Nhận ETH thử
              <ExternalLink aria-hidden size={12} strokeWidth={2} />
            </a>
          </div>
        </Card>

      </div>

      <section className='mt-12'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='eyebrow'>Kho NFT</p>
            <h2 className='mt-3 text-2xl font-normal tracking-tight sm:text-3xl'>Tác phẩm bạn đang giữ</h2>
            <p className='mt-2 text-sm text-ink-muted'>
              {ownedState === 'ready'
                ? `${owned.length} tác phẩm · ownerOf đọc trực tiếp từ Sepolia`
                : 'Hợp đồng không có hàm liệt kê, nên danh sách này đếm bằng ownerOf.'}
            </p>
          </div>
          <Button
            variant='secondary'
            size='sm'
            onClick={() => {
              setOwnedState('loading');
              void loadOwned();
            }}
            disabled={ownedState === 'loading'}
          >
            <RefreshCw aria-hidden size={16} strokeWidth={2} />
            {ownedState === 'loading' ? 'Đang tải…' : 'Làm mới'}
          </Button>
        </div>

        {ownedState === 'loading' ? (
          <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className='h-72 animate-pulse rounded-card border border-hairline bg-surface-muted' />
            ))}
          </div>
        ) : null}

        {ownedState === 'error' ? (
          <div className='mt-6 rounded-card border border-hairline bg-surface p-6'>
            <p className='text-base font-semibold text-ink'>
              {needsSetup ? 'Chưa cấu hình hợp đồng.' : 'Không đọc được tác phẩm.'}
            </p>
            <p className='mt-2 text-sm leading-6 text-ink-muted'>
              {needsSetup
                ? 'Đặt NEXT_PUBLIC_CONTRACT_ADDRESS trong .env.local rồi tải lại trang.'
                : ownedError ?? 'Sepolia có thể đang bận. Thử lại sau vài giây.'}
            </p>
          </div>
        ) : null}

        {ownedState === 'ready' && owned.length === 0 ? (
          <div className='mt-6'>
            <EmptyState
              title='Ví này chưa giữ tác phẩm nào'
              description='Đăng ký một tác phẩm mới, hoặc nhờ chủ hiện tại chuyển nhượng NFT cho địa chỉ này.'
              action={
                <Button as={Link} href='/register'>
                  Đăng ký tác phẩm
                </Button>
              }
            />
          </div>
        ) : null}

        {ownedState === 'ready' && owned.length > 0 ? (
          <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {owned.map((item) => (
              <ArtworkCard key={item.tokenId} item={item} />
            ))}
          </div>
        ) : null}
      </section>

      <ProfileTransactions
        transactions={transactions}
        totalFeeWei={txTotalFeeWei}
        paidCount={txPaidCount}
        feeCount={txFeeCount}
        state={txState}
        error={txError}
        needsSetup={needsSetup}
        onRefresh={() => {
          setTxState('loading');
          void loadTransactions();
        }}
      />

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title='Chỉnh sửa hồ sơ'
        description='Lưu trên thiết bị này; công bố khi muốn một bản cố định trên IPFS.'
      >
        <ProfileForm
          initial={draft}
          address={address}
          submitting={saving}
          error={formError}
          onSubmit={(input) => void save(input)}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}

