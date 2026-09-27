'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { NEW_VISITOR_OFFER } from '@/data/newVisitorOffer';

// ── localStorage keys ──────────────────────────────────────────────
const LS_START_TS   = 'adorous_nvo_startTimestamp';   // epoch ms when countdown began
const LS_DISMISSED  = 'adorous_nvo_dismissed';        // modal was shown & closed
const LS_USED       = 'adorous_nvo_used';             // offer was redeemed (one-time)

interface NewVisitorOfferContextType {
  /** Whether the welcome modal should be visible */
  isModalOpen: boolean;
  /** Whether the countdown is active and the discount applies */
  isOfferActive: boolean;
  /** Seconds remaining in the countdown (0 when expired) */
  remainingSeconds: number;
  /** The discount percentage from config */
  discountPercent: number;
  /** Dismiss the modal and start the countdown */
  dismissModal: () => void;
  /** Calculate the discount amount for a given subtotal */
  calculateDiscount: (subtotal: number) => number;
  /** Mark the offer as redeemed (call after successful order) */
  markUsed: () => void;
}

const NewVisitorOfferContext = createContext<NewVisitorOfferContextType | undefined>(undefined);

export function NewVisitorOfferProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOfferActive, setIsOfferActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const durationMs = NEW_VISITOR_OFFER.durationMinutes * 60 * 1000;
  const discountPercent = NEW_VISITOR_OFFER.discountPercent;

  // ── Hydrate from localStorage on mount ───────────────────────────
  useEffect(() => {
    if (!NEW_VISITOR_OFFER.enabled) {
      setIsHydrated(true);
      return;
    }

    try {
      const used = localStorage.getItem(LS_USED);
      if (used === 'true') {
        // Offer already redeemed — no modal, no timer
        setIsHydrated(true);
        return;
      }

      const dismissed = localStorage.getItem(LS_DISMISSED);
      const startTsStr = localStorage.getItem(LS_START_TS);

      if (!dismissed) {
        // Brand-new visitor — show the modal
        setIsModalOpen(true);
      } else if (startTsStr) {
        // Returning visitor who already dismissed the modal
        const startTs = parseInt(startTsStr, 10);
        const elapsed = Date.now() - startTs;
        if (elapsed < durationMs) {
          // Still within the offer window
          const secsLeft = Math.ceil((durationMs - elapsed) / 1000);
          setRemainingSeconds(secsLeft);
          setIsOfferActive(true);
        }
        // If elapsed >= durationMs the offer has expired → do nothing
      }
    } catch {
      // localStorage unavailable — silent fail
    }

    setIsHydrated(true);
  }, [durationMs]);

  // ── Countdown interval ───────────────────────────────────────────
  useEffect(() => {
    if (!isOfferActive || remainingSeconds <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsOfferActive(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOfferActive, remainingSeconds]);

  // ── Dismiss modal & start countdown ──────────────────────────────
  const dismissModal = useCallback(() => {
    const now = Date.now();
    setIsModalOpen(false);
    setIsOfferActive(true);
    setRemainingSeconds(NEW_VISITOR_OFFER.durationMinutes * 60);

    try {
      localStorage.setItem(LS_DISMISSED, 'true');
      localStorage.setItem(LS_START_TS, String(now));
    } catch {
      // silent
    }
  }, []);

  // ── Calculate discount for a subtotal ────────────────────────────
  const calculateDiscount = useCallback(
    (subtotal: number): number => {
      if (!isOfferActive || remainingSeconds <= 0) return 0;
      if (NEW_VISITOR_OFFER.minOrderAmount && subtotal < NEW_VISITOR_OFFER.minOrderAmount) return 0;

      const raw = Math.round((subtotal * discountPercent) / 100);
      return NEW_VISITOR_OFFER.maxDiscountAmount
        ? Math.min(raw, NEW_VISITOR_OFFER.maxDiscountAmount)
        : raw;
    },
    [isOfferActive, remainingSeconds, discountPercent]
  );

  // ── Mark offer as used (after checkout) ──────────────────────────
  const markUsed = useCallback(() => {
    setIsOfferActive(false);
    setRemainingSeconds(0);
    setIsModalOpen(false);
    try {
      localStorage.setItem(LS_USED, 'true');
    } catch {
      // silent
    }
  }, []);

  // Don't render children until hydrated to avoid flash
  if (!isHydrated) return null;

  return (
    <NewVisitorOfferContext.Provider
      value={{
        isModalOpen,
        isOfferActive,
        remainingSeconds,
        discountPercent,
        dismissModal,
        calculateDiscount,
        markUsed,
      }}
    >
      {children}
    </NewVisitorOfferContext.Provider>
  );
}

export function useNewVisitorOffer() {
  const context = useContext(NewVisitorOfferContext);
  if (!context) {
    throw new Error('useNewVisitorOffer must be used within a NewVisitorOfferProvider');
  }
  return context;
}
