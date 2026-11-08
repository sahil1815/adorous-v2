'use client';

import React from 'react';
import { KpiMetric } from './types';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Truck,
  DollarSign,
  RotateCcw,
} from 'lucide-react';

interface FinancialHealthCardsProps {
  kpis: {
    netRevenue: KpiMetric;
    delivered: KpiMetric;
    inTransit: KpiMetric;
    aov: KpiMetric;
    lostRevenue: KpiMetric;
  };
  compareWithPrevious: boolean;
}

function MiniSparkline({ points, color }: { points: number[]; color: string }) {
  if (!points || points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 24;

  const coords = points.map((p, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${coords.join(' L ')}`;

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0 opacity-80 hover:opacity-100 transition-opacity">
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End point dot */}
      {coords.length > 0 && (
        <circle
          cx={coords[coords.length - 1].split(',')[0]}
          cy={coords[coords.length - 1].split(',')[1]}
          r="2.5"
          fill={color}
        />
      )}
    </svg>
  );
}

function DeltaBadge({
  delta,
  isInverseGood = false,
}: {
  delta?: KpiMetric['delta'];
  isInverseGood?: boolean;
}) {
  if (!delta || delta.percentChange === null) return null;

  const isUp = delta.trend === 'up';
  const isDown = delta.trend === 'down';

  // For inverse good (e.g. revenue lost), down is good (emerald), up is bad (rose)
  const isPositive = isInverseGood ? isDown : isUp;
  const isNeutral = delta.trend === 'neutral';

  const badgeColor = isNeutral
    ? 'text-zinc-400 bg-zinc-800/60 border-zinc-700/50'
    : isPositive
    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50'
    : 'text-rose-400 bg-rose-950/60 border-rose-800/50';

  return (
    <div
      className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-xs border text-[10px] font-mono font-bold tracking-tight ${badgeColor}`}
    >
      {isUp && <TrendingUp className="w-3 h-3 shrink-0" />}
      {isDown && <TrendingDown className="w-3 h-3 shrink-0" />}
      <span>
        {isUp ? '+' : isDown ? '-' : ''}
        {delta.percentChange}%
      </span>
    </div>
  );
}

export default function FinancialHealthCards({
  kpis,
  compareWithPrevious,
}: FinancialHealthCardsProps) {
  const cards = [
    {
      key: 'netRevenue',
      data: kpis.netRevenue,
      icon: TrendingUp,
      borderColor: 'border-gold/40',
      bgColor: 'bg-[#171717]',
      accentColor: '#C6A96E',
      textColor: 'text-gold-light',
    },
    {
      key: 'delivered',
      data: kpis.delivered,
      icon: ShieldCheck,
      borderColor: 'border-emerald-600/40',
      bgColor: 'bg-[#171717]',
      accentColor: '#10b981',
      textColor: 'text-emerald-300',
    },
    {
      key: 'inTransit',
      data: kpis.inTransit,
      icon: Truck,
      borderColor: 'border-amber-600/40',
      bgColor: 'bg-[#171717]',
      accentColor: '#f59e0b',
      textColor: 'text-amber-300',
    },
    {
      key: 'aov',
      data: kpis.aov,
      icon: DollarSign,
      borderColor: 'border-white/10',
      bgColor: 'bg-[#171717]',
      accentColor: '#e4e4e7',
      textColor: 'text-white',
    },
    {
      key: 'lostRevenue',
      data: kpis.lostRevenue,
      icon: RotateCcw,
      borderColor: 'border-rose-700/40',
      bgColor: 'bg-[#191313]',
      accentColor: '#f43f5e',
      textColor: 'text-rose-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((c) => {
        const IconComponent = c.icon;
        return (
          <div
            key={c.key}
            className={`${c.bgColor} border ${c.borderColor} p-4 rounded-xs flex flex-col justify-between space-y-3 transition-all hover:border-white/20`}
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between">
              <span className={`text-[11px] uppercase font-bold tracking-wider ${c.textColor} line-clamp-1`}>
                {c.data.label}
              </span>
              <div title={c.data.tooltip} className="cursor-help">
                <IconComponent className="w-4 h-4 shrink-0" style={{ color: c.accentColor }} />
              </div>
            </div>

            {/* Middle row: Big metric & Sparkline */}
            <div className="flex items-end justify-between gap-2">
              <div
                className={`text-2xl sm:text-[26px] font-extrabold ${c.textColor} tabular-nums font-mono tracking-tight`}
              >
                {c.data.formattedValue}
              </div>
              <MiniSparkline points={c.data.sparkline} color={c.accentColor} />
            </div>

            {/* Bottom row: Delta badge & sublabel */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1 text-[11px]">
              <span className="text-zinc-400 font-medium truncate">{c.data.sublabel}</span>
              {compareWithPrevious && (
                <DeltaBadge delta={c.data.delta} isInverseGood={c.data.isInverseGood} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
