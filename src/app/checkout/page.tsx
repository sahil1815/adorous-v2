'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrdersContext';
import { useCoupons } from '@/context/CouponsContext';
import { BANGLADESH_DISTRICTS, getDistrictDeliveryFee } from '@/data/districts';
import { CartItem } from '@/types';
import {
  ShieldCheck,
  Truck,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Lock,
  Clock,
  Sparkles,
  Tag,
  CheckCircle2,
  X,
  MapPin,
  ChevronDown,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, updateQuantity, removeItem } = useCart();
  const { addOrder } = useOrders();
  const { validateCoupon, recordCouponUsage } = useCoupons();

  // Deletion Confirmation Modal State
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const districtContainerRef = useRef<HTMLDivElement>(null);
  const [giftNote, setGiftNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    freeShipping: boolean;
    description: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Errors & Submission
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Click outside to close district autocomplete
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (districtContainerRef.current && !districtContainerRef.current.contains(event.target as Node)) {
        setIsDistrictDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter districts based on query (matches name or division)
  const filteredDistricts = useMemo(() => {
    const query = selectedDistrict.trim().toLowerCase();
    if (!query) {
      return BANGLADESH_DISTRICTS;
    }
    return BANGLADESH_DISTRICTS.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.division.toLowerCase().includes(query)
    );
  }, [selectedDistrict]);

  // Shipping Fee & Discount Calculation (৳80 for Dhaka & Gazipur, ৳130 for others)
  const baseDistrictRate = getDistrictDeliveryFee(selectedDistrict);
  const isFreeDelivery = subtotal >= 2000;
  const baseShippingFee = isFreeDelivery ? 0 : baseDistrictRate;
  const shippingFee = appliedCoupon?.freeShipping ? 0 : baseShippingFee;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Quantity and Item Removal Handlers
  const handleIncreaseQuantity = (item: CartItem) => {
    updateQuantity(item.product.id, item.selectedColor.id, item.quantity + 1, item.selectedSize);
  };

  const handleDecreaseQuantity = (item: CartItem) => {
    if (item.quantity > 1) {
      updateQuantity(item.product.id, item.selectedColor.id, item.quantity - 1, item.selectedSize);
    } else {
      // Trigger confirmation popup if reducing from 1 to 0
      setItemToDelete(item);
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete.product.id, itemToDelete.selectedColor.id, itemToDelete.selectedSize);
      setItemToDelete(null);
    }
  };

  // Close deletion modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && itemToDelete) {
        setItemToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itemToDelete]);

  // Automatically re-evaluate coupon if subtotal changes due to quantity updates
  useEffect(() => {
    if (appliedCoupon) {
      const result = validateCoupon(appliedCoupon.code, subtotal, baseShippingFee);
      if (result.isValid) {
        setAppliedCoupon({
          code: result.coupon!.code,
          discountAmount: result.discountAmount,
          freeShipping: result.freeShipping,
          description: result.coupon!.description,
        });
      } else {
        setAppliedCoupon(null);
        setCouponError(`Coupon removed: ${result.message}`);
      }
    }
  }, [subtotal, baseShippingFee]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const result = validateCoupon(couponInput, subtotal, baseShippingFee);
    if (result.isValid) {
      setAppliedCoupon({
        code: result.coupon!.code,
        discountAmount: result.discountAmount,
        freeShipping: result.freeShipping,
        description: result.coupon!.description,
      });
      setCouponSuccess(result.message);
    } else {
      setCouponError(result.message);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponSuccess(null);
    setCouponError(null);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMsg('Please enter the recipient full name.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 11-digit Bangladesh phone number (e.g., 01712345678).');
      return;
    }

    if (!address.trim()) {
      setErrorMsg('Please provide a complete delivery address (House, Road, Area).');
      return;
    }

    if (!selectedDistrict.trim()) {
      setErrorMsg('Please select or type your delivery district / city.');
      return;
    }

    setIsSubmitting(true);

    // Generate unique Bangladeshi Order ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `AF-2026-${randomSuffix}`;

    const orderData = {
      orderId,
      createdAt: new Date().toISOString(),
      customer: {
        fullName,
        phone: cleanPhone.startsWith('880') ? `+${cleanPhone}` : cleanPhone.startsWith('0') ? `+88${cleanPhone}` : `+880${cleanPhone}`,
        email: email || undefined,
        address,
        district: selectedDistrict,
        giftNote: giftNote || undefined,
        whatsappUpdates,
      },
      paymentMethod,
      items,
      subtotal,
      shippingFee,
      discountAmount: appliedCoupon ? appliedCoupon.discountAmount : undefined,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      grandTotal,
    };

    try {
      if (appliedCoupon) {
        recordCouponUsage(appliedCoupon.code);
      }
      addOrder(orderData);
      localStorage.setItem('adorous_last_order', JSON.stringify(orderData));
      // Clear cart
      clearCart();
      // Redirect to confirmation
      router.push(`/order-success/${orderId}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMsg('An unexpected error occurred while placing your order. Please try again.');
    }
  };

  // If bag is empty
  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-[70vh] bg-paper flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 border border-line bg-[#FAF7F0] rounded-xs shadow-xs">
          <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center mx-auto text-ink">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif text-ink">Your Bag is Empty</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            You haven't added any luxury jewelry, churi stacks, or handbags yet. Explore our curated collections to proceed.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all shadow-sm"
            >
              <span>Explore The Edit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen">
      {/* Header Bar */}
      <section className="border-b border-line bg-[#F8F6F0] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center space-x-2 text-[11px] text-text-muted uppercase tracking-wider mb-1">
              <Link href="/" className="hover:text-ink transition-colors">Home</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-ink transition-colors">Bag</Link>
              <span>/</span>
              <span className="text-ink font-medium">Checkout</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight font-normal">
              Secure Luxury Checkout
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cash on Delivery (COD) · Inspect Before You Pay</span>
          </div>
        </div>
      </section>

      {/* Main Checkout Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Delivery & Payment Details */}
          <div className="lg:col-span-7 space-y-8">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div>{errorMsg}</div>
              </div>
            )}

            {/* 1. Recipient Details */}
            <div className="bg-paper border border-line p-5 sm:p-7 space-y-4 rounded-[2px] shadow-xs">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h2 className="font-serif text-lg text-ink font-medium flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-ink text-gold-light text-xs flex items-center justify-center font-sans font-semibold">
                    1
                  </span>
                  Recipient Contact Details
                </h2>
                <span className="text-[11px] text-text-muted uppercase tracking-wider">Required for Dispatch</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-ink font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Farhana Rahman"
                    className="w-full px-3.5 py-2.5 bg-sand/30 border border-line text-ink focus:outline-none focus:border-gold rounded-xs placeholder:text-text-muted"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-ink font-medium">
                    Mobile Phone Number (WhatsApp Enabled) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-text-muted font-medium select-none">
                      +880
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="1712 345678"
                      className="w-full pl-16 pr-3.5 py-2.5 bg-sand/30 border border-line text-ink focus:outline-none focus:border-gold rounded-xs placeholder:text-text-muted font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-text-muted block">
                    Our courier will call this number prior to arrival. We also send dispatch updates here.
                  </span>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-ink font-medium">
                    Email Address <span className="text-text-muted text-[10px]">(Optional for receipt)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farhana@example.com"
                    className="w-full px-3.5 py-2.5 bg-sand/30 border border-line text-ink focus:outline-none focus:border-gold rounded-xs placeholder:text-text-muted"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-paper border border-line p-5 sm:p-7 space-y-4 rounded-[2px] shadow-xs">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h2 className="font-serif text-lg text-ink font-medium flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-ink text-gold-light text-xs flex items-center justify-center font-sans font-semibold">
                    2
                  </span>
                  Doorstep Delivery Address
                </h2>
                <span className="text-[11px] text-gold-ink font-semibold">64 Districts Covered</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5 relative" ref={districtContainerRef}>
                  <div className="flex items-center justify-between">
                    <label className="block text-ink font-medium">
                      District / City <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px]">
                      {selectedDistrict ? (
                        baseDistrictRate === 80 ? (
                          <span className="text-gold-deep font-semibold">৳80 Delivery (Dhaka / Gazipur)</span>
                        ) : (
                          <span className="text-ink font-medium">৳130 Delivery</span>
                        )
                      ) : null}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gold-deep">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={selectedDistrict}
                      onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setIsDistrictDropdownOpen(true);
                      }}
                      onFocus={() => setIsDistrictDropdownOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsDistrictDropdownOpen(false);
                        }
                      }}
                      placeholder="Type or search district (e.g. Dhaka, Gazipur, Chittagong...)"
                      className="w-full pl-10 pr-16 py-2.5 bg-sand/30 border border-line text-ink placeholder:text-text-muted focus:outline-none focus:border-gold rounded-xs transition-colors"
                      autoComplete="off"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                      {selectedDistrict && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDistrict('');
                            setIsDistrictDropdownOpen(true);
                          }}
                          className="p-1 text-text-muted hover:text-ink transition-colors"
                          aria-label="Clear district input"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                        className="p-1 text-text-muted hover:text-gold-deep transition-colors"
                        aria-label="Toggle district suggestions"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDistrictDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Autocomplete Suggestions Popover */}
                  {isDistrictDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-paper border border-gold/40 rounded-xs shadow-xl max-h-60 overflow-y-auto divide-y divide-line/40 animate-in fade-in slide-in-from-top-1 duration-150">
                      {filteredDistricts.length > 0 ? (
                        filteredDistricts.map((dist) => {
                          const isSelected = selectedDistrict.trim().toLowerCase() === dist.name.toLowerCase();
                          const isSpecialRate = dist.deliveryFee === 80;
                          return (
                            <button
                              key={dist.name}
                              type="button"
                              onClick={() => {
                                setSelectedDistrict(dist.name);
                                setIsDistrictDropdownOpen(false);
                              }}
                              className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors hover:bg-sand/70 ${
                                isSelected ? 'bg-sand font-medium' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-ink font-medium">{dist.name}</span>
                                <span className="text-[10px] text-text-muted">({dist.division} Division)</span>
                              </div>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-[2px] font-semibold tracking-wide ${
                                  isSpecialRate
                                    ? 'bg-gold/20 text-gold-deep border border-gold/40'
                                    : 'bg-sand text-text-muted border border-line'
                                }`}
                              >
                                ৳{dist.deliveryFee} Delivery
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-3 text-xs text-text-muted text-center">
                          <span>Custom location: <strong>&ldquo;{selectedDistrict}&rdquo;</strong></span>
                          <p className="text-[10px] text-gold-deep mt-1 font-medium">
                            {baseDistrictRate === 80 ? '৳80 Express Delivery (Dhaka/Gazipur)' : '৳130 Delivery'} applies
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-ink font-medium">
                    Street Address & Landmarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Apartment no, Road no, Block / Sector, Area (e.g. House 42, Road 11, Banani, Dhaka)"
                    className="w-full px-3.5 py-2.5 bg-sand/30 border border-line text-ink focus:outline-none focus:border-gold rounded-xs placeholder:text-text-muted leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-ink font-medium">
                    Complimentary Handwritten Calligraphy Note <span className="text-text-muted text-[10px]">(Optional for gifts)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Write a message for the recipient. We will handwrite this on our deckle-edged keepsake card."
                    className="w-full px-3.5 py-2.5 bg-sand/30 border border-line text-ink focus:outline-none focus:border-gold rounded-xs placeholder:text-text-muted leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-paper border border-line p-5 sm:p-7 space-y-4 rounded-[2px] shadow-xs">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h2 className="font-serif text-lg text-ink font-medium flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-ink text-gold-light text-xs flex items-center justify-center font-sans font-semibold">
                    3
                  </span>
                  Payment Preference
                </h2>
                <span className="text-[11px] text-emerald-700 font-semibold">Zero Advance Required</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Option A: Cash on Delivery (COD) */}
                <label
                  className={`flex items-start p-4 border rounded-xs cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-gold bg-sand/30 shadow-xs'
                      : 'border-line hover:border-line/80'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-0.5 accent-gold cursor-pointer mr-3.5"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink text-sm">Cash on Delivery (COD)</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-xs font-semibold">
                        Default & Recommended
                      </span>
                    </div>
                    <p className="text-text-muted leading-relaxed">
                      Pay in Bangladeshi Taka (৳) to the courier rider at your doorstep. You may inspect the package exterior and seals before payment.
                    </p>
                  </div>
                </label>

                {/* Option B: bKash / Nagad Direct */}
                <label
                  className={`flex items-start p-4 border rounded-xs cursor-pointer transition-all ${
                    paymentMethod === 'bkash'
                      ? 'border-gold bg-sand/30 shadow-xs'
                      : 'border-line hover:border-line/80'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="mt-0.5 accent-gold cursor-pointer mr-3.5"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink text-sm">bKash / Nagad Direct Transfer</span>
                    </div>
                    <p className="text-text-muted leading-relaxed">
                      Prefer paying digitally? Select this and our WhatsApp concierge will message you our official merchant number after placing the order.
                    </p>
                  </div>
                </label>
              </div>

              {/* WhatsApp Notification Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={whatsappUpdates}
                    onChange={(e) => setWhatsappUpdates(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 accent-gold cursor-pointer rounded-xs"
                  />
                  <span className="text-ink font-medium">
                    Send me pre-dispatch verification photo and courier tracking link on WhatsApp.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Confirmation CTA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FAF8F2] border border-line p-5 sm:p-7 rounded-[2px] shadow-xs space-y-5 sticky top-24">
              <h2 className="font-serif text-xl text-ink font-medium border-b border-line pb-3">
                Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
              </h2>

              {/* Items List */}
              <div className="divide-y divide-line max-h-80 overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const itemKey = `${item.product.id}-${item.selectedColor.id}-${item.selectedSize || 'default'}-${idx}`;
                  const lineTotal = item.product.price * item.quantity;

                  return (
                    <div key={itemKey} className="py-3.5 flex items-start justify-between gap-3 first:pt-0">
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <div className="relative w-12 h-14 bg-stone rounded-xs overflow-hidden shrink-0 border border-line">
                          <Image
                            src={item.product.featuredImage}
                            alt={item.product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-medium text-ink truncate block">
                            {item.product.name}
                          </h4>
                          <div className="text-[10px] text-text-muted flex items-center gap-1.5 mt-0.5">
                            <span
                              className="w-2 h-2 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            <span className="truncate">{item.selectedColor.name}</span>
                            {item.selectedSize && <span>· Size {item.selectedSize}</span>}
                          </div>

                          {/* Quantity Stepper & Unit Price */}
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center border border-line rounded-[2px] bg-sand/40 h-6">
                              <button
                                type="button"
                                onClick={() => handleDecreaseQuantity(item)}
                                className="px-1.5 h-full text-ink hover:bg-sand transition-colors flex items-center justify-center text-xs"
                                aria-label={`Decrease quantity of ${item.product.name}`}
                                title={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                              >
                                {item.quantity === 1 ? (
                                  <Trash2 className="w-2.5 h-2.5 text-text-muted hover:text-red-700" />
                                ) : (
                                  <Minus className="w-2.5 h-2.5" />
                                )}
                              </button>
                              <span className="px-2 text-xs font-semibold tabular-nums text-ink">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleIncreaseQuantity(item)}
                                className="px-1.5 h-full text-ink hover:bg-sand transition-colors flex items-center justify-center text-xs"
                                aria-label={`Increase quantity of ${item.product.name}`}
                                title="Increase quantity"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <span className="text-[10px] text-text-muted tabular-nums">
                              ৳{item.product.price.toLocaleString('en-US')} each
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Line Total & Trash Button */}
                      <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                        <span className="text-xs font-semibold text-ink tabular-nums">
                          ৳{lineTotal.toLocaleString('en-US')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="text-text-muted hover:text-red-700 p-1 transition-colors rounded-xs hover:bg-red-50"
                          aria-label={`Remove ${item.product.name} from order`}
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo / Voucher Code Section */}
              <div className="border-t border-line pt-4 space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-text-muted font-semibold flex items-center space-x-1.5">
                  <Tag className="w-3 h-3 text-gold-dark" />
                  <span>Atelier Promo Code / Voucher</span>
                </label>

                {appliedCoupon ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-xs text-emerald-900">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-1.5 py-0.2 rounded-xs font-semibold">
                            Applied
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-700 mt-0.5">
                          {appliedCoupon.description}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-emerald-700 hover:text-emerald-900 p-1 text-xs transition-colors"
                      title="Remove promo code"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="e.g. EID2026 or FIRST10"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError(null);
                        }}
                        className="flex-1 bg-paper border border-line focus:border-gold px-3 py-2 text-xs text-ink font-mono tracking-wider uppercase rounded-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-ink hover:bg-black text-paper text-xs font-medium uppercase tracking-wider rounded-xs transition-colors shrink-0"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="text-[11px] text-red-600 flex items-center space-x-1 pt-0.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{couponError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Calculations */}
              <div className="border-t border-line pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-ink tabular-nums">
                    ৳{subtotal.toLocaleString('en-US')}
                  </span>
                </div>

                {discountAmount > 0 && appliedCoupon && (
                  <div className="flex justify-between items-center text-emerald-700 font-medium">
                    <span className="flex items-center space-x-1">
                      <span>Promo Discount ({appliedCoupon.code})</span>
                    </span>
                    <span className="font-semibold tabular-nums">
                      -৳{discountAmount.toLocaleString('en-US')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-text-muted">
                  <div className="flex items-center gap-1">
                    <span>Doorstep Courier Delivery</span>
                    {(isFreeDelivery || appliedCoupon?.freeShipping) && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 font-semibold">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-ink tabular-nums">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-semibold uppercase">Free</span>
                    ) : (
                      `৳${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="border-t border-line/80 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-serif font-semibold text-ink block">Grand Total</span>
                    <span className="text-[10px] text-text-muted">
                      {paymentMethod === 'cod' ? 'Payable upon delivery' : 'Payable via bKash'}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-ink tabular-nums">
                    ৳{grandTotal.toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              {/* Free Delivery Banner if applicable */}
              {isFreeDelivery ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center space-x-2">
                  <Truck className="w-4 h-4 shrink-0 text-emerald-700" />
                  <span>Complimentary Door-to-Door Delivery applied (Orders over ৳2,000)</span>
                </div>
              ) : (
                <div className="p-3 bg-sand/60 border border-line text-xs rounded-xs text-text-muted">
                  Add ৳{(2000 - subtotal).toLocaleString('en-US')} more to unlock <strong>Free Delivery</strong> anywhere in Bangladesh.
                </div>
              )}

              {/* Order Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gold hover:bg-gold-light disabled:opacity-50 text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center justify-center space-x-2 shadow-md"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? 'Processing Order...'
                    : `Confirm Cash on Delivery Order (৳${grandTotal.toLocaleString('en-US')})`}
                </span>
              </button>

              {/* Courier Delivery Timelines */}
              <div className="pt-2 text-[11px] text-text-muted space-y-1.5 border-t border-line">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold-deep shrink-0" />
                  <span><strong>Dhaka & Gazipur:</strong> 24 to 48 Hours Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-gold-deep shrink-0" />
                  <span><strong>All Other Districts:</strong> 48 to 72 Hours via Express Courier</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Delete Item Confirmation Popup Modal */}
      {itemToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setItemToDelete(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-item-dialog-title"
        >
          <div 
            className="bg-paper border border-gold/40 rounded-xs shadow-2xl max-w-sm w-full p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 id="delete-item-dialog-title" className="font-serif text-lg font-medium text-ink">
                  Remove from Order?
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Are you sure you want to remove this piece from your bag?
                </p>
              </div>
            </div>

            {/* Item Preview Card */}
            <div className="p-3 bg-sand/40 border border-line rounded-xs flex items-center space-x-3">
              <div className="relative w-12 h-14 bg-stone rounded-xs overflow-hidden shrink-0 border border-line">
                <Image
                  src={itemToDelete.product.featuredImage}
                  alt={itemToDelete.product.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-medium text-ink truncate">
                  {itemToDelete.product.name}
                </h4>
                <div className="text-[10px] text-text-muted flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-2 h-2 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: itemToDelete.selectedColor.hex }}
                  />
                  <span className="truncate">{itemToDelete.selectedColor.name}</span>
                  {itemToDelete.selectedSize && <span>· Size {itemToDelete.selectedSize}</span>}
                </div>
                <div className="text-xs font-semibold text-ink mt-1 tabular-nums">
                  Qty: {itemToDelete.quantity} · ৳{(itemToDelete.product.price * itemToDelete.quantity).toLocaleString('en-US')}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 bg-paper hover:bg-sand border border-line text-ink text-xs font-medium uppercase tracking-wider rounded-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
              >
                Remove Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
