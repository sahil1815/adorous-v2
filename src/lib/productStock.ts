import { Product, Colorway } from '@/types';

/**
 * Checks whether a product as a whole is out of stock.
 * A product is considered out of stock if:
 * 1. inStock is explicitly false
 * 2. stockQty is explicitly 0 or less (null/undefined means untracked / unlimited)
 * 3. Or all configured colorways are marked out of stock
 */
export function isProductOutOfStock(product?: Product | null): boolean {
  if (!product) return false;
  if (product.inStock === false) return true;
  if (typeof product.stockQty === 'number' && product.stockQty <= 0) return true;

  const hasColorways = Array.isArray(product.colorways) && product.colorways.length > 0;
  if (hasColorways) {
    // Single-colorway products match the product's overall stock directly
    if (product.colorways.length === 1) {
      return false;
    }
    // If every colorway is marked out of stock:
    // If the admin explicitly gave this product positive stock, do not treat it as out of stock
    if (product.colorways.every((c) => c.inStock === false)) {
      if (typeof product.stockQty === 'number' && product.stockQty > 0) {
        return false;
      }
      return true;
    }
  }
  return false;
}

/**
 * Checks whether a specific variant (colorway) is out of stock.
 * It is out of stock if the product as a whole is out of stock,
 * or if the selected colorway has inStock === false.
 */
export function isColorwayOutOfStock(
  product?: Product | null,
  colorway?: Colorway | null
): boolean {
  if (!product) return false;
  if (isProductOutOfStock(product)) return true;

  // Single-colorway products follow the overall product stock (already verified in-stock above)
  if (!product.colorways || product.colorways.length <= 1) {
    return false;
  }

  // If all colorways are marked false but the product itself is in stock with positive inventory,
  // do not lock customers out of selecting the colorway
  if (product.colorways.every((c) => c.inStock === false)) {
    return false;
  }

  if (colorway && colorway.inStock === false) return true;
  return false;
}

/**
 * Checks whether a product has low remaining stock (e.g. 1 to 3 pieces left).
 */
export function isProductLowStock(product?: Product | null): boolean {
  if (!product || isProductOutOfStock(product)) return false;
  return (
    typeof product.stockQty === 'number' &&
    product.stockQty > 0 &&
    product.stockQty <= 3
  );
}
