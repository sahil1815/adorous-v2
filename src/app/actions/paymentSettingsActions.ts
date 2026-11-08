'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import {
  type PaymentSettingsData,
  DEFAULT_PAYMENT_SETTINGS,
} from '@/lib/paymentSettings';

export type { PaymentSettingsData };

function formatSettings(item: any): PaymentSettingsData {
  return {
    id: item.id || 'default',
    enabled: Boolean(item.enabled ?? DEFAULT_PAYMENT_SETTINGS.enabled),
    bkashNumber: item.bkashNumber || DEFAULT_PAYMENT_SETTINGS.bkashNumber,
    bkashAccountType: item.bkashAccountType || DEFAULT_PAYMENT_SETTINGS.bkashAccountType,
    nagadNumber: item.nagadNumber || DEFAULT_PAYMENT_SETTINGS.nagadNumber,
    nagadAccountType: item.nagadAccountType || DEFAULT_PAYMENT_SETTINGS.nagadAccountType,
    onlineDiscountAmount:
      typeof item.onlineDiscountAmount === 'number'
        ? item.onlineDiscountAmount
        : Number(item.onlineDiscountAmount ?? DEFAULT_PAYMENT_SETTINGS.onlineDiscountAmount),
    instructions: item.instructions || DEFAULT_PAYMENT_SETTINGS.instructions,
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
  };
}

/**
 * Retrieves the online payment (bKash/Nagad) settings from the database.
 * Falls back to DEFAULT_PAYMENT_SETTINGS if not found.
 */
export async function getPaymentSettings(): Promise<PaymentSettingsData> {
  try {
    if (!prisma.paymentSettings) {
      return DEFAULT_PAYMENT_SETTINGS;
    }

    const fetchPromise = prisma.paymentSettings.findUnique({
      where: { id: 'default' },
    });
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('DB_TIMEOUT')), 6000)
    );

    const settings = (await Promise.race([fetchPromise, timeoutPromise])) as any;

    if (settings) {
      return formatSettings(settings);
    }

    const created = await prisma.paymentSettings.create({
      data: {
        id: 'default',
        enabled: DEFAULT_PAYMENT_SETTINGS.enabled,
        bkashNumber: DEFAULT_PAYMENT_SETTINGS.bkashNumber,
        bkashAccountType: DEFAULT_PAYMENT_SETTINGS.bkashAccountType,
        nagadNumber: DEFAULT_PAYMENT_SETTINGS.nagadNumber,
        nagadAccountType: DEFAULT_PAYMENT_SETTINGS.nagadAccountType,
        onlineDiscountAmount: DEFAULT_PAYMENT_SETTINGS.onlineDiscountAmount,
        instructions: DEFAULT_PAYMENT_SETTINGS.instructions,
      },
    });

    return formatSettings(created);
  } catch (error) {
    console.error('[getPaymentSettings] Error reading payment settings from database:', error);
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

/**
 * Updates the online payment settings in the database.
 */
export async function updatePaymentSettings(
  data: Partial<PaymentSettingsData>
): Promise<{ success: boolean; settings?: PaymentSettingsData; error?: string }> {
  try {
    const updated = await prisma.paymentSettings.upsert({
      where: { id: 'default' },
      update: {
        ...(typeof data.enabled === 'boolean' && { enabled: data.enabled }),
        ...(data.bkashNumber !== undefined && { bkashNumber: data.bkashNumber.trim() }),
        ...(data.bkashAccountType !== undefined && { bkashAccountType: data.bkashAccountType.trim() }),
        ...(data.nagadNumber !== undefined && { nagadNumber: data.nagadNumber.trim() }),
        ...(data.nagadAccountType !== undefined && { nagadAccountType: data.nagadAccountType.trim() }),
        ...(typeof data.onlineDiscountAmount === 'number' && {
          onlineDiscountAmount: Math.max(0, data.onlineDiscountAmount),
        }),
        ...(data.instructions !== undefined && { instructions: data.instructions.trim() }),
      },
      create: {
        id: 'default',
        enabled: data.enabled ?? DEFAULT_PAYMENT_SETTINGS.enabled,
        bkashNumber: data.bkashNumber?.trim() || DEFAULT_PAYMENT_SETTINGS.bkashNumber,
        bkashAccountType: data.bkashAccountType?.trim() || DEFAULT_PAYMENT_SETTINGS.bkashAccountType,
        nagadNumber: data.nagadNumber?.trim() || DEFAULT_PAYMENT_SETTINGS.nagadNumber,
        nagadAccountType: data.nagadAccountType?.trim() || DEFAULT_PAYMENT_SETTINGS.nagadAccountType,
        onlineDiscountAmount:
          typeof data.onlineDiscountAmount === 'number'
            ? Math.max(0, data.onlineDiscountAmount)
            : DEFAULT_PAYMENT_SETTINGS.onlineDiscountAmount,
        instructions: data.instructions?.trim() || DEFAULT_PAYMENT_SETTINGS.instructions,
      },
    });

    return {
      success: true,
      settings: formatSettings(updated),
    };
  } catch (error: any) {
    console.error('[updatePaymentSettings] Error updating payment settings:', error);
    return {
      success: false,
      error: error?.message || 'Failed to update payment settings.',
    };
  }
}

/**
 * Resets the online payment settings back to system defaults.
 */
export async function resetPaymentSettings(): Promise<{ success: boolean; settings?: PaymentSettingsData; error?: string }> {
  try {
    const reset = await prisma.paymentSettings.upsert({
      where: { id: 'default' },
      update: {
        enabled: DEFAULT_PAYMENT_SETTINGS.enabled,
        bkashNumber: DEFAULT_PAYMENT_SETTINGS.bkashNumber,
        bkashAccountType: DEFAULT_PAYMENT_SETTINGS.bkashAccountType,
        nagadNumber: DEFAULT_PAYMENT_SETTINGS.nagadNumber,
        nagadAccountType: DEFAULT_PAYMENT_SETTINGS.nagadAccountType,
        onlineDiscountAmount: DEFAULT_PAYMENT_SETTINGS.onlineDiscountAmount,
        instructions: DEFAULT_PAYMENT_SETTINGS.instructions,
      },
      create: {
        id: 'default',
        enabled: DEFAULT_PAYMENT_SETTINGS.enabled,
        bkashNumber: DEFAULT_PAYMENT_SETTINGS.bkashNumber,
        bkashAccountType: DEFAULT_PAYMENT_SETTINGS.bkashAccountType,
        nagadNumber: DEFAULT_PAYMENT_SETTINGS.nagadNumber,
        nagadAccountType: DEFAULT_PAYMENT_SETTINGS.nagadAccountType,
        onlineDiscountAmount: DEFAULT_PAYMENT_SETTINGS.onlineDiscountAmount,
        instructions: DEFAULT_PAYMENT_SETTINGS.instructions,
      },
    });

    try {
      revalidatePath('/checkout');
      revalidatePath('/admin');
      revalidatePath('/admin/payment-settings');
    } catch {}

    return {
      success: true,
      settings: formatSettings(reset),
    };
  } catch (error: any) {
    console.error('[resetPaymentSettings] Error resetting payment settings:', error);
    return {
      success: false,
      error: error?.message || 'Failed to reset payment settings.',
    };
  }
}
