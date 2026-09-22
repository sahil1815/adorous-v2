'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, CATEGORIES } from '@/data/catalogue';
import { Product } from '@/types';
import { useInventory } from '@/context/InventoryContext';
import { deleteProductAction, updateStockAction } from '@/app/actions/productActions';
import {
  Search,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Save,
  Check,
  Plus,
  Trash2,
  Package,
  Infinity,
  Loader2,
} from 'lucide-react';

export default function AdminInventoryPage() {
  const {
    overrides,
    customProducts,
    allProducts,
    deleteProduct,
    updateProductStock,
    updateProductBadges,
    updateProductPrice,
    getEffectiveProduct,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState<number>(0);
  const [origPriceInput, setOrigPriceInput] = useState<number>(0);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Stock qty per-product state (productId -> { qty: number | null, saving: boolean, saved: boolean })
  const [stockInputs, setStockInputs] = useState<Record<string, { qty: number; mode: 'unlimited' | 'tracked'; saving: boolean; saved: boolean }>>({});

  const getStockState = (prod: Product) => {
    if (stockInputs[prod.id]) return stockInputs[prod.id];
    // Default: unlimited for all products (DB products may override this via their stockQty field)
    return { qty: 0, mode: 'unlimited' as const, saving: false, saved: false };
  };

  const handleStockModeChange = (productId: string, mode: 'unlimited' | 'tracked') => {
    setStockInputs(prev => ({ ...prev, [productId]: { ...getStockState({ id: productId } as Product), mode, saved: false } }));
  };

  const handleStockQtyChange = (productId: string, qty: number) => {
    setStockInputs(prev => ({ ...prev, [productId]: { ...getStockState({ id: productId } as Product), qty, saved: false } }));
  };

  const handleSaveStock = async (productId: string) => {
    const s = getStockState({ id: productId } as Product);
    setStockInputs(prev => ({ ...prev, [productId]: { ...s, saving: true } }));
    const qty = s.mode === 'unlimited' ? null : Math.max(0, s.qty);
    await updateStockAction(productId, qty);
    setStockInputs(prev => ({ ...prev, [productId]: { ...s, saving: false, saved: true } }));
    setTimeout(() => setStockInputs(prev => ({ ...prev, [productId]: { ...prev[productId], saved: false } })), 2000);
  };

  // Filter products across all (custom + catalogue)
  const filteredProducts = allProducts.filter((prod) => {
    const cleanSearch = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !cleanSearch ||
      prod.name.toLowerCase().includes(cleanSearch) ||
      prod.slug.toLowerCase().includes(cleanSearch) ||
      prod.categoryLabel.toLowerCase().includes(cleanSearch);

    const matchesCategory =
      selectedCategory === 'all' || prod.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleStartEditPrice = (prod: Product) => {
    const effective = getEffectiveProduct(prod);
    setEditingPriceId(prod.id);
    setPriceInput(effective.price);
    setOrigPriceInput(effective.originalPrice || 0);
  };

  const handleSavePrice = (productId: string) => {
    updateProductPrice(productId, Number(priceInput), origPriceInput ? Number(origPriceInput) : undefined);
    setEditingPriceId(null);
    setSavedSuccessId(productId);
    setTimeout(() => setSavedSuccessId(null), 1500);
  };

  // Stock breakdown stats
  const totalItems = allProducts.length;
  const inStockCount = allProducts.filter(
    (p) => (overrides[p.id]?.stockStatus || 'in_stock') === 'in_stock'
  ).length;
  const lowStockCount = allProducts.filter(
    (p) => overrides[p.id]?.stockStatus === 'low_stock'
  ).length;
  const soldOutCount = allProducts.filter(
    (p) => overrides[p.id]?.stockStatus === 'sold_out'
  ).length;

  return (
    <div className="space-y-8">
      {/* Top Header & Stock Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-paper font-normal">
            Inventory & Catalogue Controls
          </h1>
          <p className="text-xs text-paper/60 mt-1">
            Toggle real-time stock availability, badge ribbons, seasonal prices, and add new product listings.
          </p>
        </div>

        <div className="flex items-center space-x-3">

          <Link
            href="/admin/inventory/new"
            className="px-4 py-2 bg-gold hover:bg-gold-light text-ink font-semibold rounded-xs transition-colors flex items-center space-x-2 text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#171717] border border-white/10 p-4 rounded-xs">
          <span className="text-[10px] uppercase text-paper/50 block font-medium">Total Designs</span>
          <span className="text-2xl font-serif text-paper font-semibold mt-0.5 block">{totalItems}</span>
          <span className="text-[10px] text-paper/40">Active catalog</span>
        </div>

        <div className="bg-[#171717] border border-emerald-600/30 p-4 rounded-xs">
          <span className="text-[10px] uppercase text-emerald-400 block font-medium">In Stock</span>
          <span className="text-2xl font-serif text-emerald-300 font-semibold mt-0.5 block">{inStockCount}</span>
          <span className="text-[10px] text-emerald-200/50">Ready for dispatch</span>
        </div>

        <div className="bg-[#171717] border border-amber-600/30 p-4 rounded-xs">
          <span className="text-[10px] uppercase text-amber-400 block font-medium">Low Stock Warning</span>
          <span className="text-2xl font-serif text-amber-300 font-semibold mt-0.5 block">{lowStockCount}</span>
          <span className="text-[10px] text-amber-200/50">Under 3 pieces left</span>
        </div>

        <div className="bg-[#171717] border border-red-600/30 p-4 rounded-xs">
          <span className="text-[10px] uppercase text-red-400 block font-medium">Sold Out</span>
          <span className="text-2xl font-serif text-red-300 font-semibold mt-0.5 block">{soldOutCount}</span>
          <span className="text-[10px] text-red-200/50">Purchases paused</span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-[#171717] border border-white/10 p-5 rounded-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-paper/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search designs by title, category, or slug..."
            className="w-full h-11 pl-10 pr-4 bg-[#222222] border border-white/10 rounded-xs text-xs text-paper placeholder:text-paper/40 focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xs text-[11px] transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gold text-ink font-semibold'
                : 'bg-[#222222] text-paper/70 hover:text-paper'
            }`}
          >
            All Categories ({PRODUCTS.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-xs text-[11px] transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-gold text-ink font-semibold'
                  : 'bg-[#222222] text-paper/70 hover:text-paper'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Products Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-paper/60 px-1">
          <span>Showing {filteredProducts.length} items</span>
          <span className="text-[11px]">100% Still-Life photography on warm stone plinths</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map((prod) => {
            const effective = getEffectiveProduct(prod);
            const override = overrides[prod.id] || {};
            const stockStatus = override.stockStatus || 'in_stock';
            const isEditingPrice = editingPriceId === prod.id;
            const isSaved = savedSuccessId === prod.id;

            return (
              <div
                key={prod.id}
                className="bg-[#171717] border border-white/10 hover:border-gold/30 transition-colors p-4 sm:p-5 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Left: Thumbnail & Name */}
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="relative w-16 h-20 bg-stone rounded-xs overflow-hidden shrink-0 border border-white/10">
                    <Image
                      src={prod.featuredImage}
                      alt={prod.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-semibold text-gold tracking-wider block">
                        {prod.categoryLabel}
                      </span>
                      {customProducts.some((cp) => cp.id === prod.id) && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-gold/15 text-gold-light border border-gold/30 rounded-xs uppercase font-semibold">
                          Custom Piece
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-base text-paper font-medium truncate block">
                      {prod.name}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="font-semibold text-paper tabular-nums">
                        ৳{effective.price.toLocaleString('en-US')}
                      </span>
                      {effective.originalPrice && (
                        <span className="text-[11px] text-paper/40 line-through tabular-nums">
                          ৳{effective.originalPrice.toLocaleString('en-US')}
                        </span>
                      )}
                      <Link
                        href={`/${prod.category}/${prod.slug}`}
                        target="_blank"
                        className="text-[11px] text-gold-light/60 hover:text-gold hover:underline flex items-center gap-1"
                      >
                        <span>View PDP</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Middle: Edit / Badges / Price */}
                <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
                  {/* Edit Product button for all products */}
                  <Link
                    href={`/admin/inventory/edit/${prod.id}`}
                    className="px-2.5 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 text-paper/70 hover:text-gold rounded-xs text-[11px] transition-colors flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Product</span>
                  </Link>

                  {/* Ribbon Badges Toggles */}
                  <div className="flex items-center space-x-2 bg-[#222222] p-1.5 rounded-xs border border-white/10">
                    <button
                      type="button"
                      onClick={() => updateProductBadges(prod.id, { isNewDrop: !effective.isNewDrop })}
                      className={`px-2 py-1 rounded-xs text-[10px] uppercase font-semibold transition-colors ${effective.isNewDrop ? 'bg-gold text-ink border border-gold/40' : 'text-paper/40 hover:text-paper'}`}
                    >
                      {effective.isNewDrop ? '✓ New Drop' : '+ New Drop'}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProductBadges(prod.id, { isBestseller: !effective.isBestseller })}
                      className={`px-2 py-1 rounded-xs text-[10px] uppercase font-semibold transition-colors ${effective.isBestseller ? 'bg-gold text-ink font-bold' : 'text-paper/40 hover:text-paper'}`}
                    >
                      {effective.isBestseller ? '✓ Bestseller' : '+ Bestseller'}
                    </button>
                  </div>
                </div>

                {/* Right: Stock Controls */}
                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                  {customProducts.some((cp) => cp.id === prod.id) ? (
                    /* ── Numeric stock tracking for DB products ── */
                    <div className="bg-[#1C1C1C] border border-white/10 rounded-xs p-2 space-y-2">
                      <div className="flex items-center space-x-1 text-[10px]">
                        <Package className="w-3 h-3 text-gold" />
                        <span className="text-paper/60 uppercase tracking-wider font-semibold">Stock</span>
                      </div>

                      {/* Mode switcher */}
                      <div className="flex items-center space-x-1 bg-[#141414] p-0.5 rounded-xs border border-white/10 text-[10px]">
                        <button type="button"
                          onClick={() => handleStockModeChange(prod.id, 'unlimited')}
                          className={`px-2 py-0.5 rounded-xs flex items-center space-x-1 transition-colors ${getStockState(prod).mode === 'unlimited' ? 'bg-gold text-ink font-semibold' : 'text-paper/60 hover:text-paper'}`}>
                          <Infinity className="w-3 h-3" /><span>Unlimited</span>
                        </button>
                        <button type="button"
                          onClick={() => handleStockModeChange(prod.id, 'tracked')}
                          className={`px-2 py-0.5 rounded-xs transition-colors ${getStockState(prod).mode === 'tracked' ? 'bg-gold text-ink font-semibold' : 'text-paper/60 hover:text-paper'}`}>
                          Track
                        </button>
                      </div>

                      {getStockState(prod).mode === 'tracked' && (
                        <div className="flex items-center space-x-1">
                          <button type="button"
                            onClick={() => handleStockQtyChange(prod.id, Math.max(0, getStockState(prod).qty - 1))}
                            className="w-6 h-6 bg-[#222222] border border-white/10 rounded-xs text-paper/60 hover:text-paper flex items-center justify-center text-sm leading-none">−</button>
                          <input
                            type="number" min="0"
                            value={getStockState(prod).qty}
                            onChange={(e) => handleStockQtyChange(prod.id, Math.max(0, Number(e.target.value)))}
                            className="w-14 bg-[#141414] border border-white/15 focus:border-gold px-1.5 py-0.5 text-paper rounded-xs text-xs font-mono text-center focus:outline-none"
                          />
                          <button type="button"
                            onClick={() => handleStockQtyChange(prod.id, getStockState(prod).qty + 1)}
                            className="w-6 h-6 bg-[#222222] border border-white/10 rounded-xs text-paper/60 hover:text-paper flex items-center justify-center text-sm leading-none">+</button>
                        </div>
                      )}

                      <button type="button" onClick={() => handleSaveStock(prod.id)}
                        disabled={getStockState(prod).saving}
                        className="w-full px-2 py-1 bg-[#252525] hover:bg-[#303030] border border-white/10 text-paper/70 hover:text-gold rounded-xs text-[10px] transition-colors flex items-center justify-center space-x-1">
                        {getStockState(prod).saving ? <Loader2 className="w-3 h-3 animate-spin" /> :
                          getStockState(prod).saved ? <><CheckCircle2 className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Saved!</span></> :
                            <><Package className="w-3 h-3" /><span>Save Stock</span></>}
                      </button>
                    </div>
                  ) : (
                    /* ── Status toggle for static catalogue products ── */
                    <div className="flex items-center space-x-1 bg-[#222222] p-1 rounded-xs border border-white/10">
                      <button type="button" onClick={() => updateProductStock(prod.id, 'in_stock')}
                        className={`px-2.5 py-1 rounded-xs text-[10px] font-semibold transition-colors ${stockStatus === 'in_stock' ? 'bg-emerald-700 text-white shadow-xs' : 'text-paper/50 hover:text-paper'}`}>
                        In Stock
                      </button>
                      <button type="button" onClick={() => updateProductStock(prod.id, 'low_stock')}
                        className={`px-2.5 py-1 rounded-xs text-[10px] font-semibold transition-colors ${stockStatus === 'low_stock' ? 'bg-amber-600 text-ink shadow-xs' : 'text-paper/50 hover:text-paper'}`}>
                        Low Stock
                      </button>
                      <button type="button" onClick={() => updateProductStock(prod.id, 'sold_out')}
                        className={`px-2.5 py-1 rounded-xs text-[10px] font-semibold transition-colors ${stockStatus === 'sold_out' ? 'bg-red-700 text-white shadow-xs' : 'text-paper/50 hover:text-paper'}`}>
                        Sold Out
                      </button>
                    </div>
                  )}

                  {/* Delete button — only for custom products */}
                  {customProducts.some((cp) => cp.id === prod.id) && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Permanently delete custom piece "${prod.name}" from catalogue?`)) {
                          deleteProduct(prod.id);
                          await deleteProductAction(prod.id);
                        }
                      }}
                      className="w-full flex items-center justify-center space-x-1 p-1.5 bg-[#222222] hover:bg-red-950/50 border border-white/10 hover:border-red-600/40 text-paper/40 hover:text-red-400 rounded-xs transition-colors text-[10px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
