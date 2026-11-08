'use client';

import React, { useState } from 'react';
import { X, Check, Plus, RotateCcw } from 'lucide-react';

export const STANDARD_BANGLE_SIZES = [
  '2-2 (54mm)',
  '2-4 (57mm)',
  '2-6 (60mm)',
  '2-8 (64mm)',
  '2-10 (67mm)',
  'Free Size',
];

export const DEFAULT_BANGLE_SIZES = [
  '2-4 (57mm)',
  '2-6 (60mm)',
  '2-8 (64mm)',
];

interface BangleSizingEditorProps {
  includeSizes: boolean;
  onIncludeSizesChange: (val: boolean) => void;
  allowMultipleSizes: boolean;
  onAllowMultipleSizesChange: (val: boolean) => void;
  sizes: string[];
  onSizesChange: (sizes: string[]) => void;
}

export default function BangleSizingEditor({
  includeSizes,
  onIncludeSizesChange,
  allowMultipleSizes,
  onAllowMultipleSizesChange,
  sizes,
  onSizesChange,
}: BangleSizingEditorProps) {
  const [newSizeInput, setNewSizeInput] = useState('');

  const handleAddSize = () => {
    const trimmed = newSizeInput.trim();
    if (!trimmed) return;
    if (!sizes.includes(trimmed)) {
      onSizesChange([...sizes, trimmed]);
    }
    setNewSizeInput('');
  };

  const handleRemoveSize = (indexToRemove: number) => {
    onSizesChange(sizes.filter((_, idx) => idx !== indexToRemove));
  };

  const togglePreset = (preset: string) => {
    if (sizes.includes(preset)) {
      onSizesChange(sizes.filter((s) => s !== preset));
    } else {
      onSizesChange([...sizes, preset]);
    }
  };

  const handleResetToDefault = () => {
    onSizesChange([...DEFAULT_BANGLE_SIZES]);
  };

  return (
    <div
      className={`p-4 rounded-xs border transition-all ${
        includeSizes ? 'bg-gold/10 border-gold/50 shadow-xs' : 'bg-[#141414] border-white/10'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-bold text-white block">2. Bangle Sizing</span>
          <span className="text-[11px] text-paper/60 leading-snug block mt-0.5">
            Configure available bangle sizes & multi-selection options
          </span>
        </div>
        <input
          type="checkbox"
          checked={includeSizes}
          onChange={(e) => onIncludeSizesChange(e.target.checked)}
          className="rounded-xs text-gold focus:ring-gold bg-[#1C1C1C] border-white/20 mt-0.5 h-4 w-4 cursor-pointer"
        />
      </div>

      {includeSizes ? (
        <div className="mt-3 pt-3 border-t border-gold/20 space-y-3">
          {/* Multi-Size Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allowMultipleSizes}
              onChange={(e) => onAllowMultipleSizesChange(e.target.checked)}
              className="rounded-xs text-gold focus:ring-gold bg-[#1C1C1C] border-white/20 h-3.5 w-3.5 cursor-pointer"
            />
            <span className="text-[11px] text-paper/90 font-medium">
              Allow selecting multiple sizes
            </span>
          </label>

          {/* Active Hand Sizes Display */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-paper/70 font-semibold">
              <span>Active Sizes ({sizes.length})</span>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-gold/70 hover:text-gold text-[10px] normal-case tracking-normal hover:underline flex items-center gap-0.5"
                title="Reset to standard 2-4, 2-6, 2-8"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-[#171717] rounded-xs border border-white/10 items-center">
              {sizes.length === 0 ? (
                <span className="text-[11px] text-paper/40 italic">
                  No sizes active. Click presets below or add custom size.
                </span>
              ) : (
                sizes.map((s, idx) => (
                  <span
                    key={`${s}-${idx}`}
                    className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-gold/20 text-gold border border-gold/40 rounded-[3px] text-[11px] font-mono group"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(idx)}
                      className="hover:bg-gold/40 text-gold hover:text-white p-0.5 rounded-full transition-colors cursor-pointer"
                      title={`Remove ${s}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-paper/50 font-semibold block">
              Quick Toggle Presets:
            </span>
            <div className="flex flex-wrap gap-1">
              {STANDARD_BANGLE_SIZES.map((preset) => {
                const isActive = sizes.includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => togglePreset(preset)}
                    className={`px-1.5 py-0.5 text-[10px] rounded-[3px] border font-mono transition-all flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-gold text-ink border-gold font-bold shadow-xs'
                        : 'bg-[#1C1C1C] text-paper/60 border-white/10 hover:border-white/30 hover:text-paper'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>{preset}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-2.5 h-2.5" />
                        <span>{preset}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Custom Size Form */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-paper/50 font-semibold block">
              Add Custom Size:
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newSizeInput}
                onChange={(e) => setNewSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSize();
                  }
                }}
                placeholder="e.g. 2-12 (70mm) or Custom"
                className="flex-1 bg-[#1C1C1C] border border-white/20 rounded-xs px-2.5 py-1 text-xs text-paper placeholder-paper/30 focus:border-gold focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleAddSize}
                disabled={!newSizeInput.trim()}
                className="px-2.5 py-1 bg-gold text-ink font-semibold text-xs rounded-xs hover:bg-gold-deep disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 text-[11px] text-paper/50">
          Sizing disabled (One standard size)
        </div>
      )}
    </div>
  );
}
