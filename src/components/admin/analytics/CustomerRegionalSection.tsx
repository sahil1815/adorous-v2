'use client';

import React from 'react';
import { RegionalDemand, CustomerLoyalty, CourierPerformance } from './types';
import { formatPrice } from '@/lib/formatPrice';
import {
  MapPin,
  Users,
  Truck,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CustomerRegionalSectionProps {
  regionalDemand: RegionalDemand;
  customerLoyalty: CustomerLoyalty;
  courierPerformance: CourierPerformance[];
}

interface TooltipItem {
  payload: {
    name: string;
    value: number;
    revenue: number;
  };
}

function CustomPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipItem[];
}) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    return (
      <div className="bg-[#121212]/95 backdrop-blur-md border border-gold/40 p-3 rounded-xs shadow-2xl space-y-1 text-xs">
        <p className="text-white font-bold">{data.name}</p>
        <p className="text-zinc-300 font-mono">
          Orders: <strong className="text-white">{data.value}</strong>
        </p>
        <p className="text-gold-light font-mono">
          Revenue: <strong>৳{formatPrice(data.revenue)}</strong>
        </p>
      </div>
    );
  }
  return null;
}

export default function CustomerRegionalSection({
  regionalDemand,
  customerLoyalty,
  courierPerformance,
}: CustomerRegionalSectionProps) {
  const ADOROUS_GOLD = '#C6A96E';
  const ADOROUS_EMERALD = '#10b981';

  // Regional donut data
  const regionalPieData = [
    {
      name: 'Inside Dhaka',
      value: regionalDemand.insideDhakaCount,
      revenue: regionalDemand.insideDhakaRevenue,
      color: ADOROUS_GOLD,
    },
    {
      name: 'Outside Dhaka',
      value: regionalDemand.outsideDhakaCount,
      revenue: regionalDemand.outsideDhakaRevenue,
      color: ADOROUS_EMERALD,
    },
  ];

  const totalRegionalOrders =
    regionalDemand.insideDhakaCount + regionalDemand.outsideDhakaCount;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Regional Delivery Demand & Courier Performance
            </h2>
            <span className="bg-emerald-950/60 text-emerald-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border border-emerald-800/50">
              Pan-Bangladesh
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">
            Territorial order split, top destination districts, patron repeat loyalty, and courier delivery efficiency.
          </p>
        </div>
        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Regional Split & Top Districts */}
        <div className="bg-[#171717] border border-white/10 p-5 rounded-xs space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Metropolitan vs District Split
              </h3>
              <span className="text-xs text-zinc-400 font-medium">
                Inside Dhaka Metro vs 63 Outside Districts
              </span>
            </div>
            <PieChartIcon className="w-4 h-4 text-gold shrink-0" />
          </div>

          {/* Regional Donut + Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            {/* Donut */}
            <div className="h-52 w-full relative flex items-center justify-center">
              {totalRegionalOrders === 0 ? (
                <p className="text-xs text-zinc-500 font-medium">No order data</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionalPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {regionalPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {totalRegionalOrders > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="block text-2xl font-extrabold text-white font-mono tracking-tight">
                      {totalRegionalOrders}
                    </span>
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold">
                      Parcels
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Split Breakdown Details */}
            <div className="space-y-3">
              <div className="bg-[#141414] border border-white/5 p-3 rounded-xs space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-1.5 font-bold text-gold-light">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" />
                    <span>Inside Dhaka</span>
                  </span>
                  <span className="font-mono text-zinc-300 font-bold">
                    {regionalDemand.insideDhakaCount} orders
                  </span>
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  ৳{formatPrice(regionalDemand.insideDhakaRevenue)} · Flat ৳60 shipping
                </div>
              </div>

              <div className="bg-[#141414] border border-white/5 p-3 rounded-xs space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-1.5 font-bold text-emerald-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Outside Dhaka</span>
                  </span>
                  <span className="font-mono text-zinc-300 font-bold">
                    {regionalDemand.outsideDhakaCount} orders
                  </span>
                </div>
                <div className="text-xs text-zinc-400 font-mono">
                  ৳{formatPrice(regionalDemand.outsideDhakaRevenue)} · Standard ৳100 shipping
                </div>
              </div>
            </div>
          </div>

          {/* Top 6 Destination Districts Table */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Top Destination Districts
            </h4>
            <div className="space-y-1.5">
              {regionalDemand.topDistricts.map((d, idx) => (
                <div
                  key={d.district}
                  className="bg-[#141414] border border-white/5 px-3 py-2 rounded-xs flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">#{idx + 1}</span>
                    <span className="font-semibold text-zinc-200">{d.district}</span>
                  </div>
                  <div className="flex items-center space-x-3 font-mono text-[11px]">
                    <span className="text-zinc-400">{d.ordersCount} orders</span>
                    <span className="text-gold-light font-bold">৳{formatPrice(d.revenue)}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-xs border ${
                        d.returnRate <= 5
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                          : 'bg-rose-950/60 text-rose-300 border-rose-800/50'
                      }`}
                    >
                      {d.returnRate}% RTO
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Patron Repeat Loyalty & Courier Performance */}
        <div className="space-y-6">
          {/* Patron Repeat Loyalty Widget */}
          <div className="bg-[#171717] border border-white/10 p-5 rounded-xs space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Patron Loyalty & Repeat Order Rate
                </h3>
                <span className="text-xs text-zinc-400 font-medium">
                  Identified via verified patron mobile contacts
                </span>
              </div>
              <Users className="w-4 h-4 text-gold shrink-0" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#141414] border border-white/5 p-3 rounded-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Unique Patrons
                </span>
                <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
                  {customerLoyalty.uniqueCustomersCount}
                </div>
                <span className="text-[10px] text-zinc-500 font-medium block">Unique phone numbers</span>
              </div>

              <div className="bg-[#141414] border border-gold/30 p-3 rounded-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-gold-light block tracking-wider">
                  Repeat Patrons
                </span>
                <div className="text-2xl font-extrabold text-gold-light font-mono tracking-tight">
                  {customerLoyalty.repeatCustomersCount}
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-medium block">
                  {customerLoyalty.repeatRate}% repeat rate
                </span>
              </div>

              <div className="bg-[#141414] border border-emerald-600/30 p-3 rounded-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block tracking-wider">
                  Repeat Sales Share
                </span>
                <div className="text-2xl font-extrabold text-emerald-300 font-mono tracking-tight">
                  {customerLoyalty.repeatRevenueShare}%
                </div>
                <span className="text-[10px] text-zinc-400 font-mono block">
                  ৳{formatPrice(customerLoyalty.repeatCustomersRevenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Courier Logistics Performance Comparison */}
          <div className="bg-[#171717] border border-white/10 p-5 rounded-xs space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Courier Partner Performance
                </h3>
                <span className="text-xs text-zinc-400 font-medium">
                  Delivery success and return rates across partner dispatch fleets
                </span>
              </div>
              <Truck className="w-4 h-4 text-sky-400 shrink-0" />
            </div>

            {courierPerformance.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No courier data logged</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
                      <th className="pb-2">Courier</th>
                      <th className="pb-2 text-center">Assigned</th>
                      <th className="pb-2 text-center">Delivered</th>
                      <th className="pb-2 text-center">In Transit</th>
                      <th className="pb-2 text-center">RTO</th>
                      <th className="pb-2 text-right">Success</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                    {courierPerformance.map((c) => (
                      <tr key={c.courierName} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 font-sans font-semibold text-white">
                          {c.courierName}
                        </td>
                        <td className="py-2.5 text-center text-zinc-300">{c.totalAssigned}</td>
                        <td className="py-2.5 text-center text-emerald-300 font-bold">
                          {c.delivered}
                        </td>
                        <td className="py-2.5 text-center text-amber-300">{c.inTransit}</td>
                        <td className="py-2.5 text-center text-rose-300">{c.returned}</td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded-xs border text-[10px] font-bold ${
                              c.successRate >= 90
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                                : c.successRate >= 80
                                ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                                : 'bg-rose-950/60 text-rose-300 border-rose-800/50'
                            }`}
                          >
                            {c.successRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
