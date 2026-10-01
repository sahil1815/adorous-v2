/**
 * Format price according to store rules:
 * - If after calculating the discount the price is p.00 (integer), simply show p (e.g. 500, 1,250).
 * - If it is p.q (1 decimal digit), show p.q0 (at least 2 digits, e.g. 297.50, 1,490.50, 359.10).
 * - If it is p.0q (or p.qq), show p.0q as it is (e.g. 297.05, 1,490.68).
 */
export function formatPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '0';
  const num = Number(amount);
  if (isNaN(num)) return '0';
  const clean = Math.round(num * 100) / 100;
  if (clean % 1 === 0) {
    return clean.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return clean.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

