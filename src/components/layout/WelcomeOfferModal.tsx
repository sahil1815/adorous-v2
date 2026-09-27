'use client';

import React, { useEffect, useState } from 'react';
import { useNewVisitorOffer } from '@/context/NewVisitorOfferContext';
import { NEW_VISITOR_OFFER } from '@/data/newVisitorOffer';
import { Sparkles, Gift, Clock, X } from 'lucide-react';

export default function WelcomeOfferModal() {
  const { isModalOpen, dismissModal, discountPercent } = useNewVisitorOffer();
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      // Small delay so the DOM mounts first, then CSS transition kicks in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimatingIn(true));
      });
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      dismissModal();
      setIsAnimatingIn(false);
      setIsAnimatingOut(false);
      document.body.style.overflow = '';
    }, 350);
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        opacity: isAnimatingIn && !isAnimatingOut ? 1 : 0,
        transition: 'opacity 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-2xl"
        style={{
          transform: isAnimatingIn && !isAnimatingOut ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.95)',
          transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Gold gradient border effect */}
        <div className="absolute inset-0 rounded-2xl gold-gradient-bg opacity-30 pointer-events-none" />

        {/* Inner card */}
        <div className="relative bg-ink m-[1.5px] rounded-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-ink-soft/60 text-gold/60 hover:text-gold hover:bg-ink-soft transition-all duration-200"
            aria-label="Close welcome offer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Decorative top pattern */}
          <div className="relative h-28 overflow-hidden flex items-center justify-center">
            {/* Geometric gold lines / shimmer background */}
            <div className="absolute inset-0 opacity-15">
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 20px,
                      rgba(198,169,110,0.15) 20px,
                      rgba(198,169,110,0.15) 21px
                    ),
                    repeating-linear-gradient(
                      -45deg,
                      transparent,
                      transparent 20px,
                      rgba(198,169,110,0.1) 20px,
                      rgba(198,169,110,0.1) 21px
                    )
                  `,
                }}
              />
            </div>
            {/* Radial gold glow */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(198,169,110,0.2) 0%, transparent 70%)',
              }}
            />
            {/* Animated sparkle icon */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full gold-gradient-bg flex items-center justify-center shadow-lg gold-monogram-pulse">
                <Gift className="w-8 h-8 text-ink" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-7 pt-4 text-center">
            {/* Discount badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
              <span className="text-xs font-medium tracking-wider uppercase text-gold-light">
                Exclusive First Visit Offer
              </span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-gold-light mb-3 leading-tight">
              {NEW_VISITOR_OFFER.welcomeTitle}
            </h2>

            {/* Subtitle */}
            <p className="text-sm text-gold-light/70 leading-relaxed mb-5 max-w-xs mx-auto font-sans">
              {NEW_VISITOR_OFFER.welcomeSubtext}
            </p>

            {/* Big discount display */}
            <div className="mb-5">
              <div className="inline-flex items-baseline gap-1">
                <span className="text-5xl sm:text-6xl font-serif font-bold gold-gradient-text">
                  {discountPercent}%
                </span>
                <span className="text-lg text-gold/80 font-sans font-medium uppercase tracking-wider">
                  off
                </span>
              </div>
              <p className="text-xs text-gold/50 mt-1 font-sans flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Valid for {NEW_VISITOR_OFFER.durationMinutes} minutes after you close this popup
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleClose}
              className="w-full py-3.5 px-6 rounded-xl font-sans font-semibold text-sm tracking-wider uppercase transition-all duration-300 gold-gradient-bg text-ink hover:shadow-lg hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Shopping Now
            </button>

            {/* Skip link */}
            <button
              onClick={handleClose}
              className="mt-3 text-xs text-gold/40 hover:text-gold/60 transition-colors font-sans underline underline-offset-2"
            >
              No thanks, continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
