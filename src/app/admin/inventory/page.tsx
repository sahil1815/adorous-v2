'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, CATEGORIES } from '@/data/catalogue';
import { Product } from '@/types';
import { useInventory } from '@/context/InventoryContext';
import {
  Search,
  Filter,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Tag,
  RotateCcw,
  ExternalLink,
  Edit3,
  Save,
  Check,
  Plus,
  Trash2
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
    resetInventoryOverrides,
    getEffectiveProduct,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState<number>(0);
  const [origPriceInput, setOrigPriceInput] = useState<number>(0);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

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
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all inventory, custom products, price, and badge overrides to factory catalog defaults?')) {
                resetInventoryOverrides();
              }
            }}
            className="px-3.5 py-2 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 rounded-xs text-xs text-paper/70 hover:text-gold transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

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

                {/* Middle: Badges & Price Edit */}
                <div className="flex flex-wrap items-center gap-4 text-xs w-full md:w-auto">
                  {/* Price Controls */}
                  {isEditingPrice ? (
                    <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-xs border border-white/10">
                      <div>
                        <span className="text-[9px] text-paper/40 block">Price (৳)</span>
                        <input
                          type="number"
                          value={priceInput}
                          onChange={(e) => setPriceInput(Number(e.target.value))}
                          className="w-20 h-7 px-1.5 bg-[#222222] border border-gold/30 rounded-xs text-xs font-mono text-paper"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-paper/40 block">Was (৳)</span>
                        <input
                          type="number"
                          value={origPriceInput}
                          onChange={(e) => setOrigPriceInput(Number(e.target.value))}
                          className="w-20 h-7 px-1.5 bg-[#222222] border border-white/10 rounded-xs text-xs font-mono text-paper"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSavePrice(prod.id)}
                        className="self-end h-7 px-2.5 bg-gold text-ink font-semibold text-[10px] rounded-xs uppercase tracking-wider flex items-center space-x-1"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartEditPrice(prod)}
                      className="px-2.5 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 text-paper/70 hover:text-gold rounded-xs text-[11px] transition-colors flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Price</span>
                      {isSaved && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  )}

                  {/* Ribbon Badges Toggles */}
                  <div className="flex items-center space-x-2 bg-[#222222] p-1.5 rounded-xs border border-white/10">
                    <button
                      type="button"
                      onClick={() =>
                        updateProductBadges(prod.id, {
                          isNewDrop: !effective.isNewDrop,
                        })
                      }
                      className={`px-2 py-1 rounded-xs text-[10px] uppercase font-semibold transition-colors ${
                        effective.isNewDrop
                          ? 'bg-ink text-gold-light border border-gold/40'
                          : 'text-paper/40 hover:text-paper'
                      }`}
                    >
                      {effective.isNewDrop ? '✓ New Drop' : '+ New Drop'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateProductBadges(prod.id, {
                          isBestseller: !effective.isBestseller,
                        })
                      }
                      className={`px-2 py-1 rounded-xs text-[10px] uppercase font-semibold transition-colors ${
                        effective.isBestseller
                          ? 'bg-gold text-ink font-bold'
                          : 'text-paper/40 hover:text-paper'
                      }`}
                    >
                      {effective.isBestseller ? '✓ Bestseller' : '+ Bestseller'}
                    </button>
                  </div>
                </div>

                {/* Right: Stock Status Selector */}
                <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto justify-between md:justify-start">
                  <span className="text-[11px] text-paper/50 md:hidden">Stock:</span>
                  <div className="flex items-center space-x-1 bg-[#222222] p-1 rounded-xs border border-white/10">
                    <button
                      type="button"
                      onClick={() => updateProductStock(prod.id, 'in_stock')}
                      className={`px-2.5 py-1 rounded-xs text-[10px] font-semibold transition-colors ${
                        stockStatus === 'in_stock'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-paper/50 hover:text-paper'
                      }`}
                    >
                      In Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProductStock(prod.id, 'low_stock')}
                      className={`px-2.5 py-1 rounded-xs text-[10px] font-semibold transition-colors ${
                        stockStatus === 'low_stock'
                          ? 'bg-amber-600 text-ink shadow-xs'
                          : 'text-paper/50 hover:text-paper'
                      }`}
                    >
                      Low Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProductStock(prod.id, 'sold_out')}
                      className={`px-2.5 py-1 rounded-xs text-[10px] font-semibold transition-colors ${
                        stockStatus === 'sold_out'
                          ? 'bg-red-700 text-white shadow-xs'
                          : 'text-paper/50 hover:text-paper'
                      }`}
                    >
                      Sold Out
                    </button>
                  </div>

                  {customProducts.some((cp) => cp.id === prod.id) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Permanently delete custom piece "${prod.name}" from catalogue?`)) {
                          deleteProduct(prod.id);
                        }
                      }}
                      className="p-1.5 bg-[#222222] hover:bg-red-950/50 border border-white/10 hover:border-red-600/40 text-paper/40 hover:text-red-400 rounded-xs transition-colors"
                      title="Delete Custom Piece"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
