'use server';

import { prisma } from '@/lib/db';

export async function getProductsByCategory(category: string) {
  return prisma.product.findMany({
    where: { category },
    include: {
      colorways: true,
      galleryImages: true,
      details: true,
      piecesIncluded: true,
    },
    orderBy: { featuredRank: 'asc' },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      colorways: true,
      galleryImages: true,
      details: true,
      piecesIncluded: true,
    },
  });
}

export async function getAllProducts() {
  return prisma.product.findMany({
    include: {
      colorways: true,
      galleryImages: true,
      details: true,
      piecesIncluded: true,
    },
    orderBy: { featuredRank: 'asc' },
  });
}
