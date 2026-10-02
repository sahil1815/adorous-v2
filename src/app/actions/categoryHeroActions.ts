'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { CATEGORIES } from '@/data/catalogue';

export interface CategoryHeroData {
  categorySlug: string;
  heroImage: string;
  productId?: string | null;
  productName?: string | null;
  updatedAt?: string;
}

/**
 * Get hero setting for a specific category, with fallback to catalogue default
 */
export async function getCategoryHeroSettings(categorySlug: string): Promise<CategoryHeroData> {
  const defaultCat = CATEGORIES.find((c) => c.slug === categorySlug);
  const defaultImage = defaultCat?.image || '/images/hero/hero-still-life.jpg';

  try {
    if (!prisma.categoryHeroSettings) {
      return { categorySlug, heroImage: defaultImage };
    }

    const setting = await prisma.categoryHeroSettings.findUnique({
      where: { categorySlug },
    });

    if (setting) {
      return {
        categorySlug: setting.categorySlug,
        heroImage: setting.heroImage,
        productId: setting.productId,
        productName: setting.productName,
        updatedAt: setting.updatedAt ? new Date(setting.updatedAt).toISOString() : undefined,
      };
    }

    return { categorySlug, heroImage: defaultImage };
  } catch (error) {
    console.error(`[getCategoryHeroSettings] Error for ${categorySlug}:`, error);
    return { categorySlug, heroImage: defaultImage };
  }
}

/**
 * Get all category hero settings as a record map
 */
export async function getAllCategoryHeroSettings(): Promise<Record<string, CategoryHeroData>> {
  const result: Record<string, CategoryHeroData> = {};

  // Initialize with catalogue defaults
  CATEGORIES.forEach((cat) => {
    result[cat.slug] = {
      categorySlug: cat.slug,
      heroImage: cat.image,
      productId: null,
      productName: null,
    };
  });

  try {
    if (!prisma.categoryHeroSettings) {
      return result;
    }

    const settings = await prisma.categoryHeroSettings.findMany();
    settings.forEach((s) => {
      result[s.categorySlug] = {
        categorySlug: s.categorySlug,
        heroImage: s.heroImage,
        productId: s.productId,
        productName: s.productName,
        updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : undefined,
      };
    });

    return result;
  } catch (error) {
    console.error('[getAllCategoryHeroSettings] Error reading settings:', error);
    return result;
  }
}

/**
 * Save or update the category hero image
 */
export async function setCategoryHeroImage(input: {
  categorySlug: string;
  heroImage: string;
  productId?: string;
  productName?: string;
}): Promise<{ success: boolean; settings?: CategoryHeroData; error?: string }> {
  try {
    const updated = await prisma.categoryHeroSettings.upsert({
      where: { categorySlug: input.categorySlug },
      update: {
        heroImage: input.heroImage.trim(),
        productId: input.productId ?? null,
        productName: input.productName ?? null,
      },
      create: {
        categorySlug: input.categorySlug,
        heroImage: input.heroImage.trim(),
        productId: input.productId ?? null,
        productName: input.productName ?? null,
      },
    });

    safeRevalidate(input.categorySlug);

    return {
      success: true,
      settings: {
        categorySlug: updated.categorySlug,
        heroImage: updated.heroImage,
        productId: updated.productId,
        productName: updated.productName,
        updatedAt: new Date(updated.updatedAt).toISOString(),
      },
    };
  } catch (error) {
    console.error('[setCategoryHeroImage] Error updating hero:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Reset category hero image back to default catalogue image
 */
export async function resetCategoryHeroImage(
  categorySlug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.categoryHeroSettings.findUnique({
      where: { categorySlug },
    });

    if (existing) {
      await prisma.categoryHeroSettings.delete({
        where: { categorySlug },
      });
    }

    safeRevalidate(categorySlug);

    return { success: true };
  } catch (error) {
    console.error('[resetCategoryHeroImage] Error resetting:', error);
    return { success: false, error: String(error) };
  }
}

function safeRevalidate(categorySlug: string) {
  try {
    revalidatePath(`/${categorySlug}`);
    revalidatePath('/[category]', 'page');
    revalidatePath('/');
    revalidatePath('/admin/product-ordering');
    revalidatePath('/admin/inventory');
  } catch {
    // Gracefully handle invocation outside active request context (e.g. testing / scripts)
  }
}
