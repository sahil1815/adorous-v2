'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { deductStockAction } from './productActions';
import { getWelcomeOfferSettings } from './welcomeOfferActions';

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

            // Flat target price at X% discount from baseOriginalPrice
            const targetPrice = Math.round(baseOriginalPrice * (1 - pct / 100));

            // If current selling price is higher than targetPrice, discount down to flat X%
            if (price > targetPrice) {
              serverFlatDiscount += (price - targetPrice) * qty;
            }
            // Exception: If current price <= targetPrice (product already has >= X% discount),
            // keep it as is (additional discount = 0).
          }

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
        validatedGrandTotal = Math.max(0, sub - disc + ship);
      } catch (err) {
        console.error('[createOrder] Error validating NEW_VISITOR discount on server:', err);
      }
    }

    const order = await prisma.order.create({
      data: {
        orderId: orderData.orderId,
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
