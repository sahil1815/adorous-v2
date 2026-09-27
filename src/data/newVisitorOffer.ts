/**
 * New Visitor Offer Configuration
 * ─────────────────────────────────
 * Admin-friendly single source of truth.
 * Change these values to adjust the offer behaviour sitewide.
 */
export const NEW_VISITOR_OFFER = {
  /** Master switch — set to false to disable the entire feature */
  enabled: true,

  /** Discount percentage applied to all products */
  discountPercent: 10,

  /** How long the offer lasts after the user closes the welcome modal (minutes) */
  durationMinutes: 30,

  /** Maximum discount cap in ৳ (prevents abuse on large orders) */
  maxDiscountAmount: 500,

  /** Minimum cart subtotal required to activate the discount (0 = no minimum) */
  minOrderAmount: 0,

  /** Copy shown in the welcome modal */
  welcomeTitle: 'Welcome to Adorous Fashion ✨',
  welcomeSubtext:
    'As a special welcome, enjoy an exclusive 10% off on your first order. This offer expires in 30 minutes — start exploring our curated collection now!',

  /** Label used on the floating countdown badge */
  timerLabel: 'New Visitor Offer',
} as const;
