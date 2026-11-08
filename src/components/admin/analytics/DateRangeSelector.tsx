'use client';

import React from 'react';
import { DatePreset, DateRangeConfig } from './types';
import { Calendar, Download, ArrowRight } from 'lucide-react';

interface DateRangeSelectorProps {
  config: DateRangeConfig;
  onChangeConfig: (newConfig: DateRangeConfig) => void;
  compareWithPrevious: boolean;
  onToggleCompare: (val: boolean) => void;
  onExportCsv: () => void;
  dateRange: {
    start: Date;
    end: Date;
    prevStart: Date;
    prevEnd: Date;
  };
}

export default function DateRangeSelector({
  config,
  onChangeConfig,
  compareWithPrevious,
  onToggleCompare,
  onExportCsv,
  dateRange,
}: DateRangeSelectorProps) {
  const presets: { id: DatePreset; label: string }[] = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: 'all', label: 'All Time' },
    { id: 'custom', label: 'Custom' },
  ];

  const handlePresetClick = (preset: DatePreset) => {
    onChangeConfig({
      ...config,
      preset,
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeConfig({
      ...config,
      preset: 'custom',
      startDate: e.target.value,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeConfig({
      ...config,
      preset: 'custom',
      endDate: e.target.value,
    });
  };

  const formatDisplayDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-[#141414] border border-white/10 rounded-xs p-4 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Presets and Custom Inputs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#1c1c1c] p-1 rounded-xs border border-white/5">
            {presets.map((p) => {
              const active = config.preset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetClick(p.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-all cursor-pointer ${
                    active
                      ? 'bg-gold text-ink font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {config.preset === 'custom' && (
            <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-white/10 px-2 py-1 rounded-xs text-xs text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
              <input
                type="date"
                value={config.startDate}
                onChange={handleStartDateChange}
                className="bg-transparent text-white border-0 focus:outline-hidden text-xs cursor-pointer"
              />
              <ArrowRight className="w-3 h-3 text-zinc-500 shrink-0" />
              <input
                type="date"
                value={config.endDate}
                onChange={handleEndDateChange}
                className="bg-transparent text-white border-0 focus:outline-hidden text-xs cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Comparison toggle and Export button */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={compareWithPrevious}
              onChange={(e) => onToggleCompare(e.target.checked)}
              className="accent-gold rounded-xs w-3.5 h-3.5 cursor-pointer"
            />
            <span className="font-medium">Compare to prior period</span>
          </label>

          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f1f1f] hover:bg-gold/20 text-gold-light border border-gold/30 hover:border-gold rounded-xs text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-gold" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date Window Summary Sub-bar */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/5 gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-gold" />
          <span>
            Active Window:{' '}
            <strong className="text-zinc-200">
              {formatDisplayDate(dateRange.start)} – {formatDisplayDate(dateRange.end)}
            </strong>
          </span>
          {compareWithPrevious && (
            <>
              <span className="text-zinc-600">vs</span>
              <span>
                Prior Window:{' '}
                <strong className="text-zinc-400">
                  {formatDisplayDate(dateRange.prevStart)} – {formatDisplayDate(dateRange.prevEnd)}
                </strong>
              </span>
            </>
          )}
        </div>

        <div className="text-[11px] text-zinc-500 font-mono">
          All orders dynamically synchronized with atelier database
        </div>
      </div>
    </div>
  );
}
