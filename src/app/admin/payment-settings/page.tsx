'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Save,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Smartphone,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Tag,
  Eye,
  Sliders,
  DollarSign,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import {
  getPaymentSettings,
  updatePaymentSettings,
  resetPaymentSettings,
  PaymentSettingsData,
  DEFAULT_PAYMENT_SETTINGS,
} from '@/app/actions/paymentSettingsActions';
import { formatPrice } from '@/lib/formatPrice';

export default function AdminPaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettingsData>(DEFAULT_PAYMENT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [enabled, setEnabled] = useState<boolean>(true);
  const [bkashNumber, setBkashNumber] = useState<string>('01854411797');
  const [bkashAccountType, setBkashAccountType] = useState<string>('Personal (Send Money)');
  const [nagadNumber, setNagadNumber] = useState<string>('01854411797');
  const [nagadAccountType, setNagadAccountType] = useState<string>('Personal (Send Money)');
  const [onlineDiscountAmount, setOnlineDiscountAmount] = useState<number>(50);
  const [instructions, setInstructions] = useState<string>(DEFAULT_PAYMENT_SETTINGS.instructions);

  // Preview interactive state
  const [previewTab, setPreviewTab] = useState<'bkash' | 'nagad'>('bkash');
  const [copiedPreviewNumber, setCopiedPreviewNumber] = useState<string | null>(null);

  // Load existing settings on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setIsLoading(true);
        const data = await getPaymentSettings();
        if (isMounted) {
          setSettings(data);
          setEnabled(data.enabled);
          setBkashNumber(data.bkashNumber);
          setBkashAccountType(data.bkashAccountType);
          setNagadNumber(data.nagadNumber);
          setNagadAccountType(data.nagadAccountType);
          setOnlineDiscountAmount(data.onlineDiscountAmount);
          setInstructions(data.instructions);
        }
      } catch (err: any) {
        console.warn('[AdminPaymentSettings] Using fallback defaults:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await updatePaymentSettings({
        enabled,
        bkashNumber: bkashNumber.trim(),
        bkashAccountType: bkashAccountType.trim(),
        nagadNumber: nagadNumber.trim(),
        nagadAccountType: nagadAccountType.trim(),
        onlineDiscountAmount: Math.max(0, Number(onlineDiscountAmount) || 0),
        instructions: instructions.trim(),
      });

      if (res.success && res.settings) {
        setSettings(res.settings);
        setFeedback({
          type: 'success',
          message: 'Payment configuration saved and published to the live store successfully!',
        });
        setTimeout(() => setFeedback(null), 5000);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to save payment configuration.',
        });
      }
    } catch (err: any) {
      console.error('Error saving payment settings:', err);
      setFeedback({
        type: 'error',
        message: err?.message || 'An unexpected error occurred while saving.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset payment settings back to system defaults?')) {
      return;
    }
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await resetPaymentSettings();
      if (res.success && res.settings) {
        setSettings(res.settings);
        setEnabled(res.settings.enabled);
        setBkashNumber(res.settings.bkashNumber);
        setBkashAccountType(res.settings.bkashAccountType);
        setNagadNumber(res.settings.nagadNumber);
        setNagadAccountType(res.settings.nagadAccountType);
        setOnlineDiscountAmount(res.settings.onlineDiscountAmount);
        setInstructions(res.settings.instructions);
        setFeedback({
          type: 'success',
          message: 'Payment settings have been reset to factory defaults.',
        });
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to reset settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyPreview = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPreviewNumber(text);
    setTimeout(() => setCopiedPreviewNumber(null), 2000);
  };

  const applyPresetInstructions = (type: 'personal' | 'merchant') => {
    if (type === 'personal') {
      setInstructions(
        'Please Send Money (Personal) the total payable amount to our bKash or Nagad number. Then enter your Transaction ID below to place your order with 0 COD.'
      );
    } else {
      setInstructions(
        'Please make Payment to our Merchant bKash/Nagad number. Enter your Transaction ID below to confirm your order with 0 COD.'
      );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-paper/50">
            <Link href="/admin" className="hover:text-gold transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Orders Desk</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-paper/30" />
            <span className="text-paper/80 font-medium">Payment & MFS Settings</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif text-paper font-semibold tracking-wide flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-gold" />
            <span>bKash & Nagad Online Payment Desk</span>
          </h1>
          <p className="text-xs text-paper/60 leading-relaxed max-w-2xl">
            Configure live recipient numbers, account types (Personal / Merchant), customer instructions, and the extra online payment discount (X tk). Orders placed online are logged at 0 COD and verified here.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving || isLoading}
            className="px-3.5 py-2 rounded-xs border border-white/15 bg-white/5 hover:bg-white/10 text-paper/70 hover:text-paper text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving || isLoading}
            className="px-5 py-2 rounded-xs bg-gold hover:bg-gold-light text-ink font-semibold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
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

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xs border flex items-center gap-2.5 text-xs transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Grid: Form Left, Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Activation & Online Discount Rule */}
          <div className="bg-[#171717] border border-white/10 rounded-xs p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gold" />
                <h2 className="text-sm font-semibold text-paper uppercase tracking-wider">
                  Payment Method Activation & Discount
                </h2>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs border ${
                enabled
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {enabled ? 'Active on Store' : 'Disabled'}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Enable Toggle */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="mt-0.5 accent-gold w-4 h-4 cursor-pointer"
                />
                <div>
                  <strong className="text-paper font-semibold block text-xs">
                    Enable Online Payment (bKash/Nagad) at Checkout
                  </strong>
                  <p className="text-paper/60 text-[11px] leading-relaxed mt-0.5">
                    When enabled, customers can choose Online Payment, view your numbers, enter a Transaction ID, receive the extra discount, and order at 0 COD.
                  </p>
                </div>
              </label>

              {/* Extra Online Payment Discount (X tk) */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-paper flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-gold" />
                    <span>Extra Online Payment Discount (৳ BDT)</span>
                  </label>
                  <span className="text-[11px] font-mono text-gold font-bold">
                    -৳{formatPrice(onlineDiscountAmount || 0)} OFF
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-paper/40 font-bold">৳</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={onlineDiscountAmount}
                    onChange={(e) => setOnlineDiscountAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="e.g. 50"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-[#202020] border border-white/15 focus:border-gold rounded-xs text-paper text-xs font-mono font-semibold focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-paper/50 text-[11px] leading-relaxed">
                  This flat amount is deducted immediately from the customer's Total Payable when they select Online Payment. Enter 0 if you do not wish to offer an extra discount.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: bKash & Nagad Account Numbers */}
          <div className="bg-[#171717] border border-white/10 rounded-xs p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Smartphone className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-semibold text-paper uppercase tracking-wider">
                MFS Account Numbers & Types
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              {/* bKash Section */}
              <div className="p-4 bg-[#202020] border border-white/10 rounded-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-pink-400 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
                    bKash Account
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-paper/70 block mb-1">
                    Phone / Wallet Number *
                  </label>
                  <input
                    type="text"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 bg-[#171717] border border-white/15 focus:border-gold rounded-xs text-paper font-mono font-semibold text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-paper/70 block mb-1">
                    Account Type / Direction
                  </label>
                  <select
                    value={bkashAccountType}
                    onChange={(e) => setBkashAccountType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#171717] border border-white/15 focus:border-gold rounded-xs text-paper text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Personal (Send Money)">Personal (Send Money)</option>
                    <option value="Merchant (Payment)">Merchant (Payment)</option>
                    <option value="Agent (Cash Out)">Agent (Cash Out)</option>
                  </select>
                </div>
              </div>

              {/* Nagad Section */}
              <div className="p-4 bg-[#202020] border border-white/10 rounded-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    Nagad Account
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-paper/70 block mb-1">
                    Phone / Wallet Number *
                  </label>
                  <input
                    type="text"
                    value={nagadNumber}
                    onChange={(e) => setNagadNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 bg-[#171717] border border-white/15 focus:border-gold rounded-xs text-paper font-mono font-semibold text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-paper/70 block mb-1">
                    Account Type / Direction
                  </label>
                  <select
                    value={nagadAccountType}
                    onChange={(e) => setNagadAccountType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#171717] border border-white/15 focus:border-gold rounded-xs text-paper text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Personal (Send Money)">Personal (Send Money)</option>
                    <option value="Merchant (Payment)">Merchant (Payment)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Instructions & Guidance */}
          <div className="bg-[#171717] border border-white/10 rounded-xs p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gold" />
                <h2 className="text-sm font-semibold text-paper uppercase tracking-wider">
                  Payment Instructions for Customer
                </h2>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-paper/40 mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPresetInstructions('personal')}
                  className="px-2 py-0.5 rounded-xs bg-white/5 hover:bg-white/10 text-paper/70 hover:text-gold text-[10px] transition-colors cursor-pointer"
                >
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetInstructions('merchant')}
                  className="px-2 py-0.5 rounded-xs bg-white/5 hover:bg-white/10 text-paper/70 hover:text-gold text-[10px] transition-colors cursor-pointer"
                >
                  Merchant
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Write clear instructions for customer..."
                className="w-full px-3.5 py-2.5 bg-[#202020] border border-white/15 focus:border-gold rounded-xs text-paper text-xs leading-relaxed focus:outline-none"
              />
              <p className="text-paper/50 text-[11px]">
                This message appears directly above the Transaction ID input in the checkout payment box to guide the customer.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#171717] border border-white/10 rounded-xs p-5 space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gold" />
                <h3 className="text-xs font-semibold text-paper uppercase tracking-wider">
                  Live Customer Checkout View
                </h3>
              </div>
              <span className="text-[10px] text-paper/40">Real-time simulator</span>
            </div>

            {/* Simulated Checkout Box in Customer Colors */}
            <div className="bg-[#FAF7F0] border border-[#DDD6CB] rounded-xs p-4 space-y-3.5 text-zinc-900 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#DDD6CB]/80 pb-2">
                <span className="font-semibold text-xs text-ink">Choose payment method</span>
                {onlineDiscountAmount > 0 && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-xs">
                    Save ৳{formatPrice(onlineDiscountAmount)} Online
                  </span>
                )}
              </div>

              {/* Radio selection */}
              <div className="p-3 border border-gold bg-[#C5A880]/15 rounded-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gold flex items-center justify-center bg-white">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    </div>
                    <span className="font-semibold text-xs text-ink">
                      Online Payment (bKash/Nagad)
                    </span>
                  </div>
                  {onlineDiscountAmount > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700">
                      -৳{formatPrice(onlineDiscountAmount)} OFF
                    </span>
                  )}
                </div>

                {/* Sub-box: MFS Numbers */}
                <div className="bg-white border border-[#DDD6CB] rounded-xs p-3 space-y-2.5 text-xs">
                  <p className="text-[11px] text-zinc-600 leading-snug">
                    {instructions || 'Please Send Money to any of the accounts below:'}
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {/* bKash row */}
                    <div className="flex items-center justify-between p-2 bg-[#FAF7F0] border border-[#DDD6CB] rounded-xs">
                      <div>
                        <span className="text-[10px] font-bold text-pink-700 block uppercase">
                          bKash · {bkashAccountType}
                        </span>
                        <span className="font-mono font-bold text-ink text-xs">
                          {bkashNumber || '01XXXXXXXXX'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyPreview(bkashNumber)}
                        className="px-2 py-1 text-[10px] font-medium bg-white hover:bg-sand border border-[#DDD6CB] rounded-xs text-zinc-700 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedPreviewNumber === bkashNumber ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Nagad row */}
                    <div className="flex items-center justify-between p-2 bg-[#FAF7F0] border border-[#DDD6CB] rounded-xs">
                      <div>
                        <span className="text-[10px] font-bold text-amber-700 block uppercase">
                          Nagad · {nagadAccountType}
                        </span>
                        <span className="font-mono font-bold text-ink text-xs">
                          {nagadNumber || '01XXXXXXXXX'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyPreview(nagadNumber)}
                        className="px-2 py-1 text-[10px] font-medium bg-white hover:bg-sand border border-[#DDD6CB] rounded-xs text-zinc-700 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedPreviewNumber === nagadNumber ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Transaction ID input preview */}
                  <div className="pt-2 border-t border-[#DDD6CB]/60 space-y-1">
                    <label className="text-[11px] font-semibold text-ink flex items-center justify-between">
                      <span>Transaction ID (TrxID) *</span>
                      <span className="text-[9px] text-zinc-500 font-normal">Required</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder="e.g. BL92A8ZK9P"
                      className="w-full px-2.5 py-1.5 bg-[#FAF7F0] border border-gold/60 text-xs font-mono rounded-xs text-zinc-700 placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery COD Notice */}
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center justify-between text-xs text-emerald-800">
                <span className="font-medium">Doorstep Cash Collection:</span>
                <span className="font-bold uppercase tracking-wider">৳0 COD</span>
              </div>
            </div>

            {/* Quick Helper Notes */}
            <div className="p-3 bg-white/5 border border-white/5 rounded-xs space-y-2 text-[11px] text-paper/60">
              <strong className="text-paper/80 block">Atelier Order Workflow:</strong>
              <ul className="list-disc list-inside space-y-1">
                <li>Customer submits their bKash/Nagad Transaction ID at checkout.</li>
                <li>Order is automatically flagged with <strong>৳0 COD</strong> for the courier.</li>
                <li>You verify the TrxID on the <strong>Orders Desk</strong> with 1 click.</li>
                <li>If invalid/fake, mark as <strong>Fake / Error</strong> to notify the customer on their tracking page.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
