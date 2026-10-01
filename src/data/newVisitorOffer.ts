/**
 * New Visitor Offer Configuration & Types
 * ─────────────────────────────────────────
 * Single source of truth for fallback defaults and interfaces.
 */

export interface WelcomeOfferSettingsData {
  id: string;
  enabled: boolean;
  discountPercent: number;
  delaySeconds: number;
  durationMinutes: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number | null;
  welcomeTitle: string;
  welcomeSubtext: string;
  ctaButtonText: string;
  skipButtonText: string;
  timerLabel: string;
  badgeText: string;
  updatedAt?: string;
}

export const NEW_VISITOR_OFFER = {
  /** Master switch — set to false to disable the entire feature */
  enabled: true,

  /** Discount percentage applied to all products */
  discountPercent: 10,

  /** Continuous trigger delay before popup opens (seconds) */
  delaySeconds: 5,

  /** How long the offer lasts after unlocked (minutes) */
  durationMinutes: 30,

  /** Maximum discount cap in ৳ (prevents abuse on large orders) */
  maxDiscountAmount: 500,

  /** Minimum cart subtotal required to activate the discount (0 = no minimum) */
  minOrderAmount: 0,

  /** Copy shown in the welcome modal */
  welcomeTitle: 'Welcome to Adorous Fashion ✨',
  welcomeSubtext:
    'As a special welcome, enjoy an exclusive 10% off on your first order. This offer expires in 30 minutes — start exploring our curated collection now!',

  ctaButtonText: 'Start Shopping Now',
  skipButtonText: 'No thanks, continue browsing',

  /** Label used on the floating countdown badge */
  timerLabel: 'New Visitor Offer',
  badgeText: 'Exclusive First Visit Offer',
} as const;

export const DEFAULT_WELCOME_OFFER_SETTINGS: WelcomeOfferSettingsData = {
  id: 'default',
  enabled: NEW_VISITOR_OFFER.enabled,
  discountPercent: NEW_VISITOR_OFFER.discountPercent,
  delaySeconds: NEW_VISITOR_OFFER.delaySeconds,
  durationMinutes: NEW_VISITOR_OFFER.durationMinutes,
  maxDiscountAmount: NEW_VISITOR_OFFER.maxDiscountAmount,
  minOrderAmount: NEW_VISITOR_OFFER.minOrderAmount,
  welcomeTitle: NEW_VISITOR_OFFER.welcomeTitle,
  welcomeSubtext: NEW_VISITOR_OFFER.welcomeSubtext,
  ctaButtonText: NEW_VISITOR_OFFER.ctaButtonText,
  skipButtonText: NEW_VISITOR_OFFER.skipButtonText,
  timerLabel: NEW_VISITOR_OFFER.timerLabel,
  badgeText: NEW_VISITOR_OFFER.badgeText,
};
