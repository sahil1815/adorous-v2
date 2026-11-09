import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateNextOrderId } from '@/lib/orderId';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rawCheckouts = await prisma.draftCheckout.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });

    const checkouts = rawCheckouts.map((d) => {
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
        transactionId: d.transactionId || undefined,
        onlineDiscountAmount: d.onlineDiscountAmount || undefined,
        cartItems: parsedItems,
        subtotal: Math.round(d.subtotal),
        shippingFee: Math.round(d.shippingFee),
        discountAmount: d.discountAmount !== null && d.discountAmount !== undefined ? Math.round(d.discountAmount) : undefined,
        couponCode: d.couponCode,
        grandTotal: Math.round(d.grandTotal),
        status: d.status,
        convertedOrderId: d.convertedOrderId,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      };
    });

    const rawSignIns = await prisma.draftSignIn.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    const signins = rawSignIns.map((s) => ({
      id: s.id,
      sessionId: s.sessionId,
      type: s.type,
      fullName: s.fullName || '',
      phone: s.phone || '',
      email: s.email || '',
      district: s.district || '',
      address: s.address || '',
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      checkouts,
      signins,
    });
  } catch (error: any) {
    console.error('[/api/admin/drafts GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch drafts', checkouts: [], signins: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'deleteCheckout') {
      await prisma.draftCheckout.delete({ where: { id: body.id } });
      return NextResponse.json({ success: true });
    }

    if (action === 'deleteSignIn') {
      await prisma.draftSignIn.delete({ where: { id: body.id } });
      return NextResponse.json({ success: true });
    }

    if (action === 'updateCheckoutStatus') {
      await prisma.draftCheckout.update({
        where: { id: body.id },
        data: { status: body.status },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'updateSignInStatus') {
      await prisma.draftSignIn.update({
        where: { id: body.id },
        data: { status: body.status },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'convertCheckout') {
      const draft = await prisma.draftCheckout.findUnique({
        where: { id: body.id },
      });
      if (!draft) {
        return NextResponse.json({ success: false, error: 'Draft not found' }, { status: 404 });
      }

      let parsedItems: any[] = [];
      try {
        parsedItems = JSON.parse(draft.cartItemsJson || '[]');
      } catch {
        parsedItems = [];
      }

      const generatedOrderId = await generateNextOrderId();

      const createdOrder = await prisma.order.create({
        data: {
          orderId: generatedOrderId,
          status: 'verified',
          paymentMethod: draft.paymentMethod || 'Cash on Delivery',
          transactionId: draft.transactionId,
          paymentStatus: draft.transactionId ? 'pending' : 'unpaid',
          onlineDiscountAmount: draft.onlineDiscountAmount,
          customerUserId: draft.customerUserId || null,
          subtotal: Math.round(draft.subtotal),
          shippingFee: Math.round(draft.shippingFee),
          discountAmount: draft.discountAmount ? Math.round(draft.discountAmount) : 0,
          couponCode: draft.couponCode,
          grandTotal: Math.round(draft.grandTotal),
          internalNotes: `Converted manually from Abandoned Draft (${draft.sessionId.slice(0, 8)})`,
          customer: {
            create: {
              fullName: draft.fullName || 'Valued Patron',
              phone: draft.phone || '',
              email: draft.email || null,
              address: draft.address || 'Address pending verification',
              district: draft.district || 'Dhaka',
              giftNote: draft.giftNote || null,
              whatsappUpdates: true,
            },
          },
          items: {
            create: parsedItems.map((item: any) => ({
              productId: item.id || null,
              productName: item.name || 'Jewelry Piece',
              productImage: item.image || item.featuredImage || '/images/hero/hero-still-life.jpg',
              price: Number(item.price || item.unitPrice || 0),
              quantity: Number(item.quantity || 1),
              colorName: item.selectedColorway?.name || item.colorName || 'Standard',
              colorHex: item.selectedColorway?.hex || item.colorHex || '#C6A96E',
              selectedSize: item.selectedSize || null,
              customNote: item.customNote || null,
            })),
          },
        },
      });

      await prisma.draftCheckout.update({
        where: { id: draft.id },
        data: {
          status: 'converted',
          convertedOrderId: createdOrder.orderId,
        },
      });

      return NextResponse.json({
        success: true,
        orderId: createdOrder.orderId,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('[/api/admin/drafts POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
