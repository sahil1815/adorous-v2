import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  DEFAULT_LOOKBOOK_LOOKS,
  DEFAULT_LOOKBOOK_SETTINGS,
  LookbookLook,
  LookbookSettingsData,
} from '@/data/lookbook';
import { PRODUCTS } from '@/data/catalogue';

export const dynamic = 'force-dynamic';

function formatLook(item: any): LookbookLook {
  let palette = [];
  try {
    palette = item.paletteJson ? JSON.parse(item.paletteJson) : [];
  } catch {
    palette = [];
  }

  return {
    id: item.id,
    numeral: item.numeral || 'LOOK I',
    title: item.title,
    tagline: item.tagline || '',
    description: item.description || '',
    heroImage: item.heroImage || '/images/hero/hero-still-life.jpg',
    palette,
    itemIds: Array.isArray(item.itemIds) ? item.itemIds : [],
    sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : 0,
    isActive: Boolean(item.isActive),
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
  };
}

function formatSettings(item: any): LookbookSettingsData {
  return {
    id: item?.id || 'default',
    pageBadge: item?.pageBadge || DEFAULT_LOOKBOOK_SETTINGS.pageBadge,
    pageTitle: item?.pageTitle || DEFAULT_LOOKBOOK_SETTINGS.pageTitle,
    pageDescription: item?.pageDescription || DEFAULT_LOOKBOOK_SETTINGS.pageDescription,
    homepageBadge: item?.homepageBadge || DEFAULT_LOOKBOOK_SETTINGS.homepageBadge,
    homepageHeading: item?.homepageHeading || DEFAULT_LOOKBOOK_SETTINGS.homepageHeading,
    homepageDescription: item?.homepageDescription || DEFAULT_LOOKBOOK_SETTINGS.homepageDescription,
    homepageImage1: item?.homepageImage1 || DEFAULT_LOOKBOOK_SETTINGS.homepageImage1,
    homepageImage1Label: item?.homepageImage1Label || DEFAULT_LOOKBOOK_SETTINGS.homepageImage1Label,
    homepageImage2: item?.homepageImage2 || DEFAULT_LOOKBOOK_SETTINGS.homepageImage2,
    homepageImage2Label: item?.homepageImage2Label || DEFAULT_LOOKBOOK_SETTINGS.homepageImage2Label,
    updatedAt: item?.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
  };
}

export async function GET() {
  try {
    // 1. Fetch Looks
    let looks: LookbookLook[] = [];
    try {
      const rawLooks = await prisma.lookbookLook.findMany({
        orderBy: { sortOrder: 'asc' },
      });
      if (rawLooks && rawLooks.length > 0) {
        looks = rawLooks.map(formatLook);
      } else {
        looks = DEFAULT_LOOKBOOK_LOOKS;
      }
    } catch (e) {
      console.warn('[/api/admin/lookbook] Failed to fetch looks from DB, using defaults:', e);
      looks = DEFAULT_LOOKBOOK_LOOKS;
    }

    // 2. Fetch Settings
    let settings: LookbookSettingsData = DEFAULT_LOOKBOOK_SETTINGS;
    try {
      const rawSettings = await prisma.lookbookSettings.findUnique({
        where: { id: 'default' },
      });
      if (rawSettings) {
        settings = formatSettings(rawSettings);
      }
    } catch (e) {
      console.warn('[/api/admin/lookbook] Failed to fetch settings from DB, using defaults:', e);
    }

    // 3. Fetch Products for Lookbook items picker
    let products: any[] = [];
    try {
      const rawProducts = await prisma.product.findMany({
        include: { colorways: true },
        orderBy: [{ featuredRank: 'asc' }, { createdAt: 'asc' }],
      });
      if (rawProducts && rawProducts.length > 0) {
        products = rawProducts;
      } else {
        products = PRODUCTS;
      }
    } catch {
      products = PRODUCTS;
    }

    return NextResponse.json({
      success: true,
      looks,
      settings,
      products,
    });
  } catch (error: any) {
    console.error('[/api/admin/lookbook GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to load lookbook data',
        looks: DEFAULT_LOOKBOOK_LOOKS,
        settings: DEFAULT_LOOKBOOK_SETTINGS,
        products: PRODUCTS,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'saveLook') {
      const { look } = body;
      const paletteJson = JSON.stringify(look.palette || []);
      const itemIds = Array.isArray(look.itemIds) ? look.itemIds : [];
      const isActive = look.isActive !== undefined ? Boolean(look.isActive) : true;

      let saved;
      if (look.id) {
        saved = await prisma.lookbookLook.upsert({
          where: { id: look.id },
          update: {
            numeral: look.numeral,
            title: look.title,
            tagline: look.tagline || '',
            description: look.description || '',
            heroImage: look.heroImage,
            paletteJson,
            itemIds,
            sortOrder: look.sortOrder ?? 0,
            isActive,
          },
          create: {
            id: look.id,
            numeral: look.numeral,
            title: look.title,
            tagline: look.tagline || '',
            description: look.description || '',
            heroImage: look.heroImage,
            paletteJson,
            itemIds,
            sortOrder: look.sortOrder ?? 0,
            isActive,
          },
        });
      } else {
        const id = `look-${Date.now().toString(36)}`;
        saved = await prisma.lookbookLook.create({
          data: {
            id,
            numeral: look.numeral,
            title: look.title,
            tagline: look.tagline || '',
            description: look.description || '',
            heroImage: look.heroImage,
            paletteJson,
            itemIds,
            sortOrder: look.sortOrder ?? 0,
            isActive,
          },
        });
      }
      return NextResponse.json({ success: true, look: formatLook(saved) });
    }

    if (action === 'deleteLook') {
      const { id } = body;
      await prisma.lookbookLook.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (action === 'reorderLooks') {
      const { orderedIds } = body;
      for (let index = 0; index < orderedIds.length; index++) {
        await prisma.lookbookLook.update({
          where: { id: orderedIds[index] },
          data: { sortOrder: index },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'updateSettings') {
      const { settings } = body;
      const updated = await prisma.lookbookSettings.upsert({
        where: { id: 'default' },
        update: {
          pageBadge: settings.pageBadge,
          pageTitle: settings.pageTitle,
          pageDescription: settings.pageDescription,
          homepageBadge: settings.homepageBadge,
          homepageHeading: settings.homepageHeading,
          homepageDescription: settings.homepageDescription,
          homepageImage1: settings.homepageImage1,
          homepageImage1Label: settings.homepageImage1Label,
          homepageImage2: settings.homepageImage2,
          homepageImage2Label: settings.homepageImage2Label,
        },
        create: {
          id: 'default',
          pageBadge: settings.pageBadge || DEFAULT_LOOKBOOK_SETTINGS.pageBadge,
          pageTitle: settings.pageTitle || DEFAULT_LOOKBOOK_SETTINGS.pageTitle,
          pageDescription: settings.pageDescription || DEFAULT_LOOKBOOK_SETTINGS.pageDescription,
          homepageBadge: settings.homepageBadge || DEFAULT_LOOKBOOK_SETTINGS.homepageBadge,
          homepageHeading: settings.homepageHeading || DEFAULT_LOOKBOOK_SETTINGS.homepageHeading,
          homepageDescription: settings.homepageDescription || DEFAULT_LOOKBOOK_SETTINGS.homepageDescription,
          homepageImage1: settings.homepageImage1 || DEFAULT_LOOKBOOK_SETTINGS.homepageImage1,
          homepageImage1Label: settings.homepageImage1Label || DEFAULT_LOOKBOOK_SETTINGS.homepageImage1Label,
          homepageImage2: settings.homepageImage2 || DEFAULT_LOOKBOOK_SETTINGS.homepageImage2,
          homepageImage2Label: settings.homepageImage2Label || DEFAULT_LOOKBOOK_SETTINGS.homepageImage2Label,
        },
      });
      return NextResponse.json({ success: true, settings: formatSettings(updated) });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('[/api/admin/lookbook POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
