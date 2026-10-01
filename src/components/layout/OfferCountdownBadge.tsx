'use client';

import React, { useState } from 'react';
import { useNewVisitorOffer } from '@/context/NewVisitorOfferContext';
import { Clock, Sparkles, X, Eye } from 'lucide-react';

export default function OfferCountdownBadge() {
  const { isOfferActive, remainingSeconds, discountPercent, settings, isPreviewMode } = useNewVisitorOffer();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isOfferActive || remainingSeconds <= 0 || isDismissed) return null;

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Urgency: last 5 minutes → pulsing animation
  const isUrgent = remainingSeconds <= 300;

  return (
    <div
      className="fixed z-40 transition-all duration-500 ease-out"
      style={{
        top: '72px',
        right: '16px',
      }}
    >
      <div
        className={`
          flex items-center gap-2.5 px-4 py-2.5 rounded-full
          bg-ink shadow-xl border border-gold/25
          backdrop-blur-md
          ${isUrgent ? 'animate-pulse' : ''}
        `}
        style={{
          boxShadow: isUrgent
            ? '0 0 20px rgba(198,169,110,0.35), 0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {/* Sparkle icon */}
        <div className="w-6 h-6 rounded-full gold-gradient-bg flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3 text-ink" />
        </div>

        {/* Text */}
        <div className="flex flex-col leading-none">
          <span className="text-[10px] uppercase tracking-wider text-gold/60 font-sans font-medium flex items-center gap-1">
            <span>
              {discountPercent}% off · {settings.timerLabel || 'New Visitor Offer'}
            </span>
            {isPreviewMode && (
              <span className="text-[8px] bg-gold/20 text-gold-light px-1 py-0.2 rounded-xs border border-gold/30">
                PREVIEW
              </span>
            )}
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-gold-light" />
            <span
              className={`text-sm font-mono font-bold tracking-wide ${
                isUrgent ? 'text-danger' : 'text-gold-light'
              }`}
            >
              {timeStr}
            </span>
          </div>
        </div>

        {/* Close / dismiss badge */}
        <button
          onClick={() => setIsDismissed(true)}
          className="ml-1 w-5 h-5 flex items-center justify-center rounded-full text-gold/40 hover:text-gold hover:bg-ink-soft/60 transition-colors shrink-0"
          aria-label="Hide countdown badge"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
