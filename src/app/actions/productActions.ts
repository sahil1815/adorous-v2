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
      include: {
        colorways: true,
        galleryImages: true,
        details: true,
        piecesIncluded: true,
      },
      orderBy: { featuredRank: 'asc' },
    });
    if (!products || products.length === 0) {
      return PRODUCTS.filter((p) => p.category === category).map(toDbShape);
    }
    return products;
  } catch (error) {
    console.warn(`[getProductsByCategory] Database unavailable or missing DATABASE_URL. Falling back to static catalogue for category "${category}":`, error);
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
      include: {
        colorways: true,
        galleryImages: true,
        details: true,
        piecesIncluded: true,
      },
    });
    if (!product) {
      const match = PRODUCTS.find((p) => p.slug === slug);
      return match ? toDbShape(match) : null;
    }
    return product;
  } catch (error) {
    console.warn(`[getProductBySlug] Database unavailable. Falling back to static catalogue for slug "${slug}":`, error);
    const match = PRODUCTS.find((p) => p.slug === slug);
    return match ? toDbShape(match) : null;
  }
}

export async function getAllProducts() {
  try {
    if (!process.env.DATABASE_URL) {
      return PRODUCTS.map(toDbShape);
    }
    const products = await prisma.product.findMany({
      include: {
        colorways: true,
        galleryImages: true,
        details: true,
        piecesIncluded: true,
      },
      orderBy: { featuredRank: 'asc' },
    });
    if (!products || products.length === 0) {
      return PRODUCTS.map(toDbShape);
    }
    return products;
  } catch (error) {
    console.warn('[getAllProducts] Database unavailable. Falling back to static catalogue:', error);
    return PRODUCTS.map(toDbShape);
  }
}

export async function createProductAction(productData: Product) {
  try {
    if (!process.env.DATABASE_URL) {
      return { success: true, message: 'Saved to local storage fallback (No DATABASE_URL configured)' };
    }

    const cleanSlug = productData.slug.trim().toLowerCase();

    // Check if product with this slug already exists in DB
    const existing = await prisma.product.findUnique({
      where: { slug: cleanSlug },
    });

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
        isNewDrop: productData.isNewDrop ?? false,
        isGiftPick: productData.isGiftPick ?? false,
        isBestseller: productData.isBestseller ?? false,
        featuredRank: productData.featuredRank ?? 1,
        seoKeywords: Array.isArray(productData.seoKeywords)
          ? productData.seoKeywords.join(',')
          : (productData.seoKeywords || ''),
        details: {
          create: (productData.details || []).map((text) => ({ text })),
        },
        piecesIncluded: {
          create: (productData.piecesIncluded || []).map((text) => ({ text })),
        },
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
      include: {
        colorways: true,
        galleryImages: true,
        details: true,
        piecesIncluded: true,
      },
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

export async function deleteProductAction(productId: string) {
  try {
    if (!process.env.DATABASE_URL) {
      return { success: true };
    }

    // Attempt delete by id, fallback to delete by slug if id was custom
    try {
      await prisma.product.delete({
        where: { id: productId },
      });
    } catch {
      // If not found by id, attempt finding by slug or ignore
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

