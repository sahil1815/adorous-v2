'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InventoryMetricsHeaderProps {
  totalItems: number;
  visibleCount: number;
  hiddenCount: number;
  inStockCount: number;
  lowStockCount: number;
  soldOutCount: number;
  visibilityFilter: 'all' | 'visible' | 'hidden';
  onSelectVisibilityFilter: (filter: 'all' | 'visible' | 'hidden') => void;
}

export default function InventoryMetricsHeader({
  totalItems,
  visibleCount,
  hiddenCount,
  inStockCount,
  lowStockCount,
  soldOutCount,
  visibilityFilter,
  onSelectVisibilityFilter,
}: InventoryMetricsHeaderProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Total Designs */}
      <button
        type="button"
        onClick={() => onSelectVisibilityFilter('all')}
        className={`text-left bg-[#171717] border p-4 rounded-xs transition-all cursor-pointer ${
          visibilityFilter === 'all'
            ? 'border-white/40 bg-[#1c1c1c] shadow-sm'
            : 'border-white/10 hover:border-white/30'
        }`}
      >
        <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-bold">
          Total Designs
        </span>
        <span className="text-3xl font-extrabold tabular-nums tracking-tight text-white mt-1 block">
          {totalItems}
        </span>
        <span className="text-xs text-zinc-400 font-medium">Active catalog</span>
      </button>

      {/* 2. Live on Store */}
      <button
        type="button"
        onClick={() => onSelectVisibilityFilter('visible')}
        className={`text-left bg-[#171717] border p-4 rounded-xs transition-all cursor-pointer ${
          visibilityFilter === 'visible'
            ? 'border-emerald-500 bg-emerald-950/30 shadow-sm ring-1 ring-emerald-500/40'
            : 'border-emerald-600/40 hover:border-emerald-500/70 hover:bg-emerald-950/20'
        }`}
      >
        <span className="text-[11px] uppercase tracking-wider text-emerald-400 block font-bold flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> Live on Store
        </span>
        <span className="text-3xl font-extrabold tabular-nums tracking-tight text-emerald-400 mt-1 block">
          {visibleCount}
        </span>
        <span className="text-xs text-emerald-300/80 font-medium">Discoverable to shoppers</span>
      </button>

      {/* 3. Hidden from Store */}
      <button
        type="button"
        onClick={() => onSelectVisibilityFilter('hidden')}
        className={`text-left bg-[#171717] border p-4 rounded-xs transition-all cursor-pointer ${
          visibilityFilter === 'hidden'
            ? 'border-amber-500 bg-amber-950/30 shadow-sm ring-1 ring-amber-500/40'
            : 'border-amber-600/40 hover:border-amber-500/70 hover:bg-amber-950/20'
        }`}
      >
        <span className="text-[11px] uppercase tracking-wider text-amber-400 block font-bold flex items-center gap-1.5">
          <EyeOff className="w-3.5 h-3.5" /> Hidden from Store
        </span>
        <span className="text-3xl font-extrabold tabular-nums tracking-tight text-amber-400 mt-1 block">
          {hiddenCount}
        </span>
        <span className="text-xs text-amber-300/80 font-medium">Private / draft pieces</span>
      </button>

      {/* 4. In Stock */}
      <div className="bg-[#171717] border border-white/10 p-4 rounded-xs">
        <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-bold">
          In Stock
        </span>
        <span className="text-3xl font-extrabold tabular-nums tracking-tight text-white mt-1 block">
          {inStockCount}
        </span>
        <span className="text-xs text-zinc-400 font-medium">Ready for dispatch</span>
      </div>

      {/* 5. Stock Alert */}
      <div className="bg-[#171717] border border-rose-600/40 p-4 rounded-xs col-span-2 sm:col-span-1">
        <span className="text-[11px] uppercase tracking-wider text-rose-400 block font-bold">
          Stock Alert
        </span>
        <span className="text-3xl font-extrabold tabular-nums tracking-tight text-rose-400 mt-1 block">
          {lowStockCount + soldOutCount}
        </span>
        <span className="text-xs text-rose-300/80 font-medium">
          {lowStockCount} low · {soldOutCount} sold out
        </span>
      </div>
    </div>
  );
}
