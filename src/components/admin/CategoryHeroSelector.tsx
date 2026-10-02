'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Check,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  ChevronDown,
  Layers,
  Palette,
} from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/formatPrice';
import {
  getCategoryHeroSettings,
  setCategoryHeroImage,
  resetCategoryHeroImage,
  CategoryHeroData,
} from '@/app/actions/categoryHeroActions';

interface CategoryHeroSelectorProps {
  categorySlug: string;
  categoryName: string;
  categoryProducts: Product[];
  viewUrl: string;
  onHeroUpdated?: (heroImage: string) => void;
}

export default function CategoryHeroSelector({
  categorySlug,
  categoryName,
  categoryProducts,
  viewUrl,
  onHeroUpdated,
}: CategoryHeroSelectorProps) {
  const [heroData, setHeroData] = useState<CategoryHeroData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 4000);
  };

  const loadCurrentSetting = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCategoryHeroSettings(categorySlug);
      setHeroData(data);
      setSelectedProductId(data.productId || null);
      setCustomUrlInput(data.heroImage || '');
    } catch (err) {
      console.error(err);
      showError('Failed to load current category hero image.');
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    loadCurrentSetting();
  }, [loadCurrentSetting]);

  // Handle selecting a product as the hero
  const handleSelectProduct = async (product: Product, specificImage?: string) => {
    const imageUrl = specificImage || product.featuredImage;
    if (!imageUrl) return;

    setIsSaving(true);
    try {
      const res = await setCategoryHeroImage({
        categorySlug,
        heroImage: imageUrl,
        productId: product.id,
        productName: product.name,
      });

      if (res.success && res.settings) {
        setHeroData(res.settings);
        setSelectedProductId(product.id);
        setCustomUrlInput(imageUrl);
        showSuccess(`Hero image for ${categoryName} set to "${product.name}"`);
        if (onHeroUpdated) onHeroUpdated(imageUrl);
      } else {
        showError(res.error || 'Failed to update hero image.');
      }
    } catch {
      showError('Error updating category hero.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle saving a custom image URL
  const handleSaveCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    setIsSaving(true);
    try {
      const res = await setCategoryHeroImage({
        categorySlug,
        heroImage: customUrlInput.trim(),
        productId: undefined,
        productName: 'Custom Visual Asset',
      });

      if (res.success && res.settings) {
        setHeroData(res.settings);
        setSelectedProductId(null);
        showSuccess(`Custom hero image applied to ${categoryName}.`);
        if (onHeroUpdated) onHeroUpdated(customUrlInput.trim());
      } else {
        showError(res.error || 'Failed to save custom hero image.');
      }
    } catch {
      showError('Error saving custom hero image.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle resetting back to default catalogue image
  const handleResetToDefault = async () => {
    setIsSaving(true);
    try {
      const res = await resetCategoryHeroImage(categorySlug);
      if (res.success) {
        await loadCurrentSetting();
        showSuccess(`Hero image for ${categoryName} reset to catalogue default.`);
      } else {
        showError(res.error || 'Failed to reset hero image.');
      }
    } catch {
      showError('Error resetting hero image.');
    } finally {
      setIsSaving(false);
    }
  };

  const activeHeroImage = heroData?.heroImage || '/images/hero/hero-still-life.jpg';
  const isCustomized = Boolean(heroData?.productId || heroData?.productName);

  return (
    <div className="bg-[#141414] border border-gold/25 rounded-xs p-5 space-y-4 text-xs text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2 text-gold font-semibold uppercase tracking-wider text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Category Page Hero Cover Photo</span>
          </div>
          <p className="text-[11px] text-white/50">
            Select any available product from this collection to be featured as the main editorial still-life banner on{' '}
            <span className="text-gold-light font-mono font-medium">{viewUrl}</span>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {isCustomized && (
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={isSaving}
              className="px-2.5 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-white/15 text-white/70 hover:text-white rounded-xs text-[11px] font-medium transition-colors flex items-center space-x-1.5"
              title="Reset to default catalogue image"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Reset Default</span>
            </button>
          )}

          <Link
            href={viewUrl}
            target="_blank"
            className="px-2.5 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-white/15 text-white/80 hover:text-white rounded-xs text-[11px] font-medium transition-colors flex items-center space-x-1.5"
          >
            <span>Live Page</span>
            <ExternalLink className="w-3 h-3 text-gold" />
          </Link>
        </div>
      </div>

      {/* Toasts */}
      {successToast && (
        <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 rounded-xs flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="p-2.5 bg-red-950/70 border border-red-500/40 text-red-300 rounded-xs flex items-center space-x-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Active Preview */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-white/50 block font-semibold">
            Active Storefront Hero
          </span>

          <div className="relative aspect-[4/3] rounded-xs overflow-hidden bg-black border border-gold/40 shadow-md group">
            {activeHeroImage && (
              <Image
                src={activeHeroImage}
                alt="Active Category Hero"
                fill
                sizes="(max-width: 1024px) 100vw, 300px"
                className="object-cover object-center group-hover:scale-102 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Live watermark badge */}
            <div className="absolute top-2 left-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[9px] uppercase px-2 py-0.5 rounded-xs font-semibold tracking-wider flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Hero</span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 text-white text-[10px] flex items-center justify-between pointer-events-none">
              <span className="font-medium truncate max-w-[150px]">
                {heroData?.productName || 'Catalogue Still Life'}
              </span>
              <span className="text-gold-light text-[9px]">Rajshahi Studio</span>
            </div>
          </div>

          <p className="text-[11px] text-white/60">
            Source:{' '}
            <span className="text-white font-medium">
              {heroData?.productName ? `"${heroData.productName}"` : 'Default Catalogue Image'}
            </span>
          </p>
        </div>

        {/* Right: Available Products Selector */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-white/70 block font-semibold">
              Select Hero Image From Available {categoryName} Products ({categoryProducts.length})
            </span>

            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-[10px] text-gold hover:text-gold-light transition-colors underline"
            >
              {showCustomInput ? 'Hide custom URL' : 'Or enter custom image URL'}
            </button>
          </div>

          {/* Custom URL Field (Collapsible) */}
          {showCustomInput && (
            <form onSubmit={handleSaveCustomUrl} className="flex items-center space-x-2 pb-2">
              <input
                type="text"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="Enter image URL or path (e.g. /images/...)"
                className="flex-1 bg-[#0E0E0E] border border-white/20 rounded-xs px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="px-3 py-1.5 bg-gold hover:bg-gold-light text-ink font-semibold rounded-xs text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Apply
              </button>
            </form>
          )}

          {/* Products Grid / Shelf */}
          {categoryProducts.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-xs text-white/50 italic text-xs">
              No products found in this category yet. Add products in the Inventory tab first.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {categoryProducts.map((prod) => {
                const isActive =
                  selectedProductId === prod.id ||
                  activeHeroImage === prod.featuredImage ||
                  (heroData?.productId === prod.id && !showCustomInput);

                const hasMultipleColorways = prod.colorways && prod.colorways.length > 1;

                return (
                  <div
                    key={prod.id}
                    className={`relative p-2 rounded-xs border transition-all flex flex-col justify-between ${
                      isActive
                        ? 'bg-gold/15 border-gold shadow-sm ring-1 ring-gold/40'
                        : 'bg-[#1C1C1C] border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div>
                      {/* Thumbnail */}
                      <div className="relative aspect-square rounded-xs overflow-hidden bg-black mb-2 border border-white/15">
                        <Image
                          src={prod.featuredImage}
                          alt={prod.name}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                        {isActive && (
                          <div className="absolute top-1 right-1 bg-gold text-ink p-0.5 rounded-full shadow">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <h4 className="font-serif text-[11px] font-medium text-white truncate" title={prod.name}>
                        {prod.name}
                      </h4>
                      <p className="text-[10px] text-white/50 tabular-nums">
                        ৳{formatPrice(prod.price)}
                      </p>
                    </div>

                    {/* Colorway image options if product has multiple */}
                    {hasMultipleColorways && (
                      <div className="pt-1.5 flex items-center space-x-1 overflow-x-auto">
                        {prod.colorways.map((cw) => {
                          if (!cw.image) return null;
                          const isColorwayActive = activeHeroImage === cw.image;
                          return (
                            <button
                              key={cw.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectProduct(prod, cw.image || undefined);
                              }}
                              className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                                isColorwayActive ? 'scale-125 border-white ring-1 ring-gold' : 'border-black/30 hover:scale-110'
                              }`}
                              style={{ backgroundColor: cw.hex }}
                              title={`Set ${cw.name} variant as hero`}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectProduct(prod)}
                      disabled={isSaving || isActive}
                      className={`mt-2 w-full py-1 text-[10px] uppercase tracking-wider font-semibold rounded-xs transition-colors flex items-center justify-center space-x-1 ${
                        isActive
                          ? 'bg-gold/30 text-gold-light cursor-default border border-gold/40'
                          : 'bg-[#282828] hover:bg-gold hover:text-ink text-white/80 border border-white/15'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Active Hero</span>
                        </>
                      ) : (
                        <span>Set as Hero</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
