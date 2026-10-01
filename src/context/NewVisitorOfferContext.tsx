'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { getWelcomeOfferSettings } from '@/app/actions/welcomeOfferActions';
import {
  WelcomeOfferSettingsData,
  DEFAULT_WELCOME_OFFER_SETTINGS,
} from '@/data/newVisitorOffer';

// ── Persistent Storage Keys (Normal Visitors) ──────────────────────
const LS_START_TS   = 'adorous_nvo_startTimestamp';   // epoch ms when offer countdown started
const LS_SHOWN      = 'adorous_nvo_shown';            // offer was shown & activated
const LS_DISMISSED  = 'adorous_nvo_dismissed';        // modal was closed/dismissed
const LS_USED       = 'adorous_nvo_used';             // offer was redeemed (one-time)

// ── Session Storage Keys (Session navigation & Preview mode) ───────
const SS_ACTIVE_MS           = 'adorous_nvo_session_active_ms';     // active continuous ms accumulated
const SS_PREVIEW_MODE        = 'adorous_nvo_preview';              // test mode flag
const SS_PREVIEW_SHOWN       = 'adorous_nvo_preview_shown';
const SS_PREVIEW_START_TS    = 'adorous_nvo_preview_start_ts';
const SS_PREVIEW_DISMISSED   = 'adorous_nvo_preview_dismissed';
const SS_PREVIEW_USED        = 'adorous_nvo_preview_used';

export interface DiscountCalculableItem {
  product: {
    price: number;
    originalPrice?: number | null;
  };
  quantity: number;
}

export interface NewVisitorOfferContextType {
  /** Whether the welcome modal should be visible */
  isModalOpen: boolean;
  /** Whether the countdown is active and the discount applies */
  isOfferActive: boolean;
  /** Seconds remaining in the countdown (0 when expired) */
  remainingSeconds: number;
  /** The discount percentage from DB/config */
  discountPercent: number;
  /** Current offer settings */
  settings: WelcomeOfferSettingsData;
  /** Whether current session is in admin preview/test mode */
  isPreviewMode: boolean;
  /** Dismiss the modal (discount stays active) */
  dismissModal: () => void;
  /** Calculate flat discount amount for cart items or subtotal */
  calculateDiscount: (itemsOrSubtotal: DiscountCalculableItem[] | number) => number;
  /** Mark the offer as redeemed (call after successful order) */
  markUsed: () => void;
  /** Force trigger test offer (preview mode helper) */
  resetPreviewOffer: () => void;
}

const NewVisitorOfferContext = createContext<NewVisitorOfferContextType | undefined>(undefined);

export function NewVisitorOfferProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WelcomeOfferSettingsData>(DEFAULT_WELCOME_OFFER_SETTINGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOfferActive, setIsOfferActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settingsLoadedRef = useRef(false);

  // ── Helper: Read storage based on preview mode ──────────────────
  const getStorageItem = useCallback((key: 'used' | 'shown' | 'dismissed' | 'startTs', preview: boolean) => {
    if (typeof window === 'undefined') return null;
    try {
      if (preview) {
        if (key === 'used') return sessionStorage.getItem(SS_PREVIEW_USED);
        if (key === 'shown') return sessionStorage.getItem(SS_PREVIEW_SHOWN);
        if (key === 'dismissed') return sessionStorage.getItem(SS_PREVIEW_DISMISSED);
        if (key === 'startTs') return sessionStorage.getItem(SS_PREVIEW_START_TS);
      } else {
        if (key === 'used') return localStorage.getItem(LS_USED);
        if (key === 'shown') return localStorage.getItem(LS_SHOWN);
        if (key === 'dismissed') return localStorage.getItem(LS_DISMISSED);
        if (key === 'startTs') return localStorage.getItem(LS_START_TS);
      }
    } catch {
      return null;
    }
    return null;
  }, []);

  // ── Helper: Set storage based on preview mode ───────────────────
  const setStorageItem = useCallback((key: 'used' | 'shown' | 'dismissed' | 'startTs', value: string, preview: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      if (preview) {
        if (key === 'used') sessionStorage.setItem(SS_PREVIEW_USED, value);
        if (key === 'shown') sessionStorage.setItem(SS_PREVIEW_SHOWN, value);
        if (key === 'dismissed') sessionStorage.setItem(SS_PREVIEW_DISMISSED, value);
        if (key === 'startTs') sessionStorage.setItem(SS_PREVIEW_START_TS, value);
      } else {
        if (key === 'used') localStorage.setItem(LS_USED, value);
        if (key === 'shown') localStorage.setItem(LS_SHOWN, value);
        if (key === 'dismissed') localStorage.setItem(LS_DISMISSED, value);
        if (key === 'startTs') localStorage.setItem(LS_START_TS, value);
      }
    } catch {
      // storage unavailable / quota exceeded
    }
  }, []);

  // ── 1. Fetch DB Settings and Detect Preview Mode on Mount ────────
  useEffect(() => {
    let isCancelled = false;

    async function init() {
      // Check for preview mode in URL params or sessionStorage
      let isPreview = false;
      if (typeof window !== 'undefined') {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('adorous_preview_nvo') === '1') {
            isPreview = true;
            sessionStorage.setItem(SS_PREVIEW_MODE, 'true');
          } else if (sessionStorage.getItem(SS_PREVIEW_MODE) === 'true') {
            isPreview = true;
          }
        } catch {
          // ignore
        }
      }
      setIsPreviewMode(isPreview);

      try {
        const dbSettings = await getWelcomeOfferSettings();
        if (!isCancelled) {
          setSettings(dbSettings);
          settingsLoadedRef.current = true;
          startOfferLifecycle(dbSettings, isPreview);
        }
      } catch (err) {
        console.error('Failed to load welcome offer settings, falling back:', err);
        if (!isCancelled) {
          setSettings(DEFAULT_WELCOME_OFFER_SETTINGS);
          settingsLoadedRef.current = true;
          startOfferLifecycle(DEFAULT_WELCOME_OFFER_SETTINGS, isPreview);
        }
      }
    }

    init();

    return () => {
      isCancelled = true;
      if (delayTimerRef.current) {
        clearInterval(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

  // ── 2. Offer Lifecycle: Delay Trigger or Resume Existing Countdown
  const startOfferLifecycle = (currentSettings: WelcomeOfferSettingsData, isPreview: boolean) => {
    if (!currentSettings.enabled && !isPreview) {
      setIsHydrated(true);
      return;
    }

    const durationMs = (currentSettings.durationMinutes || 30) * 60 * 1000;
    const used = getStorageItem('used', isPreview);
    if (used === 'true') {
      // Offer already redeemed
      setIsHydrated(true);
      return;
    }

    const shown = getStorageItem('shown', isPreview);
    const startTsStr = getStorageItem('startTs', isPreview);
    const dismissed = getStorageItem('dismissed', isPreview);

    if (shown === 'true' && startTsStr) {
      // Offer was already unlocked previously
      const startTs = parseInt(startTsStr, 10);
      const elapsed = Date.now() - startTs;

      if (elapsed < durationMs) {
        // Still within offer duration window
        const secsLeft = Math.ceil((durationMs - elapsed) / 1000);
        setRemainingSeconds(secsLeft);
        setIsOfferActive(true);
        // If it was shown but user refreshed without closing modal, show modal; otherwise stay closed
        setIsModalOpen(dismissed !== 'true');
      } else {
        // Offer window expired
        setIsOfferActive(false);
        setRemainingSeconds(0);
        setIsModalOpen(false);
      }
      setIsHydrated(true);
      return;
    }

    // ── Brand-New Visitor: Start or Continue 5-second Continuous Delay ──
    setIsHydrated(true);
    const targetDelayMs = Math.max(0, (currentSettings.delaySeconds ?? 5) * 1000);

    // If delay is 0s, trigger immediately
    if (targetDelayMs === 0) {
      activateOffer(currentSettings, isPreview);
      return;
    }

    // Read accumulated session time (preserved across page navigations in same tab)
    let accumulatedMs = 0;
    try {
      const savedMs = sessionStorage.getItem(SS_ACTIVE_MS);
      if (savedMs) {
        accumulatedMs = parseInt(savedMs, 10) || 0;
      }
    } catch {}

    // Check if target delay was already reached during previous page transition
    if (accumulatedMs >= targetDelayMs) {
      activateOffer(currentSettings, isPreview);
      return;
    }

    // Start continuous tracking ticker (ticks every 250ms)
    let lastTick = Date.now();

    const handleVisibilityChange = () => {
      // Reset last tick on tab focus so background time isn't counted
      lastTick = Date.now();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    delayTimerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTick;
      lastTick = now;

      // Only accumulate time if page is actively visible
      const isVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
      if (isVisible) {
        accumulatedMs += delta;
        try {
          sessionStorage.setItem(SS_ACTIVE_MS, String(accumulatedMs));
        } catch {}

        if (accumulatedMs >= targetDelayMs) {
          if (delayTimerRef.current) {
            clearInterval(delayTimerRef.current);
            delayTimerRef.current = null;
          }
          if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
          }
          try {
            sessionStorage.removeItem(SS_ACTIVE_MS);
          } catch {}
          activateOffer(currentSettings, isPreview);
        }
      }
    }, 250);
  };

  // ── 3. Activate Offer & Start Countdown ──────────────────────────
  const activateOffer = (currentSettings: WelcomeOfferSettingsData, isPreview: boolean) => {
    const now = Date.now();
    const durationSeconds = (currentSettings.durationMinutes || 30) * 60;

    // Both modal pops up AND discount becomes active immediately
    setIsModalOpen(true);
    setIsOfferActive(true);
    setRemainingSeconds(durationSeconds);

    // Record that offer has now been shown/unlocked
    setStorageItem('shown', 'true', isPreview);
    setStorageItem('startTs', String(now), isPreview);
  };

  // ── 4. Active Countdown Ticker ───────────────────────────────────
  useEffect(() => {
    if (!isOfferActive || remainingSeconds <= 0) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsOfferActive(false);
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [isOfferActive, remainingSeconds]);

  // ── 5. Dismiss Modal (Offer & discount remain active) ────────────
  const dismissModal = useCallback(() => {
    setIsModalOpen(false);
    setStorageItem('dismissed', 'true', isPreviewMode);
  }, [isPreviewMode, setStorageItem]);

  // ── 6. Calculate Flat Discount Amount ────────────────────────────
  const calculateDiscount = useCallback(
    (itemsOrSubtotal: DiscountCalculableItem[] | number): number => {
      if (!isOfferActive || remainingSeconds <= 0) return 0;
      const pct = settings.discountPercent || 10;

      if (Array.isArray(itemsOrSubtotal)) {
        let cartSubtotal = 0;
        let totalDiscount = 0;

        for (const item of itemsOrSubtotal) {
          const price = Number(item.product.price) || 0;
          const originalPrice =
            item.product.originalPrice && item.product.originalPrice > price
              ? Number(item.product.originalPrice)
              : price;
          const qty = Number(item.quantity) || 1;
          cartSubtotal += price * qty;

          // Target price at flat X% discount from originalPrice
          const targetPrice = Math.round(originalPrice * (1 - pct / 100));

          // If current selling price is higher than targetPrice, discount down to flat X%
          if (price > targetPrice) {
            totalDiscount += (price - targetPrice) * qty;
          }
          // Exception: If current price <= targetPrice (product already has >= X% discount),
          // keep it as is (additional discount = 0).
        }

        if (settings.minOrderAmount && cartSubtotal < settings.minOrderAmount) {
          return 0;
        }

        return settings.maxDiscountAmount
          ? Math.min(totalDiscount, settings.maxDiscountAmount)
          : totalDiscount;
      }

      // Fallback for number subtotal
      const subtotal = Number(itemsOrSubtotal) || 0;
      if (settings.minOrderAmount && subtotal < settings.minOrderAmount) return 0;
      const raw = Math.round((subtotal * pct) / 100);
      return settings.maxDiscountAmount ? Math.min(raw, settings.maxDiscountAmount) : raw;
    },
    [isOfferActive, remainingSeconds, settings.discountPercent, settings.minOrderAmount, settings.maxDiscountAmount]
  );

  // ── 7. Mark Offer as Used (After successful checkout) ────────────
  const markUsed = useCallback(() => {
    setIsOfferActive(false);
    setRemainingSeconds(0);
    setIsModalOpen(false);
    setStorageItem('used', 'true', isPreviewMode);
  }, [isPreviewMode, setStorageItem]);

  // ── 8. Reset Preview Mode Helper (For Admin testing) ─────────────
  const resetPreviewOffer = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(SS_PREVIEW_SHOWN);
        sessionStorage.removeItem(SS_PREVIEW_START_TS);
        sessionStorage.removeItem(SS_PREVIEW_DISMISSED);
        sessionStorage.removeItem(SS_PREVIEW_USED);
        sessionStorage.removeItem(SS_ACTIVE_MS);
      } catch {}
    }
    setIsModalOpen(false);
    setIsOfferActive(false);
    setRemainingSeconds(0);
    startOfferLifecycle(settings, true);
  }, [settings]);

  // Don't render children until hydrated to prevent hydration mismatch flash
  if (!isHydrated) return null;

  return (
    <NewVisitorOfferContext.Provider
      value={{
        isModalOpen,
        isOfferActive,
        remainingSeconds,
        discountPercent: settings.discountPercent,
        settings,
        isPreviewMode,
        dismissModal,
        calculateDiscount,
        markUsed,
        resetPreviewOffer,
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
