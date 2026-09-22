'use client';

import React from 'react';
import { X, Ruler, HelpCircle, Check, RotateCcw } from 'lucide-react';

interface ChuriSizingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChuriSizingModal({ isOpen, onClose }: ChuriSizingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        {/* Modal Window */}
        <div className="relative w-full max-w-lg bg-paper border border-line shadow-2xl z-50 p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-line pb-4">
            <div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-gold-ink font-semibold">
                Fit & Comfort Guide
              </div>
              <h3 className="font-serif text-2xl font-medium text-ink mt-0.5">
                Churi (Bangle) Sizing Chart
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-ink transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Critical Tip Banner */}
          <div className="p-3.5 bg-sand/80 border-l-2 border-gold text-xs text-ink space-y-1">
            <strong className="font-semibold block text-gold-deep">
              Important: Measure your hand knuckles, NOT your wrist!
            </strong>
            <p className="text-text-muted leading-relaxed">
              Bangles are rigid and must slide over the widest part of your hand knuckles when your fingers are brought together.
            </p>
          </div>

          {/* Sizing Table */}
          <div className="overflow-x-auto border border-line">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand/60 text-ink uppercase tracking-wider font-semibold border-b border-line">
                <tr>
                  <th className="py-2.5 px-3">Size (BD)</th>
                  <th className="py-2.5 px-3">Inner Diameter</th>
                  <th className="py-2.5 px-3">Hand Circumference</th>
                  <th className="py-2.5 px-3">Fit Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-gold-deep">2-4</td>
                  <td className="py-2.5 px-3 tabular-nums">2.25" / 5.7 cm</td>
                  <td className="py-2.5 px-3 tabular-nums">7.0" – 7.5"</td>
                  <td className="py-2.5 px-3 text-text-muted">Petite / Slender</td>
                </tr>
                <tr className="bg-gold-light/10 font-medium">
                  <td className="py-2.5 px-3 font-semibold text-gold-deep">2-6</td>
                  <td className="py-2.5 px-3 tabular-nums">2.37" / 6.0 cm</td>
                  <td className="py-2.5 px-3 tabular-nums">7.5" – 8.0"</td>
                  <td className="py-2.5 px-3 text-ink font-semibold">Standard (Most Common)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-gold-deep">2-8</td>
                  <td className="py-2.5 px-3 tabular-nums">2.50" / 6.4 cm</td>
                  <td className="py-2.5 px-3 tabular-nums">8.0" – 8.5"</td>
                  <td className="py-2.5 px-3 text-text-muted">Comfort / Wider Hand</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3 Steps To Measure */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-ink">
              How to Measure in 2 Minutes:
            </h4>
            <div className="space-y-2 text-xs text-ink/80">
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-gold text-ink font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span>Bring your thumb and little finger together, as if slipping on a bangle.</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-gold text-ink font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span>Wrap a piece of string around the widest part of your hand across the knuckles.</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-gold text-ink font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span>Measure the string against a ruler. Match against the table above.</span>
              </div>
            </div>
          </div>

          {/* Exchange Guarantee */}
          <div className="pt-2 border-t border-line flex items-center space-x-3 text-xs text-text-muted">
            <RotateCcw className="w-4 h-4 text-gold-deep shrink-0" />
            <span>Still unsure? If it doesn't fit, we offer 7-day doorstep size exchange across Bangladesh.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gold text-ink text-xs font-semibold uppercase tracking-wider rounded-[2px] hover:bg-ink-soft transition-colors"
          >
            Got It, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
