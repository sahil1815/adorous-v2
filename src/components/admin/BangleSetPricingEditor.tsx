'use client';

import React from 'react';
import { Sparkles, Plus, Trash2, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { BangleSetTier } from '@/types';

export const DEFAULT_CHURI_SET_TIERS: BangleSetTier[] = [
  {
    id: 'tier-6',
    name: '6-Set',
    price: 650,
    originalPrice: 850,
    perSetPriceText: 'প্রতি সেটের প্রাইস ১০৮ টাকা',
    badge: '',
    isDefault: false,
  },
  {
    id: 'tier-12',
    name: '12-Set',
    price: 1200,
    originalPrice: 1600,
    perSetPriceText: 'প্রতি সেটের প্রাইস ১০০ টাকা',
    badge: 'Popular',
    isDefault: true,
  },
  {
    id: 'tier-24',
    name: '24-Set',
    price: 2160,
    originalPrice: 3000,
    perSetPriceText: 'প্রতি সেটের প্রাইস ৯০ টাকা',
    badge: 'Best Value',
    isDefault: false,
  },
];

interface BangleSetPricingEditorProps {
  hasSetPricing: boolean;
  onHasSetPricingChange: (val: boolean) => void;
  setPricingBanner: string;
  onSetPricingBannerChange: (val: string) => void;
  setTiers: BangleSetTier[];
  onSetTiersChange: (tiers: BangleSetTier[]) => void;
}

export default function BangleSetPricingEditor({
  hasSetPricing,
  onHasSetPricingChange,
  setPricingBanner,
  onSetPricingBannerChange,
  setTiers,
  onSetTiersChange,
}: BangleSetPricingEditorProps) {
  // Add a new tier
  const handleAddTier = () => {
    const newTier: BangleSetTier = {
      id: `tier-${Date.now()}`,
      name: `${(setTiers.length + 1) * 6}-Set`,
      price: 1000,
      originalPrice: null,
      perSetPriceText: '',
      badge: '',
      isDefault: setTiers.length === 0,
    };
    onSetTiersChange([...setTiers, newTier]);
  };

  // Remove a tier
  const handleRemoveTier = (idxToRemove: number) => {
    const updated = setTiers.filter((_, idx) => idx !== idxToRemove);
    // If the removed tier was default, make the first one default
    if (setTiers[idxToRemove]?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    onSetTiersChange(updated);
  };

  // Update specific tier field
  const handleUpdateTier = (idx: number, field: keyof BangleSetTier, value: any) => {
    const updated = [...setTiers];
    if (field === 'isDefault' && value === true) {
      // Clear other defaults
      updated.forEach((t, i) => {
        t.isDefault = i === idx;
      });
    } else {
      updated[idx] = { ...updated[idx], [field]: value };
    }
    onSetTiersChange(updated);
  };

  // Load standard presets
  const handleApplyPresets = () => {
    onSetTiersChange(JSON.parse(JSON.stringify(DEFAULT_CHURI_SET_TIERS)));
    if (!setPricingBanner.trim()) {
      onSetPricingBannerChange('২৪ সেটের ক্ষেত্রে প্রতি সেটের প্রাইস ৯০ টাকা (সাশ্রয়ী অফার)');
    }
  };

  return (
    <div
      className={`p-4 rounded-xs border transition-all ${
        hasSetPricing ? 'bg-gold/10 border-gold/50 shadow-xs' : 'bg-[#141414] border-white/10'
      }`}
    >
      {/* Header & Toggle */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="text-xs font-bold text-white block">
              4. Bangle Set / Quantity Tier Pricing (সেট ভিত্তিক মূল্য)
            </span>
          </div>
          <span className="text-[11px] text-paper/60 leading-snug block">
            Allow customers to toggle between 6-Set, 12-Set, 24-Set with custom main and per-set prices
          </span>
        </div>
        <input
          type="checkbox"
          checked={hasSetPricing}
          onChange={(e) => onHasSetPricingChange(e.target.checked)}
          className="rounded-xs text-gold focus:ring-gold bg-[#1C1C1C] border-white/20 mt-0.5 h-4 w-4 cursor-pointer shrink-0"
        />
      </div>

      {hasSetPricing ? (
        <div className="mt-4 pt-3 border-t border-gold/20 space-y-4">
          {/* Section 1: Promotional Highlight Banner */}
          <div className="space-y-1.5 bg-[#171717] p-3 rounded-xs border border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-wider text-paper/70 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold" />
                <span>Promo Highlight Notice (দেখা যাবে প্রোডাক্ট পেজের উপরে)</span>
              </label>
            </div>
            <input
              type="text"
              value={setPricingBanner}
              onChange={(e) => onSetPricingBannerChange(e.target.value)}
              placeholder="e.g. ২৪ সেটের ক্ষেত্রে প্রতি সেটের প্রাইস ৮০ টাকা"
              className="w-full bg-[#1C1C1C] border border-white/20 rounded-xs px-2.5 py-1.5 text-xs text-paper placeholder-paper/30 focus:border-gold focus:outline-none"
            />
            {setPricingBanner.trim() && (
              <div className="mt-1.5 p-2 bg-gold/15 border border-gold/30 rounded-xs flex items-center gap-2 text-xs text-paper">
                <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
                <span className="text-[11px] font-medium text-gold-deep">
                  <strong className="text-white font-semibold">Storefront Preview:</strong> {setPricingBanner}
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Set Tiers List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-paper/80 font-bold">
                  Configured Set Tiers ({setTiers.length})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyPresets}
                  className="text-gold hover:text-gold-light text-[11px] font-medium transition-colors cursor-pointer"
                >
                  ⚡ Load Standard Presets (6, 12, 24)
                </button>
                <button
                  type="button"
                  onClick={handleAddTier}
                  className="px-2 py-0.5 bg-gold text-ink font-semibold text-xs rounded-xs hover:bg-gold-deep transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Tier</span>
                </button>
              </div>
            </div>

            {setTiers.length === 0 ? (
              <div className="p-4 text-center bg-[#171717] rounded-xs border border-dashed border-white/15 text-paper/50 text-xs space-y-2">
                <AlertCircle className="w-4 h-4 mx-auto text-amber-400" />
                <p>No set tiers added yet. Click &ldquo;Load Standard Presets&rdquo; or &ldquo;Add Tier&rdquo; above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {setTiers.map((tier, idx) => (
                  <div
                    key={tier.id || idx}
                    className="p-3 bg-[#181818] rounded-xs border border-white/10 hover:border-gold/30 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-gold/20 text-gold text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => handleUpdateTier(idx, 'name', e.target.value)}
                          placeholder="Tier Name (e.g. 6-Set, 12-Set)"
                          className="bg-[#121212] border border-white/20 rounded-xs px-2 py-0.5 text-xs text-paper font-semibold focus:border-gold focus:outline-none w-36"
                        />
                        <label className="flex items-center gap-1 cursor-pointer ml-2 text-[10px] text-paper/70">
                          <input
                            type="radio"
                            name="default-tier"
                            checked={Boolean(tier.isDefault)}
                            onChange={() => handleUpdateTier(idx, 'isDefault', true)}
                            className="text-gold focus:ring-gold h-3 w-3"
                          />
                          <span>Default</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTier(idx)}
                        className="text-paper/40 hover:text-rose-400 transition-colors p-1"
                        title="Remove tier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      {/* Main Selling Price */}
                      <div>
                        <label className="text-[10px] uppercase text-paper/60 font-medium block mb-0.5">
                          Total Price (৳) *
                        </label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => handleUpdateTier(idx, 'price', Number(e.target.value))}
                          placeholder="e.g. 1920"
                          className="w-full bg-[#121212] border border-white/15 focus:border-gold rounded-xs px-2 py-1 text-paper font-mono text-xs focus:outline-none"
                        />
                      </div>

                      {/* Compare Price */}
                      <div>
                        <label className="text-[10px] uppercase text-paper/60 font-medium block mb-0.5">
                          Original Price (৳)
                        </label>
                        <input
                          type="number"
                          value={tier.originalPrice ?? ''}
                          onChange={(e) =>
                            handleUpdateTier(idx, 'originalPrice', e.target.value ? Number(e.target.value) : null)
                          }
                          placeholder="e.g. 2400"
                          className="w-full bg-[#121212] border border-white/15 focus:border-gold rounded-xs px-2 py-1 text-paper font-mono text-xs focus:outline-none"
                        />
                      </div>

                      {/* Per-Set Price Subtext */}
                      <div>
                        <label className="text-[10px] uppercase text-paper/60 font-medium block mb-0.5">
                          Per-Set Price Text
                        </label>
                        <input
                          type="text"
                          value={tier.perSetPriceText ?? ''}
                          onChange={(e) => handleUpdateTier(idx, 'perSetPriceText', e.target.value)}
                          placeholder="e.g. প্রতি সেট ৮০ টাকা"
                          className="w-full bg-[#121212] border border-white/15 focus:border-gold rounded-xs px-2 py-1 text-paper text-xs focus:outline-none"
                        />
                      </div>

                      {/* Badge (Optional) */}
                      <div>
                        <label className="text-[10px] uppercase text-paper/60 font-medium block mb-0.5">
                          Badge (Optional)
                        </label>
                        <input
                          type="text"
                          value={tier.badge ?? ''}
                          onChange={(e) => handleUpdateTier(idx, 'badge', e.target.value)}
                          placeholder="e.g. Best Value"
                          className="w-full bg-[#121212] border border-white/15 focus:border-gold rounded-xs px-2 py-1 text-paper text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 text-[11px] text-paper/50">
          Set pricing disabled (Sold as standard single piece)
        </div>
      )}
    </div>
  );
}
