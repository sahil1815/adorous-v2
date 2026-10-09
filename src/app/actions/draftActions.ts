'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { sendWhatsAppDraftRecovery } from '@/lib/whatsapp';

export interface DraftCheckoutInput {
  sessionId: string;
  customerUserId?: string | null;
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  district?: string;
  giftNote?: string;
  paymentMethod?: string;
  cartItems: any[];
  subtotal: number;
  shippingFee: number;
  discountAmount?: number;
  couponCode?: string;
  grandTotal: number;
}

export interface DraftSignInInput {
  sessionId: string;
  type: 'register' | 'signin';
  fullName?: string;
  phone?: string;
  email?: string;
  district?: string;
  address?: string;
}

/**
 * Saves or updates a draft checkout session (abandoned cart lead).
 * Only saves if at least some contact information has been entered.
 */
export async function saveDraftCheckoutAction(data: DraftCheckoutInput) {
  try {
    if (!data.sessionId) return { success: false, error: 'Session ID is required' };

    const hasMeaningfulInput =
      (data.phone && data.phone.trim().length >= 3) ||
      (data.fullName && data.fullName.trim().length >= 2) ||
      (data.email && data.email.trim().length >= 3) ||
      (data.address && data.address.trim().length >= 3);

    if (!hasMeaningfulInput) {
      return { success: true, skipped: true };
    }

    const cartJson = JSON.stringify(data.cartItems || []);

    const draft = await prisma.draftCheckout.upsert({
      where: { sessionId: data.sessionId },
      update: {
        customerUserId: data.customerUserId || null,
        fullName: data.fullName?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        district: data.district?.trim() || null,
        giftNote: data.giftNote?.trim() || null,
        paymentMethod: data.paymentMethod || 'Cash on Delivery',
        cartItemsJson: cartJson,
        subtotal: data.subtotal || 0,
        shippingFee: data.shippingFee || 0,
        discountAmount: data.discountAmount ?? null,
        couponCode: data.couponCode?.trim() || null,
        grandTotal: data.grandTotal || 0,
        // Only keep abandoned if not already converted
      },
      create: {
        sessionId: data.sessionId,
        customerUserId: data.customerUserId || null,
        fullName: data.fullName?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        district: data.district?.trim() || null,
        giftNote: data.giftNote?.trim() || null,
        paymentMethod: data.paymentMethod || 'Cash on Delivery',
        cartItemsJson: cartJson,
        subtotal: data.subtotal || 0,
        shippingFee: data.shippingFee || 0,
        discountAmount: data.discountAmount ?? null,
        couponCode: data.couponCode?.trim() || null,
        grandTotal: data.grandTotal || 0,
        status: 'abandoned',
      },
    });

    revalidatePath('/admin/drafts');

    // Trigger automated WhatsApp recovery message after 45s if customer abandons without placing order
    if (data.phone && data.phone.trim().length >= 8) {
      const sid = data.sessionId;
      setTimeout(async () => {
        try {
          const latestDraft = await prisma.draftCheckout.findUnique({
            where: { sessionId: sid },
          });
          // Only send if still abandoned (not converted to confirmed order)
          if (latestDraft && latestDraft.status === 'abandoned') {
            await sendWhatsAppDraftRecovery(latestDraft);
          }
        } catch (e) {
          console.error(`[WhatsApp Draft Automation] Failed for session ${sid}:`, e);
        }
      }, 45000);
    }

    return { success: true, draftId: draft.id };
  } catch (error) {
    console.error('Error saving draft checkout:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Marks a draft checkout as successfully converted to an order.
 */
export async function markDraftCheckoutConvertedAction(sessionId: string, orderId: string) {
  try {
    if (!sessionId) return { success: false };

    await prisma.draftCheckout.updateMany({
      where: { sessionId },
      data: {
        status: 'converted',
        convertedOrderId: orderId,
      },
    });

    revalidatePath('/admin/drafts');
    return { success: true };
  } catch (error) {
    console.error('Error marking draft checkout converted:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetches all draft checkouts for the admin dashboard.
 */
export async function getDraftCheckoutsAction() {
  try {
    const drafts = await prisma.draftCheckout.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return drafts.map((d) => {
      let parsedItems = [];
      try {
        parsedItems = JSON.parse(d.cartItemsJson || '[]');
      } catch {
        parsedItems = [];
      }

      return {
        id: d.id,
        sessionId: d.sessionId,
        customerUserId: d.customerUserId,
        fullName: d.fullName || 'Anonymous Visitor',
        phone: d.phone || '',
        email: d.email || '',
        address: d.address || '',
        district: d.district || '',
        giftNote: d.giftNote || '',
        paymentMethod: d.paymentMethod || 'Cash on Delivery',
        cartItems: parsedItems,
        subtotal: d.subtotal,
        shippingFee: d.shippingFee,
        discountAmount: d.discountAmount,
        couponCode: d.couponCode,
        grandTotal: d.grandTotal,
        status: d.status,
        convertedOrderId: d.convertedOrderId,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      };
    });
  } catch (error) {
    console.error('Error fetching draft checkouts:', error);
    return [];
  }
}

/**
 * Deletes a draft checkout record.
 */
export async function deleteDraftCheckoutAction(id: string) {
  try {
    await prisma.draftCheckout.delete({ where: { id } });
    revalidatePath('/admin/drafts');
    return { success: true };
  } catch (error) {
    console.error('Error deleting draft checkout:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Saves or updates a draft sign-in or registration attempt.
 * Never captures or saves passwords for user privacy and security.
 */
export async function saveDraftSignInAction(data: DraftSignInInput) {
  try {
    if (!data.sessionId) return { success: false, error: 'Session ID is required' };

    const hasMeaningfulInput =
      (data.phone && data.phone.trim().length >= 3) ||
      (data.fullName && data.fullName.trim().length >= 2) ||
      (data.email && data.email.trim().length >= 3);

    if (!hasMeaningfulInput) {
      return { success: true, skipped: true };
    }

    const draft = await prisma.draftSignIn.upsert({
      where: { sessionId: data.sessionId },
      update: {
        type: data.type,
        fullName: data.fullName?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        district: data.district?.trim() || null,
        address: data.address?.trim() || null,
      },
      create: {
        sessionId: data.sessionId,
        type: data.type,
        fullName: data.fullName?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        district: data.district?.trim() || null,
        address: data.address?.trim() || null,
        status: 'abandoned',
      },
    });

    revalidatePath('/admin/drafts');
    return { success: true, draftId: draft.id };
  } catch (error) {
    console.error('Error saving draft sign-in:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Marks a draft sign-in as successfully converted/logged in.
 */
export async function markDraftSignInConvertedAction(sessionId: string) {
  try {
    if (!sessionId) return { success: false };

    await prisma.draftSignIn.updateMany({
      where: { sessionId },
      data: {
        status: 'converted',
      },
    });

    revalidatePath('/admin/drafts');
    return { success: true };
  } catch (error) {
    console.error('Error marking draft sign-in converted:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetches all draft sign-in and registration attempts for admin.
 */
export async function getDraftSignInsAction() {
  try {
    const drafts = await prisma.draftSignIn.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return drafts.map((d) => ({
      id: d.id,
      sessionId: d.sessionId,
      type: d.type,
      fullName: d.fullName || 'Anonymous Visitor',
      phone: d.phone || '',
      email: d.email || '',
      district: d.district || '',
      address: d.address || '',
      status: d.status,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching draft sign-ins:', error);
    return [];
  }
}

/**
 * Deletes a draft sign-in record.
 */
export async function deleteDraftSignInAction(id: string) {
  try {
    await prisma.draftSignIn.delete({ where: { id } });
    revalidatePath('/admin/drafts');
    return { success: true };
  } catch (error) {
    console.error('Error deleting draft sign-in:', error);
    return { success: false, error: String(error) };
  }
}
