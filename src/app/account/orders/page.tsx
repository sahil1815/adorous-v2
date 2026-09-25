'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getCustomerOrdersAction } from '@/app/actions/customerAuthActions';
import {
  Package,
  Truck,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { customer, isLoading } = useCustomerAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered'>('all');

  useEffect(() => {
    if (!isLoading && !customer) {
      router.push('/account/login?redirect=/account/orders');
    }
  }, [customer, isLoading, router]);

  useEffect(() => {
    async function load() {
      if (!customer) return;
      try {
        const res = await getCustomerOrdersAction();
        if (res.success) {
          setOrders(res.orders);
        }
      } catch (e) {
        console.warn('Error fetching orders:', e);
      } finally {
        setLoadingOrders(false);
      }
    }
    if (customer) {
      load();
    }
  }, [customer]);

  if (isLoading || !customer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-paper">
        <Loader2 className="w-6 h-6 text-gold animate-spin" />
        <p className="text-xs text-text-muted">Loading your orders...</p>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'active') {
      return ['pending', 'verified', 'packaging', 'handed_to_courier'].includes(o.status);
    }
    if (statusFilter === 'delivered') {
      return o.status === 'delivered';
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-paper">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/account"
            className="p-2 bg-sand hover:bg-sand/70 border border-line rounded-[2px] text-ink hover:text-gold-deep transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
              My Orders & Shipments
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Review your past purchases, verify delivery receipts, and follow real-time courier tracking.
            </p>
          </div>
        </div>

        <Link
          href="/shop"
          className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-2 bg-ink hover:bg-gold-deep text-paper text-xs font-semibold uppercase tracking-wider rounded-[2px] transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Shop Catalogue</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-line/60 pb-3 text-xs">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-[2px] font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-ink text-paper font-semibold'
              : 'bg-sand/60 text-text-muted hover:text-ink'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('active')}
          className={`px-3 py-1.5 rounded-[2px] font-medium transition-colors ${
            statusFilter === 'active'
              ? 'bg-ink text-paper font-semibold'
              : 'bg-sand/60 text-text-muted hover:text-ink'
          }`}
        >
          In Transit / Pending ({
            orders.filter((o) => ['pending', 'verified', 'packaging', 'handed_to_courier'].includes(o.status)).length
          })
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('delivered')}
          className={`px-3 py-1.5 rounded-[2px] font-medium transition-colors ${
            statusFilter === 'delivered'
              ? 'bg-ink text-paper font-semibold'
              : 'bg-sand/60 text-text-muted hover:text-ink'
          }`}
        >
          Delivered ({orders.filter((o) => o.status === 'delivered').length})
        </button>
      </div>

      {/* Order Cards */}
      {loadingOrders ? (
        <div className="py-20 text-center bg-sand/20 border border-line rounded-[2px]">
          <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
          <p className="text-xs text-text-muted mt-2">Retrieving order history...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-sand/20 border border-line rounded-[2px] space-y-3">
          <Package className="w-10 h-10 text-text-muted mx-auto" />
          <p className="text-sm font-medium text-ink">No orders found in this view</p>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {statusFilter === 'all'
              ? "You haven't placed an order yet. When you complete a purchase, it will appear here automatically."
              : 'No orders currently match the selected status filter.'}
          </p>
          <Link
            href="/shop"
            className="inline-block px-4 py-2 bg-gold hover:bg-gold-light text-ink text-xs font-semibold rounded-[2px] transition-colors mt-2"
          >
            Explore Jewelry & Accessories
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((order) => {
            const isDelivered = order.status === 'delivered';
            const isCancelled = order.status === 'cancelled';
            const isInTransit = ['packaging', 'handed_to_courier'].includes(order.status);

            return (
              <div
                key={order.id}
                className="bg-paper border border-line rounded-[2px] overflow-hidden shadow-xs hover:border-gold/40 transition-colors"
              >
                {/* Order Top Bar */}
                <div className="bg-sand/40 p-4 border-b border-line flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-[10px] uppercase text-text-muted block font-medium">Order Reference</span>
                      <span className="font-mono font-semibold text-ink text-sm">{order.orderId}</span>
                    </div>
                    <div className="border-l border-line/80 pl-4">
                      <span className="text-[10px] uppercase text-text-muted block font-medium">Date Placed</span>
                      <span className="text-ink">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="border-l border-line/80 pl-4 hidden md:block">
                      <span className="text-[10px] uppercase text-text-muted block font-medium">Payment Mode</span>
                      <span className="text-ink font-medium">{order.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-[2px] uppercase font-semibold tracking-wider ${
                        isDelivered
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : isCancelled
                          ? 'bg-red-50 text-red-700 border border-red-300'
                          : isInTransit
                          ? 'bg-blue-50 text-blue-700 border border-blue-300'
                          : 'bg-amber-50 text-amber-700 border border-amber-300'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>

                    <Link
                      href={`/track-order?orderId=${encodeURIComponent(order.orderId)}`}
                      className="px-3 py-1 bg-ink hover:bg-gold-deep text-paper text-xs font-medium rounded-[2px] transition-colors flex items-center space-x-1"
                    >
                      <span>Track</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="p-4 sm:p-5 divide-y divide-line/60">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start space-x-4">
                      <div className="relative w-16 h-20 bg-sand rounded-[2px] overflow-hidden shrink-0 border border-line">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-serif text-sm font-medium text-ink leading-tight truncate">
                          {item.productName}
                        </h4>
                        <div className="flex items-center space-x-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                              style={{ backgroundColor: item.colorHex || '#DDD' }}
                            />
                            <span>{item.colorName}</span>
                          </span>
                          {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                          <span>• Qty: {item.quantity}</span>
                        </div>
                        <p className="text-xs font-semibold text-ink tabular-nums">
                          ৳{item.price.toLocaleString('en-US')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer Summary */}
                <div className="bg-sand/20 p-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-text-muted">
                    <span>Delivering to: </span>
                    <span className="font-medium text-ink">
                      {order.customer?.fullName}, {order.customer?.address}, {order.customer?.district}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm font-semibold text-ink">
                    <span>Grand Total:</span>
                    <span className="text-base text-gold-deep font-mono">
                      ৳{order.grandTotal.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
