'use client';

import React from 'react';
import { FunnelStep, OperationalRates } from './types';
import { formatPrice } from '@/lib/formatPrice';
import {
  RotateCcw,
  XCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface OrderFunnelSectionProps {
  funnelSteps: FunnelStep[];
  operationalRates: OperationalRates;
  compareWithPrevious: boolean;
}

export default function OrderFunnelSection({
  funnelSteps,
  operationalRates,
  compareWithPrevious,
}: OrderFunnelSectionProps) {
  const {
    returnRate,
    cancelRate,
    deliverySuccessRate,
    returnedCount,
    cancelledCount,
    deliveredCount,
    deltaReturnRate,
    deltaCancelRate,
    deltaSuccessRate,
  } = operationalRates;

  return (
    <div className="space-y-4">
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Order Fulfillment Funnel & Logistics Velocity
            </h2>
            <span className="bg-white/5 text-zinc-300 text-[10px] font-mono px-2 py-0.5 rounded-xs border border-white/10">
              End-to-End COD
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">
            Stage-by-stage progression from initial checkout to courier handover and successful cash collection.
          </p>
        </div>
        <Layers className="w-4 h-4 text-gold shrink-0" />
      </div>

      {/* 2. Horizontal Interactive Funnel */}
      <div className="bg-[#171717] border border-white/10 p-5 rounded-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 relative">
          {funnelSteps.map((step, idx) => {
            return (
              <div
                key={step.id}
                className={`relative p-3.5 rounded-xs border ${step.borderColor} ${step.bgTint} flex flex-col justify-between space-y-3 transition-all hover:bg-white/5`}
              >
                {/* Step Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                    {step.label}
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs border"
                    style={{ borderColor: step.borderColor, color: step.color }}
                  >
                    {step.percentOfTotal}%
                  </span>
                </div>

                {/* Step Big Number & Value */}
                <div>
                  <div
                    className="text-2xl font-extrabold font-mono tracking-tight"
                    style={{ color: step.color }}
                  >
                    {step.count}
                  </div>
                  <span className="text-xs text-zinc-400 font-mono block mt-0.5">
                    ৳{formatPrice(step.value)}
                  </span>
                </div>

                {/* Step Conversion rate from previous step */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                  {idx === 0 ? (
                    <span className="text-gold-light/80 font-medium">Top of Funnel</span>
                  ) : (
                    <span className="flex items-center space-x-1 text-emerald-400/90 font-mono">
                      <span>Conv:</span>
                      <strong className="text-emerald-300">{step.conversionFromPrev}%</strong>
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-500 uppercase">Stage {idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Funnel Progress Visual Bar */}
        <div className="w-full bg-[#121212] rounded-xs h-2.5 overflow-hidden flex border border-white/5">
          <div
            style={{ width: `${deliverySuccessRate}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`Delivered: ${deliverySuccessRate}%`}
          />
          <div
            style={{ width: `${returnRate}%` }}
            className="bg-rose-500 h-full transition-all duration-500"
            title={`Returned: ${returnRate}%`}
          />
          <div
            style={{ width: `${cancelRate}%` }}
            className="bg-amber-600 h-full transition-all duration-500"
            title={`Cancelled: ${cancelRate}%`}
          />
        </div>
      </div>

      {/* 3. Operational Drop-off & Rate Summary Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Return Rate (RTO) Tile */}
        <div className="bg-[#171717] border border-rose-700/40 p-4 rounded-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-rose-300 tracking-wider">
              Return on Delivery (RTO %)
            </span>
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-rose-200 font-mono tracking-tight">
              {returnRate}%
            </div>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border ${
                returnRate <= 5
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                  : returnRate <= 10
                  ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800/50'
              }`}
            >
              {returnRate <= 5 ? 'Healthy (<5%)' : returnRate <= 10 ? 'Attention Needed' : 'High Risk'}
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-rose-300/80">
            <span>{returnedCount} parcels returned to atelier</span>
            {compareWithPrevious && deltaReturnRate && deltaReturnRate.percentChange !== null && (
              <span className="font-mono text-[11px]">
                {deltaReturnRate.trend === 'down' ? '↓ Improved' : '↑ Increased'} by{' '}
                {deltaReturnRate.percentChange}%
              </span>
            )}
          </div>
        </div>

        {/* Cancellation Rate Tile */}
        <div className="bg-[#171717] border border-amber-600/40 p-4 rounded-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-amber-300 tracking-wider">
              Pre-Dispatch Cancellation Rate
            </span>
            <XCircle className="w-4 h-4 text-amber-400" />
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-amber-200 font-mono tracking-tight">
              {cancelRate}%
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border bg-amber-950/60 text-amber-300 border-amber-800/50">
              {cancelRate <= 3 ? 'Standard (<3%)' : 'Verification Drop'}
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-amber-300/80">
            <span>{cancelledCount} orders cancelled prior to dispatch</span>
            {compareWithPrevious && deltaCancelRate && deltaCancelRate.percentChange !== null && (
              <span className="font-mono text-[11px]">
                {deltaCancelRate.trend === 'down' ? '↓ Better' : '↑ Higher'} by{' '}
                {deltaCancelRate.percentChange}%
              </span>
            )}
          </div>
        </div>

        {/* Delivery Success Rate Tile */}
        <div className="bg-[#171717] border border-emerald-600/40 p-4 rounded-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-emerald-300 tracking-wider">
              Logistics Delivery Success
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-emerald-300 font-mono tracking-tight">
              {deliverySuccessRate}%
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border bg-emerald-950/60 text-emerald-300 border-emerald-800/50">
              {deliverySuccessRate >= 90 ? 'High Fulfillment' : 'Logistics Action'}
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-emerald-300/80">
            <span>{deliveredCount} parcels paid & completed</span>
            {compareWithPrevious && deltaSuccessRate && deltaSuccessRate.percentChange !== null && (
              <span className="font-mono text-[11px]">
                {deltaSuccessRate.trend === 'up' ? '↑ Up' : '↓ Down'} by{' '}
                {deltaSuccessRate.percentChange}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
