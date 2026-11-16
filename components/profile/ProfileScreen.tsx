'use client';

import { useSearchParams } from 'next/navigation';
import { OwnProfileView } from './OwnProfileView';
import { PublishedProfileView } from './PublishedProfileView';

/** `/profile` shows the connected wallet; `/profile?uri=ipfs://…` shows a shared copy. */
export function ProfileScreen() {
  const searchParams = useSearchParams();
  const shared = searchParams.get('uri')?.trim() ?? '';
  if (shared.length > 0) return <PublishedProfileView uri={shared} />;
  return <OwnProfileView />;
}
