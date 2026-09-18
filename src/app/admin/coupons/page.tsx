'use client';

import React, { useState } from 'react';
import { useCoupons, Coupon, DiscountType } from '@/context/CouponsContext';
import {
  Tag,
  Plus,
  Copy,
  Check,
  Percent,
  Truck,
  DollarSign,
  AlertCircle,
  Clock,
  Sparkles,
  Trash2,
  Power,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  X
} from 'lucide-react';

export default function AdminCouponsPage() {
  const {
    coupons,
    addCoupon,
    toggleCouponStatus,
    deleteCoupon,
    resetToDefaultCoupons,
  } = useCoupons();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(2000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(800);
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [expiresAt, setExpiresAt] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setFormError('Coupon code is required.');
      return;
    }

    if (coupons.some((c) => c.code === cleanCode)) {
      setFormError(`Coupon with code "${cleanCode}" already exists.`);
      return;
    }

    if (!description.trim()) {
      setFormError('Please enter a description.');
      return;
    }

    if (discountType !== 'free_shipping' && Number(discountValue) <= 0) {
      setFormError('Please enter a valid discount value greater than 0.');
      return;
    }

    addCoupon({
      code: cleanCode,
      description: description.trim(),
      discountType,
      discountValue: discountType === 'free_shipping' ? 0 : Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
      maxDiscountAmount: discountType === 'percentage' && maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    });

    setSuccessMessage(`Promo code "${cleanCode}" created successfully.`);
    setTimeout(() => setSuccessMessage(null), 3000);

    // Reset Form
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(15);
    setMinOrderAmount(2000);
    setMaxDiscountAmount(800);
    setUsageLimit(100);
    setExpiresAt('');
    setShowCreateModal(false);
  };

  // Analytics Metrics
  const activeCount = coupons.filter((c) => c.isActive).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.timesUsed, 0);
  const estimatedSavings = coupons.reduce((sum, c) => {
    if (c.discountType === 'fixed') return sum + c.timesUsed * c.discountValue;
    if (c.discountType === 'percentage') return sum + c.timesUsed * Math.min(450, c.maxDiscountAmount || 500);
    return sum + c.timesUsed * 100;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-paper font-normal">
            Promotions & Coupons Desk
          </h1>
          <p className="text-xs text-paper/60 mt-1">
            Create, govern, and track luxury atelier vouchers, seasonal discounts, and free shipping allowances across Bangladesh.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset to default pre-seeded Adorous promo codes (EID2026, FIRST10, ROYAL500, FREESHIP)?')) {
                resetToDefaultCoupons();
              }
            }}
            className="px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 text-paper/60 hover:text-paper rounded-xs transition-colors flex items-center space-x-1.5 text-xs"
            title="Reset to factory promo codes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gold hover:bg-gold-light text-ink font-semibold rounded-xs transition-colors flex items-center space-x-2 text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Promo Code</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xs flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#141414] border border-gold/15 rounded-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-paper/50">
            <span>Active Promotions</span>
            <Tag className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="text-2xl font-serif text-paper font-normal">
            {activeCount} <span className="text-xs text-paper/40 font-sans">/ {coupons.length} total</span>
          </p>
          <p className="text-[11px] text-paper/40">Ready to apply at checkout</p>
        </div>

        <div className="p-4 bg-[#141414] border border-gold/15 rounded-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-paper/50">
            <span>Total Redemptions</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-serif text-emerald-300 font-normal">
            {totalRedemptions} <span className="text-xs text-paper/40 font-sans">times</span>
          </p>
          <p className="text-[11px] text-paper/40">Verified orders with voucher discount</p>
        </div>

        <div className="p-4 bg-[#141414] border border-gold/15 rounded-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-paper/50">
            <span>Patron Value Granted</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-serif text-gold font-normal">
            ৳{estimatedSavings.toLocaleString()}
          </p>
          <p className="text-[11px] text-paper/40">Cumulative discount savings in BDT</p>
        </div>
      </div>

      {/* Coupons Table / Cards */}
      <div className="bg-[#141414] border border-gold/20 rounded-xs overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-gold" />
            <h2 className="font-serif text-base text-paper font-normal">
              Active Vouchers & Promotional Codes ({coupons.length})
            </h2>
          </div>
          <span className="text-[11px] text-paper/40">
            Validated in real time against client shopping bag
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {coupons.map((coupon) => {
            const isExpired = coupon.expiresAt && new Date() > new Date(coupon.expiresAt);
            const isExhausted = coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit;

            return (
              <div
                key={coupon.id}
                className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                  !coupon.isActive || isExpired || isExhausted
                    ? 'bg-[#111111]/70 opacity-60'
                    : 'hover:bg-[#181818]'
                }`}
              >
                {/* Left: Code & Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Code Badge */}
                    <div className="flex items-center space-x-1.5 px-3 py-1 bg-black border border-gold/40 rounded-xs">
                      <span className="font-mono text-sm tracking-wider font-bold text-gold">
                        {coupon.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(coupon.code)}
                        className="text-paper/40 hover:text-gold transition-colors ml-1"
                        title="Copy code"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Discount Type Pill */}
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border bg-gold/10 text-gold-light border-gold/30 flex items-center space-x-1">
                      {coupon.discountType === 'percentage' && <Percent className="w-3 h-3 mr-0.5" />}
                      {coupon.discountType === 'fixed' && <span className="mr-0.5 font-sans">৳</span>}
                      {coupon.discountType === 'free_shipping' && <Truck className="w-3 h-3 mr-0.5" />}
                      <span>
                        {coupon.discountType === 'percentage' && `${coupon.discountValue}% OFF`}
                        {coupon.discountType === 'fixed' && `৳${coupon.discountValue} Flat OFF`}
                        {coupon.discountType === 'free_shipping' && `Free Nationwide Delivery`}
                      </span>
                    </span>

                    {/* Status Pill */}
                    {isExpired ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-300 border border-red-700/40">
                        Expired
                      </span>
                    ) : isExhausted ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-700/40">
                        Exhausted
                      </span>
                    ) : coupon.isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-700/40 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                        Paused
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-paper/80 font-medium">
                    {coupon.description}
                  </p>

                  {/* Conditions Details */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-paper/50">
                    {coupon.minOrderAmount ? (
                      <span>Min Spend: <strong className="text-paper/70 font-semibold">৳{coupon.minOrderAmount.toLocaleString()}</strong></span>
                    ) : (
                      <span>No Minimum Spend</span>
                    )}

                    {coupon.maxDiscountAmount && coupon.discountType === 'percentage' && (
                      <span>• Capped At: <strong className="text-paper/70 font-semibold">৳{coupon.maxDiscountAmount.toLocaleString()}</strong></span>
                    )}

                    {coupon.expiresAt && (
                      <span>• Valid Until: <strong className="text-paper/70 font-semibold">{new Date(coupon.expiresAt).toLocaleDateString('en-GB')}</strong></span>
                    )}
                  </div>
                </div>

                {/* Right: Usage & Actions */}
                <div className="flex items-center justify-between lg:justify-end space-x-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  {/* Usage Progress */}
                  <div className="text-right space-y-1 min-w-[110px]">
                    <div className="text-xs text-paper/60">
                      Redeemed: <strong className="text-gold font-mono">{coupon.timesUsed}</strong>
                      {coupon.usageLimit && <span className="text-paper/40"> / {coupon.usageLimit}</span>}
                    </div>
                    {coupon.usageLimit && (
                      <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gold h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (coupon.timesUsed / coupon.usageLimit) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Toggle Status Button */}
                  <button
                    type="button"
                    onClick={() => toggleCouponStatus(coupon.id)}
                    className={`p-2 rounded-xs border transition-colors ${
                      coupon.isActive
                        ? 'bg-[#1C1C1C] border-white/10 text-emerald-400 hover:text-amber-400'
                        : 'bg-[#1C1C1C] border-white/10 text-zinc-500 hover:text-emerald-400'
                    }`}
                    title={coupon.isActive ? 'Pause Promo Code' : 'Activate Promo Code'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Permanently delete promo code "${coupon.code}"?`)) {
                        deleteCoupon(coupon.id);
                      }
                    }}
                    className="p-2 bg-[#1C1C1C] hover:bg-red-950/40 border border-white/10 hover:border-red-600/40 text-paper/40 hover:text-red-400 rounded-xs transition-colors"
                    title="Delete Promo Code"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Promo Code Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141414] border border-gold/30 rounded-xs max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gold" />
                <h3 className="font-serif text-lg text-paper font-normal">
                  Create New Atelier Promo Code
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-paper/40 hover:text-paper transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-700/40 rounded-xs flex items-center space-x-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              {/* Code */}
              <div>
                <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MONSOON20 or EIDLUXE"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs font-mono tracking-wider focus:outline-none uppercase"
                />
                <span className="text-[10px] text-paper/40 mt-1 block">
                  Automatically converted to uppercase. Patrons enter this at checkout.
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                  Description / Patron Announcement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20% Atelier Courtesy for Monsoon Collection"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs focus:outline-none"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                  Discount Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`py-2 px-3 border rounded-xs transition-colors text-center ${
                      discountType === 'percentage'
                        ? 'bg-gold text-ink font-bold border-gold'
                        : 'bg-[#1C1C1C] text-paper/70 border-white/10 hover:border-white/20'
                    }`}
                  >
                    % Percentage
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`py-2 px-3 border rounded-xs transition-colors text-center ${
                      discountType === 'fixed'
                        ? 'bg-gold text-ink font-bold border-gold'
                        : 'bg-[#1C1C1C] text-paper/70 border-white/10 hover:border-white/20'
                    }`}
                  >
                    ৳ Flat Off
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('free_shipping')}
                    className={`py-2 px-3 border rounded-xs transition-colors text-center ${
                      discountType === 'free_shipping'
                        ? 'bg-gold text-ink font-bold border-gold'
                        : 'bg-[#1C1C1C] text-paper/70 border-white/10 hover:border-white/20'
                    }`}
                  >
                    Free Delivery
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              {discountType !== 'free_shipping' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                      {discountType === 'percentage' ? 'Percentage Off (%) *' : 'Flat Amount Off (৳) *'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={discountType === 'percentage' ? '100' : '50000'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs focus:outline-none"
                    />
                  </div>

                  {discountType === 'percentage' && (
                    <div>
                      <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                        Max Discount Ceiling (৳)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 1000"
                        value={maxDiscountAmount}
                        onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                        className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Minimum Spend & Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                    Minimum Cart Spend (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for no minimum"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                    Max Redemptions Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 text-paper/70 rounded-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold hover:bg-gold-light text-ink font-semibold rounded-xs transition-colors shadow-sm"
                >
                  Publish Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
