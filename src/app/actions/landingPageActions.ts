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

// Built-in fallback seeds for active campaign links
const SEED_LANDING_PAGES: LandingPageData[] = [
  {
    id: 'lp-luxe-crystal-collection',
    slug: 'luxe-crystal-collection',
    title: 'Luxe Crystal Collection',
    headline: 'Luxe Crystal Collection',
    subtitle: 'Brilliant faceted crystal suites, floral cluster drops, and heirloom statement pieces.',
    productIds: [
      'prod-luxe-floral-crystal-duo-2-piece-set',
      'prod-luxe-crystal-gemstone-suite-2-piece-set',
      'prod-luxe-golden-crystal-gemstone-suite-5-piece-box-set',
      'golden-crystal-5-piece-luxury-suite',
    ],
    sortOrder: 'manual',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lp-jewellery5',
    slug: 'jewellery5',
    title: 'Jewelry Sets Collection',
    headline: 'Jewelry Suites & Heritage Sets',
    subtitle: 'Artisanal bridal suites and handcrafted crystal suites presented in signature velvet gift cases.',
    productIds: [
      'golden-crystal-5-piece-luxury-suite',
      'prod-luxe-golden-crystal-gemstone-suite-5-piece-box-set',
      'prod-luxe-crystal-gemstone-suite-2-piece-set',
      'prod-luxe-floral-crystal-duo-2-piece-set',
      'kundan-bridal-heritage-choker-set',
    ],
    sortOrder: 'manual',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function getAllLandingPages(): Promise<LandingPageData[]> {
  try {
    const pages = await prisma.landingPage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (pages.length === 0) {
      // Auto-seed into DB so they are persistent
      for (const seed of SEED_LANDING_PAGES) {
        await prisma.landingPage.upsert({
          where: { slug: seed.slug },
          update: {},
          create: {
            id: seed.id,
            slug: seed.slug,
            title: seed.title,
            headline: seed.headline,
            subtitle: seed.subtitle,
            productIds: seed.productIds,
            sortOrder: seed.sortOrder,
            isActive: seed.isActive,
          },
        }).catch(() => {});
      }

      const seededPages = await prisma.landingPage.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return seededPages.map(serializeLandingPage);
    }

    return pages.map(serializeLandingPage);
  } catch (error) {
    console.error('[getAllLandingPages] Error fetching landing pages from DB:', error);
    return SEED_LANDING_PAGES;
  }
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPageData | null> {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase();

  try {
    const page = await prisma.landingPage.findUnique({
      where: { slug: cleanSlug },
    });

    if (page) {
      return serializeLandingPage(page);
    }

    // Check seed fallback
    const seed = SEED_LANDING_PAGES.find((p) => p.slug === cleanSlug);
    if (seed) {
      // Persist seed to database for future requests
      await prisma.landingPage.upsert({
        where: { slug: seed.slug },
        update: {},
        create: {
          id: seed.id,
          slug: seed.slug,
          title: seed.title,
          headline: seed.headline,
          subtitle: seed.subtitle,
          productIds: seed.productIds,
          sortOrder: seed.sortOrder,
          isActive: seed.isActive,
        },
      }).catch(() => {});

      return seed;
    }

    return null;
  } catch (error) {
    console.error(`[getLandingPageBySlug] Error fetching slug "${slug}":`, error);
    const seed = SEED_LANDING_PAGES.find((p) => p.slug === cleanSlug);
    return seed || null;
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
