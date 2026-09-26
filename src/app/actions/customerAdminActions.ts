'use server';

import { prisma } from '@/lib/db';

export interface AdminCustomerOrderSummary {
  orderId: string;
  createdAt: string;
  grandTotal: number;
  status: string;
  itemsCount: number;
  paymentMethod: string;
}

export interface AdminRegisteredCustomer {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  district: string | null;
  address: string | null;
  whatsappUpdates: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  savedAddressesCount: number;
  savedAddresses: {
    id: string;
    label: string;
    recipientName: string;
    phone: string;
    district: string;
    address: string;
    isDefault: boolean;
  }[];
  orders: AdminCustomerOrderSummary[];
}

export interface AdminGuestCustomer {
  phone: string;
  fullName: string;
  email: string | null;
  district: string;
  address: string;
  whatsappUpdates: boolean;
  giftNote?: string | null;
  orderCount: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
  orders: AdminCustomerOrderSummary[];
}

export interface CustomersOverviewStats {
  registeredCount: number;
  guestCount: number;
  totalUniqueBuyers: number;
  repeatGuestCount: number;
  registeredRevenue: number;
  guestRevenue: number;
  totalRevenue: number;
}

// 1. Fetch Registered Patrons
export async function getAdminRegisteredUsersAction(): Promise<AdminRegisteredCustomer[]> {
  try {
    if (!process.env.DATABASE_URL) return [];

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

    return users.map((user) => {
      const totalSpent = user.orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
      const ordersSummary: AdminCustomerOrderSummary[] = user.orders.map((o) => ({
        orderId: o.orderId,
        createdAt: o.createdAt.toISOString(),
        grandTotal: o.grandTotal,
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
  } catch (error) {
    console.error('[getAdminRegisteredUsersAction] Error fetching registered users:', error);
    return [];
  }
}

// 2. Fetch Guest Customers (Ordered without an account)
export async function getAdminGuestCustomersAction(): Promise<AdminGuestCustomer[]> {
  try {
    if (!process.env.DATABASE_URL) return [];

    // Find all orders where customerUserId is null
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
    const map = new Map<string, AdminGuestCustomer>();

    for (const order of guestOrders) {
      if (!order.customer) continue;

      const rawPhone = order.customer.phone.trim();
      const phoneKey = rawPhone.replace(/[^\d+]/g, '');

      const orderSummary: AdminCustomerOrderSummary = {
        orderId: order.orderId,
        createdAt: order.createdAt.toISOString(),
        grandTotal: order.grandTotal,
        status: order.status,
        itemsCount: order.items.reduce((acc, it) => acc + (it.quantity || 1), 0),
        paymentMethod: order.paymentMethod || 'Cash on Delivery',
      };

      if (!map.has(phoneKey)) {
        map.set(phoneKey, {
          phone: rawPhone,
          fullName: order.customer.fullName,
          email: order.customer.email || null,
          district: order.customer.district,
          address: order.customer.address,
          whatsappUpdates: order.customer.whatsappUpdates,
          giftNote: order.customer.giftNote || null,
          orderCount: 1,
          totalSpent: order.grandTotal,
          firstOrderDate: order.createdAt.toISOString(),
          lastOrderDate: order.createdAt.toISOString(),
          orders: [orderSummary],
        });
      } else {
        const existing = map.get(phoneKey)!;
        existing.orderCount += 1;
        existing.totalSpent += order.grandTotal;
        existing.orders.push(orderSummary);
        // Track earliest date as firstOrderDate
        if (new Date(order.createdAt) < new Date(existing.firstOrderDate)) {
          existing.firstOrderDate = order.createdAt.toISOString();
        }
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
    );
  } catch (error) {
    console.error('[getAdminGuestCustomersAction] Error fetching guest customers:', error);
    return [];
  }
}

// 3. Combined Overview Stats
export async function getCustomersOverviewStatsAction(): Promise<CustomersOverviewStats> {
  try {
    const [registered, guests] = await Promise.all([
      getAdminRegisteredUsersAction(),
      getAdminGuestCustomersAction(),
    ]);

    const registeredRevenue = registered.reduce((sum, u) => sum + u.totalSpent, 0);
    const guestRevenue = guests.reduce((sum, g) => sum + g.totalSpent, 0);
    const repeatGuestCount = guests.filter((g) => g.orderCount > 1).length;

    // Check unique phone overlap between registered and guests
    const regPhones = new Set(
      registered
        .filter((r) => r.phone)
        .map((r) => (r.phone as string).replace(/[^\d+]/g, ''))
    );
    let uniqueGuestOnlyCount = 0;
    guests.forEach((g) => {
      const cleanPhone = g.phone ? g.phone.replace(/[^\d+]/g, '') : '';
      if (!cleanPhone || !regPhones.has(cleanPhone)) {
        uniqueGuestOnlyCount++;
      }
    });

    return {
      registeredCount: registered.length,
      guestCount: guests.length,
      totalUniqueBuyers: registered.length + uniqueGuestOnlyCount,
      repeatGuestCount,
      registeredRevenue,
      guestRevenue,
      totalRevenue: registeredRevenue + guestRevenue,
    };
  } catch (error) {
    console.error('[getCustomersOverviewStatsAction] Error:', error);
    return {
      registeredCount: 0,
      guestCount: 0,
      totalUniqueBuyers: 0,
      repeatGuestCount: 0,
      registeredRevenue: 0,
      guestRevenue: 0,
      totalRevenue: 0,
    };
  }
}
