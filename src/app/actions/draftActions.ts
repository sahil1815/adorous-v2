'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { generateNextOrderId } from '@/lib/orderId';
import { deductStockAction } from './productActions';

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Non-fatal if invoked outside Next.js request lifecycle
  }
}

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

export interface ConvertDraftToOrderOptions {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  district?: string;
  giftNote?: string;
  paymentMethod?: string;
  shippingFee?: number;
  internalNotes?: string;
}

/**
 * Converts a draft checkout into an official confirmed Order in the system.
 * Deducts stock, generates next continuous Order ID, links convertedOrderId, and sets status to 'converted'.
 */
export async function convertDraftCheckoutToOrderAction(
  draftId: string,
  options?: ConvertDraftToOrderOptions
) {
  try {
    if (!draftId) {
      return { success: false, error: 'Draft ID is required' };
    }

    const draft = await prisma.draftCheckout.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      return { success: false, error: 'Draft checkout record not found' };
    }

    // If it was already converted and has an existing order in database
    if (draft.status === 'converted' && draft.convertedOrderId) {
      const existingOrder = await prisma.order.findUnique({
        where: { orderId: draft.convertedOrderId },
      });
      if (existingOrder) {
        return {
          success: true,
          orderId: existingOrder.orderId,
          alreadyConverted: true,
          message: `This draft checkout was already converted as order ${existingOrder.orderId}`,
        };
      }
    }

    // Parse cart items
    let cartItems: any[] = [];
    try {
      cartItems = JSON.parse(draft.cartItemsJson || '[]');
    } catch {
      cartItems = [];
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return {
        success: false,
        error: 'Cannot convert draft to order: no items found in cart',
      };
    }

    // Clean customer values with safe fallbacks
    const fullName = options?.fullName?.trim() || draft.fullName?.trim() || 'Valued Customer';
    const phone = options?.phone?.trim() || draft.phone?.trim() || 'Unspecified';
    const email = options?.email?.trim() || draft.email?.trim() || undefined;
    const address = options?.address?.trim() || draft.address?.trim() || 'Address to be confirmed with customer';
    const district = options?.district?.trim() || draft.district?.trim() || 'Dhaka (Metro & Greater)';
    const giftNote = options?.giftNote?.trim() || draft.giftNote?.trim() || undefined;

    let paymentMethod = options?.paymentMethod?.trim() || draft.paymentMethod?.trim() || 'Cash on Delivery';
    if (paymentMethod.toLowerCase() === 'cod') {
      paymentMethod = 'Cash on Delivery';
    }

    const shippingFee = options?.shippingFee !== undefined ? Number(options.shippingFee) : Number(draft.shippingFee || 0);
    const subtotal = Number(draft.subtotal || 0);
    const discountAmount = draft.discountAmount !== null && draft.discountAmount !== undefined ? Number(draft.discountAmount) : undefined;
    const couponCode = draft.couponCode?.trim() || undefined;

    // Recalculate grandTotal if custom shipping fee or discount is used
    let grandTotal = Number(draft.grandTotal || 0);
    if (options?.shippingFee !== undefined) {
      grandTotal = Math.max(0, Math.round((subtotal - (discountAmount || 0) + shippingFee) * 100) / 100);
    }

    const internalNotes = options?.internalNotes?.trim() ||
      'Converted from abandoned cart via concierge call with customer.';

    // Continuous Order ID (AF-YYYY-10001, etc.)
    const assignedOrderId = await generateNextOrderId();

    // Create Order with Customer and Items in Prisma
    const order = await prisma.order.create({
      data: {
        orderId: assignedOrderId,
        customerUserId: draft.customerUserId || null,
        status: 'pending',
        courierPartner: null,
        paymentMethod,
        subtotal,
        shippingFee,
        discountAmount,
        couponCode,
        grandTotal,
        internalNotes,
        customer: {
          create: {
            fullName,
            phone,
            email,
            address,
            district,
            giftNote,
            whatsappUpdates: true,
          },
        },
        items: {
          create: cartItems.map((item: any) => {
            const orig = item.product?.originalPrice;
            const sellPrice = item.product?.price ?? 0;
            const itemPrice = orig && orig > sellPrice ? orig : sellPrice;
            const colorName = item.selectedColor?.name || (typeof item.selectedColor === 'string' ? item.selectedColor : 'Standard');
            const colorHex = item.selectedColor?.hex || '#C5A880';

            return {
              productId: item.product?.id || null,
              productName: item.product?.name || 'Jewelry item',
              productImage: item.product?.featuredImage || '',
              price: itemPrice,
              quantity: Number(item.quantity) || 1,
              colorName,
              colorHex,
              selectedSize: item.selectedSize || null,
            };
          }),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    // Deduct stock for tracked products
    try {
      await deductStockAction(
        order.items.map((item) => ({
          productId: item.productId ?? null,
          quantity: item.quantity,
        }))
      );
    } catch (stockErr) {
      console.warn('Failed to deduct stock for converted draft order:', stockErr);
    }

    // Update draft record
    await prisma.draftCheckout.update({
      where: { id: draft.id },
      data: {
        status: 'converted',
        convertedOrderId: assignedOrderId,
        fullName: fullName !== 'Valued Customer' ? fullName : draft.fullName,
        phone: phone !== 'Unspecified' ? phone : draft.phone,
        email: email || draft.email,
        address: address !== 'Address to be confirmed with customer' ? address : draft.address,
        district: district,
        paymentMethod,
        shippingFee,
        grandTotal,
      },
    });

    safeRevalidatePath('/admin');
    safeRevalidatePath('/admin/drafts');
    safeRevalidatePath('/admin/orders');

    return {
      success: true,
      orderId: assignedOrderId,
      order,
    };
  } catch (error) {
    console.error('Error converting draft checkout to order:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Directly updates status of a draft checkout (e.g. toggle between 'abandoned' and 'converted').
 */
export async function updateDraftCheckoutStatusAction(
  id: string,
  status: 'abandoned' | 'converted',
  convertedOrderId?: string | null
) {
  try {
    if (!id) return { success: false, error: 'Draft ID is required' };

    const updateData: any = { status };
    if (status === 'converted') {
      if (convertedOrderId !== undefined) {
        updateData.convertedOrderId = convertedOrderId?.trim() || null;
      }
    } else if (status === 'abandoned') {
      updateData.convertedOrderId = null;
    }

    const draft = await prisma.draftCheckout.update({
      where: { id },
      data: updateData,
    });

    safeRevalidatePath('/admin/drafts');
    safeRevalidatePath('/admin');
    return { success: true, draft };
  } catch (error) {
    console.error('Error updating draft checkout status:', error);
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

/**
 * Directly updates status of a draft sign-in lead.
 */
export async function updateDraftSignInStatusAction(
  id: string,
  status: 'abandoned' | 'converted'
) {
  try {
    if (!id) return { success: false, error: 'Lead ID is required' };

    await prisma.draftSignIn.update({
      where: { id },
      data: { status },
    });

    safeRevalidatePath('/admin/drafts');
    return { success: true };
  } catch (error) {
    console.error('Error updating draft sign-in status:', error);
    return { success: false, error: String(error) };
  }
}

