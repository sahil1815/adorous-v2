/**
 * Format price according to store rules:
 * - If integer or ends with .0, display simply as integer 'p' (e.g. 500, 1,200)
 * - If it has decimal cents/poisha 'p.q', display as 'p.q' as it is (e.g. 499.5, 359.1, 1,250.75)
 */
export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '0';
  const clean = Math.round(Number(amount) * 100) / 100;
  return clean.toLocaleString('en-US', { maximumFractionDigits: 2 });
}
