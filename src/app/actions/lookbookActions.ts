'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import {
  LookbookLook,
  LookbookSettingsData,
  DEFAULT_LOOKBOOK_LOOKS,
  DEFAULT_LOOKBOOK_SETTINGS,
  LookbookPaletteItem,
} from '@/data/lookbook';

function formatLook(item: any): LookbookLook {
  let palette: LookbookPaletteItem[] = [];
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
    id: item.id || 'default',
    pageBadge: item.pageBadge || DEFAULT_LOOKBOOK_SETTINGS.pageBadge,
    pageTitle: item.pageTitle || DEFAULT_LOOKBOOK_SETTINGS.pageTitle,
    pageDescription: item.pageDescription || DEFAULT_LOOKBOOK_SETTINGS.pageDescription,
    homepageBadge: item.homepageBadge || DEFAULT_LOOKBOOK_SETTINGS.homepageBadge,
    homepageHeading: item.homepageHeading || DEFAULT_LOOKBOOK_SETTINGS.homepageHeading,
    homepageDescription: item.homepageDescription || DEFAULT_LOOKBOOK_SETTINGS.homepageDescription,
    homepageImage1: item.homepageImage1 || DEFAULT_LOOKBOOK_SETTINGS.homepageImage1,
    homepageImage1Label: item.homepageImage1Label || DEFAULT_LOOKBOOK_SETTINGS.homepageImage1Label,
    homepageImage2: item.homepageImage2 || DEFAULT_LOOKBOOK_SETTINGS.homepageImage2,
    homepageImage2Label: item.homepageImage2Label || DEFAULT_LOOKBOOK_SETTINGS.homepageImage2Label,
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
  };
}

/**
 * Fetch all lookbook looks. Automatically seeds default looks if the table is empty.
 */
export async function getLookbookLooks(includeInactive = false): Promise<LookbookLook[]> {
  try {
    if (!prisma.lookbookLook) {
      return DEFAULT_LOOKBOOK_LOOKS;
    }

    const where = includeInactive ? {} : { isActive: true };
    const looks = await prisma.lookbookLook.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    if (looks.length > 0) {
      return looks.map(formatLook);
    }

    // Auto-seed defaults if table has zero entries
    const count = await prisma.lookbookLook.count();
    if (count === 0) {
      for (const def of DEFAULT_LOOKBOOK_LOOKS) {
        await prisma.lookbookLook.create({
          data: {
            id: def.id,
            numeral: def.numeral,
            title: def.title,
            tagline: def.tagline,
            description: def.description,
            heroImage: def.heroImage,
            paletteJson: JSON.stringify(def.palette),
            itemIds: def.itemIds,
            sortOrder: def.sortOrder,
            isActive: def.isActive,
          },
        });
      }

      const seeded = await prisma.lookbookLook.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
      });
      return seeded.map(formatLook);
    }

    return looks.map(formatLook);
  } catch (error) {
    console.error('[getLookbookLooks] Error fetching lookbook looks:', error);
    return DEFAULT_LOOKBOOK_LOOKS;
  }
}

/**
 * Fetch single look by ID
 */
export async function getLookbookLookById(id: string): Promise<LookbookLook | null> {
  try {
    if (!prisma.lookbookLook) return null;
    const look = await prisma.lookbookLook.findUnique({
      where: { id },
    });
    return look ? formatLook(look) : null;
  } catch (error) {
    console.error('[getLookbookLookById] Error fetching look:', error);
    return null;
  }
}

/**
 * Create or update a Lookbook look
 */
export async function saveLookbookLook(
  input: {
    id?: string;
    numeral: string;
    title: string;
    tagline: string;
    description: string;
    heroImage: string;
    palette: LookbookPaletteItem[];
    itemIds: string[];
    sortOrder?: number;
    isActive?: boolean;
  }
): Promise<{ success: boolean; look?: LookbookLook; error?: string }> {
  try {
    const paletteJson = JSON.stringify(input.palette || []);
    const itemIds = Array.isArray(input.itemIds) ? input.itemIds : [];
    const isActive = input.isActive !== undefined ? Boolean(input.isActive) : true;

    let saved;
    if (input.id) {
      const existing = await prisma.lookbookLook.findUnique({ where: { id: input.id } });
      if (existing) {
        saved = await prisma.lookbookLook.update({
          where: { id: input.id },
          data: {
            numeral: input.numeral.trim(),
            title: input.title.trim(),
            tagline: input.tagline.trim(),
            description: input.description.trim(),
            heroImage: input.heroImage.trim(),
            paletteJson,
            itemIds,
            isActive,
            sortOrder: input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder,
          },
        });
      } else {
        saved = await prisma.lookbookLook.create({
          data: {
            id: input.id,
            numeral: input.numeral.trim(),
            title: input.title.trim(),
            tagline: input.tagline.trim(),
            description: input.description.trim(),
            heroImage: input.heroImage.trim(),
            paletteJson,
            itemIds,
            isActive,
            sortOrder: input.sortOrder !== undefined ? input.sortOrder : 0,
          },
        });
      }
    } else {
      const count = await prisma.lookbookLook.count();
      saved = await prisma.lookbookLook.create({
        data: {
          numeral: input.numeral.trim(),
          title: input.title.trim(),
          tagline: input.tagline.trim(),
          description: input.description.trim(),
          heroImage: input.heroImage.trim(),
          paletteJson,
          itemIds,
          isActive,
          sortOrder: input.sortOrder !== undefined ? input.sortOrder : count,
        },
      });
    }

    revalidatePath('/lookbook');
    revalidatePath('/');
    revalidatePath('/admin/lookbook');

    return { success: true, look: formatLook(saved) };
  } catch (error) {
    console.error('[saveLookbookLook] Error saving look:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Delete a lookbook look
 */
export async function deleteLookbookLook(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.lookbookLook.delete({
      where: { id },
    });

    revalidatePath('/lookbook');
    revalidatePath('/');
    revalidatePath('/admin/lookbook');

    return { success: true };
  } catch (error) {
    console.error('[deleteLookbookLook] Error deleting look:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Reorder lookbook looks
 */
export async function reorderLookbookLooks(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    for (let index = 0; index < orderedIds.length; index++) {
      const id = orderedIds[index];
      await prisma.lookbookLook.update({
        where: { id },
        data: { sortOrder: index },
      });
    }

    revalidatePath('/lookbook');
    revalidatePath('/');
    revalidatePath('/admin/lookbook');

    return { success: true };
  } catch (error) {
    console.error('[reorderLookbookLooks] Error reordering looks:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch Lookbook & Homepage Band settings
 */
export async function getLookbookSettings(): Promise<LookbookSettingsData> {
  try {
    if (!prisma.lookbookSettings) {
      return DEFAULT_LOOKBOOK_SETTINGS;
    }

    const settings = await prisma.lookbookSettings.findUnique({
      where: { id: 'default' },
    });

    if (settings) {
      return formatSettings(settings);
    }

    // Auto seed default settings
    const created = await prisma.lookbookSettings.create({
      data: {
        id: 'default',
        pageBadge: DEFAULT_LOOKBOOK_SETTINGS.pageBadge,
        pageTitle: DEFAULT_LOOKBOOK_SETTINGS.pageTitle,
        pageDescription: DEFAULT_LOOKBOOK_SETTINGS.pageDescription,
        homepageBadge: DEFAULT_LOOKBOOK_SETTINGS.homepageBadge,
        homepageHeading: DEFAULT_LOOKBOOK_SETTINGS.homepageHeading,
        homepageDescription: DEFAULT_LOOKBOOK_SETTINGS.homepageDescription,
        homepageImage1: DEFAULT_LOOKBOOK_SETTINGS.homepageImage1,
        homepageImage1Label: DEFAULT_LOOKBOOK_SETTINGS.homepageImage1Label,
        homepageImage2: DEFAULT_LOOKBOOK_SETTINGS.homepageImage2,
        homepageImage2Label: DEFAULT_LOOKBOOK_SETTINGS.homepageImage2Label,
      },
    });

    return formatSettings(created);
  } catch (error) {
    console.error('[getLookbookSettings] Error fetching settings:', error);
    return DEFAULT_LOOKBOOK_SETTINGS;
  }
}

/**
 * Update Lookbook & Homepage Band settings
 */
export async function updateLookbookSettings(
  input: Partial<Omit<LookbookSettingsData, 'id' | 'updatedAt'>>
): Promise<{ success: boolean; settings?: LookbookSettingsData; error?: string }> {
  try {
    const updated = await prisma.lookbookSettings.upsert({
      where: { id: 'default' },
      update: {
        pageBadge: input.pageBadge ?? undefined,
        pageTitle: input.pageTitle ?? undefined,
        pageDescription: input.pageDescription ?? undefined,
        homepageBadge: input.homepageBadge ?? undefined,
        homepageHeading: input.homepageHeading ?? undefined,
        homepageDescription: input.homepageDescription ?? undefined,
        homepageImage1: input.homepageImage1 ?? undefined,
        homepageImage1Label: input.homepageImage1Label ?? undefined,
        homepageImage2: input.homepageImage2 ?? undefined,
        homepageImage2Label: input.homepageImage2Label ?? undefined,
      },
      create: {
        id: 'default',
        pageBadge: input.pageBadge ?? DEFAULT_LOOKBOOK_SETTINGS.pageBadge,
        pageTitle: input.pageTitle ?? DEFAULT_LOOKBOOK_SETTINGS.pageTitle,
        pageDescription: input.pageDescription ?? DEFAULT_LOOKBOOK_SETTINGS.pageDescription,
        homepageBadge: input.homepageBadge ?? DEFAULT_LOOKBOOK_SETTINGS.homepageBadge,
        homepageHeading: input.homepageHeading ?? DEFAULT_LOOKBOOK_SETTINGS.homepageHeading,
        homepageDescription: input.homepageDescription ?? DEFAULT_LOOKBOOK_SETTINGS.homepageDescription,
        homepageImage1: input.homepageImage1 ?? DEFAULT_LOOKBOOK_SETTINGS.homepageImage1,
        homepageImage1Label: input.homepageImage1Label ?? DEFAULT_LOOKBOOK_SETTINGS.homepageImage1Label,
        homepageImage2: input.homepageImage2 ?? DEFAULT_LOOKBOOK_SETTINGS.homepageImage2,
        homepageImage2Label: input.homepageImage2Label ?? DEFAULT_LOOKBOOK_SETTINGS.homepageImage2Label,
      },
    });

    revalidatePath('/lookbook');
    revalidatePath('/');
    revalidatePath('/admin/lookbook');

    return { success: true, settings: formatSettings(updated) };
  } catch (error) {
    console.error('[updateLookbookSettings] Error updating lookbook settings:', error);
    return { success: false, error: String(error) };
  }
}
