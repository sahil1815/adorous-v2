/**
 * Utility functions for calculating and formatting product piece counts and set badges.
 *
 * Handles products where inclusions contain repeated items with multipliers (e.g., "2x", "4x")
 * and pairs (e.g., "1x Pair", "4 Pairs"), specifically for bangles (churi) and earrings,
 * as well as mixed jewelry suites and box sets.
 */

/**
 * Parses an individual piece inclusion string to determine how many physical units it represents.
 *
 * @param text The string describing the inclusion item (e.g. "2x Deep Maroon Silk Floral Bangles", "1x Pair Kashmiri Jhumkas")
 * @param isRepeatedItemCategory True for categories like 'churi' or 'earrings' where items are multiples of the same jewelry piece.
 */
export function parsePieceCount(text: string, isRepeatedItemCategory: boolean): number {
  if (!text || typeof text !== 'string') return 1;
  const trimmed = text.trim();
  if (!trimmed) return 0;

  // 1. Check for pair expressions:
  // e.g. "1x Pair ...", "2x Pairs ...", "1 Pair ...", "4 Pairs ...", "Pair of ..."
  const pairMatch = trimmed.match(/^(\d+)\s*(?:x|×)?\s*pairs?\b/i) || trimmed.match(/^pairs?\b/i);
  if (pairMatch) {
    const numPairs = pairMatch[1] ? parseInt(pairMatch[1], 10) : 1;
    // In categories of repeated items (churi, earrings), 1 pair consists of 2 physical pieces.
    // In mixed jewelry sets (e.g., necklace + earrings duo), a pair of earrings counts as 1 set component.
    return isRepeatedItemCategory ? numPairs * 2 : numPairs;
  }

  // 2. Check for explicit piece count expressions:
  // e.g. "8 Pcs ...", "4 Pieces ..."
  const pcsMatch = trimmed.match(/^(\d+)\s*(?:pcs?|pieces?)\b/i);
  if (pcsMatch) {
    return parseInt(pcsMatch[1], 10) || 1;
  }

  // 3. Check for multiplier prefix:
  // e.g. "2x Deep Maroon ...", "4x Gold-Tone ...", "2 × Accent Bangles"
  const multiplierMatch = trimmed.match(/^(\d+)\s*(?:x|×)\s*/i);
  if (multiplierMatch) {
    return parseInt(multiplierMatch[1], 10) || 1;
  }

  // Fallback: 1 piece
  return 1;
}

export interface ProductPieceInfo {
  displayPieces: number;
  badgeLabel: string | null;
}

/**
 * Computes the total piece count and badge label for a product.
 */
export function getProductPieceInfo(product: {
  name?: string;
  category?: string;
  piecesIncluded?: string[] | { text: string }[];
  complimentaryItem?: string | null;
}): ProductPieceInfo {
  const category = (product.category || '').toLowerCase();
  const isChuriOrEarrings = category === 'churi' || category === 'earrings';

  // Check if product title explicitly specifies a piece count: e.g. "(8-Piece Set)", "(2-Piece Set)", "(5-Piece Box Set)"
  const namePieceMatch = product.name?.match(/\((\d+)[- ]*(?:piece|pcs|pc)/i);
  const nameCount = namePieceMatch ? parseInt(namePieceMatch[1], 10) : 0;

  // Check if product title specifies a pair count: e.g. "(4-Pair Set)"
  const namePairMatch = product.name?.match(/\((\d+)[- ]*pairs?[- ]*set\)/i);
  const namePairCount = namePairMatch ? parseInt(namePairMatch[1], 10) * (isChuriOrEarrings ? 2 : 1) : 0;

  const rawPieces = product.piecesIncluded || [];
  const pieceStrings: string[] = rawPieces.map((p: any) =>
    typeof p === 'string' ? p : p?.text || ''
  );

  let calculatedPieces = 0;
  for (const item of pieceStrings) {
    calculatedPieces += parsePieceCount(item, isChuriOrEarrings);
  }

  // If piecesIncluded is empty but it's an earring product, default to 2 pieces (1 pair)
  if (category === 'earrings' && pieceStrings.length === 0 && calculatedPieces === 0) {
    calculatedPieces = 2;
  }

  // If piecesIncluded is empty for bags or lifestyle items, default to 1 piece
  if ((category === 'bags' || category === 'more' || category === 'umbrellas') && pieceStrings.length === 0 && calculatedPieces === 0) {
    calculatedPieces = 1;
  }

  // In mixed jewelry sets without explicit piece count in name, complimentary packaging / boxes can count towards set pieces.
  // For churi, earrings, bags, and items where the title already specifies exact piece count, complimentaryItem is gift packaging.
  if (
    product.complimentaryItem &&
    !isChuriOrEarrings &&
    category !== 'bags' &&
    category !== 'more' &&
    category !== 'umbrellas' &&
    nameCount === 0
  ) {
    calculatedPieces += 1;
  }

  let effectiveCount = 0;
  if (nameCount > 0) {
    effectiveCount = nameCount;
  } else if (namePairCount > 0) {
    effectiveCount = namePairCount;
  } else {
    effectiveCount = calculatedPieces;
  }

  // Only products with no discernible piece count (effectiveCount <= 0) should hide the badge
  if (effectiveCount <= 0) {
    return {
      displayPieces: 0,
      badgeLabel: null,
    };
  }

  return {
    displayPieces: effectiveCount,
    badgeLabel: `${effectiveCount} Pcs Set`,
  };
}
