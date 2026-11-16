const MOMENT = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

/** One moment format for every on-chain timestamp: transfer timeline, activity table. */
export function formatMoment(timestamp: number | null): string {
  if (!timestamp) return '—';
  return MOMENT.format(new Date(timestamp * 1000));
}
