'use server';

import { prisma } from '@/lib/db';
import { PRODUCTS } from '@/data/catalogue';
import { Product } from '@/types';

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
