'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Clock,
  Gift,
  X,
  Percent,
  Timer,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Sliders,
  Type,
  FileCode2,
  DollarSign
} from 'lucide-react';
import {
  getWelcomeOfferSettings,
  updateWelcomeOfferSettings,
} from '@/app/actions/welcomeOfferActions';
import {
  WelcomeOfferSettingsData,
  DEFAULT_WELCOME_OFFER_SETTINGS,
} from '@/data/newVisitorOffer';

export default function AdminWelcomeOfferPage() {
  const [settings, setSettings] = useState<WelcomeOfferSettingsData>(DEFAULT_WELCOME_OFFER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [enabled, setEnabled] = useState(true);
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [delaySeconds, setDelaySeconds] = useState<number>(5);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | null>(500);
  const [minOrderAmount, setMinOrderAmount] = useState<number | null>(0);

  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeSubtext, setWelcomeSubtext] = useState('');
  const [ctaButtonText, setCtaButtonText] = useState('');
  const [skipButtonText, setSkipButtonText] = useState('');
  const [timerLabel, setTimerLabel] = useState('');
  const [badgeText, setBadgeText] = useState('');

  // Load from DB on mount
  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await getWelcomeOfferSettings();
        setSettings(data);
        setEnabled(data.enabled);
        setDiscountPercent(data.discountPercent);
        setDelaySeconds(data.delaySeconds);
        setDurationMinutes(data.durationMinutes);
        setMaxDiscountAmount(data.maxDiscountAmount);
        setMinOrderAmount(data.minOrderAmount);
        setWelcomeTitle(data.welcomeTitle);
        setWelcomeSubtext(data.welcomeSubtext);
        setCtaButtonText(data.ctaButtonText);
        setSkipButtonText(data.skipButtonText);
        setTimerLabel(data.timerLabel);
        setBadgeText(data.badgeText);
      } catch (err) {
        console.error('Failed to load welcome offer settings:', err);
        setErrorMessage('Failed to load settings from server. Using fallback defaults.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleResetToDefaults = () => {
    setEnabled(DEFAULT_WELCOME_OFFER_SETTINGS.enabled);
    setDiscountPercent(DEFAULT_WELCOME_OFFER_SETTINGS.discountPercent);
    setDelaySeconds(DEFAULT_WELCOME_OFFER_SETTINGS.delaySeconds);
    setDurationMinutes(DEFAULT_WELCOME_OFFER_SETTINGS.durationMinutes);
    setMaxDiscountAmount(DEFAULT_WELCOME_OFFER_SETTINGS.maxDiscountAmount);
    setMinOrderAmount(DEFAULT_WELCOME_OFFER_SETTINGS.minOrderAmount);
    setWelcomeTitle(DEFAULT_WELCOME_OFFER_SETTINGS.welcomeTitle);
    setWelcomeSubtext(DEFAULT_WELCOME_OFFER_SETTINGS.welcomeSubtext);
    setCtaButtonText(DEFAULT_WELCOME_OFFER_SETTINGS.ctaButtonText);
    setSkipButtonText(DEFAULT_WELCOME_OFFER_SETTINGS.skipButtonText);
    setTimerLabel(DEFAULT_WELCOME_OFFER_SETTINGS.timerLabel);
    setBadgeText(DEFAULT_WELCOME_OFFER_SETTINGS.badgeText);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (discountPercent <= 0 || discountPercent > 100) {
      setErrorMessage('Discount percentage must be between 1% and 100%.');
      return;
    }

    if (delaySeconds < 0) {
      setErrorMessage('Delay seconds cannot be negative.');
      return;
    }

    if (durationMinutes < 1) {
      setErrorMessage('Offer duration must be at least 1 minute.');
      return;
    }

    if (!welcomeTitle.trim()) {
      setErrorMessage('Modal title cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateWelcomeOfferSettings({
        enabled,
        discountPercent: Number(discountPercent),
        delaySeconds: Number(delaySeconds),
        durationMinutes: Number(durationMinutes),
        maxDiscountAmount: maxDiscountAmount !== null && maxDiscountAmount !== undefined ? Number(maxDiscountAmount) : null,
        minOrderAmount: minOrderAmount !== null && minOrderAmount !== undefined ? Number(minOrderAmount) : null,
        welcomeTitle: welcomeTitle.trim(),
        welcomeSubtext: welcomeSubtext.trim(),
        ctaButtonText: ctaButtonText.trim(),
        skipButtonText: skipButtonText.trim(),
        timerLabel: timerLabel.trim(),
        badgeText: badgeText.trim(),
      });

      if (res.success && res.settings) {
        setSettings(res.settings);
        setSuccessMessage('Welcome offer configuration saved successfully!');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(res.error || 'Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Launch test mode URL
  const launchPreview = (path: string = '/') => {
    const url = `${path}${path.includes('?') ? '&' : '?'}adorous_preview_nvo=1`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-gold font-medium">
            Loading Offer Settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full gold-gradient-bg flex items-center justify-center text-ink shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="font-serif text-2xl text-paper font-semibold tracking-wide">
              First-Visit Welcome Offer
            </h1>
          </div>
          <p className="text-xs text-paper/60 mt-1 max-w-2xl">
            Configure the automated first-time visitor discount popup, delay trigger timer, live modal copy, and simulate tests on the live store without polluting visitor history.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => launchPreview('/')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xs bg-[#1C1C1C] border border-gold/40 text-gold-light hover:text-gold hover:border-gold hover:bg-[#252525] transition-all text-xs font-semibold uppercase tracking-wider shadow-sm"
            title="Preview offer popup as a simulated new visitor in a new tab"
          >
            <Eye className="w-3.5 h-3.5 text-gold" />
            <span>Preview as New Visitor</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xs gold-gradient-bg text-ink font-semibold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-gold/10"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xs bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xs bg-rose-950/40 border border-rose-500/40 flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Card 1: Master Status & Rules */}
            <div className="bg-[#141414] border border-white/10 rounded-xs p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-gold" />
                  <h2 className="text-sm font-semibold text-paper uppercase tracking-wider">
                    Offer Activation & Timing Rules
                  </h2>
                </div>

                {/* Enable/Disable Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#252525] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                  <span className={`ml-3 text-xs font-semibold ${enabled ? 'text-gold-light' : 'text-paper/40'}`}>
                    {enabled ? 'Active / Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              {/* Number Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Discount Percentage */}
                <div>
                  <label className="block text-xs font-medium text-paper/80 mb-1.5">
                    Discount Percentage (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3.5 py-2.5 text-sm text-paper focus:outline-none focus:border-gold transition-colors pr-8 font-mono"
                      required
                    />
                    <Percent className="w-3.5 h-3.5 text-paper/40 absolute right-3 top-3 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-paper/50 mt-1">Default: 10% off</p>
                </div>

                {/* Delay Trigger (Seconds) */}
                <div>
                  <label className="block text-xs font-medium text-paper/80 mb-1.5 flex items-center gap-1.5">
                    <span>Continuous Delay Trigger</span>
                    <span className="text-[10px] text-gold font-mono px-1.5 py-0.2 bg-gold/10 border border-gold/30 rounded-xs">
                      Continuous
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={delaySeconds}
                      onChange={(e) => setDelaySeconds(Number(e.target.value))}
                      className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3.5 py-2.5 text-sm text-paper focus:outline-none focus:border-gold transition-colors pr-10 font-mono"
                      required
                    />
                    <span className="text-xs text-paper/40 absolute right-3 top-3 pointer-events-none">
                      sec
                    </span>
                  </div>
                  <p className="text-[11px] text-paper/50 mt-1">
                    Continuous seconds on site before popup & discount trigger (default: 5)
                  </p>
                </div>

                {/* Offer Duration (Minutes) */}
                <div>
                  <label className="block text-xs font-medium text-paper/80 mb-1.5">
                    Offer Duration (Minutes)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3.5 py-2.5 text-sm text-paper focus:outline-none focus:border-gold transition-colors pr-12 font-mono"
                      required
                    />
                    <span className="text-xs text-paper/40 absolute right-3 top-3 pointer-events-none">
                      min
                    </span>
                  </div>
                  <p className="text-[11px] text-paper/50 mt-1">Countdown active window (default: 30)</p>
                </div>

                {/* Max Discount Cap */}
                <div>
                  <label className="block text-xs font-medium text-paper/80 mb-1.5">
                    Max Discount Cap (৳)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={maxDiscountAmount ?? ''}
                      onChange={(e) =>
                        setMaxDiscountAmount(e.target.value === '' ? null : Number(e.target.value))
                      }
                      placeholder="e.g. 500 (blank for no cap)"
                      className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3.5 py-2.5 text-sm text-paper focus:outline-none focus:border-gold transition-colors pr-8 font-mono"
                    />
                    <span className="text-xs text-paper/40 absolute right-3 top-3 pointer-events-none">
                      ৳
                    </span>
                  </div>
                  <p className="text-[11px] text-paper/50 mt-1">Caps maximum deduction (default: 500)</p>
                </div>

                {/* Minimum Order Amount */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-paper/80 mb-1.5">
                    Minimum Order Subtotal (৳)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={minOrderAmount ?? ''}
                      onChange={(e) =>
                        setMinOrderAmount(e.target.value === '' ? null : Number(e.target.value))
                      }
                      placeholder="0 (no minimum required)"
                      className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3.5 py-2.5 text-sm text-paper focus:outline-none focus:border-gold transition-colors pr-8 font-mono"
                    />
                    <span className="text-xs text-paper/40 absolute right-3 top-3 pointer-events-none">
                      ৳
                    </span>
                  </div>
                  <p className="text-[11px] text-paper/50 mt-1">
                    Minimum cart subtotal required to apply the discount (0 = applies to any order)
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Modal Copy & Text Fields */}
            <div className="bg-[#141414] border border-white/10 rounded-xs p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
                <Type className="w-4 h-4 text-gold" />
                <h2 className="text-sm font-semibold text-paper uppercase tracking-wider">
                  Popup Content & Text Copy
                </h2>
              </div>

              {/* Badge Text */}
              <div>
                <label className="block text-xs font-medium text-paper/80 mb-1.5">
                  Top Pill Badge Text
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="Exclusive First Visit Offer"
                  className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3.5 py-2.5 text-sm text-paper focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Modal Heading */}
              <div>
                <label className="block text-xs font-medium text-paper/80 mb-1.5">
                  Popup Headline
                </label>
                <input
                  type="text"
                  value={welcomeTitle}
                  onChange={(e) => setWelcomeTitle(e.target.value)}
                  placeholder="Welcome to Adorous Fashion ✨"
                  className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3.5 py-2.5 text-sm text-paper focus:outline-none focus:border-gold transition-colors"
                  required
                />
              </div>

              {/* Modal Subtext */}
              <div>
                <label className="block text-xs font-medium text-paper/80 mb-1.5">
                  Popup Message / Subtext
                </label>
                <textarea
                  rows={3}
                  value={welcomeSubtext}
                  onChange={(e) => setWelcomeSubtext(e.target.value)}
                  placeholder="As a special welcome, enjoy an exclusive 10% off..."
                  className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3.5 py-2.5 text-sm text-paper focus:outline-none focus:border-gold transition-colors resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CTA Button Text */}
                <div>
                  <label className="block text-xs font-medium text-paper/80 mb-1.5">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={ctaButtonText}
                    onChange={(e) => setCtaButtonText(e.target.value)}
                    placeholder="Start Shopping Now"
                    className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3.5 py-2.5 text-sm text-paper focus:outline-none focus:border-gold transition-colors"
                    required
                  />
                </div>

                {/* Skip Button Text */}
                <div>
                  <label className="block text-xs font-medium text-paper/80 mb-1.5">
                    Dismiss Link Label
                  </label>
                  <input
                    type="text"
                    value={skipButtonText}
                    onChange={(e) => setSkipButtonText(e.target.value)}
                    placeholder="No thanks, continue browsing"
                    className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3.5 py-2.5 text-sm text-paper focus:outline-none focus:border-gold transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Countdown Floating Pill Label */}
              <div>
                <label className="block text-xs font-medium text-paper/80 mb-1.5">
                  Floating Countdown Pill Label
                </label>
                <input
                  type="text"
                  value={timerLabel}
                  onChange={(e) => setTimerLabel(e.target.value)}
                  placeholder="New Visitor Offer"
                  className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3.5 py-2.5 text-sm text-paper focus:outline-none focus:border-gold transition-colors"
                  required
                />
                <p className="text-[11px] text-paper/50 mt-1">
                  Shown in the floating badge after popup is displayed (e.g. &ldquo;10% off · New Visitor Offer&rdquo;)
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="text-xs text-paper/50 hover:text-gold transition-colors underline underline-offset-4"
              >
                Reset Form to Factory Defaults
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 rounded-xs gold-gradient-bg text-ink font-semibold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-gold/10 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Test & Simulation Card */}
          <div className="bg-[#141414] border border-gold/30 rounded-xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
              <Eye className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-semibold text-gold-light uppercase tracking-wider">
                Admin Simulation & Live Test Mode
              </h2>
            </div>

            <p className="text-xs text-paper/70 leading-relaxed">
              Because your browser has previously visited or made orders, you would not normally see the welcome popup or receive the first-visit discount. Use these test launcher buttons to open the storefront as a <strong>simulated new customer</strong>.
            </p>

            <ul className="text-xs text-paper/60 space-y-1.5 list-disc list-inside">
              <li>Ignores your normal browser visitor status and order records.</li>
              <li>Runs the continuous {delaySeconds}-second countdown naturally.</li>
              <li>Calculates and applies the {discountPercent}% discount live in Cart and Checkout.</li>
              <li><strong>Zero permanent pollution</strong>: does not modify your real browser cookie or customer metrics.</li>
            </ul>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => launchPreview('/')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xs gold-gradient-bg text-ink font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Test Storefront Home</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => launchPreview('/checkout')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xs bg-[#1F1F1F] border border-white/20 text-paper hover:text-gold hover:border-gold transition-colors text-xs font-semibold uppercase tracking-wider shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-gold" />
                <span>Test Direct on Checkout</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="bg-[#141414] border border-white/10 rounded-xs p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-paper">
                  Real-Time Popup Preview
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                Interactive Preview
              </span>
            </div>

            {/* Popup Card Preview Mockup */}
            <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl shadow-2xl bg-ink border border-gold/30">
              {/* Inner modal content */}
              <div className="relative">
                {/* Close button mockup */}
                <div className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-ink-soft/80 text-gold/60">
                  <X className="w-3.5 h-3.5" />
                </div>

                {/* Decorative header */}
                <div className="relative h-24 overflow-hidden flex items-center justify-center bg-gradient-to-b from-gold/15 to-transparent">
                  <div className="w-12 h-12 rounded-full gold-gradient-bg flex items-center justify-center shadow-lg">
                    <Gift className="w-6 h-6 text-ink" />
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 pb-6 pt-2 text-center space-y-3">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/20">
                    <Sparkles className="w-3 h-3 text-gold" />
                    <span className="text-[10px] font-medium tracking-wider uppercase text-gold-light">
                      {badgeText || 'Exclusive First Visit Offer'}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-serif text-xl font-semibold text-gold-light leading-tight">
                    {welcomeTitle || 'Welcome to Adorous Fashion ✨'}
                  </h4>

                  {/* Subtext */}
                  <p className="text-xs text-gold-light/70 leading-relaxed max-w-xs mx-auto font-sans line-clamp-3">
                    {welcomeSubtext || 'Enjoy an exclusive discount on your first order.'}
                  </p>

                  {/* Discount percentage */}
                  <div className="py-1">
                    <div className="inline-flex items-baseline gap-1">
                      <span className="text-4xl font-serif font-bold gold-gradient-text">
                        {discountPercent}%
                      </span>
                      <span className="text-sm text-gold/80 font-sans font-medium uppercase tracking-wider">
                        off
                      </span>
                    </div>
                    <p className="text-[10px] text-gold/50 mt-0.5 font-sans flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      Valid for {durationMinutes} minutes after you close this popup
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="w-full py-3 px-4 rounded-xl font-sans font-semibold text-xs tracking-wider uppercase gold-gradient-bg text-ink shadow-md shadow-gold/20 text-center cursor-default">
                    {ctaButtonText || 'Start Shopping Now'}
                  </div>

                  {/* Skip Link */}
                  <div className="text-[11px] text-gold/40 hover:text-gold/60 underline underline-offset-2 cursor-default">
                    {skipButtonText || 'No thanks, continue browsing'}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Pill Preview */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <span className="text-[11px] font-medium text-paper/60 uppercase tracking-wider block">
                Floating Countdown Pill (Sticky top-right)
              </span>

              <div className="flex items-center justify-center py-2">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-ink shadow-xl border border-gold/30">
                  <div className="w-5 h-5 rounded-full gold-gradient-bg flex items-center justify-center shrink-0">
                    <Sparkles className="w-2.5 h-2.5 text-ink" />
                  </div>
                  <div className="flex flex-col leading-none text-left">
                    <span className="text-[9px] uppercase tracking-wider text-gold/60 font-sans font-medium">
                      {discountPercent}% off · {timerLabel || 'New Visitor Offer'}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-gold-light" />
                      <span className="text-xs font-mono font-bold tracking-wide text-gold-light">
                        {String(durationMinutes).padStart(2, '0')}:00
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Summary */}
            <div className="p-3.5 rounded-xs bg-[#1C1C1C] border border-white/5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-paper/50">Offer Status:</span>
                <span className={`font-semibold ${enabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {enabled ? 'Active / On' : 'Disabled / Off'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-paper/50">Continuous Delay:</span>
                <span className="font-mono text-paper">{delaySeconds} seconds</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-paper/50">Active Countdown:</span>
                <span className="font-mono text-paper">{durationMinutes} minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-paper/50">Discount Cap:</span>
                <span className="font-mono text-paper">
                  {maxDiscountAmount ? `৳${maxDiscountAmount}` : 'No cap'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-paper/50">Min Order:</span>
                <span className="font-mono text-paper">
                  {minOrderAmount ? `৳${minOrderAmount}` : 'None'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
