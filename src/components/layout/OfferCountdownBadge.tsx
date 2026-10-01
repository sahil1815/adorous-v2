'use client';

import React, { useState, useRef } from 'react';
import { useNewVisitorOffer } from '@/context/NewVisitorOfferContext';
import { Clock, Sparkles, X } from 'lucide-react';

export default function OfferCountdownBadge() {
  const { isOfferActive, remainingSeconds, discountPercent, settings, isPreviewMode } = useNewVisitorOffer();
  const [isDismissed, setIsDismissed] = useState(false);

  // Drag coordinates and active state
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startOffsetX: number; startOffsetY: number }>({
    clientX: 0,
    clientY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });

  const clampOffset = (x: number, y: number) => {
    if (typeof window === 'undefined') return { x, y };
    const badgeEl = badgeRef.current;
    const badgeWidth = badgeEl ? badgeEl.offsetWidth : 240;
    const badgeHeight = badgeEl ? badgeEl.offsetHeight : 44;

    const minX = -(window.innerWidth - badgeWidth - 16);
    const maxX = 8;
    const minY = -64;
    const maxY = window.innerHeight - 72 - badgeHeight - 16;

    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  };

  React.useEffect(() => {
    const handleResize = () => {
      setOffset((prev) => clampOffset(prev.x, prev.y));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If user clicked close button, let close handler execute without dragging
    if ((e.target as HTMLElement).closest('button')) return;
    if (e.button !== 0) return; // Only drag with primary mouse button / touch

    setIsDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.clientX;
    const deltaY = e.clientY - dragStartRef.current.clientY;
    setOffset(
      clampOffset(
        dragStartRef.current.startOffsetX + deltaX,
        dragStartRef.current.startOffsetY + deltaY
      )
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    // Stays at the place where it is taken
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    // Stays at the place where it is taken
  };

  if (!isOfferActive || remainingSeconds <= 0 || isDismissed) return null;

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Urgency: last 5 minutes → pulsing animation
  const isUrgent = remainingSeconds <= 300;

  return (
    <div
      className="fixed z-40"
      style={{
        top: '72px',
        right: '16px',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <div
        ref={badgeRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`
          flex items-center gap-2.5 px-4 py-2.5 rounded-full
          bg-ink border border-gold/25
          backdrop-blur-md select-none
          ${isUrgent && !isDragging ? 'animate-pulse' : ''}
          ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:border-gold/50'}
        `}
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: isDragging
            ? 'none'
            : 'box-shadow 0.3s ease, border-color 0.2s ease, transform 0.15s ease-out',
          boxShadow: isDragging
            ? '0 16px 36px rgba(0,0,0,0.55), 0 0 25px rgba(198,169,110,0.45)'
            : isUrgent
              ? '0 0 20px rgba(198,169,110,0.35), 0 4px 20px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {/* Sparkle icon */}
        <div className="w-6 h-6 rounded-full gold-gradient-bg flex items-center justify-center shrink-0 pointer-events-none">
          <Sparkles className="w-3 h-3 text-ink" />
        </div>

        {/* Text */}
        <div className="flex flex-col leading-none pointer-events-none">
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
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="ml-1 w-5 h-5 flex items-center justify-center rounded-full text-gold/40 hover:text-gold hover:bg-ink-soft/60 transition-colors shrink-0"
          aria-label="Hide countdown badge"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
