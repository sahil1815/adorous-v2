'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export type SortOrder = 'manual' | 'most-purchased' | 'newest' | 'oldest' | 'best-rating';

export interface LandingPageData {
  id: string;
  slug: string;
  title: string;
  headline: string;
  subtitle?: string | null;
  productIds: string[];
  sortOrder: SortOrder;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getAllLandingPages(): Promise<LandingPageData[]> {
  try {
    const pages = await prisma.landingPage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return pages.map(serializeLandingPage);
  } catch (error) {
    console.error('[getAllLandingPages] Error fetching landing pages from DB:', error);
    return [];
  }
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPageData | null> {
  if (!slug) return null;
  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

  try {
    let page = await prisma.landingPage.findUnique({
      where: { slug: cleanSlug },
    });

    if (!page) {
      page = await prisma.landingPage.findFirst({
        where: {
          slug: { equals: cleanSlug, mode: 'insensitive' },
        },
      });
    }

    if (page) {
      return serializeLandingPage(page);
    }

    return null;
  } catch (error) {
    console.error(`[getLandingPageBySlug] Error fetching slug "${slug}":`, error);
    return null;
  }
}

export async function upsertLandingPage(data: {
  id?: string;
  slug: string;
  title: string;
  headline: string;
  subtitle?: string | null;
  productIds: string[];
  sortOrder?: SortOrder;
  isActive?: boolean;
}) {
  try {
    const cleanSlug = data.slug.trim().toLowerCase();
    const page = await prisma.landingPage.upsert({
      where: { slug: cleanSlug },
      update: {
        title: data.title,
        headline: data.headline,
        subtitle: data.subtitle ?? null,
        productIds: data.productIds,
        sortOrder: data.sortOrder || 'manual',
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      create: {
        id: data.id || undefined,
        slug: cleanSlug,
        title: data.title,
        headline: data.headline,
        subtitle: data.subtitle ?? null,
        productIds: data.productIds,
        sortOrder: data.sortOrder || 'manual',
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    revalidatePath(`/collections/${cleanSlug}`);
    revalidatePath('/collections');
    return { success: true, page: serializeLandingPage(page) };
  } catch (error: any) {
    console.error('[upsertLandingPage] Error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteLandingPageAction(idOrSlug: string) {
  try {
    await prisma.landingPage.deleteMany({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    revalidatePath('/collections');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteLandingPageAction] Error:', error);
    return { success: false, error: error.message };
  }
}

export async function syncLandingPagesFromClient(clientPages: LandingPageData[]) {
  if (!Array.isArray(clientPages) || clientPages.length === 0) {
    return { success: true, synced: 0 };
  }

  try {
    let synced = 0;
    for (const cp of clientPages) {
      if (!cp.slug || !cp.title) continue;
      const cleanSlug = cp.slug.trim().toLowerCase();
      await prisma.landingPage.upsert({
        where: { slug: cleanSlug },
        update: {
          title: cp.title,
          headline: cp.headline,
          subtitle: cp.subtitle ?? null,
          productIds: cp.productIds || [],
          sortOrder: cp.sortOrder || 'manual',
          isActive: cp.isActive !== undefined ? cp.isActive : true,
        },
        create: {
          id: cp.id || undefined,
          slug: cleanSlug,
          title: cp.title,
          headline: cp.headline,
          subtitle: cp.subtitle ?? null,
          productIds: cp.productIds || [],
          sortOrder: cp.sortOrder || 'manual',
          isActive: cp.isActive !== undefined ? cp.isActive : true,
        },
      });
      synced++;
    }

    revalidatePath('/collections');
    return { success: true, synced };
  } catch (error: any) {
    console.error('[syncLandingPagesFromClient] Error:', error);
    return { success: false, error: error.message };
  }
}

function serializeLandingPage(p: any): LandingPageData {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    headline: p.headline,
    subtitle: p.subtitle,
    productIds: p.productIds || [],
    sortOrder: (p.sortOrder as SortOrder) || 'manual',
    isActive: Boolean(p.isActive),
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
  };
}
