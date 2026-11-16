'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { AdminOrder } from '@/context/OrdersContext';

interface OrderStatsHeaderProps {
  orders: AdminOrder[];
  statusFilter: string;
  onSelectStatusFilter: (status: string) => void;
}

export default function OrderStatsHeader({
  orders,
  statusFilter,
  onSelectStatusFilter,
}: OrderStatsHeaderProps) {
  // Stats calculation
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const packagingCount = orders.filter((o) => o.status === 'packaging').length;
  const courierCount = orders.filter((o) => o.status === 'handed_to_courier').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const returnedCount = orders.filter((o) => o.status === 'returned').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;
  const returnedAndCancelledCount = returnedCount + cancelledCount;

  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const deliveredRevenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.grandTotal, 0);
  const returnedAndCancelledRevenue = orders
    .filter((o) => o.status === 'returned' || o.status === 'cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  return (
    <div className="space-y-3">
      {/* 6 Top Operational KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Total Orders */}
        <button
          type="button"
          onClick={() => onSelectStatusFilter('all')}
          className={`text-left bg-[#161616] border p-4 rounded-xs space-y-1.5 transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'border-gold bg-[#1c1a15] shadow-sm ring-1 ring-gold/40'
              : 'border-white/10 hover:border-gold/50 hover:bg-[#1a1a1a]'
          }`}
        >
          <span className="text-[11px] uppercase tracking-wider text-zinc-300 block font-bold">
            Total Orders
          </span>
          <div className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
            {totalOrders}
          </div>
          <span className="text-xs text-zinc-400 font-medium block">
            Logged in System
          </span>
        </button>

        {/* 2. Pending Call */}
        <button
          type="button"
          onClick={() => onSelectStatusFilter('pending')}
          className={`text-left bg-[#161616] border p-4 rounded-xs space-y-1.5 transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'border-amber-400 bg-amber-950/40 shadow-sm ring-1 ring-amber-400/50'
              : 'border-amber-600/30 hover:border-amber-400/70 hover:bg-amber-950/20'
          }`}
        >
          <span className="text-[11px] uppercase tracking-wider text-amber-300 block font-bold">
            Pending Call
          </span>
          <div className="text-3xl font-extrabold text-amber-300 tabular-nums tracking-tight">
            {pendingCount}
          </div>
          <span className="text-xs text-amber-200/80 font-medium block">
            Needs verification
          </span>
        </button>

        {/* 3. In Packaging */}
        <button
          type="button"
          onClick={() => onSelectStatusFilter('packaging')}
          className={`text-left bg-[#161616] border p-4 rounded-xs space-y-1.5 transition-all cursor-pointer ${
            statusFilter === 'packaging'
              ? 'border-purple-400 bg-purple-950/40 shadow-sm ring-1 ring-purple-400/50'
              : 'border-purple-600/30 hover:border-purple-400/70 hover:bg-purple-950/20'
          }`}
        >
          <span className="text-[11px] uppercase tracking-wider text-purple-300 block font-bold">
            In Packaging
          </span>
          <div className="text-3xl font-extrabold text-purple-200 tabular-nums tracking-tight">
            {packagingCount}
          </div>
          <span className="text-xs text-purple-200/80 font-medium block">
            Inspecting & sealing
          </span>
        </button>

        {/* 4. With Courier */}
        <button
          type="button"
          onClick={() => onSelectStatusFilter('handed_to_courier')}
          className={`text-left bg-[#161616] border p-4 rounded-xs space-y-1.5 transition-all cursor-pointer ${
            statusFilter === 'handed_to_courier'
              ? 'border-sky-400 bg-sky-950/40 shadow-sm ring-1 ring-sky-400/50'
              : 'border-sky-600/30 hover:border-sky-400/70 hover:bg-sky-950/20'
          }`}
        >
          <span className="text-[11px] uppercase tracking-wider text-sky-300 block font-bold">
            With Courier
          </span>
          <div className="text-3xl font-extrabold text-sky-200 tabular-nums tracking-tight">
            {courierCount}
          </div>
          <span className="text-xs text-sky-200/80 font-medium block">
            In active delivery
          </span>
        </button>

        {/* 5. Delivered & Paid */}
        <button
          type="button"
          onClick={() => onSelectStatusFilter('delivered')}
          className={`text-left bg-[#161616] border p-4 rounded-xs space-y-1.5 transition-all cursor-pointer ${
            statusFilter === 'delivered'
              ? 'border-emerald-400 bg-emerald-950/40 shadow-sm ring-1 ring-emerald-400/50'
              : 'border-emerald-600/30 hover:border-emerald-400/70 hover:bg-emerald-950/20'
          }`}
        >
          <span className="text-[11px] uppercase tracking-wider text-emerald-300 block font-bold">
            Delivered & Paid
          </span>
          <div className="text-3xl font-extrabold text-emerald-300 tabular-nums tracking-tight">
            {deliveredCount}
          </div>
          <span className="text-xs text-emerald-200/80 font-medium block">
            Completed & Remitted
          </span>
        </button>

        {/* 6. Returned & Cancelled */}
        <button
          type="button"
          onClick={() => onSelectStatusFilter('returned_and_cancelled')}
          className={`text-left bg-[#181212] border p-4 rounded-xs space-y-1.5 transition-all cursor-pointer group ${
            ['returned_and_cancelled', 'returned', 'cancelled'].includes(statusFilter)
              ? 'border-rose-500 bg-rose-950/60 shadow-sm ring-1 ring-rose-500/50'
              : 'border-rose-600/40 hover:border-rose-500 hover:bg-[#201515]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-rose-300 block font-bold group-hover:text-rose-200">
              Returned & Cancelled
            </span>
            <RotateCcw className="w-3.5 h-3.5 text-rose-300 group-hover:rotate-180 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-rose-200 tabular-nums tracking-tight">
            {returnedAndCancelledCount}
          </div>
          <span className="text-xs text-rose-200/90 block font-medium">
            {returnedCount} Ret · {cancelledCount} Canc
          </span>
        </button>
      </div>

      {/* Financial Pipeline Strip */}
      <div className="bg-[#141414] border border-white/10 p-4 rounded-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-gold-light block font-bold">
              Total Order Pipeline
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-gold-light tabular-nums tracking-tight mt-0.5">
              ৳{totalRevenue.toLocaleString('en-US')}
            </div>
          </div>
          <div className="h-8 w-px bg-white/10 hidden sm:block" />
          <div>
            <span className="text-[11px] uppercase tracking-wider text-emerald-300 block font-bold">
              Delivered & Collected
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-300 tabular-nums tracking-tight mt-0.5">
              ৳{deliveredRevenue.toLocaleString('en-US')}
            </div>
          </div>
          <div className="h-8 w-px bg-white/10 hidden sm:block" />
          <div>
            <span className="text-[11px] uppercase tracking-wider text-rose-300 block font-bold">
              Returned / Cancelled Value
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-rose-200 tabular-nums tracking-tight mt-0.5">
              ৳{returnedAndCancelledRevenue.toLocaleString('en-US')}
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-zinc-400 font-medium">
          <span>Cash on Delivery · Real-time Database Sync</span>
        </div>
      </div>
    </div>
  );
}
