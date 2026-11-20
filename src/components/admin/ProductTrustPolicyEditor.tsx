'use client';

import React from 'react';
import {
  ShieldCheck,
  RotateCcw,
  Truck,
  Sliders,
  Info,
  Check,
} from 'lucide-react';
import { ProductCategory } from '@/types';
import {
  DEFAULT_GLOBAL_TRUST_POLICY,
  DEFAULT_CATEGORY_TRUST_POLICIES,
} from '@/lib/trustPolicies';

interface ProductTrustPolicyEditorProps {
  category: ProductCategory;
  hasCustomTrustPolicy: boolean;
  onHasCustomTrustPolicyChange: (val: boolean) => void;
  trustGuaranteeTitle: string;
  onTrustGuaranteeTitleChange: (val: string) => void;
  trustGuaranteeText: string;
  onTrustGuaranteeTextChange: (val: string) => void;
  trustExchangeTitle: string;
  onTrustExchangeTitleChange: (val: string) => void;
  trustExchangeText: string;
  onTrustExchangeTextChange: (val: string) => void;
  trustDeliveryTitle: string;
  onTrustDeliveryTitleChange: (val: string) => void;
  trustDeliveryText: string;
  onTrustDeliveryTextChange: (val: string) => void;
  showTrustGuarantee: boolean;
  onShowTrustGuaranteeChange: (val: boolean) => void;
  showTrustExchange: boolean;
  onShowTrustExchangeChange: (val: boolean) => void;
  showTrustDelivery: boolean;
  onShowTrustDeliveryChange: (val: boolean) => void;
}

export default function ProductTrustPolicyEditor({
  category,
  hasCustomTrustPolicy,
  onHasCustomTrustPolicyChange,
  trustGuaranteeTitle,
  onTrustGuaranteeTitleChange,
  trustGuaranteeText,
  onTrustGuaranteeTextChange,
  trustExchangeTitle,
  onTrustExchangeTitleChange,
  trustExchangeText,
  onTrustExchangeTextChange,
  trustDeliveryTitle,
  onTrustDeliveryTitleChange,
  trustDeliveryText,
  onTrustDeliveryTextChange,
  showTrustGuarantee,
  onShowTrustGuaranteeChange,
  showTrustExchange,
  onShowTrustExchangeChange,
  showTrustDelivery,
  onShowTrustDeliveryChange,
}: ProductTrustPolicyEditorProps) {
  const categoryDefault =
    DEFAULT_CATEGORY_TRUST_POLICIES[category] || DEFAULT_GLOBAL_TRUST_POLICY;

  const handleApplyCategoryDefaults = () => {
    onTrustGuaranteeTitleChange(categoryDefault.guaranteeTitle);
    onTrustGuaranteeTextChange(categoryDefault.guaranteeText);
    onTrustExchangeTitleChange(categoryDefault.exchangeTitle);
    onTrustExchangeTextChange(categoryDefault.exchangeText);
    onTrustDeliveryTitleChange(categoryDefault.deliveryTitle);
    onTrustDeliveryTextChange(categoryDefault.deliveryText);
    onShowTrustGuaranteeChange(categoryDefault.showGuarantee !== false);
    onShowTrustExchangeChange(categoryDefault.showExchange !== false);
    onShowTrustDeliveryChange(categoryDefault.showDelivery !== false);
  };

  const handleEnableCustom = () => {
    onHasCustomTrustPolicyChange(true);
    // If fields are empty, prefill with category defaults
    if (!trustGuaranteeTitle && !trustGuaranteeText) {
      handleApplyCategoryDefaults();
    }
  };

  const handleUseCategoryDefault = () => {
    onHasCustomTrustPolicyChange(false);
  };

  return (
    <div className="bg-[#141414] border border-white/10 rounded-xs p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-serif font-semibold text-paper tracking-wide">
            Trust, Guarantee & Exchange Policy
          </h3>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-semibold ${
            hasCustomTrustPolicy
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {hasCustomTrustPolicy ? 'Custom Override Active' : 'Inheriting Category Policy'}
        </span>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleUseCategoryDefault}
          className={`p-3 rounded-xs border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
            !hasCustomTrustPolicy
              ? 'bg-[#1C1C1C] border-gold shadow-xs'
              : 'bg-[#181818] border-white/10 hover:border-white/20 opacity-70'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
              !hasCustomTrustPolicy
                ? 'border-gold bg-gold text-[#0D0D0D]'
                : 'border-white/30'
            }`}
          >
            {!hasCustomTrustPolicy && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-paper block">
              Inherit {category.toUpperCase()} Category Policy (Recommended)
            </span>
            <span className="text-[11px] text-paper/50 block leading-relaxed">
              Automatically updates whenever you update the category policy in Atelier Settings.
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={handleEnableCustom}
          className={`p-3 rounded-xs border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
            hasCustomTrustPolicy
              ? 'bg-[#1C1C1C] border-gold shadow-xs'
              : 'bg-[#181818] border-white/10 hover:border-white/20 opacity-70'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
              hasCustomTrustPolicy
                ? 'border-gold bg-gold text-[#0D0D0D]'
                : 'border-white/30'
            }`}
          >
            {hasCustomTrustPolicy && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-paper block">
              Custom Policy for this Piece
            </span>
            <span className="text-[11px] text-paper/50 block leading-relaxed">
              Write bespoke guarantee durations, exchange rules, or hide reassurance for clearance items.
            </span>
          </div>
        </button>
      </div>

      {/* When Inheriting: Clean Summary of what customer will see */}
      {!hasCustomTrustPolicy && (
        <div className="bg-[#181818] border border-white/10 rounded-xs p-3.5 flex items-start gap-3">
          <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-paper/70">
            <p className="text-paper font-medium">Currently active category promise:</p>
            <p className="text-[11px] text-emerald-400 font-semibold">
              {categoryDefault.guaranteeTitle}
            </p>
            {Boolean(categoryDefault.guaranteeText && categoryDefault.guaranteeText.trim()) && (
              <p className="text-[11px] text-paper/60 line-clamp-2">
                {categoryDefault.guaranteeText}
              </p>
            )}
            <div className="flex items-center gap-4 text-[11px] text-paper/50 pt-1">
              <span>{categoryDefault.exchangeTitle} {categoryDefault.exchangeText}</span>
              <span>•</span>
              <span>{categoryDefault.deliveryTitle} {categoryDefault.deliveryText}</span>
            </div>
          </div>
        </div>
      )}

      {/* When Custom Override is Enabled: Full Form Fields */}
      {hasCustomTrustPolicy && (
        <div className="space-y-4 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs text-paper/80 font-medium flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-gold" />
              <span>Bespoke Product Promise Fields</span>
            </span>
            <button
              type="button"
              onClick={handleApplyCategoryDefaults}
              className="text-[11px] text-gold hover:text-gold-light underline cursor-pointer"
            >
              Reset to Category Defaults
            </button>
          </div>

          {/* Guarantee Highlight Box */}
          <div className="space-y-3 bg-[#181818] p-3.5 rounded-xs border border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-paper flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Green Guarantee Highlight Box</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-paper/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTrustGuarantee}
                  onChange={(e) => onShowTrustGuaranteeChange(e.target.checked)}
                  className="rounded border-white/20 bg-[#1C1C1C] text-gold focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px]">{showTrustGuarantee ? 'Show' : 'Hide'}</span>
              </label>
            </div>

            {showTrustGuarantee && (
              <>
                <div>
                  <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                    Guarantee Title
                  </label>
                  <input
                    type="text"
                    value={trustGuaranteeTitle}
                    onChange={(e) => onTrustGuaranteeTitleChange(e.target.value)}
                    placeholder="e.g. ৬ মাসের গ্যারান্টি (6-Month Official Guarantee)"
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                    Guarantee Scope & Details
                  </label>
                  <textarea
                    rows={2}
                    value={trustGuaranteeText}
                    onChange={(e) => onTrustGuaranteeTextChange(e.target.value)}
                    placeholder="Describe what is covered for this specific piece..."
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none leading-relaxed transition-colors"
                  />
                </div>
              </>
            )}
          </div>

          {/* Exchange & Delivery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Exchange */}
            <div className="bg-[#181818] p-3.5 rounded-xs border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-paper flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-gold" />
                  <span>Exchange Policy</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-paper/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTrustExchange}
                    onChange={(e) => onShowTrustExchangeChange(e.target.checked)}
                    className="rounded border-white/20 bg-[#1C1C1C] text-gold focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px]">{showTrustExchange ? 'Show' : 'Hide'}</span>
                </label>
              </div>
              {showTrustExchange && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={trustExchangeTitle}
                    onChange={(e) => onTrustExchangeTitleChange(e.target.value)}
                    placeholder="e.g. ৭ দিনের এক্সচেঞ্জ :"
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-1.5 text-paper rounded-xs text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    value={trustExchangeText}
                    onChange={(e) => onTrustExchangeTextChange(e.target.value)}
                    placeholder="e.g. সাইজ ও ফিনিশ পরিবর্তনযোগ্য"
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-1.5 text-paper rounded-xs text-xs focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Delivery */}
            <div className="bg-[#181818] p-3.5 rounded-xs border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-paper flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-gold" />
                  <span>Delivery Timeline</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-paper/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTrustDelivery}
                    onChange={(e) => onShowTrustDeliveryChange(e.target.checked)}
                    className="rounded border-white/20 bg-[#1C1C1C] text-gold focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px]">{showTrustDelivery ? 'Show' : 'Hide'}</span>
                </label>
              </div>
              {showTrustDelivery && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={trustDeliveryTitle}
                    onChange={(e) => onTrustDeliveryTitleChange(e.target.value)}
                    placeholder="e.g. ডেলিভারি :"
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-1.5 text-paper rounded-xs text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    value={trustDeliveryText}
                    onChange={(e) => onTrustDeliveryTextChange(e.target.value)}
                    placeholder="e.g. 1–3 days"
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-1.5 text-paper rounded-xs text-xs focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
