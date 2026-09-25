'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getOrders, 
  createOrder, 
  updateOrderStatus as updateOrderStatusDb,
  updateOrderCourier as updateOrderCourierDb,
  updateInternalNotes as updateInternalNotesDb,
  deleteOrder as deleteOrderDb
} from '@/app/actions/orderActions';
import { PRODUCTS } from '@/data/catalogue'; // used as fallback if needed

export type OrderStatus =
  | 'pending'
  | 'verified'
  | 'packaging'
  | 'handed_to_courier'
  | 'delivered'
  | 'cancelled';

export interface AdminOrderItem {
  product: {
    id: string;
    name: string;
    category: string;
    slug: string;
    price: number;
    featuredImage: string;
  };
  selectedColor: {
    name: string;
    hex: string;
  };
  selectedSize?: string;
  quantity: number;
}

export interface AdminOrder {
  orderId: string;
  customerUserId?: string | null;
  createdAt: string;
  status: OrderStatus;
  courierPartner: 'Steadfast Courier' | 'Pathao Courier' | 'RedX' | 'Paperfly' | string | null;
  consignmentId?: string | null;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    district: string;
    giftNote?: string;
    whatsappUpdates: boolean;
  };
  paymentMethod: string;
  items: AdminOrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount?: number;
  couponCode?: string;
  grandTotal: number;
  internalNotes?: string;
}

interface OrdersContextType {
  orders: AdminOrder[];
  addOrder: (order: Omit<AdminOrder, 'status' | 'courierPartner'> & Partial<Pick<AdminOrder, 'status' | 'courierPartner'>>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderCourier: (orderId: string, courierPartner: AdminOrder['courierPartner'], consignmentId: string) => Promise<void>;
  updateInternalNotes: (orderId: string, notes: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  getOrderByIdOrPhone: (query: string) => AdminOrder | undefined;
  resetToSampleOrders: () => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  const refreshOrders = async () => {
    try {
      const dbOrders = await getOrders();
      setOrders(dbOrders as AdminOrder[]);
    } catch (e) {
      console.error('Failed to load orders', e);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const addOrder = async (orderData: Omit<AdminOrder, 'status' | 'courierPartner'> & Partial<Pick<AdminOrder, 'status' | 'courierPartner'>>) => {
    const res = await createOrder(orderData);
    if (res.success) {
      await refreshOrders();
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    // Optimistic update
    setOrders(prev => prev.map(o => (o.orderId === orderId ? { ...o, status } : o)));
    await updateOrderStatusDb(orderId, status);
  };

  const updateOrderCourier = async (
    orderId: string,
    courierPartner: AdminOrder['courierPartner'],
    consignmentId: string
  ) => {
    setOrders(prev => prev.map(o => (o.orderId === orderId ? { ...o, courierPartner, consignmentId } : o)));
    if (courierPartner) {
      await updateOrderCourierDb(orderId, courierPartner, consignmentId);
    }
  };

  const updateInternalNotes = async (orderId: string, internalNotes: string) => {
    setOrders(prev => prev.map(o => (o.orderId === orderId ? { ...o, internalNotes } : o)));
    await updateInternalNotesDb(orderId, internalNotes);
  };

  const deleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.orderId !== orderId));
    await deleteOrderDb(orderId);
  };

  const getOrderByIdOrPhone = (query: string): AdminOrder | undefined => {
    const clean = query.trim().toLowerCase();
    return orders.find(
      (o) =>
        o.orderId.toLowerCase() === clean ||
        o.customer.phone.toLowerCase().includes(clean) ||
        (o.consignmentId && o.consignmentId.toLowerCase() === clean)
    );
  };

  const resetToSampleOrders = () => {
    // No-op for DB version, or implement a reset DB script
    console.log('Reset to sample orders disabled in DB mode');
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        updateOrderCourier,
        updateInternalNotes,
        deleteOrder,
        getOrderByIdOrPhone,
        resetToSampleOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
