'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { deductStockAction } from './productActions';
import { getWelcomeOfferSettings } from './welcomeOfferActions';
import { generateNextOrderId } from '@/lib/orderId';

export async function createOrder(orderData: any) {
  try {
    let validatedDiscountAmount = orderData.discountAmount ? Number(orderData.discountAmount) : undefined;
    let validatedCouponCode = orderData.couponCode;
    let validatedGrandTotal = orderData.grandTotal;

    // Server-side validation for New Visitor Offer
    if (orderData.couponCode === 'NEW_VISITOR') {
      try {
        const settings = await getWelcomeOfferSettings();
        if (!settings.enabled) {
          validatedDiscountAmount = undefined;
          validatedCouponCode = undefined;
        } else {
          // Look up authentic product prices directly from the database
          const itemProductIds = (orderData.items || [])
            .map((i: any) => i.product?.id)
            .filter(Boolean);

          const dbProducts = await prisma.product.findMany({
            where: { id: { in: itemProductIds } },
            select: { id: true, price: true, originalPrice: true },
          });
          const dbProductMap = new Map(dbProducts.map((p) => [p.id, p]));

          let serverSubtotal = 0;
          let serverFlatDiscount = 0;
          const pct = settings.discountPercent || 10;

          for (const item of orderData.items || []) {
            const dbProd = item.product?.id ? dbProductMap.get(item.product.id) : null;
            const price = dbProd?.price ?? item.product?.price ?? 0;
            const originalPrice = dbProd?.originalPrice ?? item.product?.originalPrice;
            const baseOriginalPrice = originalPrice && originalPrice > price ? originalPrice : price;
            const qty = Number(item.quantity) || 1;
            serverSubtotal += price * qty;

            // Flat target price at X% discount from baseOriginalPrice (preserving exact decimals p.q if fractional)
            const targetPrice = Math.round(baseOriginalPrice * (1 - pct / 100) * 100) / 100;

            // If current selling price is higher than targetPrice, discount down to flat X%
            if (price > targetPrice) {
              serverFlatDiscount += (price - targetPrice) * qty;
            }
            // Exception: If current price <= targetPrice (product already has >= X% discount),
            // keep it as is (additional discount = 0).
          }

          serverFlatDiscount = Math.round(serverFlatDiscount * 100) / 100;

          // Check minOrderAmount threshold
          if (settings.minOrderAmount && serverSubtotal < settings.minOrderAmount) {
            validatedDiscountAmount = undefined;
            validatedCouponCode = undefined;
          } else {
            const maxAllowedDiscount = settings.maxDiscountAmount
              ? Math.min(serverFlatDiscount, settings.maxDiscountAmount)
              : serverFlatDiscount;

            const claimedDiscount = Number(orderData.discountAmount) || 0;
            // Verify client discount does not exceed authorized calculation (±1 BDT tolerance for rounding)
            if (claimedDiscount > maxAllowedDiscount + 1) {
              validatedDiscountAmount = maxAllowedDiscount;
            } else {
              validatedDiscountAmount = claimedDiscount > 0 ? claimedDiscount : maxAllowedDiscount;
            }
          }
        }

        const sub = Number(orderData.subtotal) || 0;
        const ship = Number(orderData.shippingFee) || 0;
        const disc = Number(validatedDiscountAmount) || 0;
        validatedGrandTotal = Math.max(0, Math.round((sub - disc + ship) * 100) / 100);
      } catch (err) {
        console.error('[createOrder] Error validating NEW_VISITOR discount on server:', err);
      }
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
        paymentMethod: orderData.paymentMethod,
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
          create: orderData.items.map((item: any) => ({
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.featuredImage,
            price: item.product.price,
            quantity: item.quantity,
            colorName: item.selectedColor.name,
            colorHex: item.selectedColor.hex,
            selectedSize: item.selectedSize,
          })),
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

    revalidatePath('/admin');
    return { success: true, order };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { success: false, error: String(error) };
  }
}

export async function getOrders() {
  try {
    if (!process.env.DATABASE_URL) {
      return [];
    }
    const dbOrders = await prisma.order.findMany({
      include: {
        customer: true,
        items: true,
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
          category: '',
          slug: '',
          price: item.price,
          featuredImage: item.productImage,
        },
        selectedColor: {
          name: item.colorName,
          hex: item.colorHex,
        },
        selectedSize: item.selectedSize || undefined,
        quantity: item.quantity,
      })),
    }));
  } catch (error) {
    console.error("Failed to fetch orders from database:", error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
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

export async function updateOrderCourier(orderId: string, courierPartner: string, consignmentId: string) {
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
      newDiscount = Math.round(newSubtotal * discountRatio * 100) / 100;
    }

    // 3. Determine shipping fee
    let finalShippingFee = order.shippingFee;
    if (typeof customShippingFee === 'number' && !isNaN(customShippingFee) && customShippingFee >= 0) {
      finalShippingFee = customShippingFee;
    }

    // 4. Calculate new grand total
    const calculatedGrandTotal = Math.max(
      0,
      Math.round((newSubtotal - (newDiscount || 0) + finalShippingFee) * 100) / 100
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

export async function updateOrderShippingFee(
  orderId: string,
  shippingFee: number,
  customGrandTotal?: number
) {
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
      Math.round((order.subtotal - (order.discountAmount || 0) + fee) * 100) / 100
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
  return await generateNextOrderId();
}

