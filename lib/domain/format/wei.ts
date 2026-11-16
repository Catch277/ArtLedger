/** Formats a decimal wei string as ETH without pulling ethers into the domain. */
export function formatWeiToEth(wei: string, digits = 4): string {
  let value: bigint;
  try {
    value = BigInt(wei);
  } catch {
    return '0';
  }
  const base = 10n ** 18n;
  const whole = value / base;
  const fraction = (value % base).toString().padStart(18, '0').slice(0, digits).replace(/0+$/, '');
  return fraction.length > 0 ? `${whole}.${fraction}` : whole.toString();
}