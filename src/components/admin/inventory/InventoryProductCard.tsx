'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ExternalLink,
  Edit3,
  Copy,
  Eye,
  EyeOff,
  Clock,
  Package,
  Infinity,
  CheckCircle2,
  Save,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/formatPrice';
import { calculateSellingPrice } from '@/lib/pricing';

interface StockState {
  qty: number;
  mode: 'unlimited' | 'tracked';
  saving: boolean;
  saved: boolean;
  error: string | null;
}

interface InventoryProductCardProps {
  product: Product;
  effectiveProduct: Product;
  isCustomPiece: boolean;
  // Visibility
  isProductHidden: boolean;
  onToggleVisibility: (prod: Product, targetHidden: boolean) => void;
  isTogglingVisibility: boolean;
  // Badges
  onToggleBadge: (prod: Product, badgeKey: 'isNewDrop' | 'isBestseller') => void;
  // Inline Price Editing
  isEditingPrice: boolean;
  onStartEditPrice: (prod: Product) => void;
  onCancelEditPrice: () => void;
  basePriceInput: number | string;
  onBasePriceChange: (val: string) => void;
  discountInput: number | string;
  onDiscountChange: (val: string) => void;
  discountTypeInput: 'percent' | 'flat';
  onDiscountTypeToggle: () => void;
  onSavePrice: (prod: Product) => void;
  isSavingPrice: boolean;
  isSavedPrice: boolean;
  // Stock Controls
  stockState: StockState;
  onStockModeChange: (productId: string, mode: 'unlimited' | 'tracked') => void;
  onStockQtyChange: (productId: string, qty: number) => void;
  onQuickPreset: (prod: Product, target: 'in_stock' | 'low_stock' | 'sold_out') => void;
  onSaveStock: (prod: Product) => void;
  // Delete
  onOpenDeleteModal: (prod: Product) => void;
}

export default function InventoryProductCard({
  product,
  effectiveProduct,
  isCustomPiece,
  isProductHidden,
  onToggleVisibility,
  isTogglingVisibility,
  onToggleBadge,
  isEditingPrice,
  onStartEditPrice,
  onCancelEditPrice,
  basePriceInput,
  onBasePriceChange,
  discountInput,
  onDiscountChange,
  discountTypeInput,
  onDiscountTypeToggle,
  onSavePrice,
  isSavingPrice,
  isSavedPrice,
  stockState,
  onStockModeChange,
  onStockQtyChange,
  onQuickPreset,
  onSaveStock,
  onOpenDeleteModal,
}: InventoryProductCardProps) {
  // Compute stock status badge
  let stockBadge = (
    <span className="text-[10px] px-2 py-0.5 rounded-xs bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-medium">
      In Stock (Unlimited)
    </span>
  );
  if (stockState.mode === 'tracked') {
    if (stockState.qty === 0) {
      stockBadge = (
        <span className="text-[10px] px-2 py-0.5 rounded-xs bg-red-950/60 text-red-300 border border-red-800/40 font-bold">
          Sold Out (0 pcs)
        </span>
      );
    } else if (stockState.qty <= 2) {
      stockBadge = (
        <span className="text-[10px] px-2 py-0.5 rounded-xs bg-amber-950/60 text-amber-300 border border-amber-800/40 font-bold">
          Low Stock ({stockState.qty} left)
        </span>
      );
    } else {
      stockBadge = (
        <span className="text-[10px] px-2 py-0.5 rounded-xs bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-medium">
          In Stock ({stockState.qty} pcs)
        </span>
      );
    }
  }

  return (
    <div className="bg-[#171717] border border-white/10 hover:border-gold/30 transition-colors p-4 sm:p-5 rounded-xs flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5">
      {/* Left: Thumbnail & Name & Pricing */}
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <div className="relative w-16 h-20 bg-stone rounded-xs overflow-hidden shrink-0 border border-white/10">
          {product.featuredImage?.startsWith('data:') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.featuredImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={product.featuredImage || '/hero-jewel.png'}
              alt={product.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          )}
        </div>

        <div className="min-w-0 space-y-1.5 flex-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="text-[10px] uppercase font-bold text-gold tracking-wider block">
              {product.categoryLabel}
            </span>
            {isCustomPiece && (
              <span className="text-[9px] px-1.5 py-0.2 bg-gold/15 text-gold-light border border-gold/30 rounded-xs uppercase font-semibold">
                Custom Piece
              </span>
            )}
            {stockBadge}
            {isProductHidden ? (
              <span className="text-[10px] px-2 py-0.5 rounded-xs bg-amber-950/60 text-amber-300 border border-amber-800/40 flex items-center gap-1 font-medium">
                <EyeOff className="w-2.5 h-2.5" />
                Hidden from Store
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-xs bg-emerald-950/40 text-emerald-300/90 border border-emerald-800/30 flex items-center gap-1 font-medium">
                <Eye className="w-2.5 h-2.5" />
                Live on Store
              </span>
            )}
            {(() => {
              if (!product.createdAt) return null;
              const d = new Date(product.createdAt);
              if (isNaN(d.getTime())) return null;
              return (
                <span className="text-[10px] px-2 py-0.5 rounded-xs bg-white/5 text-paper/50 border border-white/10 flex items-center gap-1 font-mono">
                  <Clock className="w-2.5 h-2.5 text-paper/40" />
                  Added{' '}
                  {d.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              );
            })()}
          </div>

          <h3 className="text-base font-bold text-white tracking-tight truncate block max-w-md hover:text-gold transition-colors">
            {product.name}
          </h3>

          {/* Pricing with inline editor */}
          <div className="flex items-center space-x-3 text-xs flex-wrap gap-y-1">
            {isEditingPrice ? (
              (() => {
                const inlinePricing = calculateSellingPrice(
                  basePriceInput,
                  discountInput,
                  discountTypeInput
                );
                return (
                  <div className="flex items-center space-x-2 bg-[#222222] p-1.5 rounded-xs border border-gold/40 flex-wrap gap-y-1">
                    <div className="flex items-center space-x-1">
                      <span className="text-gold text-[10px] font-semibold">Price ৳:</span>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={basePriceInput}
                        onChange={(e) => onBasePriceChange(e.target.value)}
                        className="w-20 bg-[#171717] border border-white/20 text-paper text-xs px-1.5 py-0.5 rounded-xs focus:outline-none focus:border-gold font-mono"
                      />
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-paper/60 text-[10px]">Disc:</span>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max={discountTypeInput === 'percent' ? 100 : undefined}
                        value={discountInput}
                        onChange={(e) => onDiscountChange(e.target.value)}
                        placeholder="0"
                        className="w-16 bg-[#171717] border border-white/20 text-paper/90 text-xs px-1.5 py-0.5 rounded-xs focus:outline-none focus:border-gold font-mono"
                      />
                      <button
                        type="button"
                        onClick={onDiscountTypeToggle}
                        title="Toggle discount type between % and ৳"
                        className="px-1.5 py-0.5 bg-[#171717] border border-white/20 hover:border-gold text-[10px] text-gold font-mono rounded-xs cursor-pointer"
                      >
                        {discountTypeInput === 'percent' ? '%' : '৳'}
                      </button>
                    </div>
                    <div className="text-[10px] text-paper/70 font-mono flex items-center gap-1">
                      <span>=</span>
                      <span className="text-gold font-semibold">
                        ৳{formatPrice(inlinePricing.sellingPrice)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSavePrice(product)}
                      disabled={isSavingPrice}
                      className="px-2 py-0.5 bg-gold text-ink text-[11px] font-semibold rounded-xs hover:bg-gold-light transition-colors cursor-pointer"
                    >
                      {isSavingPrice ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEditPrice}
                      className="text-paper/40 hover:text-paper text-[11px] px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                );
              })()
            ) : (
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-gold tabular-nums tracking-tight">
                  ৳{formatPrice(effectiveProduct.price)}
                </span>
                {effectiveProduct.originalPrice &&
                  effectiveProduct.originalPrice > effectiveProduct.price && (
                    <>
                      <span className="text-xs text-zinc-400 line-through tabular-nums font-semibold">
                        ৳{formatPrice(effectiveProduct.originalPrice)}
                      </span>
                      {effectiveProduct.discount && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-bold font-mono">
                          {effectiveProduct.discountType === 'flat'
                            ? `৳${effectiveProduct.discount} OFF`
                            : `${effectiveProduct.discount}% OFF`}
                        </span>
                      )}
                    </>
                  )}
                <button
                  type="button"
                  onClick={() => onStartEditPrice(product)}
                  className="text-[10px] text-paper/40 hover:text-gold transition-colors underline underline-offset-2 ml-1 cursor-pointer"
                >
                  {isSavedPrice ? '✓ Saved' : 'Edit Price'}
                </button>
              </div>
            )}

            <span className="text-white/20">•</span>

            <Link
              href={`/${product.category}/${product.slug}`}
              target="_blank"
              className="text-[11px] text-gold-light/60 hover:text-gold hover:underline flex items-center gap-1"
            >
              <span>View PDP</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Middle: Edit, Duplicate, Visibility Toggle & Ribbon Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs w-full xl:w-auto">
        <Link
          href={`/admin/inventory/edit/${product.id}`}
          className="px-2.5 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 text-paper/70 hover:text-gold rounded-xs text-[11px] transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </Link>

        <Link
          href={`/admin/inventory/new?duplicate=${product.id}`}
          className="px-2.5 py-1.5 bg-[#222222] hover:bg-gold/15 hover:border-gold/40 border border-white/10 text-paper/70 hover:text-gold rounded-xs text-[11px] transition-colors flex items-center space-x-1.5 cursor-pointer"
          title="Duplicate this piece and its details into a new draft"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Duplicate</span>
        </Link>

        {/* Quick Visibility 1-Click Toggle */}
        <button
          type="button"
          onClick={() => onToggleVisibility(product, !isProductHidden)}
          disabled={isTogglingVisibility}
          className={`px-2.5 py-1.5 border rounded-xs text-[11px] transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer ${
            isProductHidden
              ? 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-600/40 text-amber-300'
              : 'bg-[#222222] hover:bg-[#2A2A2A] border-white/10 text-paper/60 hover:text-paper'
          }`}
          title={isProductHidden ? 'Click to make Live on storefront' : 'Click to Hide from storefront'}
        >
          {isTogglingVisibility ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
          ) : isProductHidden ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Hidden (Make Live)</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hide</span>
            </>
          )}
        </button>

        {/* Ribbon Badges Toggles */}
        <div className="flex items-center space-x-1 bg-[#222222] p-1 rounded-xs border border-white/10">
          <button
            type="button"
            onClick={() => onToggleBadge(product, 'isNewDrop')}
            className={`px-2 py-1 rounded-xs text-[10px] uppercase font-semibold transition-colors cursor-pointer ${
              effectiveProduct.isNewDrop
                ? 'bg-gold text-ink border border-gold/40'
                : 'text-paper/40 hover:text-paper'
            }`}
          >
            {effectiveProduct.isNewDrop ? '✓ New Drop' : '+ New Drop'}
          </button>
          <button
            type="button"
            onClick={() => onToggleBadge(product, 'isBestseller')}
            className={`px-2 py-1 rounded-xs text-[10px] uppercase font-semibold transition-colors cursor-pointer ${
              effectiveProduct.isBestseller
                ? 'bg-gold text-ink font-bold'
                : 'text-paper/40 hover:text-paper'
            }`}
          >
            {effectiveProduct.isBestseller ? '✓ Bestseller' : '+ Bestseller'}
          </button>
        </div>
      </div>

      {/* Right: Unified Stock Controls Suite */}
      <div className="flex flex-col sm:flex-row xl:flex-col gap-2 shrink-0 w-full xl:w-64 bg-[#1C1C1C] border border-white/10 rounded-xs p-3 space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center space-x-1.5">
            <Package className="w-3.5 h-3.5 text-gold" />
            <span className="text-paper/70 uppercase tracking-wider font-semibold">
              Inventory Stock
            </span>
          </div>
          {stockState.saved && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Saved!
            </span>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-[#141414] p-0.5 rounded-xs border border-white/10 text-[10px]">
          <button
            type="button"
            onClick={() => onStockModeChange(product.id, 'unlimited')}
            className={`py-1 rounded-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer ${
              stockState.mode === 'unlimited'
                ? 'bg-gold text-ink font-semibold'
                : 'text-paper/60 hover:text-paper'
            }`}
          >
            <Infinity className="w-3 h-3" />
            <span>Unlimited</span>
          </button>
          <button
            type="button"
            onClick={() => onStockModeChange(product.id, 'tracked')}
            className={`py-1 rounded-xs font-medium transition-colors cursor-pointer ${
              stockState.mode === 'tracked'
                ? 'bg-gold text-ink font-semibold'
                : 'text-paper/60 hover:text-paper'
            }`}
          >
            Track Count
          </button>
        </div>

        {/* Tracked numeric input */}
        {stockState.mode === 'tracked' && (
          <div className="flex items-center justify-between bg-[#141414] border border-white/10 p-1 rounded-xs">
            <span className="text-[10px] text-paper/50 pl-1 font-mono">Qty:</span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => onStockQtyChange(product.id, Math.max(0, stockState.qty - 1))}
                className="w-6 h-6 bg-[#222222] border border-white/10 rounded-xs text-paper/70 hover:text-paper flex items-center justify-center text-sm leading-none transition-colors cursor-pointer"
              >
                −
              </button>
              <input
                type="number"
                min="0"
                value={stockState.qty}
                onChange={(e) =>
                  onStockQtyChange(product.id, Math.max(0, Number(e.target.value)))
                }
                className="w-14 bg-[#1C1C1C] border border-white/15 focus:border-gold px-1 py-0.5 text-paper rounded-xs text-xs font-mono text-center focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onStockQtyChange(product.id, stockState.qty + 1)}
                className="w-6 h-6 bg-[#222222] border border-white/10 rounded-xs text-paper/70 hover:text-paper flex items-center justify-center text-sm leading-none transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Quick 1-Click Status Presets */}
        <div className="grid grid-cols-3 gap-1 pt-0.5">
          <button
            type="button"
            onClick={() => onQuickPreset(product, 'in_stock')}
            className="py-1 px-1 bg-[#141414] hover:bg-emerald-950/40 hover:border-emerald-600/40 border border-white/5 rounded-xs text-[9px] text-paper/60 hover:text-emerald-300 transition-colors text-center font-medium cursor-pointer"
            title="Set as Unlimited In Stock"
          >
            In Stock
          </button>
          <button
            type="button"
            onClick={() => onQuickPreset(product, 'low_stock')}
            className="py-1 px-1 bg-[#141414] hover:bg-amber-950/40 hover:border-amber-600/40 border border-white/5 rounded-xs text-[9px] text-paper/60 hover:text-amber-300 transition-colors text-center font-medium cursor-pointer"
            title="Set count to 2 pieces"
          >
            Low (2)
          </button>
          <button
            type="button"
            onClick={() => onQuickPreset(product, 'sold_out')}
            className="py-1 px-1 bg-[#141414] hover:bg-red-950/40 hover:border-red-600/40 border border-white/5 rounded-xs text-[9px] text-paper/60 hover:text-red-300 transition-colors text-center font-medium cursor-pointer"
            title="Set count to 0 (Pause purchases)"
          >
            Sold Out
          </button>
        </div>

        {/* Save Stock button */}
        <button
          type="button"
          onClick={() => onSaveStock(product)}
          disabled={stockState.saving}
          className="w-full py-1.5 px-3 bg-[#262626] hover:bg-gold hover:text-ink border border-white/10 hover:border-gold text-paper/80 font-medium rounded-xs text-[11px] transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
        >
          {stockState.saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : stockState.saved ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Stock Saved</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Stock</span>
            </>
          )}
        </button>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => onOpenDeleteModal(product)}
          className="w-full flex items-center justify-center space-x-1.5 py-1 px-2 bg-transparent hover:bg-red-950/30 border border-transparent hover:border-red-600/30 text-paper/40 hover:text-red-400 rounded-xs transition-colors text-[10px] cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Product</span>
        </button>
      </div>
    </div>
  );
}
