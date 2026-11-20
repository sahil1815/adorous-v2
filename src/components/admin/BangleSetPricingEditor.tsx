'use client';

import React, { useState } from 'react';
import { Zap, Plus, Trash2, CheckCircle2, AlertCircle, Layers, ShieldCheck } from 'lucide-react';
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
  setPricingBanner?: string;
  onSetPricingBannerChange?: (val: string) => void;
  setTiers: BangleSetTier[];
  onSetTiersChange: (tiers: BangleSetTier[]) => void;
  showSetPriceInButtons?: boolean;
  onShowSetPriceInButtonsChange?: (val: boolean) => void;
  actualPricePosition?: 'top' | 'after_set' | 'after_color' | 'after_quantity';
  onActualPricePositionChange?: (pos: 'top' | 'after_set' | 'after_color' | 'after_quantity') => void;
  unitPriceHeaderPrompt?: string;
  onUnitPriceHeaderPromptChange?: (val: string) => void;
}

export default function BangleSetPricingEditor({
  hasSetPricing,
  onHasSetPricingChange,
  setPricingBanner = '',
  onSetPricingBannerChange,
  setTiers,
  onSetTiersChange,
  showSetPriceInButtons = false,
  onShowSetPriceInButtonsChange,
  actualPricePosition = 'top',
  onActualPricePositionChange,
  unitPriceHeaderPrompt = '',
  onUnitPriceHeaderPromptChange,
}: BangleSetPricingEditorProps) {
  // Add a new tier
  const handleAddTier = () => {
    const newTier: BangleSetTier = {
      id: `tier-${Date.now()}`,
      name: `${(setTiers.length + 1) * 6}-Set`,
      price: 1000,
      originalPrice: null,
      perSetPriceText: '',
      promoBanner: '',
      badge: '',
      isDefault: setTiers.length === 0,
    };
    onSetTiersChange([...setTiers, newTier]);
  };

  // Remove a tier
  const handleRemoveTier = (idxToRemove: number) => {
    const updated = setTiers.filter((_, idx) => idx !== idxToRemove);
    if (setTiers[idxToRemove]?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    onSetTiersChange(updated);
  };

  // Update specific tier field
  const handleUpdateTier = (idx: number, field: keyof BangleSetTier, value: any) => {
    const updated = [...setTiers];
    if (field === 'isDefault' && value === true) {
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
    if (onSetPricingBannerChange) {
      onSetPricingBannerChange('');
    }
  };

  const activeDefaultTier = setTiers.find((t) => t.isDefault) || setTiers[0];

  return (
    <div
      className={`p-4 rounded-xs border transition-all ${
        hasSetPricing ? 'bg-gold/10 border-gold/50 shadow-xs' : 'bg-[#141414] border-white/10'
      }`}
    >
      {/* Header & Master Toggle */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gold" />
            <span className="text-xs font-bold text-white block">
              Bangle Set Tier Pricing & Bundle Configuration
            </span>
          </div>
          <span className="text-[11px] text-paper/60 leading-snug block">
            Configure 6-Set, 12-Set, 24-Set tiered bundle pricing, dynamic promotional banner, and luxury badges.
          </span>
        </div>
        <input
          type="checkbox"
          checked={hasSetPricing}
          onChange={(e) => onHasSetPricingChange(e.target.checked)}
          className="rounded-xs text-gold focus:ring-gold bg-[#1C1C1C] border-white/20 mt-0.5 h-4 w-4 cursor-pointer"
        />
      </div>

      {hasSetPricing ? (
        <div className="mt-3 pt-3 border-t border-gold/20 space-y-4">
          {/* Quick Presets Button */}
          <div className="flex items-center justify-between gap-2 bg-[#171717] p-2.5 rounded-xs border border-white/10">
            <div className="text-[11px] text-paper/80">
              <span className="text-gold font-semibold">Standard Bundle:</span> 6-Set (৳650), 12-Set (৳1,200), 24-Set (৳2,160).
            </div>
            <button
              type="button"
              onClick={handleApplyPresets}
              className="px-2.5 py-1 text-xs bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40 rounded-xs font-medium transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-gold" />
              <span>Load Standard Presets</span>
            </button>
          </div>

          {/* Configured Set Tiers */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-wider text-paper/70 font-semibold block">
                Configured Set Tiers ({setTiers.length}):
              </label>
              <button
                type="button"
                onClick={handleAddTier}
                className="px-2 py-0.5 text-xs bg-gold text-ink font-semibold rounded-xs hover:bg-gold-light transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Tier</span>
              </button>
            </div>

            {setTiers.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-white/20 rounded-xs text-paper/40 text-xs">
                No tiers configured. Click &ldquo;⚡ Load Standard Presets&rdquo; or &ldquo;+ Add Tier&rdquo; to begin.
              </div>
            ) : (
              <div className="space-y-2.5">
                {setTiers.map((tier, idx) => (
                  <div
                    key={tier.id || idx}
                    className={`p-3 rounded-xs border transition-all ${
                      tier.isDefault
                        ? 'bg-[#1C1C1C] border-gold/60 shadow-xs'
                        : 'bg-[#161616] border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-paper/90">
                          <input
                            type="radio"
                            name="default_set_tier"
                            checked={Boolean(tier.isDefault)}
                            onChange={() => handleUpdateTier(idx, 'isDefault', true)}
                            className="text-gold focus:ring-gold bg-[#121212] border-white/20 h-3.5 w-3.5 cursor-pointer"
                          />
                          <span className={tier.isDefault ? 'text-gold' : 'text-paper/70'}>
                            {tier.isDefault ? 'Default Selected' : 'Set as Default'}
                          </span>
                        </label>
                        {tier.isDefault && (
                          <span className="px-1.5 py-0.2 bg-gold/20 text-gold text-[10px] font-mono rounded-[2px] border border-gold/40">
                            Pre-selected
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTier(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded-xs transition-colors cursor-pointer"
                        title="Delete tier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                      {/* Tier Name */}
                      <div>
                        <label className="text-[10px] uppercase text-paper/60 font-medium block mb-0.5">
                          Set Name *
                        </label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => handleUpdateTier(idx, 'name', e.target.value)}
                          placeholder="e.g. 24-Set"
                          className="w-full bg-[#121212] border border-white/15 focus:border-gold rounded-xs px-2 py-1 text-paper font-bold text-xs focus:outline-none"
                        />
                      </div>

                      {/* Total Price */}
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
                      <div className="sm:col-span-4">
                        <label className="text-[10px] uppercase text-paper/60 font-medium block mb-0.5">
                          Promotional Badge (Optional):
                        </label>
                        <input
                          type="text"
                          value={tier.badge ?? ''}
                          onChange={(e) => handleUpdateTier(idx, 'badge', e.target.value)}
                          placeholder="e.g. Best Value, Most Popular, Mega Saving"
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
