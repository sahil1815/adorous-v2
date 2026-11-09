/**
 * Format price according to store rules:
 * - Every price is strictly in integer format, no decimal values will be there.
 * - e.g. 500, 1,250, 2,390
 */
export function formatPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '0';
  const num = Number(amount);
  if (isNaN(num)) return '0';
  const clean = Math.round(num);
  return clean.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
