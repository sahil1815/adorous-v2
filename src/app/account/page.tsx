'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getCustomerOrdersAction } from '@/app/actions/customerAuthActions';
import {
  User,
  Package,
  MapPin,
  LogOut,
  ChevronRight,
  Truck,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { customer, isLoading, logout } = useCustomerAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading && !customer) {
      router.push('/account/login');
    }
  }, [customer, isLoading, router]);

  useEffect(() => {
    async function loadOrders() {
      if (!customer) return;
      try {
        const res = await getCustomerOrdersAction();
        if (res.success) {
          setOrders(res.orders);
        }
      } catch (e) {
        console.warn('Could not load orders:', e);
      } finally {
        setLoadingOrders(false);
      }
    }
    if (customer) {
      loadOrders();
    }
  }, [customer]);

  if (isLoading || !customer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-paper">
        <Loader2 className="w-6 h-6 text-gold animate-spin" />
        <p className="text-xs text-text-muted">Loading your client portal...</p>
      </div>
    );
  }

  const activeShipments = orders.filter((o) =>
    ['verified', 'packaging', 'handed_to_courier'].includes(o.status)
  );

  const defaultAddress = customer.savedAddresses?.find((a) => a.isDefault) || customer.savedAddresses?.[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-paper">
      {/* Welcome Banner */}
      <div className="bg-sand/40 border border-line p-6 rounded-[2px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-gold/15 text-gold-deep border border-gold/40 flex items-center justify-center text-xl font-serif font-semibold uppercase shadow-xs">
            {customer.fullName.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-gold-deep tracking-wider block">
              Adorous Client Privileges
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
              Welcome, {customer.fullName}
            </h1>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {customer.phone} {customer.email && `• ${customer.email}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Link
            href="/shop"
            className="flex-1 md:flex-none px-4 py-2 bg-ink hover:bg-gold-deep text-paper font-semibold text-xs uppercase tracking-wider rounded-[2px] transition-colors text-center"
          >
            Explore Pieces
          </Link>
          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-2 bg-paper border border-line hover:border-red-400 text-text-muted hover:text-red-600 text-xs rounded-[2px] transition-colors flex items-center space-x-1.5"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/account/orders"
          className="bg-paper border border-line hover:border-gold/50 p-5 rounded-[2px] transition-colors group space-y-1 block"
        >
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] uppercase font-medium tracking-wider">Total Orders</span>
            <Package className="w-4 h-4 text-gold-deep" />
          </div>
          <p className="text-2xl font-serif text-ink font-semibold">{orders.length}</p>
          <span className="text-[11px] text-gold-deep group-hover:underline flex items-center gap-1">
            <span>View order history</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/account/orders"
          className="bg-paper border border-line hover:border-gold/50 p-5 rounded-[2px] transition-colors group space-y-1 block"
        >
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] uppercase font-medium tracking-wider">Active Shipments</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-serif text-ink font-semibold">{activeShipments.length}</p>
          <span className="text-[11px] text-emerald-600 group-hover:underline flex items-center gap-1">
            <span>{activeShipments.length > 0 ? 'Track current delivery' : 'No parcels in transit'}</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/account/addresses"
          className="bg-paper border border-line hover:border-gold/50 p-5 rounded-[2px] transition-colors group space-y-1 block"
        >
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[10px] uppercase font-medium tracking-wider">Saved Addresses</span>
            <MapPin className="w-4 h-4 text-gold-deep" />
          </div>
          <p className="text-2xl font-serif text-ink font-semibold">
            {customer.savedAddresses?.length || (customer.address ? 1 : 0)}
          </p>
          <span className="text-[11px] text-gold-deep group-hover:underline flex items-center gap-1">
            <span>Manage 1-click addresses</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Orders Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <h2 className="font-serif text-lg text-ink font-medium">Recent Orders</h2>
            <Link
              href="/account/orders"
              className="text-xs text-gold-deep hover:underline font-medium flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingOrders ? (
            <div className="py-12 text-center bg-sand/20 border border-line rounded-[2px]">
              <Loader2 className="w-5 h-5 text-gold animate-spin mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 px-4 text-center bg-sand/20 border border-line rounded-[2px] space-y-3">
              <ShoppingBag className="w-8 h-8 text-text-muted mx-auto" />
              <p className="text-xs text-text-muted font-medium">You have not placed any orders yet.</p>
              <Link
                href="/shop"
                className="inline-block px-4 py-2 bg-gold hover:bg-gold-light text-ink text-xs font-semibold rounded-[2px] transition-colors"
              >
                Browse Jewellery & Bags
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => {
                const isDelivered = order.status === 'delivered';
                const isCancelled = order.status === 'cancelled';
                const isInTransit = ['packaging', 'handed_to_courier'].includes(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-paper border border-line hover:border-gold/30 p-4 rounded-[2px] transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs border-b border-line/50 pb-2.5">
                      <div>
                        <span className="font-mono font-semibold text-ink">{order.orderId}</span>
                        <span className="text-text-muted ml-2 text-[11px]">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-[2px] uppercase font-semibold tracking-wider ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isCancelled
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : isInTransit
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Order items thumbnails */}
                    <div className="flex items-center space-x-3 overflow-x-auto py-1">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex items-center space-x-2 shrink-0">
                          <div className="relative w-10 h-12 bg-sand rounded-[2px] overflow-hidden border border-line">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-[11px]">
                            <p className="text-ink font-medium truncate max-w-[140px]">{item.productName}</p>
                            <p className="text-text-muted text-[10px]">
                              {item.colorName} • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-line/50 text-xs">
                      <span className="font-semibold text-ink tabular-nums">
                        ৳{order.grandTotal.toLocaleString('en-US')}
                        <span className="text-[10px] font-normal text-text-muted ml-1">
                          ({order.paymentMethod})
                        </span>
                      </span>

                      <Link
                        href={`/track-order?orderId=${encodeURIComponent(order.orderId)}`}
                        className="text-gold-deep hover:underline text-[11px] font-medium flex items-center gap-1"
                      >
                        <span>Live Tracking</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Default Shipping Address & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-sand/30 border border-line p-5 rounded-[2px] space-y-3">
            <div className="flex items-center justify-between border-b border-line/60 pb-2">
              <div className="flex items-center space-x-1.5 text-ink">
                <MapPin className="w-4 h-4 text-gold-deep" />
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider">
                  Default Address
                </h3>
              </div>
              <Link
                href="/account/addresses"
                className="text-[11px] text-gold-deep hover:underline font-medium"
              >
                Change
              </Link>
            </div>

            {defaultAddress ? (
              <div className="text-xs text-ink/80 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-ink">{defaultAddress.recipientName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-gold/15 text-gold-deep rounded-[2px] uppercase">
                    {defaultAddress.label}
                  </span>
                </div>
                <p className="text-text-muted font-mono">{defaultAddress.phone}</p>
                <p className="leading-relaxed">{defaultAddress.address}</p>
                <p className="font-medium text-ink">{defaultAddress.district}, Bangladesh</p>
              </div>
            ) : customer.address ? (
              <div className="text-xs text-ink/80 space-y-1">
                <p className="font-semibold text-ink">{customer.fullName}</p>
                <p className="text-text-muted font-mono">{customer.phone}</p>
                <p className="leading-relaxed">{customer.address}</p>
                <p className="font-medium text-ink">{customer.district}, Bangladesh</p>
              </div>
            ) : (
              <div className="text-xs text-text-muted space-y-2 py-2">
                <p>No default address saved yet.</p>
                <Link
                  href="/account/addresses"
                  className="inline-flex items-center space-x-1 text-gold-deep font-semibold hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add delivery address</span>
                </Link>
              </div>
            )}
          </div>

          {/* Concierge Card */}
          <div className="bg-paper border border-line p-5 rounded-[2px] space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-whatsapp animate-pulse" />
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-ink">
                VIP Styling & Support
              </h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Need custom matching with your saree, jewelry piece resizing, or delivery scheduling? Reach our direct concierge anytime.
            </p>
            <a
              href="https://wa.me/8801577731381?text=Hello%20Adorous%20Fashion,%20I%20am%20a%20registered%20client%20with%20an%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 bg-sand hover:bg-sand/70 border border-line text-ink font-medium text-xs rounded-[2px] transition-colors flex items-center justify-center space-x-2 block text-center"
            >
              <span>Message Concierge on WhatsApp</span>
              <ExternalLink className="w-3 h-3 text-whatsapp" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
