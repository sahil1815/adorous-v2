/**
 * Format price according to store rules:
 * - If integer or ends with .0 / .00, display simply as integer 'p' without decimals (e.g. 1500, 500, 1,200)
 * - If it has non-zero digits after the dot (fraction price 'p.q'), display them as they are (e.g. 1490.68, 297.5, 359.1, 1,250.75)
 * - Trailing zeros after the dot are omitted (e.g. 1490.60 -> 1,490.6, 1500.00 -> 1,500)
 */
export function formatPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '0';
  const num = Number(amount);
  if (isNaN(num)) return '0';
  const clean = Math.round(num * 100) / 100;
  return clean.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

