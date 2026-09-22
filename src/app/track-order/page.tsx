'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Phone
} from 'lucide-react';
import { PRODUCTS } from '@/data/catalogue';
import { useOrders } from '@/context/OrdersContext';

interface TrackingStep {
  title: string;
  location: string;
  time: string;
  completed: boolean;
  current: boolean;
  description: string;
}

interface TrackingData {
  orderId: string;
  consignmentId: string;
  courierName: string;
  courierUrl: string;
  statusText: string;
  statusBadge: 'confirmed' | 'packaging' | 'transit' | 'out_for_delivery' | 'delivered';
  currentStepIndex: number;
  recipientName: string;
  recipientPhone: string;
  district: string;
  address: string;
  estimatedDelivery: string;
  paymentMethod: string;
  codAmount: number;
  items: Array<{
    name: string;
    category: string;
    image: string;
    color: string;
    size?: string;
    quantity: number;
    price: number;
  }>;
  timeline: TrackingStep[];
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || searchParams.get('phone') || '';
  const { getOrderByIdOrPhone } = useOrders();

  const [inputQuery, setInputQuery] = useState(initialRef);
  const [searched, setSearched] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [recentOrder, setRecentOrder] = useState<any>(null);

  // Load last placed order from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adorous_last_order');
      if (saved) {
        setRecentOrder(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Perform tracking search
  const handleSearch = (queryToSearch: string) => {
    const cleanQuery = queryToSearch.trim();
    if (!cleanQuery) return;

    setSearched(true);

    // 1. Check active database via OrdersContext (Live sync with Admin Desk!)
    const dbOrder = getOrderByIdOrPhone(cleanQuery);
    if (dbOrder) {
      const isDhaka = dbOrder.customer.district.toLowerCase().includes('dhaka');
      const consignment = dbOrder.consignmentId || `ST-${dbOrder.orderId.replace(/[^0-9]/g, '') || '884920'}`;

      let statusText = 'Order Confirmed & Queued for Packaging';
      let statusBadge: 'confirmed' | 'packaging' | 'transit' | 'out_for_delivery' | 'delivered' = 'confirmed';
      let currentStepIndex = 0;

      if (dbOrder.status === 'verified') {
        statusText = 'WhatsApp Verified · In Packaging Queue';
        statusBadge = 'packaging';
        currentStepIndex = 1;
      } else if (dbOrder.status === 'packaging') {
        statusText = 'Undergoing Keepsake Packaging & Micro-Inspection';
        statusBadge = 'packaging';
        currentStepIndex = 1;
      } else if (dbOrder.status === 'handed_to_courier') {
        statusText = isDhaka ? 'Out for Doorstep Delivery in Dhaka' : 'In Transit via Steadfast Courier Hub';
        statusBadge = isDhaka ? 'out_for_delivery' : 'transit';
        currentStepIndex = isDhaka ? 3 : 2;
      } else if (dbOrder.status === 'delivered') {
        statusText = 'Delivered to Doorstep & Payment Collected';
        statusBadge = 'delivered';
        currentStepIndex = 3;
      }

      setTrackingData({
        orderId: dbOrder.orderId,
        consignmentId: consignment,
        courierName: dbOrder.courierPartner || 'Steadfast Courier Bangladesh',
        courierUrl: `https://steadfast.com.bd/t/${consignment}`,
        statusText,
        statusBadge,
        currentStepIndex,
        recipientName: dbOrder.customer.fullName,
        recipientPhone: dbOrder.customer.phone,
        district: dbOrder.customer.district,
        address: dbOrder.customer.address,
        estimatedDelivery: isDhaka ? 'Within 24–48 Hours' : 'Within 48–72 Hours',
        paymentMethod: dbOrder.paymentMethod,
        codAmount: dbOrder.grandTotal,
        items: dbOrder.items.map((i) => ({
          name: i.product.name,
          category: i.product.category,
          image: i.product.featuredImage,
          color: i.selectedColor?.name || 'Standard',
          size: i.selectedSize,
          quantity: i.quantity,
          price: i.product.price,
        })),
        timeline: [
          {
            title: 'Order Confirmed',
            location: 'Adorous Desk, Rajshahi',
            time: 'Order Verified',
            completed: true,
            current: currentStepIndex === 0,
            description: 'Order logged and confirmed for Cash on Delivery dispatch.',
          },
          {
            title: 'Keepsake Box Packaging & Seal',
            location: 'Quality Inspection Desk, Rajshahi',
            time: currentStepIndex >= 1 ? 'Micro-Inspected' : 'Upcoming',
            completed: currentStepIndex >= 1,
            current: currentStepIndex === 1,
            description: 'Carefully wrapped in signature velvet keepsake pouch and sealed.',
          },
          {
            title: 'Handed to Courier Partner',
            location: 'Steadfast Central Sorting Hub (Tejgaon)',
            time: currentStepIndex >= 2 ? 'Consignment Dispatched' : 'Upcoming',
            completed: currentStepIndex >= 2,
            current: currentStepIndex === 2,
            description: `Scanned into ${dbOrder.courierPartner || 'Steadfast'} central logistics network.`,
          },
          {
            title: isDhaka ? 'Out for Doorstep Delivery' : 'En Route to District Delivery Hub',
            location: isDhaka ? `${dbOrder.customer.district} Delivery Area` : `${dbOrder.customer.district} Hub`,
            time: currentStepIndex >= 3 ? 'With Courier Rider' : 'Estimated',
            completed: currentStepIndex >= 3,
            current: currentStepIndex >= 3,
            description: isDhaka
              ? 'Rider will call prior to arrival. Cash on Delivery payable upon receipt.'
              : 'Parcel moving via secure expressway transit to your home district.',
          },
        ],
      });
      return;
    }

    // 2. Check if matches local recent order
    if (recentOrder && (
      recentOrder.orderId.toLowerCase() === cleanQuery.toLowerCase() ||
      recentOrder.customer?.phone?.includes(cleanQuery)
    )) {
      const isDhaka = recentOrder.customer.district.toLowerCase().includes('dhaka');
      setTrackingData({
        orderId: recentOrder.orderId,
        consignmentId: `ST-${recentOrder.orderId.replace(/[^0-9]/g, '') || '884920'}`,
        courierName: 'Steadfast Courier Bangladesh',
        courierUrl: `https://steadfast.com.bd/t/ST-${recentOrder.orderId.replace(/[^0-9]/g, '') || '884920'}`,
        statusText: isDhaka ? 'Out for Doorstep Delivery in Dhaka' : 'In Transit to District Delivery Hub',
        statusBadge: isDhaka ? 'out_for_delivery' : 'transit',
        currentStepIndex: isDhaka ? 3 : 2,
        recipientName: recentOrder.customer.fullName,
        recipientPhone: recentOrder.customer.phone,
        district: recentOrder.customer.district,
        address: recentOrder.customer.address,
        estimatedDelivery: isDhaka ? 'Today by 6:00 PM' : 'Within 48 hours',
        paymentMethod: 'Cash on Delivery (COD)',
        codAmount: recentOrder.grandTotal,
        items: recentOrder.items.map((i: any) => ({
          name: i.product.name,
          category: i.product.categoryLabel || i.product.category,
          image: i.product.featuredImage,
          color: i.selectedColor?.name || 'Standard',
          size: i.selectedSize,
          quantity: i.quantity,
          price: i.product.price,
        })),
        timeline: [
          {
            title: 'Order Confirmed',
            location: 'Adorous Desk, Rajshahi',
            time: '10:15 AM · Order Verified',
            completed: true,
            current: false,
            description: 'Order logged and confirmed for Cash on Delivery dispatch.',
          },
          {
            title: 'Keepsake Box Packaging & Seal',
            location: 'Quality Inspection Desk, Rajshahi',
            time: '01:45 PM · Micro-Inspected',
            completed: true,
            current: false,
            description: 'Carefully wrapped in signature velvet keepsake pouch and sealed.',
          },
          {
            title: 'Handed to Courier Partner',
            location: 'Steadfast Central Sorting Hub (Tejgaon)',
            time: '05:30 PM · Consignment Dispatched',
            completed: true,
            current: !isDhaka,
            description: 'Scanned into courier central logistics network.',
          },
          {
            title: isDhaka ? 'Out for Doorstep Delivery' : 'En Route to District Delivery Hub',
            location: isDhaka ? `${recentOrder.customer.district} Delivery Area` : `${recentOrder.customer.district} Hub`,
            time: isDhaka ? '09:30 AM · With Courier Rider' : 'Estimated tomorrow morning',
            completed: isDhaka,
            current: isDhaka,
            description: isDhaka
              ? 'Rider will call prior to arrival. Cash on Delivery payable upon receipt.'
              : 'Parcel moving via secure expressway transit to your home district.',
          },
        ],
      });
      return;
    }

    // 2. Pre-set Demo Orders
    const upper = cleanQuery.toUpperCase();
    if (upper === 'AF-2026-4102' || upper.includes('4102') || cleanQuery.includes('01712')) {
      const zariChoker = PRODUCTS[0];
      setTrackingData({
        orderId: 'AF-2026-4102',
        consignmentId: 'ST-88294102',
        courierName: 'Steadfast Courier Bangladesh',
        courierUrl: 'https://steadfast.com.bd/t/ST-88294102',
        statusText: 'Out for Doorstep Delivery (Rajshahi Metro)',
        statusBadge: 'out_for_delivery',
        currentStepIndex: 3,
        recipientName: 'Sumaiya Rahman',
        recipientPhone: '+880 1712-345678',
        district: 'Rajshahi (Boalia)',
        address: 'Devisingpara, Islampara, Boalia, Rajshahi',
        estimatedDelivery: 'Today by 5:30 PM',
        paymentMethod: 'Cash on Delivery (COD)',
        codAmount: 2650,
        items: [
          {
            name: zariChoker.name,
            category: zariChoker.categoryLabel,
            image: zariChoker.featuredImage,
            color: 'Antique Gold & Ruby',
            quantity: 1,
            price: 2650,
          },
        ],
        timeline: [
          {
            title: 'Order Confirmed',
            location: 'Adorous Desk, Rajshahi',
            time: 'Yesterday · 11:20 AM',
            completed: true,
            current: false,
            description: 'Cash on Delivery order verified and processed.',
          },
          {
            title: 'Keepsake Box Packaging & Seal',
            location: 'Quality Inspection Desk, Rajshahi',
            time: 'Yesterday · 03:10 PM',
            completed: true,
            current: false,
            description: 'Electroplating inspection passed. Packed in rigid keepsake box with velvet pouch.',
          },
          {
            title: 'Handed to Steadfast Courier Hub',
            location: 'Tejgaon Central Logistics Hub',
            time: 'Yesterday · 07:45 PM',
            completed: true,
            current: false,
            description: 'Consignment ST-88294102 generated and dispatched into delivery pool.',
          },
          {
            title: 'Out for Delivery (Doorstep)',
            location: 'Courier Delivery Unit',
            time: 'Today · 09:15 AM',
            completed: true,
            current: true,
            description: 'Delivery rider is in your zone. Please keep ৳2,650 ready for Cash on Delivery handover.',
          },
        ],
      });
      return;
    }

    if (upper === 'AF-2026-1088' || upper.includes('1088') || cleanQuery.includes('01819')) {
      const churiStack = PRODUCTS[2] || PRODUCTS[0];
      setTrackingData({
        orderId: 'AF-2026-1088',
        consignmentId: 'ST-77491088',
        courierName: 'Steadfast Courier Bangladesh',
        courierUrl: 'https://steadfast.com.bd/t/ST-77491088',
        statusText: 'In Transit to Chittagong Regional Hub',
        statusBadge: 'transit',
        currentStepIndex: 2,
        recipientName: 'Tasnim Chowdhury',
        recipientPhone: '+880 1819-876543',
        district: 'Chittagong (Nasirabad Housing Society)',
        address: 'Villa Noor, Road 3, Nasirabad, Chittagong',
        estimatedDelivery: 'Tomorrow afternoon (2:00 PM - 5:00 PM)',
        paymentMethod: 'Cash on Delivery (COD)',
        codAmount: 1850,
        items: [
          {
            name: churiStack.name,
            category: churiStack.categoryLabel,
            image: churiStack.featuredImage,
            color: 'Imperial Emerald & Gold',
            size: '2-6 (Standard)',
            quantity: 1,
            price: 1850,
          },
        ],
        timeline: [
          {
            title: 'Order Confirmed',
            location: 'Adorous Desk, Rajshahi',
            time: 'Today · 09:40 AM',
            completed: true,
            current: false,
            description: 'Patron order confirmed for Chittagong delivery.',
          },
          {
            title: 'Keepsake Box Packaging & Seal',
            location: 'Quality Inspection Desk, Rajshahi',
            time: 'Today · 12:30 PM',
            completed: true,
            current: false,
            description: 'Churi sizing verified (2-6). Wrapped in velvet keep-tray.',
          },
          {
            title: 'Dispatched via Steadfast Expressway Transit',
            location: 'Tejgaon Inter-District Hub to Chittagong Hub',
            time: 'Today · 04:15 PM',
            completed: true,
            current: true,
            description: 'Parcel in transit along Dhaka-Chittagong highway network.',
          },
          {
            title: 'Out for Doorstep Delivery',
            location: 'Chittagong Nasirabad Delivery Unit',
            time: 'Estimated Tomorrow',
            completed: false,
            current: false,
            description: 'Courier rider will initiate doorstep delivery with Cash on Delivery collection.',
          },
        ],
      });
      return;
    }

    // 3. Dynamic generic parser for any custom order number
    if (upper.startsWith('AF-')) {
      const prod = PRODUCTS[0];
      setTrackingData({
        orderId: upper,
        consignmentId: `ST-${upper.replace(/[^0-9]/g, '')}`,
        courierName: 'Steadfast Courier Bangladesh',
        courierUrl: `https://steadfast.com.bd/t/ST-${upper.replace(/[^0-9]/g, '')}`,
        statusText: 'Verified & Queued for Packaging at Adorous Fashion',
        statusBadge: 'packaging',
        currentStepIndex: 1,
        recipientName: 'Valued Patron',
        recipientPhone: '+880 17XXXXXXXX',
        district: 'Bangladesh (64 Districts Coverage)',
        address: 'Registered Patron Delivery Address',
        estimatedDelivery: '1–3 Business Days',
        paymentMethod: 'Cash on Delivery (COD)',
        codAmount: 2650,
        items: [
          {
            name: prod.name,
            category: prod.categoryLabel,
            image: prod.featuredImage,
            color: 'Artisanal Gold Edition',
            quantity: 1,
            price: prod.price,
          },
        ],
        timeline: [
          {
            title: 'Order Confirmed',
            location: 'Adorous Desk, Rajshahi',
            time: 'Today · Verified',
            completed: true,
            current: false,
            description: 'Logged into our order management desk.',
          },
          {
            title: 'Keepsake Box Packaging & Micro-Inspection',
            location: 'Quality Inspection Desk, Rajshahi',
            time: 'In Progress',
            completed: true,
            current: true,
            description: 'Undergoing 22k electroplate check before courier handover.',
          },
          {
            title: 'Courier Hub Handover',
            location: 'Steadfast Central Sorting Hub (Tejgaon)',
            time: 'Scheduled Next Pickup',
            completed: false,
            current: false,
            description: 'Consignment will be scanned and transit tracking activated.',
          },
          {
            title: 'Doorstep Delivery (Cash on Delivery)',
            location: 'Destination Address',
            time: '1-3 Business Days',
            completed: false,
            current: false,
            description: 'Inspect package exterior prior to Cash on Delivery payment.',
          },
        ],
      });
      return;
    }

    // Not found
    setTrackingData(null);
  };

  // Auto-search if ref was passed in URL query
  useEffect(() => {
    if (initialRef) {
      handleSearch(initialRef);
    }
  }, [initialRef]);

  // Construct WhatsApp Status Check link
  const generateWhatsAppInquiry = () => {
    const ref = trackingData ? trackingData.orderId : inputQuery || 'my order';
    const msg = `Hello Adorous Fashion! I am inquiring about the dispatch status of my order ${ref}. Please provide a live update on my delivery.`;
    return `https://wa.me/8801577731381?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="bg-paper min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-[0.2em] uppercase text-gold-deep">
            <Truck className="w-4 h-4 text-gold-deep" />
            <span>Nationwide Logistics · 64 Districts</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink font-medium">
            Track Your Parcel
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-lg mx-auto leading-relaxed">
            Enter your <strong>Order Reference</strong> (e.g. <code>AF-2026-4102</code>) or mobile number to track live courier transit and dispatch updates.
          </p>
        </div>

        {/* Search Input Card */}
        <div className="bg-[#FAF8F2] border border-line p-6 sm:p-8 rounded-[2px] shadow-xs space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(inputQuery);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Enter Order Reference (e.g. AF-2026-4102) or Phone Number"
                className="w-full h-12 pl-10 pr-4 bg-paper border border-line rounded-[2px] text-xs sm:text-sm text-ink placeholder:text-text-muted/60 focus:outline-none focus:border-gold-deep transition-colors"
              />
            </div>
            <button
              type="submit"
              className="h-12 px-8 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-[2px] transition-all flex items-center justify-center space-x-2 shrink-0 shadow-sm"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Parcel</span>
            </button>
          </form>

          {/* Quick Demo & Recent Order Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-text-muted text-[11px]">Quick Lookups:</span>

            {recentOrder && (
              <button
                type="button"
                onClick={() => {
                  setInputQuery(recentOrder.orderId);
                  handleSearch(recentOrder.orderId);
                }}
                className="px-2.5 py-1 bg-sand hover:bg-sand-dark border border-line text-ink rounded-xs text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-gold-deep" />
                <span>Your Recent Order ({recentOrder.orderId})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setInputQuery('AF-2026-4102');
                handleSearch('AF-2026-4102');
              }}
              className="px-2.5 py-1 bg-paper hover:bg-sand border border-line text-ink rounded-xs text-[11px] transition-colors"
            >
              Demo: Dhaka Out for Delivery (<code>AF-2026-4102</code>)
            </button>

            <button
              type="button"
              onClick={() => {
                setInputQuery('AF-2026-1088');
                handleSearch('AF-2026-1088');
              }}
              className="px-2.5 py-1 bg-paper hover:bg-sand border border-line text-ink rounded-xs text-[11px] transition-colors"
            >
              Demo: Inter-District Transit (<code>AF-2026-1088</code>)
            </button>
          </div>
        </div>

        {/* Results Section */}
        {searched && trackingData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Status Summary Banner */}
            <div className="bg-sand text-ink p-6 sm:p-8 rounded-[2px] border border-gold/30 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-semibold tracking-wider uppercase text-gold-deep">
                      Live Courier Dispatch Update
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
                    {trackingData.statusText}
                  </h2>
                  <p className="text-xs text-ink/80">
                    Order Ref: <strong className="text-gold-deep">{trackingData.orderId}</strong> · Consignment:{' '}
                    <strong className="text-ink">{trackingData.consignmentId}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                  <a
                    href={trackingData.courierUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-paper/10 hover:bg-paper/20 border border-gold/40 text-gold-deep text-xs font-medium rounded-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-gold" />
                    <span>View on Steadfast Portal</span>
                  </a>

                  <a
                    href={generateWhatsAppInquiry()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xs transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Status Check</span>
                  </a>
                </div>
              </div>

              {/* Delivery Meta Strip */}
              <div className="mt-6 pt-6 border-t border-paper/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-ink/80">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-ink/50 block">Courier:</span>
                  <span className="font-semibold text-ink mt-0.5 block">{trackingData.courierName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-ink/50 block">Estimated Arrival:</span>
                  <span className="font-semibold text-gold-deep mt-0.5 block">{trackingData.estimatedDelivery}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-ink/50 block">Payment Mode:</span>
                  <span className="font-semibold text-ink mt-0.5 block">{trackingData.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-ink/50 block">Amount Payable (COD):</span>
                  <span className="font-semibold text-gold-deep mt-0.5 block text-sm">৳{trackingData.codAmount.toLocaleString('en-US')}</span>
                </div>
              </div>
            </div>

            {/* 4-Stage Visual Journey Timeline */}
            <div className="bg-paper border border-line p-6 sm:p-8 rounded-[2px] shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <h3 className="font-serif text-lg text-ink font-medium">
                  Dispatch & Transit Journey
                </h3>
                <span className="text-xs text-text-muted">
                  Stage {trackingData.currentStepIndex + 1} of 4
                </span>
              </div>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
                {trackingData.timeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle Indicator */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        step.completed
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : step.current
                          ? 'bg-gold text-ink ring-4 ring-gold/20'
                          : 'bg-sand border border-line text-text-muted'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Details */}
                    <div className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className={`text-xs sm:text-sm font-semibold ${step.current ? 'text-gold-deep' : 'text-ink'}`}>
                          {step.title}
                        </h4>
                        <span className="text-[11px] text-text-muted font-mono">
                          {step.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs text-gold-ink font-medium">
                        <MapPin className="w-3 h-3 text-gold-deep shrink-0" />
                        <span>{step.location}</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed pt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination & Package Contents */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Recipient & Address */}
              <div className="md:col-span-5 bg-[#FAF8F2] border border-line p-5 rounded-[2px] shadow-xs space-y-3 text-xs">
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-ink border-b border-line pb-2">
                  Destination Details
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] uppercase text-text-muted block">Recipient Name:</span>
                    <strong className="text-ink text-sm block mt-0.5">{trackingData.recipientName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-text-muted block">Contact Phone:</span>
                    <span className="text-ink font-mono">{trackingData.recipientPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-text-muted block">Delivery Address:</span>
                    <p className="text-ink leading-relaxed mt-0.5">{trackingData.address}</p>
                    <span className="text-gold-deep font-semibold block mt-1">{trackingData.district}</span>
                  </div>
                </div>
              </div>

              {/* Items Card */}
              <div className="md:col-span-7 bg-paper border border-line p-5 rounded-[2px] shadow-xs space-y-3">
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-ink border-b border-line pb-2">
                  Package Contents ({trackingData.items.reduce((s, i) => s + i.quantity, 0)} Items)
                </h3>
                <div className="divide-y divide-line">
                  {trackingData.items.map((item, i) => (
                    <div key={i} className="py-2.5 first:pt-0 flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="relative w-12 h-14 bg-stone rounded-xs overflow-hidden shrink-0 border border-line">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase tracking-wider text-text-muted block">
                            {item.category}
                          </span>
                          <h4 className="text-xs font-medium text-ink truncate block">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-text-muted">
                            Colour: {item.color} {item.size && `· Size: ${item.size}`} · Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-ink tabular-nums shrink-0">
                        ৳{(item.price * item.quantity).toLocaleString('en-US')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-line pt-2.5 flex items-center justify-between text-xs">
                  <span className="text-text-muted">Total Payable to Courier Rider:</span>
                  <span className="font-semibold text-ink text-sm tabular-nums">
                    ৳{trackingData.codAmount.toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not Found State */}
        {searched && !trackingData && (
          <div className="bg-paper border border-line p-8 sm:p-12 text-center rounded-[2px] shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-full bg-sand/60 border border-line flex items-center justify-center mx-auto text-gold-deep">
              <AlertCircle className="w-7 h-7 text-gold-deep" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="font-serif text-xl text-ink font-medium">No Parcel Found for "{inputQuery}"</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Please double-check your Order Reference (e.g. <code>AF-2026-4102</code>) or the 11-digit phone number provided during checkout.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={generateWhatsAppInquiry()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-sand hover:bg-black text-gold-deep font-semibold text-xs tracking-wider uppercase rounded-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-whatsapp" />
                <span>Contact Us on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setInputQuery('AF-2026-4102');
                  handleSearch('AF-2026-4102');
                }}
                className="px-6 py-3 bg-sand hover:bg-sand-dark text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-colors"
              >
                Try Demo Order
              </button>
            </div>
          </div>
        )}

        {/* Three Trust & Delivery Assurance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-line">
          <div className="p-5 bg-sand/40 border border-line rounded-xs space-y-2">
            <div className="w-8 h-8 rounded-full bg-paper border border-gold/30 flex items-center justify-center text-gold-deep">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-sm text-ink font-semibold">Doorstep Inspection</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Verify your parcel exterior before paying Cash on Delivery. Zero upfront risk across all 64 districts.
            </p>
          </div>

          <div className="p-5 bg-sand/40 border border-line rounded-xs space-y-2">
            <div className="w-8 h-8 rounded-full bg-paper border border-gold/30 flex items-center justify-center text-gold-deep">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-sm text-ink font-semibold">Predictable Transit</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Rajshahi Metro orders deliver within 24–48 hours. Nationwide district dispatches arrive in 2–4 days via Steadfast.
            </p>
          </div>

          <div className="p-5 bg-sand/40 border border-line rounded-xs space-y-2">
            <div className="w-8 h-8 rounded-full bg-paper border border-gold/30 flex items-center justify-center text-gold-deep">
              <RotateCcw className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-sm text-ink font-semibold">7-Day Free Exchange</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Need a different churi size or finish? Our doorstep exchange courier will swap it directly at your door.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <span className="text-xs uppercase tracking-widest text-text-muted">Loading Tracker...</span>
          </div>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
