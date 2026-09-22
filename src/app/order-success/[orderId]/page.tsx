'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  MessageCircle,
  Clock,
  Truck,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Package,
  PhoneCall
} from 'lucide-react';

interface OrderData {
  orderId: string;
  createdAt: string;
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
  items: Array<{
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
  }>;
  subtotal: number;
  shippingFee: number;
  grandTotal: number;
}

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('adorous_last_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.orderId === orderId) {
          setOrder(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load order', e);
    }
  }, [orderId]);

  // Construct WhatsApp confirmation text
  const waMessage = order
    ? `Hello Adorous Fashion! I just placed Order ${order.orderId} for ৳${order.grandTotal.toLocaleString('en-US')}. Recipient: ${order.customer.fullName} (${order.customer.district}). Please confirm my order details for dispatch.`
    : `Hello Adorous Fashion! I just placed Order ${orderId}. Please confirm my order details.`;

  const waUrl = `https://wa.me/8801577731381?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="bg-paper min-h-screen">
      {/* Header Banner */}
      <section className="border-b border-line bg-[#F8F6F0] py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-800">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-semibold tracking-[0.25em] text-gold-ink uppercase block">
            Order Received · Cash on Delivery
          </span>

          <h1 className="text-3xl sm:text-4xl font-serif text-ink font-normal tracking-tight">
            Thank You, {order ? order.customer.fullName : 'Valued Patron'}
          </h1>

          <p className="text-xs sm:text-sm text-text-muted max-w-lg mx-auto leading-relaxed">
            Your boutique accessories order has been logged into our system.
          </p>

          <div className="pt-2 inline-flex items-center gap-2 bg-paper px-4 py-2 rounded-xs border border-line text-xs font-mono">
            <span className="text-text-muted">Order Reference:</span>
            <strong className="text-ink font-semibold">{orderId}</strong>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* HIGH PRIORITY: WhatsApp Instant Confirmation Action */}
        <section className="bg-emerald-950 text-white p-6 sm:p-8 rounded-[2px] border border-emerald-700/50 shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-gold-deep" />
                Priority Bangladesh Dispatch
              </div>
              <h2 className="text-xl sm:text-2xl font-serif text-white">
                Confirm on WhatsApp for Same-Day Handover
              </h2>
              <p className="text-xs text-emerald-100/80 max-w-lg leading-relaxed">
                In Bangladesh, orders verified directly via WhatsApp are fast-tracked into our packaging queue and prioritized for next-morning courier pickup.
              </p>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center space-x-2 shrink-0 shadow-lg"
            >
              <MessageCircle className="w-4 h-4 text-ink" />
              <span>Confirm on WhatsApp Now</span>
            </a>
          </div>
        </section>

        {/* 4-Step Dispatch Progress Tracker */}
        <section className="bg-paper border border-line p-6 rounded-[2px] shadow-xs">
          <h3 className="font-serif text-base text-ink mb-6 pb-2 border-b border-line">
            Fulfillment Journey
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-xs">
            {/* Step 1 */}
            <div className="space-y-1.5 relative">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <span className="font-semibold text-ink">1. Order Placed</span>
              </div>
              <p className="text-[11px] text-text-muted pl-8">
                Saved in queue.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-1.5 relative">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gold text-ink flex items-center justify-center font-bold text-[10px]">
                  2
                </div>
                <span className="font-semibold text-ink">2. WhatsApp Verification</span>
              </div>
              <p className="text-[11px] text-text-muted pl-8">
                Our team confirms dispatch address.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-1.5 relative">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-sand text-text-muted flex items-center justify-center font-bold text-[10px]">
                  3
                </div>
                <span className="font-medium text-text-muted">3. Keepsake Packaging</span>
              </div>
              <p className="text-[11px] text-text-muted pl-8">
                Micro-inspected and sealed in box.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-1.5 relative">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-sand text-text-muted flex items-center justify-center font-bold text-[10px]">
                  4
                </div>
                <span className="font-medium text-text-muted">4. Doorstep Delivery</span>
              </div>
              <p className="text-[11px] text-text-muted pl-8">
                24-48h Dhaka / 48-72h outside.
              </p>
            </div>
          </div>
        </section>

        {/* Order Details Breakdown */}
        {order ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Items */}
            <div className="md:col-span-7 bg-paper border border-line p-5 rounded-[2px] shadow-xs space-y-4">
              <h3 className="font-serif text-base text-ink border-b border-line pb-2">
                Items in This Order ({order.items.reduce((s, i) => s + i.quantity, 0)})
              </h3>

              <div className="divide-y divide-line">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative w-12 h-14 bg-stone rounded-xs overflow-hidden shrink-0 border border-line">
                        <Image
                          src={item.product.featuredImage}
                          alt={item.product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-medium text-ink truncate block">
                          {item.product.name}
                        </h4>
                        <div className="text-[10px] text-text-muted flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-2 h-2 rounded-full border border-black/20"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          <span>{item.selectedColor.name}</span>
                          {item.selectedSize && <span>· Size {item.selectedSize}</span>}
                          <span>· Qty {item.quantity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-ink tabular-nums">
                        ৳{(item.product.price * item.quantity).toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-line pt-3 space-y-1.5 text-xs text-text-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-ink tabular-nums">৳{order.subtotal.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery ({order.customer.district})</span>
                  <span className="text-ink tabular-nums">
                    {order.shippingFee === 0 ? 'FREE' : `৳${order.shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-ink text-sm pt-2 border-t border-line">
                  <span>Payable upon Delivery (COD)</span>
                  <span className="tabular-nums">৳{order.grandTotal.toLocaleString('en-US')}</span>
                </div>
              </div>
            </div>

            {/* Right: Shipping Address & Summary */}
            <div className="md:col-span-5 bg-[#FAF8F2] border border-line p-5 rounded-[2px] shadow-xs space-y-4 text-xs">
              <h3 className="font-serif text-base text-ink border-b border-line pb-2">
                Delivery Details
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-text-muted block">
                    Recipient:
                  </span>
                  <p className="text-ink font-medium mt-0.5">{order.customer.fullName}</p>
                  <p className="text-text-muted">{order.customer.phone}</p>
                  {order.customer.email && <p className="text-text-muted">{order.customer.email}</p>}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold text-text-muted block">
                    Delivery Address:
                  </span>
                  <p className="text-ink mt-0.5 leading-relaxed">{order.customer.address}</p>
                  <p className="text-gold-ink font-semibold">{order.customer.district}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold text-text-muted block">
                    Payment Mode:
                  </span>
                  <p className="text-ink font-medium mt-0.5">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'bKash Direct Transfer'}
                  </p>
                  <p className="text-[10px] text-emerald-700">Zero advance payment required</p>
                </div>

                {order.customer.giftNote && (
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-text-muted block">
                      Gift Note for Recipient:
                    </span>
                    <p className="italic text-text-muted bg-paper p-2.5 border border-line rounded-xs mt-1">
                      "{order.customer.giftNote}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Bottom CTAs: Track Order & Continue Shopping */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/track-order?ref=${orderId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all shadow-sm"
          >
            <Truck className="w-4 h-4" />
            <span>Track Live Dispatch Status</span>
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-sand hover:bg-black text-gold-deep font-semibold text-xs tracking-wider uppercase rounded-xs transition-all shadow-sm"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
