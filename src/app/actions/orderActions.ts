'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { deductStockAction } from './productActions';

export async function createOrder(orderData: any) {
  try {
    const order = await prisma.order.create({
      data: {
        orderId: orderData.orderId,
        status: orderData.status || 'pending',
        courierPartner: orderData.courierPartner,
        paymentMethod: orderData.paymentMethod,
        subtotal: orderData.subtotal,
        shippingFee: orderData.shippingFee,
        discountAmount: orderData.discountAmount,
        couponCode: orderData.couponCode,
        grandTotal: orderData.grandTotal,
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
