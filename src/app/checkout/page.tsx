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
      <section className="border-b border-line bg-[#F8F6F0] py-4 sm:py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
          <nav className="flex items-center space-x-2 text-[10px] sm:text-[11px] text-text-muted uppercase tracking-wider shrink-0">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-ink transition-colors">Bag</Link>
            <span>/</span>
            <span className="text-ink font-medium">Checkout</span>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-emerald-200/60 shadow-sm shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            <span className="font-medium">Cash on Delivery (COD) <span className="hidden sm:inline">· Inspect Before You Pay</span></span>
          </div>
        </div>
      </section>

      {/* Main Checkout Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-32 lg:py-12">
        <form id="checkout-form" onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Delivery Details & Mini Haul */}
          <div className="lg:col-span-7 space-y-5">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div>{errorMsg}</div>
              </div>
            )}

            {/* Shipping Details Form Block */}
            <div className="bg-paper border border-line p-5 sm:p-7 rounded-[2px] shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

                {/* 1. Full Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-ink font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 bg-sand/30 border border-line text-ink focus:outline-none focus:border-gold rounded-xs placeholder:text-text-muted"
                  />
                </div>

                {/* 2. Phone Number */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-ink font-medium">
                    Phone Number <span className="text-red-500">*</span>
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
                      placeholder="Enter your phone number"
                      className="w-full pl-16 pr-3.5 py-2.5 bg-sand/30 border border-line text-ink focus:outline-none focus:border-gold rounded-xs placeholder:text-text-muted font-mono"
                    />
                  </div>
                </div>

                {/* 3. Email Address (Moved to Top) */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-ink font-medium">
                    Email Address <span className="text-text-muted text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. farhana@example.com"
                    className="w-full px-3.5 py-2.5 bg-sand/30 border border-line text-ink focus:outline-none focus:border-gold rounded-xs placeholder:text-text-muted"
                  />
                </div>

                {/* 4. Division / District */}
                <div className="space-y-1 sm:col-span-2 relative" ref={districtContainerRef}>
                  <div className="flex items-center justify-between">
                    <label className="block text-ink font-medium">
                      District <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
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
                        if (e.key === 'Escape') setIsDistrictDropdownOpen(false);
                      }}
                      placeholder="Choose division and district"
                      className="w-full px-3.5 py-2.5 bg-sand/30 border border-line text-ink placeholder:text-text-muted focus:outline-none focus:border-gold rounded-xs transition-colors"
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
                              className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors hover:bg-sand/70 ${isSelected ? 'bg-sand font-medium' : ''}`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-ink font-medium">{dist.name}</span>
                                <span className="text-[10px] text-text-muted">({dist.division} Division)</span>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-[2px] font-semibold tracking-wide ${isSpecialRate ? 'bg-gold/20 text-gold-deep border border-gold/40' : 'bg-sand text-text-muted border border-line'}`}>
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

                {/* 5. Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-ink font-medium">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House, road and other address details"
                    className="w-full px-3.5 py-2.5 bg-sand/30 border border-line text-ink focus:outline-none focus:border-gold rounded-xs placeholder:text-text-muted leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Mini Haul (Cart Items) moved to Left Column */}
            <div className="bg-paper border border-line p-5 sm:p-7 rounded-[2px] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <ShoppingBag className="w-5 h-5 text-gold-dark shrink-0" />
                <h2 className="font-serif text-lg text-ink font-medium">
                  Mini Haul
                </h2>
              </div>

              {/* Items Header */}
              <div className="hidden sm:flex justify-between text-[11px] font-semibold text-text-muted uppercase tracking-wider px-2">
                <span className="flex-1">Product</span>
                <span className="w-24 text-center">Price</span>
                <span className="w-20 text-right">Quantity</span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-line max-h-96 overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const itemKey = `${item.product.id}-${item.selectedColor.id}-${item.selectedSize || 'default'}-${idx}`;
                  const lineTotal = item.product.price * item.quantity;

                  return (
                    <div key={itemKey} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0">
                      {/* Product Info */}
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
                          
                          {/* Mobile Quantity/Price Display */}
                          <div className="sm:hidden flex items-center justify-between mt-2 w-full">
                            <span className="text-xs font-semibold text-ink tabular-nums">
                              ৳{lineTotal.toLocaleString('en-US')}
                            </span>
                            <div className="flex items-center space-x-2 text-xs">
                              <button onClick={() => handleDecreaseQuantity(item)} className="p-1 hover:bg-sand rounded-xs"><Minus className="w-3 h-3" /></button>
                              <span className="font-semibold">Qty: {item.quantity}</span>
                              <button onClick={() => handleIncreaseQuantity(item)} className="p-1 hover:bg-sand rounded-xs"><Plus className="w-3 h-3" /></button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Price */}
                      <div className="hidden sm:flex w-24 justify-center shrink-0">
                        <span className="text-xs font-semibold text-ink tabular-nums">
                          ৳{lineTotal.toLocaleString('en-US')}
                        </span>
                      </div>

                      {/* Desktop Quantity Stepper */}
                      <div className="hidden sm:flex w-20 justify-end items-center space-x-2 shrink-0">
                        <span className="text-xs font-semibold">Qty: {item.quantity}</span>
                        {/* Optionally add +/- here for desktop too, keeping simple text to match screenshot layout */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Coupon, Payment, Summary, Place Order */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-6 lg:sticky lg:top-24">
              
              {/* Promo / Coupon Section */}
              <div className="bg-paper border border-line p-5 rounded-[2px] shadow-xs">
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
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <label className="text-xs font-medium text-ink shrink-0">Coupon:</label>
                      <div className="flex flex-1 items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Enter your coupon code"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          className="flex-1 bg-sand/30 border border-line focus:border-gold px-3 py-2.5 text-xs text-ink font-mono tracking-wider uppercase rounded-[2px] focus:outline-none placeholder:text-text-muted/60 placeholder:normal-case"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-4 py-2.5 bg-ink hover:bg-black text-paper text-xs font-medium uppercase tracking-wider rounded-xs transition-colors shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{couponError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method Section */}
              <div className="bg-paper border border-line p-5 rounded-[2px] shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-line pb-3">
                  <h2 className="font-medium text-sm text-ink">
                    Choose payment method
                  </h2>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Option A: bKash (Online Payment equivalent) */}
                  <label
                    className={`flex items-center justify-between p-3.5 border rounded-xs cursor-pointer transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-gold bg-sand/30 shadow-xs'
                        : 'border-line hover:border-line/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'bkash'}
                        onChange={() => setPaymentMethod('bkash')}
                        className="accent-gold w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="font-medium text-ink">Online Payment (bKash/Nagad)</span>
                    </div>
                  </label>

                  {/* Option B: Cash on Delivery */}
                  <label
                    className={`flex items-center justify-between p-3.5 border rounded-xs cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-gold bg-sand/30 shadow-xs'
                        : 'border-line hover:border-line/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-gold w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="font-medium text-ink">Cash on Delivery</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Summary & Pricing */}
              <div className="bg-paper border border-line p-5 rounded-[2px] shadow-xs space-y-4 text-xs">
                <h2 className="font-medium text-sm text-ink border-b border-line pb-3">
                  Summary
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-ink">
                    <span>Product Price</span>
                    <span className="tabular-nums">৳{subtotal.toLocaleString('en-US')}</span>
                  </div>

                  {discountAmount > 0 && appliedCoupon && (
                    <div className="flex justify-between items-center text-emerald-700 font-medium">
                      <span>Promo Discount ({appliedCoupon.code})</span>
                      <span className="tabular-nums">-৳{discountAmount.toLocaleString('en-US')}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-ink">
                    <div className="flex items-center gap-1 cursor-pointer">
                      <span>Shipping Fee</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                    <span className="tabular-nums">
                      {shippingFee === 0 && (isFreeDelivery || appliedCoupon?.freeShipping) ? (
                        <span className="text-emerald-700 font-semibold uppercase">Free</span>
                      ) : selectedDistrict ? (
                        `৳${shippingFee}`
                      ) : (
                        <span className="text-text-muted">Select an address first</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Total Payable (Always shown here on Desktop, also shown here on Mobile to preserve normal flow) */}
                <div className="border-t border-line/80 pt-4 flex justify-between items-center font-semibold text-sm">
                  <span>Total Payable</span>
                  <span className="tabular-nums">
                    {selectedDistrict ? `৳${grandTotal.toLocaleString('en-US')}` : <span className="text-xs font-normal">Pending address</span>}
                  </span>
                </div>
              </div>

              {/* 6. Gift Note Section */}
              <div className="bg-paper border border-line p-5 rounded-[2px] shadow-xs space-y-3">
                <label className="block text-ink font-medium text-sm">
                  Special Instructions
                  <span className="text-text-muted text-[10px] block sm:inline sm:ml-1 mt-0.5 sm:mt-0">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Write a message..."
                  className="w-full px-3.5 py-2.5 bg-sand/30 border border-line text-ink text-xs focus:outline-none focus:border-gold rounded-xs placeholder:text-text-muted leading-relaxed"
                />
              </div>

              {/* Desktop Submit Button (Hidden on Mobile) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="hidden lg:flex w-full py-4 bg-gold hover:bg-gold-light disabled:opacity-50 text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all items-center justify-center space-x-2 shadow-md"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting ? 'Processing Order...' : `Place Order (৳${grandTotal.toLocaleString('en-US')})`}
                </span>
              </button>
            </div>
          </div>
        </form>

        {/* Mobile Sticky Footer (Hidden on Desktop) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-paper px-4 py-3 sm:p-4 border-t border-line shadow-[0_-8px_16px_rgba(0,0,0,0.04)] z-[9999] space-y-3 pb-safe">
          <div className="flex justify-between items-center font-semibold text-sm">
            <span>Total Payable</span>
            <span className="tabular-nums">
              {selectedDistrict ? `৳${grandTotal.toLocaleString('en-US')}` : <span className="text-xs font-normal text-text-muted">Pending address</span>}
            </span>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full py-4 bg-gold hover:bg-gold-light disabled:opacity-50 text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center justify-center space-x-2 shadow-md"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>
              {isSubmitting ? 'Processing Order...' : `Place Order (৳${grandTotal.toLocaleString('en-US')})`}
            </span>
          </button>
        </div>
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
