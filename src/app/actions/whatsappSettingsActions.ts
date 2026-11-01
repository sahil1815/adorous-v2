'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE } from '@/lib/whatsappTemplate';

export interface WhatsAppSettingsData {
  id: string;
  verificationTemplate: string;
  updatedAt?: string;
  createdAt?: string;
}

/**
 * Retrieves the WhatsApp message template settings from the database.
 * Falls back to DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE safely if not found or on db error.
 */
export async function getWhatsAppSettings(): Promise<WhatsAppSettingsData> {
  try {
    if (!prisma.whatsAppSettings) {
      return {
        id: 'default',
        verificationTemplate: DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE,
      };
    }

    const settings = await prisma.whatsAppSettings.findUnique({
      where: { id: 'default' },
    });

    if (settings && settings.verificationTemplate) {
      return {
        id: settings.id,
        verificationTemplate: settings.verificationTemplate,
        updatedAt: settings.updatedAt ? new Date(settings.updatedAt).toISOString() : undefined,
        createdAt: settings.createdAt ? new Date(settings.createdAt).toISOString() : undefined,
      };
    }

    // If no row exists yet, initialize it
    const created = await prisma.whatsAppSettings.create({
      data: {
        id: 'default',
        verificationTemplate: DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE,
      },
    });

    return {
      id: created.id,
      verificationTemplate: created.verificationTemplate,
      updatedAt: created.updatedAt ? new Date(created.updatedAt).toISOString() : undefined,
      createdAt: created.createdAt ? new Date(created.createdAt).toISOString() : undefined,
    };
  } catch (error) {
    console.error('[getWhatsAppSettings] Error reading settings from database:', error);
    return {
      id: 'default',
      verificationTemplate: DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE,
    };
  }
}

/**
 * Updates the WhatsApp verification message template format in the database.
 */
export async function updateWhatsAppVerificationTemplate(
  template: string
): Promise<{ success: boolean; settings?: WhatsAppSettingsData; error?: string }> {
  try {
    if (typeof template !== 'string' || !template.trim()) {
      return { success: false, error: 'Template content cannot be empty.' };
    }

    const trimmedTemplate = template.trim();

    const updated = await prisma.whatsAppSettings.upsert({
      where: { id: 'default' },
      update: {
        verificationTemplate: trimmedTemplate,
      },
      create: {
        id: 'default',
        verificationTemplate: trimmedTemplate,
      },
    });

    try {
      revalidatePath('/admin');
      revalidatePath('/admin/whatsapp');
    } catch {
      // Ignored outside Next.js request lifecycle
    }

    return {
      success: true,
      settings: {
        id: updated.id,
        verificationTemplate: updated.verificationTemplate,
        updatedAt: updated.updatedAt ? new Date(updated.updatedAt).toISOString() : undefined,
        createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString() : undefined,
      },
    };
  } catch (error: any) {
    console.error('[updateWhatsAppVerificationTemplate] Error saving settings:', error);
    return {
      success: false,
      error: error?.message || 'Failed to update WhatsApp message template.',
    };
  }
}

/**
 * Resets the verification template back to the factory Adorous standard.
 */
export async function resetWhatsAppVerificationTemplate(): Promise<{
  success: boolean;
  settings?: WhatsAppSettingsData;
  error?: string;
}> {
  return updateWhatsAppVerificationTemplate(DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE);
}
