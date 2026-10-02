'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export type AdminSortOrder = 'manual' | 'most-purchased' | 'newest' | 'oldest' | 'best-rating';

export interface PageOrdering {
  sortOrder: AdminSortOrder;
  manualOrder: string[]; // Product IDs in display sequence
}

const DEFAULT_ORDERING: PageOrdering = {
  sortOrder: 'manual',
  manualOrder: [],
};

/**
 * Get saved ordering for a specific page key (e.g. 'shop-all', 'category-jewelry')
 */
export async function getPageOrdering(pageKey: string): Promise<PageOrdering> {
  try {
    if (!prisma.productPageOrdering) {
      return DEFAULT_ORDERING;
    }

    const row = await prisma.productPageOrdering.findUnique({
      where: { pageKey },
    });

    if (!row) {
      return DEFAULT_ORDERING;
    }

    const manualOrder = Array.isArray(row.manualOrder)
      ? (row.manualOrder as string[])
      : [];

    return {
      sortOrder: (row.sortOrder as AdminSortOrder) || 'manual',
      manualOrder,
    };
  } catch (error) {
    console.error(`[getPageOrdering] Error for ${pageKey}:`, error);
    return DEFAULT_ORDERING;
  }
}

/**
 * Get all page orderings as a record map
 */
export async function getAllPageOrderings(): Promise<Record<string, PageOrdering>> {
  const result: Record<string, PageOrdering> = {};

  try {
    if (!prisma.productPageOrdering) {
      return result;
    }

    const rows = await prisma.productPageOrdering.findMany();
    rows.forEach((r) => {
      const manualOrder = Array.isArray(r.manualOrder)
        ? (r.manualOrder as string[])
        : [];

      result[r.pageKey] = {
        sortOrder: (r.sortOrder as AdminSortOrder) || 'manual',
        manualOrder,
      };
    });

    return result;
  } catch (error) {
    console.error('[getAllPageOrderings] Error fetching orderings:', error);
    return result;
  }
}

/**
 * Save page ordering to PostgreSQL database and sync featuredRank for immediate SSR accuracy
 */
export async function savePageOrdering(
  pageKey: string,
  ordering: PageOrdering
): Promise<{ success: boolean; error?: string }> {
  try {
    const manualOrder = Array.isArray(ordering.manualOrder) ? ordering.manualOrder : [];

    // 1. Persist the ordering configuration in database
    await prisma.productPageOrdering.upsert({
      where: { pageKey },
      update: {
        sortOrder: ordering.sortOrder,
        manualOrder: manualOrder as any,
      },
      create: {
        pageKey,
        sortOrder: ordering.sortOrder,
        manualOrder: manualOrder as any,
      },
    });

    // 2. If this is 'shop-all' and manualOrder is provided, synchronize featuredRank in PostgreSQL
    if (pageKey === 'shop-all' && ordering.sortOrder === 'manual' && manualOrder.length > 0) {
      const updates = manualOrder.map((productId, index) =>
        prisma.product.updateMany({
          where: {
            OR: [{ id: productId }, { slug: productId }],
          },
          data: {
            featuredRank: index + 1,
          },
        })
      );
      await prisma.$transaction(updates);
    }

    // 3. If this is a category page (e.g. 'category-jewelry') and manualOrder is provided,
    // ensure those products have sequential ranks within their category
    if (pageKey.startsWith('category-') && ordering.sortOrder === 'manual' && manualOrder.length > 0) {
      const updates = manualOrder.map((productId, index) =>
        prisma.product.updateMany({
          where: {
            OR: [{ id: productId }, { slug: productId }],
          },
          data: {
            featuredRank: index + 1,
          },
        })
      );
      await prisma.$transaction(updates);
    }

    // 4. Invalidate caches so storefront updates instantly
    safeRevalidatePaths(pageKey);

    return { success: true };
  } catch (error) {
    console.error(`[savePageOrdering] Error saving for ${pageKey}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Reset a page's ordering back to default
 */
export async function resetPageOrdering(pageKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.productPageOrdering.deleteMany({
      where: { pageKey },
    });

    safeRevalidatePaths(pageKey);
    return { success: true };
  } catch (error) {
    console.error(`[resetPageOrdering] Error resetting for ${pageKey}:`, error);
    return { success: false, error: String(error) };
  }
}

function safeRevalidatePaths(pageKey: string) {
  try {
    revalidatePath('/shop');
    revalidatePath('/');
    revalidatePath('/admin/product-ordering');
    revalidatePath('/[category]', 'page');
    revalidatePath('/jewelry');
    revalidatePath('/bags');
    revalidatePath('/churi');
    revalidatePath('/earrings');
    revalidatePath('/more');
  } catch {
    // Non-critical if called outside active request
  }
}
