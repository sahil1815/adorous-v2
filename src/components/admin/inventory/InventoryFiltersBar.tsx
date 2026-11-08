'use client';

import React from 'react';
import { Search, Eye, EyeOff, X } from 'lucide-react';
import { CATEGORIES } from '@/data/catalogue';
import { Product } from '@/types';

interface InventoryFiltersBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  visibilityFilter: 'all' | 'visible' | 'hidden';
  onVisibilityChange: (filter: 'all' | 'visible' | 'hidden') => void;
  activeProducts: Product[];
  visibleCount: number;
  hiddenCount: number;
}

export default function InventoryFiltersBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  visibilityFilter,
  onVisibilityChange,
  activeProducts,
  visibleCount,
  hiddenCount,
}: InventoryFiltersBarProps) {
  const isFiltered =
    selectedCategory !== 'all' || visibilityFilter !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="bg-[#171717] border border-white/10 p-5 rounded-xs space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-paper/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search designs by title, category, or slug..."
          className="w-full h-11 pl-10 pr-9 bg-[#222222] border border-white/10 rounded-xs text-xs text-paper placeholder:text-paper/40 focus:outline-none focus:border-gold transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/40 hover:text-paper p-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <button
          type="button"
          onClick={() => onCategoryChange('all')}
          className={`px-3 py-1.5 rounded-xs text-[11px] transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-gold text-ink font-semibold'
              : 'bg-[#222222] text-paper/70 hover:text-paper'
          }`}
        >
          All Categories ({activeProducts.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = activeProducts.filter((p) => p.category === cat.slug).length;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onCategoryChange(cat.slug)}
              className={`px-3 py-1.5 rounded-xs text-[11px] transition-colors cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-gold text-ink font-semibold'
                  : 'bg-[#222222] text-paper/70 hover:text-paper'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Visibility Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[10px] uppercase font-semibold text-paper/40 tracking-wider mr-1">
            Store Visibility:
          </span>
          <button
            type="button"
            onClick={() => onVisibilityChange('all')}
            className={`px-2.5 py-1 rounded-xs text-[11px] font-medium transition-colors cursor-pointer ${
              visibilityFilter === 'all'
                ? 'bg-paper/20 text-paper border border-white/20 font-semibold'
                : 'bg-[#222222] text-paper/60 hover:text-paper border border-transparent'
            }`}
          >
            All Pieces ({activeProducts.length})
          </button>
          <button
            type="button"
            onClick={() => onVisibilityChange('visible')}
            className={`px-2.5 py-1 rounded-xs text-[11px] font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
              visibilityFilter === 'visible'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 font-semibold'
                : 'bg-[#222222] text-paper/60 hover:text-emerald-300 border border-transparent'
            }`}
          >
            <Eye className="w-3 h-3 text-emerald-400" />
            <span>Live on Store ({visibleCount})</span>
          </button>
          <button
            type="button"
            onClick={() => onVisibilityChange('hidden')}
            className={`px-2.5 py-1 rounded-xs text-[11px] font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
              visibilityFilter === 'hidden'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/50 font-semibold'
                : 'bg-[#222222] text-paper/60 hover:text-amber-300 border border-transparent'
            }`}
          >
            <EyeOff className="w-3 h-3 text-amber-400" />
            <span>Hidden Pieces ({hiddenCount})</span>
          </button>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              onCategoryChange('all');
              onVisibilityChange('all');
              onSearchChange('');
            }}
            className="text-[11px] text-paper/40 hover:text-gold underline transition-colors cursor-pointer"
          >
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}
