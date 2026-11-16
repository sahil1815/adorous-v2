'use client';

import React, { useState } from 'react';
import { TrendDataPoint } from './types';
import { formatPrice } from '@/lib/formatPrice';
import {
  Line,
  Area,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenueTrendChartProps {
  trendData: TrendDataPoint[];
  compareWithPrevious: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TrendDataPoint }>;
  label?: string;
  compareWithPrevious?: boolean;
}

function CustomTooltip({ active, payload, label, compareWithPrevious }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const point: TrendDataPoint | undefined = payload[0]?.payload;
    return (
      <div className="bg-[#121212]/95 backdrop-blur-md border border-gold/40 p-3.5 rounded-xs shadow-2xl space-y-2 min-w-[200px]">
        <div className="border-b border-white/10 pb-1.5 flex items-center justify-between">
          <span className="text-white text-xs font-bold tracking-wide">{point?.date || label}</span>
          <span className="text-[10px] text-zinc-400 font-mono">{point?.fullDate}</span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between text-gold-light">
            <span>Net Revenue:</span>
            <strong className="font-mono">৳{formatPrice(point?.netRevenue ?? 0)}</strong>
          </div>

          <div className="flex items-center justify-between text-zinc-400">
            <span>Gross Logged:</span>
            <span className="font-mono">৳{formatPrice(point?.grossRevenue ?? 0)}</span>
          </div>

          <div className="flex items-center justify-between text-emerald-300">
            <span>Delivered & Paid:</span>
            <span className="font-mono">৳{formatPrice(point?.deliveredRevenue ?? 0)}</span>
          </div>

          <div className="flex items-center justify-between text-sky-300">
            <span>Order Volume:</span>
            <strong className="font-mono">{point?.ordersCount ?? 0} orders</strong>
          </div>

          {compareWithPrevious && point?.prevRevenue !== undefined && (
            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Prior Period:</span>
              <span className="font-mono text-zinc-300">৳{formatPrice(point.prevRevenue)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export default function RevenueTrendChart({
  trendData,
  compareWithPrevious,
}: RevenueTrendChartProps) {
  const [viewMode, setViewMode] = useState<'dual' | 'gross_net' | 'delivered'>('dual');

  const ADOROUS_GOLD = '#C6A96E';
  const ADOROUS_EMERALD = '#10b981';
  const ADOROUS_SKY = '#38bdf8';
  const ADOROUS_GHOST = '#71717a';

  return (
    <div className="bg-[#171717] border border-white/10 p-5 rounded-xs space-y-5">
      {/* Chart Header & View Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Revenue Dynamics & Order Velocity
            </h3>
            <span className="bg-gold/20 text-gold text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border border-gold/30">
              Dual Axis
            </span>
          </div>
          <span className="text-xs text-zinc-400 font-medium">
            Daily financial output correlated with order volume over time.
          </span>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center bg-[#1c1c1c] p-1 rounded-xs border border-white/5 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('dual')}
            className={`px-2.5 py-1 font-semibold rounded-xs transition-colors cursor-pointer ${
              viewMode === 'dual'
                ? 'bg-gold text-ink font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Revenue + Orders
          </button>
          <button
            type="button"
            onClick={() => setViewMode('gross_net')}
            className={`px-2.5 py-1 font-semibold rounded-xs transition-colors cursor-pointer ${
              viewMode === 'gross_net'
                ? 'bg-gold text-ink font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Gross vs Net
          </button>
          <button
            type="button"
            onClick={() => setViewMode('delivered')}
            className={`px-2.5 py-1 font-semibold rounded-xs transition-colors cursor-pointer ${
              viewMode === 'delivered'
                ? 'bg-gold text-ink font-bold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Delivered Cash
          </button>
        </div>
      </div>

      {/* Recharts Visual Canvas */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={trendData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGoldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ADOROUS_GOLD} stopOpacity={0.35} />
                <stop offset="95%" stopColor={ADOROUS_GOLD} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="deliveredEmeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ADOROUS_EMERALD} stopOpacity={0.3} />
                <stop offset="95%" stopColor={ADOROUS_EMERALD} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />

            {/* X-Axis */}
            <XAxis
              dataKey="date"
              stroke="#52525b"
              tick={{ fill: '#a1a1aa', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            {/* Left Y-Axis: Currency */}
            <YAxis
              yAxisId="left"
              stroke="#52525b"
              tick={{ fill: '#a1a1aa', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `৳${formatPrice(val)}`}
            />

            {/* Right Y-Axis: Orders Count (if dual mode) */}
            {viewMode === 'dual' && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#52525b"
                tick={{ fill: ADOROUS_SKY, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
            )}

            <Tooltip content={<CustomTooltip compareWithPrevious={compareWithPrevious} />} />

            {/* Ghost Line: Previous Period (when comparison enabled) */}
            {compareWithPrevious && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="prevRevenue"
                name="Prior Period"
                stroke={ADOROUS_GHOST}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            )}

            {/* Render based on view mode */}
            {viewMode === 'dual' && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="netRevenue"
                  name="Net Revenue"
                  stroke={ADOROUS_GOLD}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGoldGradient)"
                  dot={{ fill: ADOROUS_GOLD, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 6, fill: '#fff', stroke: ADOROUS_GOLD, strokeWidth: 2 }}
                />
                <Bar
                  yAxisId="right"
                  dataKey="ordersCount"
                  name="Order Volume"
                  fill={ADOROUS_SKY}
                  opacity={0.65}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
              </>
            )}

            {viewMode === 'gross_net' && (
              <>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="grossRevenue"
                  name="Gross Pipeline"
                  stroke="#71717a"
                  strokeWidth={2}
                  dot={{ fill: '#71717a', r: 3 }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="netRevenue"
                  name="Net Revenue"
                  stroke={ADOROUS_GOLD}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGoldGradient)"
                  dot={{ fill: ADOROUS_GOLD, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 6, fill: '#fff', stroke: ADOROUS_GOLD, strokeWidth: 2 }}
                />
              </>
            )}

            {viewMode === 'delivered' && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="deliveredRevenue"
                  name="Delivered & Remitted"
                  stroke={ADOROUS_EMERALD}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#deliveredEmeraldGradient)"
                  dot={{ fill: ADOROUS_EMERALD, strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 6, fill: '#fff', stroke: ADOROUS_EMERALD, strokeWidth: 2 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="netRevenue"
                  name="Total Pipeline"
                  stroke={ADOROUS_GOLD}
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  dot={false}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend / Footnote */}
      <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-gold inline-block" />
            <span className="text-zinc-300">Net Revenue</span>
          </div>
          {viewMode === 'dual' && (
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-sky-400/80 inline-block rounded-2xs" />
              <span className="text-sky-300">Daily Order Count</span>
            </div>
          )}
          {viewMode === 'delivered' && (
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
              <span className="text-emerald-300">Delivered & Remitted Cash</span>
            </div>
          )}
          {compareWithPrevious && (
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-zinc-500 inline-block border-b border-dashed border-zinc-400" />
              <span className="text-zinc-500">Prior Period Baseline</span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-zinc-500">
          Amounts formatted in Bangladeshi Taka (BDT ৳)
        </div>
      </div>
    </div>
  );
}
