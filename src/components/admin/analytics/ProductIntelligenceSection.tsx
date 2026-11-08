'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductPerformance, CategoryDemand, CouponImpact } from './types';
import { formatPrice } from '@/lib/formatPrice';
import {
  Sparkles,
  Tag,
  Package,
} from 'lucide-react';

interface ProductIntelligenceSectionProps {
  topProducts: ProductPerformance[];
  categoriesDemand: CategoryDemand[];
  couponImpact: CouponImpact;
}

export default function ProductIntelligenceSection({
  topProducts,
  categoriesDemand,
  couponImpact,
}: ProductIntelligenceSectionProps) {
  const [productSort, setProductSort] = useState<'revenue' | 'units'>('revenue');

  const sortedProducts = [...topProducts].sort((a, b) =>
    productSort === 'revenue' ? b.revenue - a.revenue : b.unitsSold - a.unitsSold
  );

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Product Intelligence & Catalogue Merchandising
            </h2>
            <span className="bg-gold/20 text-gold text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border border-gold/30">
              SKU Performance
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">
            Identify top-selling heirloom pieces, category unit demand, and promotional discount absorption.
          </p>
        </div>
        <Sparkles className="w-4 h-4 text-gold shrink-0" />
      </div>

      {/* Grid: Top Products Table (2/3) + Category Demand (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 6 Best-Selling Products (2 Columns) */}
        <div className="lg:col-span-2 bg-[#171717] border border-white/10 p-5 rounded-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Top Performing Products
              </h3>
              <span className="text-xs text-zinc-400 font-medium">
                Ranked by customer demand and realized revenue
              </span>
            </div>

            <div className="flex items-center bg-[#1c1c1c] p-0.5 rounded-xs border border-white/5 text-xs">
              <button
                type="button"
                onClick={() => setProductSort('revenue')}
                className={`px-2.5 py-1 font-semibold rounded-xs transition-colors cursor-pointer ${
                  productSort === 'revenue'
                    ? 'bg-gold text-ink font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                By Revenue
              </button>
              <button
                type="button"
                onClick={() => setProductSort('units')}
                className={`px-2.5 py-1 font-semibold rounded-xs transition-colors cursor-pointer ${
                  productSort === 'units'
                    ? 'bg-gold text-ink font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                By Units Sold
              </button>
            </div>
          </div>

          {/* Product Items List */}
          {sortedProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 font-medium">
              No product sales data available for this timeframe.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedProducts.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="bg-[#141414] border border-white/5 hover:border-gold/30 p-3 rounded-xs flex items-center justify-between gap-3 transition-colors"
                >
                  {/* Left: Rank + Image + Title */}
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-5 text-center text-xs font-mono font-bold text-zinc-400">
                      #{idx + 1}
                    </span>

                    {/* Product Still-Life Thumbnail */}
                    <div className="w-11 h-11 rounded-xs bg-[#1f1f1f] border border-white/10 shrink-0 overflow-hidden flex items-center justify-center relative">
                      {p.featuredImage ? (
                        <Image
                          src={p.featuredImage}
                          alt={p.name}
                          width={44}
                          height={44}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <Package className="w-5 h-5 text-gold/60" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate max-w-[220px] sm:max-w-xs">
                        {p.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-[11px] text-zinc-400 mt-0.5">
                        <span className="capitalize text-gold-light/80 font-medium">
                          {p.category || 'Fine Jewelry'}
                        </span>
                        <span>•</span>
                        <span>{p.ordersCount} orders</span>
                        <span>•</span>
                        <span>Avg ৳{formatPrice(p.avgUnitPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Units + Revenue + Share bar */}
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-gold-light font-mono">
                      ৳{formatPrice(p.revenue)}
                    </div>
                    <div className="flex items-center justify-end space-x-1.5 text-[11px] text-zinc-400 mt-0.5">
                      <span className="font-mono text-zinc-300 font-semibold">{p.unitsSold} units</span>
                      <span className="text-zinc-600">|</span>
                      <span className="text-emerald-400 font-mono">{p.shareOfRevenue}% share</span>
                    </div>

                    {/* Mini progress bar */}
                    <div className="w-24 bg-white/10 rounded-full h-1 mt-1.5 overflow-hidden ml-auto">
                      <div
                        className="bg-gold h-full rounded-full"
                        style={{ width: `${Math.min(100, p.shareOfRevenue * 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-white/5 text-[11px] text-zinc-500 text-center">
            Luxury keepsake packaging included with each high-demand piece
          </div>
        </div>

        {/* Category Demand & Share (1 Column) */}
        <div className="bg-[#171717] border border-white/10 p-5 rounded-xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white tracking-tight">Category Contribution</h3>
            <span className="text-xs text-zinc-400 font-medium">
              Revenue distribution across luxury collections
            </span>
          </div>

          <div className="space-y-3.5 flex-grow">
            {categoriesDemand.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{cat.name}</span>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-zinc-400">{cat.units} units</span>
                    <strong className="text-gold-light">৳{formatPrice(cat.revenue)}</strong>
                  </div>
                </div>

                {/* Progress bar with percentage */}
                <div className="w-full bg-[#121212] rounded-xs h-2 overflow-hidden flex border border-white/5">
                  <div
                    className="bg-gold h-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Share of Net Sales</span>
                  <span className="text-gold-light font-bold">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/5 text-[11px] text-zinc-500 text-center">
            Curated pieces verified against highest artisan standards
          </div>
        </div>
      </div>

      {/* Promotional & Coupon Impact Banner */}
      <div className="bg-[#171717] border border-white/10 p-5 rounded-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-gold shrink-0" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Promotional Vouchers & Discount Absorption
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-medium">
            Impact of welcome offers, promotional coupon codes & concessions
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Card 1: Orders with Promo */}
          <div className="bg-[#141414] border border-white/5 p-3.5 rounded-xs space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
              Orders with Promo
            </span>
            <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
              {couponImpact.totalOrdersWithCoupon}
            </div>
            <span className="text-[11px] text-emerald-400 font-medium block">
              {couponImpact.couponAdoptionRate}% of total checkouts
            </span>
          </div>

          {/* Card 2: Total Discounts Absorbed */}
          <div className="bg-[#141414] border border-white/5 p-3.5 rounded-xs space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
              Discounts Absorbed
            </span>
            <div className="text-2xl font-extrabold text-amber-300 font-mono tracking-tight">
              ৳{formatPrice(couponImpact.totalDiscountGiven)}
            </div>
            <span className="text-[11px] text-zinc-500 font-medium block">Total price reductions</span>
          </div>

          {/* Card 3: AOV with Coupon */}
          <div className="bg-[#141414] border border-white/5 p-3.5 rounded-xs space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
              AOV with Voucher
            </span>
            <div className="text-2xl font-extrabold text-gold-light font-mono tracking-tight">
              ৳{formatPrice(couponImpact.aovWithCoupon)}
            </div>
            <span className="text-[11px] text-zinc-400 font-medium block">Per discounted basket</span>
          </div>

          {/* Card 4: AOV Full Price */}
          <div className="bg-[#141414] border border-white/5 p-3.5 rounded-xs space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
              AOV Full Price
            </span>
            <div className="text-2xl font-extrabold text-zinc-200 font-mono tracking-tight">
              ৳{formatPrice(couponImpact.aovWithoutCoupon)}
            </div>
            <span className="text-[11px] text-zinc-500 font-medium block">Organic full price checkouts</span>
          </div>
        </div>

        {/* Top Coupon Codes Used */}
        {couponImpact.topCoupons.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium mr-1">Active Vouchers:</span>
            {couponImpact.topCoupons.map((c) => (
              <span
                key={c.code}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#1a1a1a] border border-gold/30 rounded-xs text-xs font-mono text-gold-light"
              >
                <Tag className="w-3 h-3 text-gold" />
                <strong className="text-white">{c.code}</strong>
                <span className="text-zinc-500">({c.usageCount} uses · ৳{formatPrice(c.discountGiven)})</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
