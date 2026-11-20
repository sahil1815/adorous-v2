import { BangleSetTier } from '@/types';

/**
 * Resolves the dynamic promotional banner text based on the selected set tier.
 * 
 * Behavior:
 * 1. When a tier is selected and has `perSetPriceText`:
 *    - If `perSetPriceText` already mentions the tier name or numeric count, use it directly (+ badge suffix).
 *    - Otherwise, format dynamically: `${tier.name}-এর ক্ষেত্রে ${tier.perSetPriceText}${badgeSuffix}`.
 * 2. If the tier has no `perSetPriceText`:
 *    - Fall back to the customBanner configured in admin (if provided).
 *    - Otherwise, fall back to `${tier.name} বান্ডেল অফার${badgeSuffix}`.
 */
const toBanglaDigits = (str: string) =>
  str.replace(/[0-9]/g, (d) => String.fromCharCode(d.charCodeAt(0) + 0x09e6 - 0x0030));

const toEnglishDigits = (str: string) =>
  str.replace(/[০-৯]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x09e6 + 0x0030));

export function resolveDynamicSetBanner(
  tier: BangleSetTier | null | undefined,
  customBanner?: string | null
): string {
  if (!tier) return customBanner?.trim() || '';

  // 1. Direct editable promotional banner configured on this tier
  if (tier.promoBanner && tier.promoBanner.trim()) {
    return tier.promoBanner.trim();
  }

  // 2. Derive dynamically from perSetPriceText and badge
  if (tier.perSetPriceText && tier.perSetPriceText.trim()) {
    const perSetText = tier.perSetPriceText.trim();
    const tierName = tier.name.trim();
    const badgeSuffix = tier.badge && tier.badge.trim() ? ` (${tier.badge.trim()})` : '';

    const lowerText = perSetText.toLowerCase();
    const lowerName = tierName.toLowerCase();
    const digitsOnly = tierName.replace(/\D/g, '');
    const banglaDigits = toBanglaDigits(digitsOnly);

    const alreadyMentions =
      lowerText.includes(lowerName) ||
      (digitsOnly.length > 0 && (
        lowerText.includes(digitsOnly) ||
        lowerText.includes(banglaDigits) ||
        lowerText.includes(`${digitsOnly} সেট`) ||
        lowerText.includes(`${banglaDigits} সেট`) ||
        lowerText.includes(`${banglaDigits} সেটের`)
      ));

    if (alreadyMentions) {
      return `${perSetText}${badgeSuffix}`;
    }

    return `${tierName}-এর ক্ষেত্রে ${perSetText}${badgeSuffix}`;
  }

  // Fallback to custom banner if provided
  if (customBanner && customBanner.trim()) {
    return customBanner.trim();
  }

  if (tier) {
    const badgeSuffix = tier.badge && tier.badge.trim() ? ` (${tier.badge.trim()})` : '';
    return `${tier.name} বান্ডেল অফার${badgeSuffix}`;
  }

  return '';
}
