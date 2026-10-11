/**
 * Pricing calculation utility for Adorous Fashion.
 * Supports:
 * - Base price (Compare price)
 * - Discount (Percent % or Flat ৳)
 * - Computes effective selling price accurately with 2 decimal precision
 */

export function calculateSellingPrice(
  basePrice: number | string,
  discount?: number | string | null,
  discountType?: 'percent' | 'flat' | null | string
): {
  sellingPrice: number;
  comparePrice: number;
  discountPercent: number;
  discountAmount: number;
} {
  const base = Math.max(0, Number(basePrice) || 0);
  const disc = Number(discount) || 0;
  const type = discountType === 'flat' ? 'flat' : 'percent';

  if (disc <= 0 || base <= 0) {
    return {
      sellingPrice: base,
      comparePrice: base,
      discountPercent: 0,
      discountAmount: 0,
    };
  }

  let sellingPrice = base;
  let discountAmount = 0;

  if (type === 'percent') {
    const pct = Math.min(100, Math.max(0, disc));
    discountAmount = Math.round(base * (pct / 100) * 100) / 100;
    sellingPrice = Math.max(0, Math.round((base - discountAmount) * 100) / 100);
  } else {
    // Flat amount in BDT
    discountAmount = Math.min(base, Math.max(0, disc));
    sellingPrice = Math.max(0, Math.round((base - discountAmount) * 100) / 100);
  }

  const effectiveDiscountPct = base > 0 ? Math.round(((base - sellingPrice) / base) * 100) : 0;

  return {
    sellingPrice,
    comparePrice: base,
    discountPercent: effectiveDiscountPct,
    discountAmount,
  };
}
