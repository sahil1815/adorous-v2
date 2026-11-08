import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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

    const orders = dbOrders.map(order => ({
      orderId: order.orderId,
      createdAt: order.createdAt.toISOString(),
      status: order.status,
      courierPartner: order.courierPartner,
      consignmentId: order.consignmentId,
      customer: order.customer
        ? {
            fullName: order.customer.fullName,
            phone: order.customer.phone,
            email: order.customer.email || undefined,
            address: order.customer.address,
            district: order.customer.district,
            giftNote: order.customer.giftNote || undefined,
            whatsappUpdates: order.customer.whatsappUpdates,
          }
        : {
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
      items: (order.items || []).map(item => ({
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

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (err: any) {
    console.error('[/api/admin/orders] Failed to fetch orders:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Database error', orders: [] },
      { status: 500 }
    );
  }
}
