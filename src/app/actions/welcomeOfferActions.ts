'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import {
  WelcomeOfferSettingsData,
  DEFAULT_WELCOME_OFFER_SETTINGS,
} from '@/data/newVisitorOffer';

function formatSettings(item: any): WelcomeOfferSettingsData {
  return {
    id: item.id || 'default',
    enabled: Boolean(item.enabled),
    discountPercent: Number(item.discountPercent ?? DEFAULT_WELCOME_OFFER_SETTINGS.discountPercent),
    delaySeconds: Number(item.delaySeconds ?? DEFAULT_WELCOME_OFFER_SETTINGS.delaySeconds),
    durationMinutes: Number(item.durationMinutes ?? DEFAULT_WELCOME_OFFER_SETTINGS.durationMinutes),
    maxDiscountAmount:
      item.maxDiscountAmount !== null && item.maxDiscountAmount !== undefined
        ? Number(item.maxDiscountAmount)
        : null,
    minOrderAmount:
      item.minOrderAmount !== null && item.minOrderAmount !== undefined
        ? Number(item.minOrderAmount)
        : null,
    welcomeTitle: item.welcomeTitle || DEFAULT_WELCOME_OFFER_SETTINGS.welcomeTitle,
    welcomeSubtext: item.welcomeSubtext || DEFAULT_WELCOME_OFFER_SETTINGS.welcomeSubtext,
    ctaButtonText: item.ctaButtonText || DEFAULT_WELCOME_OFFER_SETTINGS.ctaButtonText,
    skipButtonText: item.skipButtonText || DEFAULT_WELCOME_OFFER_SETTINGS.skipButtonText,
    timerLabel: item.timerLabel || DEFAULT_WELCOME_OFFER_SETTINGS.timerLabel,
    badgeText: item.badgeText || DEFAULT_WELCOME_OFFER_SETTINGS.badgeText,
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
  };
}

export async function getWelcomeOfferSettings(): Promise<WelcomeOfferSettingsData> {
  try {
    if (!prisma.welcomeOfferSettings) {
      return DEFAULT_WELCOME_OFFER_SETTINGS;
    }

    const existing = await prisma.welcomeOfferSettings.findUnique({
      where: { id: 'default' },
    });

    if (existing) {
      return formatSettings(existing);
    }

    // Initialize with defaults if table is empty
    const created = await prisma.welcomeOfferSettings.create({
      data: {
        id: 'default',
        enabled: DEFAULT_WELCOME_OFFER_SETTINGS.enabled,
        discountPercent: DEFAULT_WELCOME_OFFER_SETTINGS.discountPercent,
        delaySeconds: DEFAULT_WELCOME_OFFER_SETTINGS.delaySeconds,
        durationMinutes: DEFAULT_WELCOME_OFFER_SETTINGS.durationMinutes,
        maxDiscountAmount: DEFAULT_WELCOME_OFFER_SETTINGS.maxDiscountAmount,
        minOrderAmount: DEFAULT_WELCOME_OFFER_SETTINGS.minOrderAmount,
        welcomeTitle: DEFAULT_WELCOME_OFFER_SETTINGS.welcomeTitle,
        welcomeSubtext: DEFAULT_WELCOME_OFFER_SETTINGS.welcomeSubtext,
        ctaButtonText: DEFAULT_WELCOME_OFFER_SETTINGS.ctaButtonText,
        skipButtonText: DEFAULT_WELCOME_OFFER_SETTINGS.skipButtonText,
        timerLabel: DEFAULT_WELCOME_OFFER_SETTINGS.timerLabel,
        badgeText: DEFAULT_WELCOME_OFFER_SETTINGS.badgeText,
      },
    });

    return formatSettings(created);
  } catch (error) {
    console.error('[getWelcomeOfferSettings] Error reading settings from database:', error);
    return DEFAULT_WELCOME_OFFER_SETTINGS;
  }
}

export async function updateWelcomeOfferSettings(
  input: Partial<Omit<WelcomeOfferSettingsData, 'id' | 'updatedAt'>>
): Promise<{ success: boolean; settings?: WelcomeOfferSettingsData; error?: string }> {
  try {
    const updated = await prisma.welcomeOfferSettings.upsert({
      where: { id: 'default' },
      update: {
        enabled: input.enabled ?? undefined,
        discountPercent: input.discountPercent !== undefined ? Number(input.discountPercent) : undefined,
        delaySeconds: input.delaySeconds !== undefined ? Math.max(0, Math.round(Number(input.delaySeconds))) : undefined,
        durationMinutes: input.durationMinutes !== undefined ? Math.max(1, Math.round(Number(input.durationMinutes))) : undefined,
        maxDiscountAmount: input.maxDiscountAmount !== undefined ? (input.maxDiscountAmount === null ? null : Number(input.maxDiscountAmount)) : undefined,
        minOrderAmount: input.minOrderAmount !== undefined ? (input.minOrderAmount === null ? null : Number(input.minOrderAmount)) : undefined,
        welcomeTitle: input.welcomeTitle ?? undefined,
        welcomeSubtext: input.welcomeSubtext ?? undefined,
        ctaButtonText: input.ctaButtonText ?? undefined,
        skipButtonText: input.skipButtonText ?? undefined,
        timerLabel: input.timerLabel ?? undefined,
        badgeText: input.badgeText ?? undefined,
      },
      create: {
        id: 'default',
        enabled: input.enabled ?? DEFAULT_WELCOME_OFFER_SETTINGS.enabled,
        discountPercent: input.discountPercent !== undefined ? Number(input.discountPercent) : DEFAULT_WELCOME_OFFER_SETTINGS.discountPercent,
        delaySeconds: input.delaySeconds !== undefined ? Math.max(0, Math.round(Number(input.delaySeconds))) : DEFAULT_WELCOME_OFFER_SETTINGS.delaySeconds,
        durationMinutes: input.durationMinutes !== undefined ? Math.max(1, Math.round(Number(input.durationMinutes))) : DEFAULT_WELCOME_OFFER_SETTINGS.durationMinutes,
        maxDiscountAmount: input.maxDiscountAmount !== undefined ? input.maxDiscountAmount : DEFAULT_WELCOME_OFFER_SETTINGS.maxDiscountAmount,
        minOrderAmount: input.minOrderAmount !== undefined ? input.minOrderAmount : DEFAULT_WELCOME_OFFER_SETTINGS.minOrderAmount,
        welcomeTitle: input.welcomeTitle ?? DEFAULT_WELCOME_OFFER_SETTINGS.welcomeTitle,
        welcomeSubtext: input.welcomeSubtext ?? DEFAULT_WELCOME_OFFER_SETTINGS.welcomeSubtext,
        ctaButtonText: input.ctaButtonText ?? DEFAULT_WELCOME_OFFER_SETTINGS.ctaButtonText,
        skipButtonText: input.skipButtonText ?? DEFAULT_WELCOME_OFFER_SETTINGS.skipButtonText,
        timerLabel: input.timerLabel ?? DEFAULT_WELCOME_OFFER_SETTINGS.timerLabel,
        badgeText: input.badgeText ?? DEFAULT_WELCOME_OFFER_SETTINGS.badgeText,
      },
    });

    revalidatePath('/', 'layout');
    revalidatePath('/checkout');
    revalidatePath('/admin');
    revalidatePath('/admin/welcome-offer');

    return { success: true, settings: formatSettings(updated) };
  } catch (error) {
    console.error('[updateWelcomeOfferSettings] Error updating settings:', error);
    return { success: false, error: String(error) };
  }
}
