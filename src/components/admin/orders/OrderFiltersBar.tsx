'use client';

import React from 'react';
import Link from 'next/link';
import { Search, RotateCcw, MessageCircle, X } from 'lucide-react';

interface OrderFiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  regionFilter: string;
  onRegionChange: (region: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  onResetDemo: () => void;
  totalOrdersCount: number;
  pendingCount: number;
  verifiedCount: number;
  packagingCount: number;
  courierCount: number;
  deliveredCount: number;
  returnedAndCancelledCount: number;
  returnedCount: number;
  cancelledCount: number;
}

export default function OrderFiltersBar({
  searchQuery,
  onSearchChange,
  regionFilter,
  onRegionChange,
  statusFilter,
  onStatusChange,
  onResetDemo,
  totalOrdersCount,
  pendingCount,
  verifiedCount,
  packagingCount,
  courierCount,
  deliveredCount,
  returnedAndCancelledCount,
  returnedCount,
  cancelledCount,
}: OrderFiltersBarProps) {
  const statusPills = [
    { id: 'all', label: 'All Orders', count: totalOrdersCount },
    { id: 'pending', label: 'Pending WhatsApp', count: pendingCount },
    { id: 'verified', label: 'Verified', count: verifiedCount },
    { id: 'packaging', label: 'In Packaging', count: packagingCount },
    { id: 'handed_to_courier', label: 'With Courier', count: courierCount },
    { id: 'delivered', label: 'Delivered', count: deliveredCount },
    {
      id: 'returned_and_cancelled',
      label: 'Returned & Cancelled',
      count: returnedAndCancelledCount,
      isRedGroup: true,
    },
    { id: 'returned', label: 'Returned', count: returnedCount, isRedGroup: true },
    { id: 'cancelled', label: 'Cancelled', count: cancelledCount, isRedGroup: true },
  ];

  return (
    <div className="bg-[#171717] border border-white/10 p-5 rounded-xs space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-paper/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Order ID (AF-...), Patron Name, Phone, or Consignment..."
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

        {/* Region & Actions Bar */}
        <div className="flex items-center space-x-2">
          <select
            value={regionFilter}
            onChange={(e) => onRegionChange(e.target.value)}
            className="h-11 px-3 bg-[#222222] border border-white/10 rounded-xs text-xs text-paper focus:outline-none focus:border-gold"
          >
            <option value="all">All Delivery Regions</option>
            <option value="dhaka">Dhaka (৳80 / Free)</option>
            <option value="outside">Outside Dhaka (৳130 / Free)</option>
          </select>

          <button
            type="button"
            onClick={onResetDemo}
            className="h-11 px-3.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 rounded-xs text-xs text-paper/70 hover:text-gold transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
            title="Reset sample orders for local QA testing"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          <Link
            href="/admin/whatsapp"
            className="h-11 px-3.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 hover:border-emerald-500/40 rounded-xs text-xs text-paper/70 hover:text-emerald-400 transition-colors flex items-center space-x-1.5 shrink-0"
            title="Configure WhatsApp Verification Message Format"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">WhatsApp Format</span>
          </Link>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-[11px] text-paper/40 font-medium mr-1">Status:</span>
        {statusPills.map((pill) => {
          const isActive = statusFilter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onStatusChange(pill.id)}
              className={`px-3 py-1 rounded-xs text-[11px] transition-all flex items-center space-x-1.5 cursor-pointer ${
                isActive
                  ? pill.isRedGroup
                    ? 'bg-red-800 text-white font-semibold shadow-xs border border-red-500'
                    : 'bg-gold text-ink font-semibold shadow-xs'
                  : pill.isRedGroup && pill.count > 0
                  ? 'bg-[#221717] hover:bg-[#2c1c1c] text-red-300 border border-red-900/50 hover:border-red-700/60'
                  : 'bg-[#222222] text-paper/70 hover:text-paper hover:bg-[#2A2A2A] border border-white/5'
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                  isActive
                    ? pill.isRedGroup
                      ? 'bg-black/50 text-red-200'
                      : 'bg-ink text-gold'
                    : pill.isRedGroup && pill.count > 0
                    ? 'bg-red-950 text-red-300 border border-red-800/40'
                    : 'bg-black/40 text-paper/60'
                }`}
              >
                {pill.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
