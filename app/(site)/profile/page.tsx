import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileScreen } from '@/components/profile/ProfileScreen';

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        eyebrow='Hồ sơ'
        title='Hồ sơ của bạn'
        description='Tên hiển thị, ảnh đại diện và liên kết được lưu trên thiết bị này; bản công bố nằm trên IPFS. Số dư và tác phẩm đang giữ đọc trực tiếp từ Sepolia.'
      />
      <Suspense fallback={<div className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12'><div className='h-56 animate-pulse rounded-card border border-hairline bg-surface-muted' /></div>}>
        <ProfileScreen />
      </Suspense>
    </>
  );
}
