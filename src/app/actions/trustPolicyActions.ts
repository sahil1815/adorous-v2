'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { verifyAdminSession } from '@/lib/adminAuth';
import { TrustPolicyData } from '@/types';
import {
  DEFAULT_GLOBAL_TRUST_POLICY,
  DEFAULT_CATEGORY_TRUST_POLICIES,
} from '@/lib/trustPolicies';

/**
 * Retrieves all trust policies from the database, populated with defaults
 * for any unconfigured categories or global master policy.
 */
export async function getAllTrustPolicies(): Promise<Record<string, TrustPolicyData>> {
  try {
    if (!prisma.trustPolicySettings) {
      return {
        global: { ...DEFAULT_GLOBAL_TRUST_POLICY },
        ...DEFAULT_CATEGORY_TRUST_POLICIES,
      };
    }

    const records = await prisma.trustPolicySettings.findMany();
    const map: Record<string, TrustPolicyData> = {
      global: { ...DEFAULT_GLOBAL_TRUST_POLICY },
      ...DEFAULT_CATEGORY_TRUST_POLICIES,
    };

    records.forEach((rec) => {
      map[rec.id] = {
        id: rec.id,
        guaranteeTitle: rec.guaranteeTitle,
        guaranteeText: rec.guaranteeText,
        exchangeTitle: rec.exchangeTitle,
        exchangeText: rec.exchangeText,
        deliveryTitle: rec.deliveryTitle,
        deliveryText: rec.deliveryText,
        showGuarantee: rec.showGuarantee,
        showExchange: rec.showExchange,
        showDelivery: rec.showDelivery,
        updatedAt: rec.updatedAt ? new Date(rec.updatedAt).toISOString() : undefined,
        createdAt: rec.createdAt ? new Date(rec.createdAt).toISOString() : undefined,
      };
    });

    return map;
  } catch (error) {
    console.error('[getAllTrustPolicies] Error fetching trust policies:', error);
    return {
      global: { ...DEFAULT_GLOBAL_TRUST_POLICY },
      ...DEFAULT_CATEGORY_TRUST_POLICIES,
    };
  }
}

/**
 * Retrieves the raw trust policy record directly from DB.
 * Returns null if no database record exists yet.
 */
export async function getTrustPolicyRecord(id: string): Promise<TrustPolicyData | null> {
  const cleanId = (id || '').toLowerCase().trim();
  try {
    if (!prisma.trustPolicySettings) {
      return null;
    }

    const record = await prisma.trustPolicySettings.findUnique({
      where: { id: cleanId },
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      guaranteeTitle: record.guaranteeTitle,
      guaranteeText: record.guaranteeText,
      exchangeTitle: record.exchangeTitle,
      exchangeText: record.exchangeText,
      deliveryTitle: record.deliveryTitle,
      deliveryText: record.deliveryText,
      showGuarantee: record.showGuarantee,
      showExchange: record.showExchange,
      showDelivery: record.showDelivery,
      updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : undefined,
      createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : undefined,
    };
  } catch (error) {
    console.error(`[getTrustPolicyRecord] Error loading record "${id}":`, error);
    return null;
  }
}

/**
 * Retrieves a single trust policy by category slug or 'global'.
 */
export async function getTrustPolicyById(id: string): Promise<TrustPolicyData> {
  const cleanId = (id || '').toLowerCase().trim();
  const defaultPolicy =
    DEFAULT_CATEGORY_TRUST_POLICIES[cleanId] || DEFAULT_GLOBAL_TRUST_POLICY;

  try {
    if (!prisma.trustPolicySettings) {
      return { ...defaultPolicy, id: cleanId };
    }

    const record = await prisma.trustPolicySettings.findUnique({
      where: { id: cleanId },
    });

    if (!record) {
      return { ...defaultPolicy, id: cleanId };
    }

    return {
      id: record.id,
      guaranteeTitle: record.guaranteeTitle,
      guaranteeText: record.guaranteeText,
      exchangeTitle: record.exchangeTitle,
      exchangeText: record.exchangeText,
      deliveryTitle: record.deliveryTitle,
      deliveryText: record.deliveryText,
      showGuarantee: record.showGuarantee,
      showExchange: record.showExchange,
      showDelivery: record.showDelivery,
      updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : undefined,
      createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : undefined,
    };
  } catch (error) {
    console.error(`[getTrustPolicyById] Error loading trust policy "${id}":`, error);
    return { ...defaultPolicy, id: cleanId };
  }
}

/**
 * Updates or creates a category-level or global master trust policy.
 */
export async function updateTrustPolicyAction(
  id: string,
  data: {
    guaranteeTitle: string;
    guaranteeText: string;
    exchangeTitle: string;
    exchangeText: string;
    deliveryTitle: string;
    deliveryText: string;
    showGuarantee: boolean;
    showExchange: boolean;
    showDelivery: boolean;
  }
): Promise<{ success: boolean; policy?: TrustPolicyData; error?: string }> {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  const cleanId = (id || '').toLowerCase().trim();
  if (!cleanId) {
    return { success: false, error: 'Target section ID is required.' };
  }

  try {
    const upserted = await prisma.trustPolicySettings.upsert({
      where: { id: cleanId },
      update: {
        guaranteeTitle: (data.guaranteeTitle || '').trim(),
        guaranteeText: (data.guaranteeText || '').trim(),
        exchangeTitle: (data.exchangeTitle || '').trim(),
        exchangeText: (data.exchangeText || '').trim(),
        deliveryTitle: (data.deliveryTitle || '').trim(),
        deliveryText: (data.deliveryText || '').trim(),
        showGuarantee: Boolean(data.showGuarantee),
        showExchange: Boolean(data.showExchange),
        showDelivery: Boolean(data.showDelivery),
      },
      create: {
        id: cleanId,
        guaranteeTitle: (data.guaranteeTitle || '').trim(),
        guaranteeText: (data.guaranteeText || '').trim(),
        exchangeTitle: (data.exchangeTitle || '').trim(),
        exchangeText: (data.exchangeText || '').trim(),
        deliveryTitle: (data.deliveryTitle || '').trim(),
        deliveryText: (data.deliveryText || '').trim(),
        showGuarantee: Boolean(data.showGuarantee),
        showExchange: Boolean(data.showExchange),
        showDelivery: Boolean(data.showDelivery),
      },
    });

    try {
      revalidatePath('/admin');
      revalidatePath('/admin/trust-policies');
      revalidatePath('/[category]/[slug]', 'page');
      revalidatePath('/shop');
    } catch {
      // Ignored outside Next.js request lifecycle
    }

    return {
      success: true,
      policy: {
        id: upserted.id,
        guaranteeTitle: upserted.guaranteeTitle,
        guaranteeText: upserted.guaranteeText,
        exchangeTitle: upserted.exchangeTitle,
        exchangeText: upserted.exchangeText,
        deliveryTitle: upserted.deliveryTitle,
        deliveryText: upserted.deliveryText,
        showGuarantee: upserted.showGuarantee,
        showExchange: upserted.showExchange,
        showDelivery: upserted.showDelivery,
        updatedAt: upserted.updatedAt ? new Date(upserted.updatedAt).toISOString() : undefined,
        createdAt: upserted.createdAt ? new Date(upserted.createdAt).toISOString() : undefined,
      },
    };
  } catch (error: unknown) {
    console.error(`[updateTrustPolicyAction] Failed to update policy "${cleanId}":`, error);
    return { success: false, error: (error as Error)?.message || 'Database error occurred while updating policy.' };
  }
}

/**
 * Resets a trust policy to its default factory copy.
 */
export async function resetTrustPolicyAction(
  id: string
): Promise<{ success: boolean; policy?: TrustPolicyData; error?: string }> {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  const cleanId = (id || '').toLowerCase().trim();
  const defaultPolicy =
    DEFAULT_CATEGORY_TRUST_POLICIES[cleanId] || DEFAULT_GLOBAL_TRUST_POLICY;

  return updateTrustPolicyAction(cleanId, defaultPolicy);
}
