'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getOrders, 
  createOrder, 
  updateOrderStatus as updateOrderStatusDb,
  updateOrderCourier as updateOrderCourierDb,
  updateInternalNotes as updateInternalNotesDb,
  deleteOrder as deleteOrderDb,
  updateOrderItemQuantity as updateOrderItemQuantityDb,
  updateOrderItemProduct as updateOrderItemProductDb,
  updateOrderTotals as updateOrderTotalsDb,
  updateOrderShippingFee as updateOrderShippingFeeDb
} from '@/app/actions/orderActions';
import { PRODUCTS } from '@/data/catalogue'; // used as fallback if needed

export type OrderStatus =
  | 'pending'
  | 'verified'
  | 'packaging'
  | 'handed_to_courier'
  | 'delivered'
  | 'returned'
  | 'cancelled';

export interface AdminOrderItem {
  id?: string;
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
  courierPartner: 'Steadfast Courier' | 'Pathao Courier' | 'CarryBee' | 'RedX' | 'Paperfly' | string | null;
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
  addOrder: (
    order: Omit<AdminOrder, 'status' | 'courierPartner' | 'orderId'> &
      Partial<Pick<AdminOrder, 'status' | 'courierPartner' | 'orderId'>>
  ) => Promise<{ success: boolean; order?: { orderId: string; [key: string]: unknown }; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderCourier: (orderId: string, courierPartner: AdminOrder['courierPartner'], consignmentId: string) => Promise<void>;
  updateInternalNotes: (orderId: string, notes: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  updateOrderItemQuantity: (
    orderId: string,
    itemId: string,
    newQuantity: number,
    customGrandTotal?: number,
    customShippingFee?: number
  ) => Promise<{ success: boolean; error?: string }>;
  updateOrderItemProduct: (payload: {
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
  }) => Promise<{ success: boolean; error?: string }>;
  updateOrderShippingFee: (orderId: string, shippingFee: number, customGrandTotal?: number) => Promise<{ success: boolean; error?: string }>;
  updateOrderTotals: (orderId: string, grandTotal: number, discountAmount?: number, subtotal?: number, shippingFee?: number) => Promise<{ success: boolean; error?: string }>;
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

  const addOrder = async (
    orderData: Omit<AdminOrder, 'status' | 'courierPartner' | 'orderId'> &
      Partial<Pick<AdminOrder, 'status' | 'courierPartner' | 'orderId'>>
  ) => {
    const res = await createOrder(orderData);
    if (res.success) {
      await refreshOrders();
    }
    return res;
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

  const updateOrderItemQuantity = async (
    orderId: string,
    itemId: string,
    newQuantity: number,
    customGrandTotal?: number,
    customShippingFee?: number
  ) => {
    // Optimistic update
    setOrders(prev =>
      prev.map(o => {
        if (o.orderId !== orderId) return o;
        const updatedItems = o.items.map(it => {
          if (it.id === itemId || (!it.id && o.items.length === 1)) {
            return { ...it, quantity: newQuantity };
          }
          return it;
        });
        const newSubtotal = updatedItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
        let newDiscount = o.discountAmount;
        if (o.subtotal > 0 && typeof o.discountAmount === 'number' && o.discountAmount > 0) {
          newDiscount = Math.round(newSubtotal * (o.discountAmount / o.subtotal) * 100) / 100;
        }
        const finalShip = typeof customShippingFee === 'number' ? customShippingFee : o.shippingFee;
        const newGrandTotal =
          typeof customGrandTotal === 'number' && !isNaN(customGrandTotal) && customGrandTotal >= 0
            ? customGrandTotal
            : Math.max(0, Math.round((newSubtotal - (newDiscount || 0) + finalShip) * 100) / 100);

        return {
          ...o,
          items: updatedItems,
          subtotal: newSubtotal,
          discountAmount: newDiscount,
          shippingFee: finalShip,
          grandTotal: newGrandTotal,
        };
      })
    );

    const res = await updateOrderItemQuantityDb(orderId, itemId, newQuantity, customGrandTotal, customShippingFee);
    if (res.success) {
      await refreshOrders();
    }
    return res;
  };

  const updateOrderItemProduct = async (payload: {
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
  }) => {
    const { orderId, itemId, newProduct, newColor, newSize, newQuantity, customUnitPrice, customGrandTotal, customShippingFee } = payload;
    const unitPrice = typeof customUnitPrice === 'number' && !isNaN(customUnitPrice) ? customUnitPrice : newProduct.price;

    // Optimistic update
    setOrders(prev =>
      prev.map(o => {
        if (o.orderId !== orderId) return o;
        const updatedItems = o.items.map((it, idx) => {
          if (it.id === itemId || (!it.id && (itemId === `item-${idx}` || o.items.length === 1))) {
            return {
              ...it,
              product: {
                id: newProduct.id,
                name: newProduct.name,
                category: newProduct.category || '',
                slug: newProduct.slug || '',
                price: unitPrice,
                featuredImage: newProduct.featuredImage,
              },
              selectedColor: {
                name: newColor.name,
                hex: newColor.hex,
              },
              selectedSize: newSize || undefined,
              quantity: newQuantity,
            };
          }
          return it;
        });

        const newSubtotal = updatedItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
        let newDiscount = o.discountAmount;
        if (o.subtotal > 0 && typeof o.discountAmount === 'number' && o.discountAmount > 0) {
          newDiscount = Math.round(newSubtotal * (o.discountAmount / o.subtotal) * 100) / 100;
        }
        const finalShip = typeof customShippingFee === 'number' ? customShippingFee : o.shippingFee;
        const newGrandTotal =
          typeof customGrandTotal === 'number' && !isNaN(customGrandTotal) && customGrandTotal >= 0
            ? customGrandTotal
            : Math.max(0, Math.round((newSubtotal - (newDiscount || 0) + finalShip) * 100) / 100);

        return {
          ...o,
          items: updatedItems,
          subtotal: newSubtotal,
          discountAmount: newDiscount,
          shippingFee: finalShip,
          grandTotal: newGrandTotal,
        };
      })
    );

    const res = await updateOrderItemProductDb(payload);
    if (res.success) {
      await refreshOrders();
    }
    return res;
  };

  const updateOrderShippingFee = async (
    orderId: string,
    shippingFee: number,
    customGrandTotal?: number
  ) => {
    const fee = Math.max(0, shippingFee);
    setOrders(prev =>
      prev.map(o => {
        if (o.orderId !== orderId) return o;
        const calculatedGrandTotal = Math.max(0, Math.round((o.subtotal - (o.discountAmount || 0) + fee) * 100) / 100);
        const finalGrandTotal =
          typeof customGrandTotal === 'number' && !isNaN(customGrandTotal) && customGrandTotal >= 0
            ? customGrandTotal
            : calculatedGrandTotal;
        return {
          ...o,
          shippingFee: fee,
          grandTotal: finalGrandTotal,
        };
      })
    );
    const res = await updateOrderShippingFeeDb(orderId, fee, customGrandTotal);
    if (res.success) {
      await refreshOrders();
    }
    return res;
  };

  const updateOrderTotals = async (
    orderId: string,
    grandTotal: number,
    discountAmount?: number,
    subtotal?: number,
    shippingFee?: number
  ) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.orderId !== orderId) return o;
        return {
          ...o,
          grandTotal,
          ...(typeof discountAmount === 'number' ? { discountAmount } : {}),
          ...(typeof subtotal === 'number' ? { subtotal } : {}),
          ...(typeof shippingFee === 'number' ? { shippingFee } : {}),
        };
      })
    );
    const res = await updateOrderTotalsDb(orderId, grandTotal, discountAmount, subtotal, shippingFee);
    if (res.success) {
      await refreshOrders();
    }
    return res;
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
        updateOrderItemQuantity,
        updateOrderItemProduct,
        updateOrderShippingFee,
        updateOrderTotals,
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
