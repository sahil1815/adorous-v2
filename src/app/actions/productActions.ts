'use server';

import { prisma } from '@/lib/db';
import { PRODUCTS } from '@/data/catalogue';
import { Product } from '@/types';
import { revalidatePath } from 'next/cache';

// Helper to convert static Product to the shape expected by frontend PDP & Category pages
function toDbShape(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    categoryLabel: product.categoryLabel,
    tagline: product.tagline ?? null,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    description: product.description ?? null,
    badge: null,
    inStock: product.inStock ?? true,
    stockQty: null as number | null,
    isNewDrop: product.isNewDrop ?? false,
    isGiftPick: product.isGiftPick ?? false,
    isBestseller: product.isBestseller ?? false,
    featuredRank: product.featuredRank ?? null,
    featuredImage: product.featuredImage,
    seoKeywords: Array.isArray(product.seoKeywords) ? product.seoKeywords.join(',') : (product.seoKeywords ?? ''),
    details: (product.details || []).map((text, idx) => ({ id: `detail-${idx}`, text, productId: product.id })),
    piecesIncluded: (product.piecesIncluded || []).map((text, idx) => ({ id: `piece-${idx}`, text, productId: product.id })),
    colorways: (product.colorways || []).map((cw) => ({
      id: cw.id,
      colorId: cw.id,
      name: cw.name,
      hex: cw.hex,
      inStock: cw.inStock,
      productId: product.id,
    })),
    galleryImages: (product.galleryImages || []).map((url, idx) => ({ id: `img-${idx}`, url, productId: product.id })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getProductsByCategory(category: string) {
  try {
    if (!process.env.DATABASE_URL) {
      return PRODUCTS.filter((p) => p.category === category).map(toDbShape);
    }
    const products = await prisma.product.findMany({
      where: { category },
      include: { colorways: true, galleryImages: true, details: true, piecesIncluded: true },
      orderBy: { featuredRank: 'asc' },
    });
    if (!products || products.length === 0) {
      return PRODUCTS.filter((p) => p.category === category).map(toDbShape);
    }
    return products;
  } catch (error) {
    console.warn(`[getProductsByCategory] Falling back to static catalogue for category "${category}":`, error);
    return PRODUCTS.filter((p) => p.category === category).map(toDbShape);
  }
}

export async function getProductBySlug(slug: string) {
  try {
    if (!process.env.DATABASE_URL) {
      const match = PRODUCTS.find((p) => p.slug === slug);
      return match ? toDbShape(match) : null;
    }
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { colorways: true, galleryImages: true, details: true, piecesIncluded: true },
    });
    if (!product) {
      const match = PRODUCTS.find((p) => p.slug === slug);
      return match ? toDbShape(match) : null;
    }
    return product;
  } catch (error) {
    console.warn(`[getProductBySlug] Falling back to static catalogue for slug "${slug}":`, error);
    const match = PRODUCTS.find((p) => p.slug === slug);
    return match ? toDbShape(match) : null;
  }
}

export async function getAllProducts() {
  try {
    if (!process.env.DATABASE_URL) return PRODUCTS.map(toDbShape);
    const products = await prisma.product.findMany({
      include: { colorways: true, galleryImages: true, details: true, piecesIncluded: true },
      orderBy: { featuredRank: 'asc' },
    });
    if (!products || products.length === 0) return PRODUCTS.map(toDbShape);
    return products;
  } catch (error) {
    console.warn('[getAllProducts] Database unavailable. Falling back to static catalogue:', error);
    return PRODUCTS.map(toDbShape);
  }
}

export async function getProductById(id: string) {
  try {
    if (!process.env.DATABASE_URL) return null;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { colorways: true, galleryImages: true, details: true, piecesIncluded: true },
    });
    return product ?? null;
  } catch (error) {
    console.warn(`[getProductById] Error fetching product ${id}:`, error);
    return null;
  }
}

export async function createProductAction(productData: Product) {
  try {
    if (!process.env.DATABASE_URL) {
      return { success: true, message: 'Saved to local storage fallback (No DATABASE_URL configured)' };
    }

    const cleanSlug = productData.slug.trim().toLowerCase();
    const existing = await prisma.product.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return {
        success: false,
        error: `A piece with canonical URL slug "${cleanSlug}" already exists in the catalogue. Please use a unique title or slug.`,
      };
    }

    const created = await prisma.product.create({
      data: {
        slug: cleanSlug,
        name: productData.name.trim(),
        category: productData.category,
        categoryLabel: productData.categoryLabel || 'Luxury Accessories',
        tagline: productData.tagline?.trim() || null,
        price: Number(productData.price),
        originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
        description: productData.description?.trim() || null,
        featuredImage: productData.featuredImage,
        badge: productData.isNewDrop ? 'New Drop' : (productData.isBestseller ? 'Bestseller' : null),
        inStock: productData.inStock ?? true,
        stockQty: null,
        isNewDrop: productData.isNewDrop ?? false,
        isGiftPick: productData.isGiftPick ?? false,
        isBestseller: productData.isBestseller ?? false,
        featuredRank: productData.featuredRank ?? 1,
        seoKeywords: Array.isArray(productData.seoKeywords) ? productData.seoKeywords.join(',') : (productData.seoKeywords || ''),
        details: { create: (productData.details || []).map((text) => ({ text })) },
        piecesIncluded: { create: (productData.piecesIncluded || []).map((text) => ({ text })) },
        colorways: {
          create: (productData.colorways || []).map((cw) => ({
            colorId: cw.id,
            name: cw.name,
            hex: cw.hex,
            inStock: cw.inStock ?? true,
          })),
        },
        galleryImages: {
          create: (productData.galleryImages && productData.galleryImages.length > 0
            ? productData.galleryImages
            : [productData.featuredImage]
          ).map((url) => ({ url })),
        },
      },
      include: { colorways: true, galleryImages: true, details: true, piecesIncluded: true },
    });

    try {
      revalidatePath(`/${productData.category}/${cleanSlug}`);
      revalidatePath(`/${productData.category}`);
      revalidatePath('/shop');
      revalidatePath('/');
      revalidatePath('/admin/inventory');
    } catch (revalErr) {
      console.warn('Revalidation warning:', revalErr);
    }

    return { success: true, product: toDbShape(created as any) };
  } catch (error: any) {
    console.error('[createProductAction] Error saving product to database:', error);
    return { success: false, error: error?.message || 'Database error occurred while creating product' };
  }
}

export async function updateProductAction(
  id: string,
  productData: {
    name: string;
    slug: string;
    category: string;
    categoryLabel: string;
    tagline?: string;
    price: number;
    originalPrice?: number;
    description?: string;
    featuredImage: string;
    isNewDrop: boolean;
    isBestseller: boolean;
    isGiftPick: boolean;
    inStock: boolean;
    seoKeywords: string[];
    details: string[];
    piecesIncluded: string[];
    colorways: { id: string; name: string; hex: string; inStock: boolean }[];
    galleryImages: string[];
  }
) {
  try {
    if (!process.env.DATABASE_URL) {
      return { success: false, error: 'No DATABASE_URL configured' };
    }

    const cleanSlug = productData.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const conflicting = await prisma.product.findFirst({
      where: { slug: cleanSlug, NOT: { id } },
    });
    if (conflicting) {
      return { success: false, error: `Slug "${cleanSlug}" is already used by another product.` };
    }

    await prisma.$transaction([
      prisma.productDetail.deleteMany({ where: { productId: id } }),
      prisma.productPiece.deleteMany({ where: { productId: id } }),
      prisma.productColorway.deleteMany({ where: { productId: id } }),
      prisma.productGalleryImage.deleteMany({ where: { productId: id } }),
      prisma.product.update({
        where: { id },
        data: {
          slug: cleanSlug,
          name: productData.name.trim(),
          category: productData.category,
          categoryLabel: productData.categoryLabel,
          tagline: productData.tagline?.trim() || null,
          price: Number(productData.price),
          originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
          description: productData.description?.trim() || null,
          featuredImage: productData.featuredImage,
          badge: productData.isNewDrop ? 'New Drop' : (productData.isBestseller ? 'Bestseller' : null),
          inStock: productData.inStock,
          isNewDrop: productData.isNewDrop,
          isBestseller: productData.isBestseller,
          isGiftPick: productData.isGiftPick,
          seoKeywords: productData.seoKeywords.join(','),
          details: { create: productData.details.map((text) => ({ text })) },
          piecesIncluded: { create: productData.piecesIncluded.map((text) => ({ text })) },
          colorways: {
            create: productData.colorways.map((cw) => ({
              colorId: cw.id,
              name: cw.name,
              hex: cw.hex,
              inStock: cw.inStock,
            })),
          },
          galleryImages: {
            create: (productData.galleryImages.length > 0
              ? productData.galleryImages
              : [productData.featuredImage]
            ).map((url) => ({ url })),
          },
        },
      }),
    ]);

    try {
      revalidatePath(`/${productData.category}/${cleanSlug}`);
      revalidatePath(`/${productData.category}`);
      revalidatePath('/shop');
      revalidatePath('/');
      revalidatePath('/admin/inventory');
    } catch (revalErr) {
      console.warn('Revalidation warning:', revalErr);
    }

    return { success: true };
  } catch (error: any) {
    console.error('[updateProductAction] Error:', error);
    return { success: false, error: error?.message || 'Failed to update product' };
  }
}

export async function updateStockAction(id: string, stockQty: number | null) {
  try {
    if (!process.env.DATABASE_URL) return { success: true };
    const inStock = stockQty === null || stockQty > 0;
    await prisma.product.update({ where: { id }, data: { stockQty, inStock } });
    try { revalidatePath('/admin/inventory'); } catch {}
    return { success: true };
  } catch (error: any) {
    console.error('[updateStockAction] Error:', error);
    return { success: false, error: error?.message || 'Failed to update stock' };
  }
}

export async function deductStockAction(
  items: { productId: string | null; quantity: number }[]
) {
  try {
    if (!process.env.DATABASE_URL) return { success: true };
    const trackedItems = items.filter((i) => i.productId);
    if (trackedItems.length === 0) return { success: true };

    await prisma.$transaction(
      trackedItems.map((item) =>
        prisma.product.updateMany({
          where: { id: item.productId!, stockQty: { not: null, gt: 0 } },
          data: { stockQty: { decrement: item.quantity } },
        })
      )
    );

    // Mark any tracked products that hit 0 as sold out
    await prisma.product.updateMany({
      where: { stockQty: { lte: 0 }, NOT: { stockQty: null } },
      data: { inStock: false, stockQty: 0 },
    });

    return { success: true };
  } catch (error: any) {
    console.error('[deductStockAction] Error:', error);
    return { success: false, error: error?.message || 'Failed to deduct stock' };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    if (!process.env.DATABASE_URL) {
      return { success: true };
    }

    try {
      await prisma.product.delete({ where: { id: productId } });
    } catch {
      // If not found by id, ignore
    }

    try {
      revalidatePath('/shop');
      revalidatePath('/');
      revalidatePath('/admin/inventory');
    } catch (revalErr) {
      console.warn('Revalidation warning:', revalErr);
    }

    return { success: true };
  } catch (error: any) {
    console.error('[deleteProductAction] Error deleting product:', error);
    return { success: false, error: error?.message || 'Failed to delete product from database' };
  }
}
