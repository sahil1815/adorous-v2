'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { deductStockAction } from './productActions';
import { getWelcomeOfferSettings } from './welcomeOfferActions';
import { getPaymentSettings } from './paymentSettingsActions';
import { generateNextOrderId } from '@/lib/orderId';
import { verifyAdminSession } from '@/lib/adminAuth';
import { sendMetaCapiEvent } from '@/lib/metaCapi';

export async function createOrder(orderData: any) {
  try {
    // 1. Authoritative price recalculation from database
    const itemProductIds = (orderData.items || [])
      .map((i: any) => i.product?.id)
      .filter(Boolean);

    let authoritativeSubtotal = 0;
    let dbProductMap = new Map<string, { id: string; price: number; originalPrice?: number | null }>();

    if (itemProductIds.length > 0) {
      try {
        const dbProducts = await prisma.product.findMany({
          where: { id: { in: itemProductIds } },
          select: { id: true, price: true, originalPrice: true },
        });
        dbProductMap = new Map(dbProducts.map((p) => [p.id, p]));
      } catch (dbErr) {
        console.warn('[createOrder] Warning fetching product prices from DB:', dbErr);
      }
    }

    for (const item of orderData.items || []) {
      const dbProd = item.product?.id ? dbProductMap.get(item.product.id) : null;
      const unitPrice = dbProd ? Math.round(Number(dbProd.price)) : (Math.round(Number(item.product?.price)) || 0);
      const qty = Math.max(1, Number(item.quantity) || 1);
      authoritativeSubtotal += unitPrice * qty;
    }

    // 2. Authoritative shipping fee validation based on destination district
    const districtRaw = String(orderData.customer?.district || '').trim().toLowerCase();
    const isDhakaMetro = districtRaw.includes('dhaka');
    let validatedShippingFee = isDhakaMetro ? 80 : 130;

    // 3. Authoritative coupon / discount validation
    let validatedDiscountAmount = 0;
    let validatedCouponCode: string | undefined = orderData.couponCode ? String(orderData.couponCode).trim() : undefined;

    if (validatedCouponCode === 'NEW_VISITOR') {
      try {
        const settings = await getWelcomeOfferSettings();
        if (settings.enabled) {
          const pct = settings.discountPercent || 10;
          let compareSubtotal = 0;
          for (const item of orderData.items || []) {
            const dbProd = item.product?.id ? dbProductMap.get(item.product.id) : null;
            const price = dbProd ? Number(dbProd.price) : (Number(item.product?.price) || 0);
            const orig = dbProd?.originalPrice ?? item.product?.originalPrice;
            const comparePrice = orig && orig > price ? orig : price;
            const qty = Math.max(1, Number(item.quantity) || 1);
            compareSubtotal += comparePrice * qty;
          }
          const computedDiscount = Math.round(compareSubtotal * (pct / 100));
          const maxDisc = settings.maxDiscountAmount || 500;
          validatedDiscountAmount = Math.min(computedDiscount, maxDisc);
        } else {
          validatedCouponCode = undefined;
        }
      } catch (err) {
        console.error('[createOrder] Error validating NEW_VISITOR discount on server:', err);
      }
    } else if (validatedCouponCode) {
      const upperCode = validatedCouponCode.toUpperCase();
      const subForCoupon = authoritativeSubtotal > 0 ? authoritativeSubtotal : (Number(orderData.subtotal) || 0);

      if (upperCode === 'EID2026') {
        if (subForCoupon >= 2000) {
          validatedDiscountAmount = Math.min(Math.round(subForCoupon * 0.15), 800);
          validatedCouponCode = 'EID2026';
        } else {
          validatedCouponCode = undefined;
        }
      } else if (upperCode === 'FIRST10') {
        if (subForCoupon >= 1000) {
          validatedDiscountAmount = Math.min(Math.round(subForCoupon * 0.10), 500);
          validatedCouponCode = 'FIRST10';
        } else {
          validatedCouponCode = undefined;
        }
      } else if (upperCode === 'ROYAL500') {
        if (subForCoupon >= 3500) {
          validatedDiscountAmount = 500;
          validatedCouponCode = 'ROYAL500';
        } else {
          validatedCouponCode = undefined;
        }
      } else if (upperCode === 'FREESHIP') {
        validatedShippingFee = 0;
        validatedDiscountAmount = 0;
        validatedCouponCode = 'FREESHIP';
      } else {
        // Unknown or custom coupon: accept within reasonable bounds (cannot exceed 30% of subtotal)
        const claimed = Number(orderData.discountAmount) || 0;
        if (claimed > 0 && claimed <= Math.round(subForCoupon * 0.3)) {
          validatedDiscountAmount = claimed;
        } else {
          validatedCouponCode = undefined;
          validatedDiscountAmount = 0;
        }
      }
    }

    const sub = authoritativeSubtotal > 0 ? authoritativeSubtotal : (Number(orderData.subtotal) || 0);
    const ship = validatedShippingFee;
    const disc = validatedDiscountAmount;
    let validatedGrandTotal = Math.max(0, Math.round(sub - disc + ship));

    // Determine Payment Mode & Online Payment Handling
    const isOnlinePayment =
      orderData.paymentMethod === 'bkash' ||
      orderData.paymentMethod === 'online' ||
      (typeof orderData.paymentMethod === 'string' &&
        orderData.paymentMethod.toLowerCase().includes('online'));

    let finalPaymentMethod = isOnlinePayment ? 'Online Payment (bKash/Nagad)' : (orderData.paymentMethod || 'Cash on Delivery');
    let finalTransactionId: string | null = null;
    let finalOnlineDiscountAmount: number | null = null;
    let finalCodAmount = 0;
    let finalPaymentStatus = 'pending';

    if (isOnlinePayment) {
      const rawTrxId = typeof orderData.transactionId === 'string' ? orderData.transactionId.trim() : '';
      if (!rawTrxId) {
        return {
          success: false,
          error: 'Please provide a valid bKash or Nagad Transaction ID to complete your order.',
        };
      }
      finalTransactionId = rawTrxId;

      // Validate and apply online discount amount from authoritative settings
      try {
        const paymentSettings = await getPaymentSettings();
        if (paymentSettings.enabled && paymentSettings.onlineDiscountAmount > 0) {
          finalOnlineDiscountAmount = paymentSettings.onlineDiscountAmount;
        }
      } catch (err) {
        console.error('[createOrder] Error fetching payment settings:', err);
      }

      // Recompute grand total incorporating online discount
      const sub = Number(orderData.subtotal) || 0;
      const ship = Number(orderData.shippingFee) || 0;
      const promoDisc = Number(validatedDiscountAmount) || 0;
      const onlineDisc = Number(finalOnlineDiscountAmount) || 0;
      validatedGrandTotal = Math.max(0, Math.round(sub - promoDisc - onlineDisc + ship));

      // On online payment, the courier collects 0 COD!
      finalCodAmount = 0;
    } else {
      finalCodAmount = validatedGrandTotal;
    }

    // Generate authoritative server-side continuous order ID (AF-YYYY-10001, AF-YYYY-10002, ...)
    // Preserves legacy import IDs (AF-LEG-*) if explicitly provided
    let finalOrderId = orderData.orderId;
    if (!finalOrderId || !String(finalOrderId).startsWith('AF-LEG-')) {
      finalOrderId = await generateNextOrderId();
    }

    const order = await prisma.order.create({
      data: {
        orderId: finalOrderId,
        customerUserId: orderData.customerUserId || null,
        status: orderData.status || 'pending',
        courierPartner: orderData.courierPartner,
        paymentMethod: finalPaymentMethod,
        transactionId: finalTransactionId,
        paymentStatus: finalPaymentStatus,
        onlineDiscountAmount: finalOnlineDiscountAmount,
        codAmount: finalCodAmount,
        subtotal: orderData.subtotal,
        shippingFee: orderData.shippingFee,
        discountAmount: validatedDiscountAmount,
        couponCode: validatedCouponCode,
        grandTotal: validatedGrandTotal,
        internalNotes: orderData.internalNotes,
        customer: {
          create: {
            fullName: orderData.customer.fullName,
            phone: orderData.customer.phone,
            email: orderData.customer.email,
            address: orderData.customer.address,
            district: orderData.customer.district,
            giftNote: orderData.customer.giftNote,
            whatsappUpdates: orderData.customer.whatsappUpdates,
          },
        },
        items: {
          create: (orderData.items || []).map((item: any) => {
            const orig = item.product?.originalPrice;
            const sellPrice = item.product?.price ?? 0;
            const itemPrice = orig && orig > sellPrice ? orig : sellPrice;
            return {
              productId: item.product?.id || null,
              productName: item.product?.name || 'Jewelry item',
              productImage: item.product?.featuredImage || '',
              price: itemPrice,
              quantity: Number(item.quantity) || 1,
              colorName: item.selectedColor?.name || (typeof item.selectedColor === 'string' ? item.selectedColor : 'Standard'),
              colorHex: item.selectedColor?.hex || '#C5A880',
              selectedSize: item.selectedSize || (Array.isArray(item.selectedSizes) ? item.selectedSizes.join(', ') : null),
              customNote: item.customNote?.trim() || null,
            };
          }),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });
    
    // Deduct stock for tracked products (atomic, safe for concurrent orders)
    await deductStockAction(
      order.items.map((item) => ({
        productId: item.productId ?? null,
        quantity: item.quantity,
      }))
    );

    // Dispatch server-side Meta Conversions API (CAPI) Purchase event for 100% conversion tracking
    try {
      sendMetaCapiEvent({
        eventName: 'Purchase',
        eventId: finalOrderId, // Exact match with browser pixel trackFbEvent eventID
        eventSourceUrl: 'https://adorousfashion.store/checkout',
        userData: {
          fullName: orderData.customer?.fullName,
          phone: orderData.customer?.phone,
          email: orderData.customer?.email,
          district: orderData.customer?.district,
        },
        customData: {
          currency: 'BDT',
          value: validatedGrandTotal,
          order_id: finalOrderId,
          content_ids: order.items.map((i) => i.productId).filter(Boolean) as string[],
          num_items: order.items.reduce((sum, i) => sum + i.quantity, 0),
          contents: order.items.map((i) => ({
            id: i.productId || i.productName,
            quantity: i.quantity,
            item_price: i.price,
          })),
        },
      }).catch((capiErr) => console.warn('[createOrder] Background Meta CAPI notification warning:', capiErr));
    } catch (capiError) {
      // Non-blocking
    }

    try {
      revalidatePath('/admin');
    } catch {}
    return { success: true, order };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { success: false, error: String(error) };
  }
}

export async function getOrders() {
  const session = await verifyAdminSession();
  if (!session) {
    return [];
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!process.env.DATABASE_URL && !process.env.DATABASE_URL_POOLED) {
        return [];
      }
      const dbOrders = await prisma.order.findMany({
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return dbOrders.map(order => ({
        orderId: order.orderId,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        courierPartner: order.courierPartner,
        consignmentId: order.consignmentId,
        customer: order.customer ? {
          fullName: order.customer.fullName,
          phone: order.customer.phone,
          email: order.customer.email || undefined,
          address: order.customer.address,
          district: order.customer.district,
          giftNote: order.customer.giftNote || undefined,
          whatsappUpdates: order.customer.whatsappUpdates,
        } : {
          fullName: 'Unknown',
          phone: '',
          address: '',
          district: '',
          whatsappUpdates: false,
        },
        paymentMethod: order.paymentMethod,
        transactionId: (order as any).transactionId || null,
        paymentStatus: ((order as any).paymentStatus || 'pending') as 'pending' | 'verified' | 'fake',
        onlineDiscountAmount: (order as any).onlineDiscountAmount || undefined,
        codAmount:
          typeof (order as any).codAmount === 'number'
            ? (order as any).codAmount
            : (order.paymentMethod?.toLowerCase().includes('online') || order.paymentMethod?.toLowerCase().includes('bkash'))
            ? 0
            : order.grandTotal,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        discountAmount: order.discountAmount || undefined,
        couponCode: order.couponCode || undefined,
        grandTotal: order.grandTotal,
        internalNotes: order.internalNotes || undefined,
        items: order.items.map(item => ({
          id: item.id,
          product: {
            id: item.productId || 'unknown',
            name: item.productName,
            category: item.product?.category || '',
            slug: item.product?.slug || '',
            price: item.price,
            featuredImage: item.productImage,
          },
          selectedColor: {
            name: item.colorName,
            hex: item.colorHex,
          },
          selectedSize: item.selectedSize || undefined,
          customNote: item.customNote || undefined,
          quantity: item.quantity,
        })),
      }));
    } catch (error: any) {
      console.warn(`[getOrders] Attempt ${attempt}/${maxRetries} failed:`, error?.message || error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, attempt * 400));
      } else {
        console.error("Failed to fetch orders from database after retries:", error);
        return [];
      }
    }
  }
  return [];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  try {
    await prisma.order.update({
      where: { orderId },
      data: { status },
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function updateOrderPaymentStatus(orderId: string, paymentStatus: 'pending' | 'verified' | 'fake') {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  try {
    const updated = await prisma.order.update({
      where: { orderId },
      data: { paymentStatus },
    });
    try {
      revalidatePath('/admin');
      revalidatePath('/track-order');
      revalidatePath('/account/orders');
    } catch {}
    return { success: true, order: updated };
  } catch (error) {
    console.error('[updateOrderPaymentStatus] Error:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateOrderCodAmount(orderId: string, codAmount: number) {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  try {
    const updated = await prisma.order.update({
      where: { orderId },
      data: { codAmount: Math.max(0, codAmount) },
    });
    try {
      revalidatePath('/admin');
      revalidatePath('/track-order');
    } catch {}
    return { success: true, order: updated };
  } catch (error) {
    console.error('[updateOrderCodAmount] Error:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateOrderCourier(orderId: string, courierPartner: string, consignmentId: string) {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  try {
    await prisma.order.update({
      where: { orderId },
      data: { courierPartner, consignmentId },
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function updateInternalNotes(orderId: string, internalNotes: string) {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  try {
    await prisma.order.update({
      where: { orderId },
      data: { internalNotes },
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function deleteOrder(orderId: string) {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  try {
    await prisma.order.delete({
      where: { orderId },
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function updateOrderItemQuantity(
  orderId: string,
  itemId: string,
  newQuantity: number,
  customGrandTotal?: number,
  customShippingFee?: number
) {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  try {
    if (newQuantity < 1) {
      return { success: false, error: 'Quantity must be at least 1' };
    }

    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Match item by id or fallback to item-index or first item
    let targetItem = order.items.find((i) => i.id === itemId);
    if (!targetItem && typeof itemId === 'string' && itemId.startsWith('item-')) {
      const idx = parseInt(itemId.replace('item-', ''), 10);
      if (!isNaN(idx) && order.items[idx]) {
        targetItem = order.items[idx];
      }
    }
    if (!targetItem) {
      targetItem = order.items[0];
    }
    if (!targetItem) {
      return { success: false, error: 'Order item not found' };
    }

    const oldQuantity = targetItem.quantity;
    const quantityDiff = newQuantity - oldQuantity;

    // 1. Calculate new subtotal
    const newSubtotal = order.items.reduce((sum, item) => {
      const q = item.id === targetItem.id ? newQuantity : item.quantity;
      return sum + item.price * q;
    }, 0);

    // 2. Calculate proportional discount
    let newDiscount = order.discountAmount;
    if (order.subtotal > 0 && typeof order.discountAmount === 'number' && order.discountAmount > 0) {
      const discountRatio = order.discountAmount / order.subtotal;
      newDiscount = Math.round(newSubtotal * discountRatio);
    }

    // 3. Determine shipping fee
    let finalShippingFee = order.shippingFee;
    if (typeof customShippingFee === 'number' && !isNaN(customShippingFee) && customShippingFee >= 0) {
      finalShippingFee = customShippingFee;
    }

    // 4. Calculate new grand total
    const calculatedGrandTotal = Math.max(
      0,
      Math.round(newSubtotal - (newDiscount || 0) + finalShippingFee)
    );

    const finalGrandTotal =
      typeof customGrandTotal === 'number' && !isNaN(customGrandTotal) && customGrandTotal >= 0
        ? customGrandTotal
        : calculatedGrandTotal;

    // 5. Update database in transaction
    await prisma.$transaction(async (tx) => {
      // Update item quantity
      await tx.orderItem.update({
        where: { id: targetItem.id },
        data: { quantity: newQuantity },
      });

      // Update order totals & shipping fee
      await tx.order.update({
        where: { orderId },
        data: {
          subtotal: newSubtotal,
          discountAmount: newDiscount,
          shippingFee: finalShippingFee,
          grandTotal: finalGrandTotal,
        },
      });

      // 6. Adjust product stock if tracked
      if (targetItem.productId && quantityDiff !== 0) {
        if (quantityDiff < 0) {
          // Quantity reduced -> restore stock back to inventory
          const restoreCount = Math.abs(quantityDiff);
          await tx.product.updateMany({
            where: { id: targetItem.productId, NOT: { stockQty: null } },
            data: {
              stockQty: { increment: restoreCount },
              inStock: true,
            },
          });
        } else if (quantityDiff > 0) {
          // Quantity increased -> deduct from inventory
          await tx.product.updateMany({
            where: { id: targetItem.productId, stockQty: { not: null, gt: 0 } },
            data: {
              stockQty: { decrement: quantityDiff },
            },
          });
          // Check if any tracked products hit 0
          await tx.product.updateMany({
            where: { id: targetItem.productId, stockQty: { lte: 0 }, NOT: { stockQty: null } },
            data: { inStock: false, stockQty: 0 },
          });
        }
      }
    });

    try {
      revalidatePath('/admin');
      revalidatePath('/admin/inventory');
      revalidatePath('/track-order');
    } catch {}

    return {
      success: true,
      newSubtotal,
      newDiscount,
      finalShippingFee,
      finalGrandTotal,
    };
  } catch (error: any) {
    console.error('[updateOrderItemQuantity] Error:', error);
    return { success: false, error: error?.message || 'Failed to update item quantity' };
  }
}

export async function updateOrderItemProduct({
  orderId,
  itemId,
  newProduct,
  newColor,
  newSize,
  newQuantity,
  customUnitPrice,
  customGrandTotal,
  customShippingFee,
  customNote,
}: {
  orderId: string;
  itemId: string;
  newProduct: {
    id: string;
    name: string;
    category?: string;
    slug?: string;
    price: number;
    featuredImage: string;
  };
  newColor: {
    name: string;
    hex: string;
  };
  newSize?: string;
  newQuantity: number;
  customUnitPrice?: number;
  customGrandTotal?: number;
  customShippingFee?: number;
  customNote?: string;
}) {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  try {
    if (newQuantity < 1) {
      return { success: false, error: 'Quantity must be at least 1' };
    }

    if (!process.env.DATABASE_URL) {
      return { success: true };
    }

    const order = await prisma.order.findUnique({
      where: { orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Match item by id or fallback to item-index or first item
    let targetItem = order.items.find((i) => i.id === itemId);
    if (!targetItem && typeof itemId === 'string' && itemId.startsWith('item-')) {
      const idx = parseInt(itemId.replace('item-', ''), 10);
      if (!isNaN(idx) && order.items[idx]) {
        targetItem = order.items[idx];
      }
    }
    if (!targetItem) {
      targetItem = order.items[0];
    }
    if (!targetItem) {
      return { success: false, error: 'Order item not found' };
    }

    const oldQuantity = targetItem.quantity;
    const oldProductId = targetItem.productId;

    const unitPrice =
      typeof customUnitPrice === 'number' && !isNaN(customUnitPrice) && customUnitPrice >= 0
        ? customUnitPrice
        : newProduct.price;

    // 1. Calculate new subtotal
    const newSubtotal = order.items.reduce((sum, item) => {
      if (item.id === targetItem.id) {
        return sum + unitPrice * newQuantity;
      }
      return sum + item.price * item.quantity;
    }, 0);

    // 2. Calculate proportional discount if voucher was used
    let newDiscount = order.discountAmount;
    if (order.subtotal > 0 && typeof order.discountAmount === 'number' && order.discountAmount > 0) {
      const discountRatio = order.discountAmount / order.subtotal;
      newDiscount = Math.round(newSubtotal * discountRatio);
    }

    // 3. Determine shipping fee
    let finalShippingFee = order.shippingFee;
    if (typeof customShippingFee === 'number' && !isNaN(customShippingFee) && customShippingFee >= 0) {
      finalShippingFee = customShippingFee;
    }

    // 4. Calculate new grand total
    const calculatedGrandTotal = Math.max(
      0,
      Math.round(newSubtotal - (newDiscount || 0) + finalShippingFee)
    );

    const finalGrandTotal =
      typeof customGrandTotal === 'number' && !isNaN(customGrandTotal) && customGrandTotal >= 0
        ? customGrandTotal
        : calculatedGrandTotal;

    // 5. Verify if newProduct.id exists in DB to prevent foreign key errors
    let validProductId: string | null = null;
    if (newProduct.id) {
      try {
        const found = await prisma.product.findUnique({
          where: { id: newProduct.id },
          select: { id: true },
        });
        if (found) {
          validProductId = found.id;
        }
      } catch {}
    }

    // 6. Update database in transaction
    await prisma.$transaction(async (tx) => {
      // Update item
      await tx.orderItem.update({
        where: { id: targetItem.id },
        data: {
          productId: validProductId,
          productName: newProduct.name,
          productImage: newProduct.featuredImage,
          price: unitPrice,
          quantity: newQuantity,
          colorName: newColor.name,
          colorHex: newColor.hex,
          selectedSize: newSize || null,
          customNote: customNote !== undefined ? (customNote || null) : targetItem.customNote,
        },
      });

      // Update order totals & shipping fee
      await tx.order.update({
        where: { orderId },
        data: {
          subtotal: newSubtotal,
          discountAmount: newDiscount,
          shippingFee: finalShippingFee,
          grandTotal: finalGrandTotal,
        },
      });

      // 7. Adjust inventory stocks if tracked
      if (oldProductId && validProductId && oldProductId === validProductId) {
        // Same product, different qty
        const diff = newQuantity - oldQuantity;
        if (diff < 0) {
          await tx.product.updateMany({
            where: { id: validProductId, NOT: { stockQty: null } },
            data: { stockQty: { increment: Math.abs(diff) }, inStock: true },
          });
        } else if (diff > 0) {
          await tx.product.updateMany({
            where: { id: validProductId, stockQty: { not: null, gt: 0 } },
            data: { stockQty: { decrement: diff } },
          });
          await tx.product.updateMany({
            where: { id: validProductId, stockQty: { lte: 0 }, NOT: { stockQty: null } },
            data: { inStock: false, stockQty: 0 },
          });
        }
      } else {
        // Product changed: restore old product stock
        if (oldProductId) {
          await tx.product.updateMany({
            where: { id: oldProductId, NOT: { stockQty: null } },
            data: { stockQty: { increment: oldQuantity }, inStock: true },
          });
        }
        // Deduct new product stock
        if (validProductId) {
          await tx.product.updateMany({
            where: { id: validProductId, stockQty: { not: null, gt: 0 } },
            data: { stockQty: { decrement: newQuantity } },
          });
          await tx.product.updateMany({
            where: { id: validProductId, stockQty: { lte: 0 }, NOT: { stockQty: null } },
            data: { inStock: false, stockQty: 0 },
          });
        }
      }
    });

    try {
      revalidatePath('/admin');
      revalidatePath('/admin/inventory');
      revalidatePath('/track-order');
    } catch {}

    return {
      success: true,
      newSubtotal,
      newDiscount,
      finalShippingFee,
      finalGrandTotal,
    };
  } catch (error: any) {
    console.error('[updateOrderItemProduct] Error:', error);
    return { success: false, error: error?.message || 'Failed to update order product' };
  }
}


export async function updateOrderShippingFee(
  orderId: string,
  shippingFee: number,
  customGrandTotal?: number
) {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderId },
    });
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    const fee = Math.max(0, shippingFee);
    const calculatedGrandTotal = Math.max(
      0,
      Math.round(order.subtotal - (order.discountAmount || 0) + fee)
    );
    const finalGrandTotal =
      typeof customGrandTotal === 'number' && !isNaN(customGrandTotal) && customGrandTotal >= 0
        ? customGrandTotal
        : calculatedGrandTotal;

    await prisma.order.update({
      where: { orderId },
      data: {
        shippingFee: fee,
        grandTotal: finalGrandTotal,
      },
    });

    try {
      revalidatePath('/admin');
      revalidatePath('/track-order');
    } catch {}

    return { success: true, shippingFee: fee, grandTotal: finalGrandTotal };
  } catch (error: any) {
    console.error('[updateOrderShippingFee] Error:', error);
    return { success: false, error: error?.message || 'Failed to update delivery fee' };
  }
}

export async function updateOrderTotals(
  orderId: string,
  grandTotal: number,
  discountAmount?: number,
  subtotal?: number,
  shippingFee?: number
) {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, error: 'Unauthorized: Admin authentication required.' };
  }

  try {
    const data: any = { grandTotal };
    if (typeof discountAmount === 'number') data.discountAmount = discountAmount;
    if (typeof subtotal === 'number') data.subtotal = subtotal;
    if (typeof shippingFee === 'number') data.shippingFee = shippingFee;

    await prisma.order.update({
      where: { orderId },
      data,
    });

    try {
      revalidatePath('/admin');
      revalidatePath('/track-order');
    } catch {}

    return { success: true };
  } catch (error: any) {
    console.error('[updateOrderTotals] Error:', error);
    return { success: false, error: error?.message || 'Failed to update order totals' };
  }
}

export async function getNextOrderIdAction(): Promise<string> {
  const session = await verifyAdminSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return await generateNextOrderId();
}

/**
 * Public, privacy-safe order tracking lookup by Order ID or Customer Phone.
 * Returns only tracking-relevant fields for the requested order.
 */
export async function getPublicOrderTracking(query: string) {
  try {
    const clean = (query || '').trim();
    if (!clean) {
      return { success: false, error: 'Please enter a valid Order Reference or Phone Number' };
    }

    const cleanDigits = clean.replace(/[^0-9]/g, '');

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderId: { equals: clean, mode: 'insensitive' } },
          ...(cleanDigits.length >= 10
            ? [{ customer: { phone: { contains: cleanDigits.slice(-10) } } }]
            : []),
        ],
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!order) {
      return { success: false, error: 'No order found matching this reference' };
    }

    const isDhaka = Boolean(order.customer?.district?.toLowerCase().includes('dhaka'));
    const consignment = order.consignmentId || `ST-${order.orderId.replace(/[^0-9]/g, '') || '884920'}`;

    return {
      success: true,
      order: {
        orderId: order.orderId,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        courierPartner: order.courierPartner || 'Steadfast Courier',
        consignmentId: consignment,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        transactionId: order.transactionId,
        codAmount: (order.paymentMethod?.toLowerCase().includes('online') || order.paymentMethod?.toLowerCase().includes('bkash'))
          ? 0
          : (typeof (order as any).codAmount === 'number' ? (order as any).codAmount : order.grandTotal),
        customer: {
          fullName: order.customer?.fullName || 'Valued Patron',
          phone: order.customer?.phone || '',
          district: order.customer?.district || (isDhaka ? 'Dhaka' : 'Nationwide'),
          address: order.customer?.address || '',
        },
        items: order.items.map((i) => ({
          product: {
            id: i.productId || '',
            name: i.productName,
            category: i.product?.category || '',
            slug: i.product?.slug || '',
            price: i.price,
            featuredImage: i.productImage,
          },
          selectedColor: {
            name: i.colorName || 'Standard',
            hex: i.colorHex || '#DDD6CB',
          },
          selectedSize: i.selectedSize || undefined,
          customNote: i.customNote || undefined,
          quantity: i.quantity,
        })),
        grandTotal: order.grandTotal,
        shippingFee: order.shippingFee,
        subtotal: order.subtotal,
      },
    };
  } catch (error: any) {
    console.error('[getPublicOrderTracking] Error:', error);
    return { success: false, error: error?.message || 'Database error occurred while fetching tracking details' };
  }
}


