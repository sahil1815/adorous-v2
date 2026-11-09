import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch Registered Users with their orders and saved addresses
    const users = await prisma.customerUser.findMany({
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        savedAddresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const registeredUsers = users.map((user) => {
      const totalSpent = Math.round(user.orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0));
      const ordersSummary = user.orders.map((o) => ({
        orderId: o.orderId,
        createdAt: o.createdAt.toISOString(),
        grandTotal: Math.round(o.grandTotal),
        status: o.status,
        itemsCount: o.items.reduce((acc, it) => acc + (it.quantity || 1), 0),
        paymentMethod: o.paymentMethod || 'Cash on Delivery',
      }));

      return {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        district: user.district,
        address: user.address,
        whatsappUpdates: user.whatsappUpdates,
        createdAt: user.createdAt.toISOString(),
        orderCount: user.orders.length,
        totalSpent,
        savedAddressesCount: user.savedAddresses.length,
        savedAddresses: user.savedAddresses.map((sa) => ({
          id: sa.id,
          label: sa.label,
          recipientName: sa.recipientName,
          phone: sa.phone,
          district: sa.district,
          address: sa.address,
          isDefault: sa.isDefault,
        })),
        orders: ordersSummary,
      };
    });

    // 2. Fetch Guest Customers (Ordered without an account)
    const guestOrders = await prisma.order.findMany({
      where: {
        customerUserId: null,
      },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by sanitized phone number
    const guestMap = new Map<string, any>();

    for (const order of guestOrders) {
      if (!order.customer) continue;

      const rawPhone = order.customer.phone.trim();
      const phoneKey = rawPhone.replace(/[^\d+]/g, '');

      const orderSummary = {
        orderId: order.orderId,
        createdAt: order.createdAt.toISOString(),
        grandTotal: order.grandTotal,
        status: order.status,
        itemsCount: order.items.reduce((acc, it) => acc + (it.quantity || 1), 0),
        paymentMethod: order.paymentMethod || 'Cash on Delivery',
      };

      if (!guestMap.has(phoneKey)) {
        guestMap.set(phoneKey, {
          phone: order.customer.phone,
          fullName: order.customer.fullName,
          email: order.customer.email,
          district: order.customer.district,
          address: order.customer.address,
          whatsappUpdates: order.customer.whatsappUpdates,
          giftNote: order.customer.giftNote,
          orderCount: 1,
          totalSpent: Math.round(order.grandTotal),
          firstOrderDate: order.createdAt.toISOString(),
          lastOrderDate: order.createdAt.toISOString(),
          orders: [orderSummary],
        });
      } else {
        const existing = guestMap.get(phoneKey)!;
        existing.orderCount += 1;
        existing.totalSpent += Math.round(order.grandTotal);
        existing.orders.push(orderSummary);

        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt.toISOString();
          existing.address = order.customer.address;
          existing.district = order.customer.district;
        }
        if (new Date(order.createdAt) < new Date(existing.firstOrderDate)) {
          existing.firstOrderDate = order.createdAt.toISOString();
        }
      }
    }

    const guestCustomers = Array.from(guestMap.values()).sort(
      (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
    );

    // 3. Overview Stats
    const registeredCount = registeredUsers.length;
    const guestCount = guestCustomers.length;
    const totalUniqueBuyers = registeredCount + guestCount;
    const repeatGuestCount = guestCustomers.filter((g) => g.orderCount > 1).length;

    const registeredRevenue = Math.round(registeredUsers.reduce((sum, u) => sum + u.totalSpent, 0));
    const guestRevenue = Math.round(guestCustomers.reduce((sum, g) => sum + g.totalSpent, 0));
    const totalRevenue = Math.round(registeredRevenue + guestRevenue);

    const stats = {
      registeredCount,
      guestCount,
      totalUniqueBuyers,
      repeatGuestCount,
      registeredRevenue,
      guestRevenue,
      totalRevenue,
    };

    return NextResponse.json({
      success: true,
      registered: registeredUsers,
      guests: guestCustomers,
      stats,
    });
  } catch (error: any) {
    console.error('[/api/admin/customers] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch customers',
        registered: [],
        guests: [],
        stats: null,
      },
      { status: 500 }
    );
  }
}
