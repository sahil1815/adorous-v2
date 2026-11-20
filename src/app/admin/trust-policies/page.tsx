'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  RotateCcw,
  Truck,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Eye,
  Sparkles,
  Info,
  Sliders,
  Layers,
  ShoppingBag,
  Gem,
  CircleDot,
  Loader2,
} from 'lucide-react';
import {
  getAllTrustPolicies,
  updateTrustPolicyAction,
  resetTrustPolicyAction,
} from '@/app/actions/trustPolicyActions';
import { TrustPolicyData } from '@/types';
import {
  DEFAULT_GLOBAL_TRUST_POLICY,
  DEFAULT_CATEGORY_TRUST_POLICIES,
} from '@/lib/trustPolicies';

interface SectionTab {
  id: string;
  label: string;
  categoryName: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const SECTION_TABS: SectionTab[] = [
  {
    id: 'global',
    label: 'Global Master Default',
    categoryName: 'All Products (Fallback)',
    icon: Sparkles,
    description: 'System master template applied across any product or category without specific overrides.',
  },
  {
    id: 'jewelry',
    label: 'Jewelry Sets',
    categoryName: 'Fashion Jewelry Sets',
    icon: Gem,
    description: 'Applied to bridal chokers, hasli sets, and necklace suites (plating & gemstone guarantee).',
  },
  {
    id: 'bags',
    label: "Ladies' Handbags",
    categoryName: "Ladies' Handbags",
    icon: ShoppingBag,
    description: 'Applied to structured satchels, clutches & totes (craftsmanship, zippers & material durability).',
  },
  {
    id: 'churi',
    label: 'Bangles & Churi',
    categoryName: 'Bangles & Churi',
    icon: CircleDot,
    description: 'Applied to glass bangles, velvet churi & antique karas (wrist sizing exchanges & glass finish).',
  },
  {
    id: 'earrings',
    label: 'Chandbalis & Jhumkas',
    categoryName: 'Chandbalis & Jhumkas',
    icon: Layers,
    description: 'Applied to statement earrings, bell jhumkas & ear tops (plating longevity & hypoallergenic care).',
  },
  {
    id: 'more',
    label: 'More & Accessories',
    categoryName: 'More & Accessories',
    icon: Sliders,
    description: 'Applied to boutique accessories, umbrellas & novelty atelier pieces.',
  },
];

export default function AdminTrustPoliciesPage() {
  const [activeTab, setActiveTab] = useState<string>('global');
  const [policies, setPolicies] = useState<Record<string, TrustPolicyData>>({
    global: { ...DEFAULT_GLOBAL_TRUST_POLICY },
    ...DEFAULT_CATEGORY_TRUST_POLICIES,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active policy
  const activePolicy =
    policies[activeTab] ||
    DEFAULT_CATEGORY_TRUST_POLICIES[activeTab] ||
    DEFAULT_GLOBAL_TRUST_POLICY;

  const updateActiveField = <K extends keyof TrustPolicyData>(key: K, value: TrustPolicyData[K]) => {
    setPolicies((prev) => {
      const current =
        prev[activeTab] ||
        DEFAULT_CATEGORY_TRUST_POLICIES[activeTab] ||
        DEFAULT_GLOBAL_TRUST_POLICY;
      return {
        ...prev,
        [activeTab]: {
          ...current,
          [key]: value,
        },
      };
    });
  };

  // Load policies from DB on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getAllTrustPolicies();
        if (isMounted) {
          setPolicies(data);
        }
      } catch (err) {
        console.error('Error loading trust policies:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setFeedback(null);

      const payload = {
        guaranteeTitle: activePolicy.guaranteeTitle,
        guaranteeText: activePolicy.guaranteeText,
        exchangeTitle: activePolicy.exchangeTitle,
        exchangeText: activePolicy.exchangeText,
        deliveryTitle: activePolicy.deliveryTitle,
        deliveryText: activePolicy.deliveryText,
        showGuarantee: activePolicy.showGuarantee,
        showExchange: activePolicy.showExchange,
        showDelivery: activePolicy.showDelivery,
      };

      const res = await updateTrustPolicyAction(activeTab, payload);
      if (res.success && res.policy) {
        setPolicies((prev) => ({
          ...prev,
          [activeTab]: res.policy!,
        }));
        setFeedback({
          type: 'success',
          message: `Trust & guarantee policy for "${SECTION_TABS.find((t) => t.id === activeTab)?.label}" saved and live!`,
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to save policy.',
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: (err as Error)?.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    const confirmed = window.confirm(
      `Reset "${SECTION_TABS.find((t) => t.id === activeTab)?.label}" policy to default system template?`
    );
    if (!confirmed) return;

    try {
      setIsSaving(true);
      const res = await resetTrustPolicyAction(activeTab);
      if (res.success && res.policy) {
        setPolicies((prev) => ({
          ...prev,
          [activeTab]: res.policy!,
        }));
        setFeedback({
          type: 'success',
          message: 'Policy reset to default factory template.',
        });
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to reset policy.' });
    } finally {
      setIsSaving(false);
    }
  };

  const activeTabMeta = SECTION_TABS.find((t) => t.id === activeTab) || SECTION_TABS[0];

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-paper/50">
            <Link href="/admin" className="hover:text-gold transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Orders Desk</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-paper/30" />
            <span className="text-paper/80 font-medium">Atelier Configuration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif text-paper font-semibold tracking-wide flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Trust, Guarantee & Exchange Policy Desk</span>
          </h1>
          <p className="text-xs text-paper/60 leading-relaxed max-w-3xl">
            Configure official guarantees, exchange promises, and delivery timelines by category or across all products. Every product in a section inherits these rules automatically unless customized individually on its edit page.
          </p>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={isSaving || isLoading}
            className="px-3 py-2 rounded-xs border border-white/15 bg-white/5 hover:bg-white/10 text-paper/70 hover:text-paper text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            title="Reset active tab to default factory copy"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="px-4 py-2 rounded-xs bg-gold hover:bg-gold-light text-[#0D0D0D] text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer font-sans"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Policy...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save {activeTabMeta.label}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xs border text-xs flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-white/40 hover:text-white text-xs px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Category Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
        {SECTION_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-xs text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gold text-[#0D0D0D] shadow-sm font-semibold'
                  : 'bg-[#181818] border border-white/10 text-paper/70 hover:text-paper hover:bg-[#202020]'
              }`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0D0D0D]' : 'text-gold'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category Tab Explanation Banner */}
      <div className="bg-[#141414] border border-white/10 rounded-xs p-3.5 flex items-start gap-3">
        <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
        <div className="text-xs text-paper/70 leading-relaxed">
          <strong className="text-paper block text-xs">Section Target: {activeTabMeta.categoryName}</strong>
          {activeTabMeta.description}
          {activeTab !== 'global' && (
            <span className="block mt-1 text-[11px] text-paper/50">
              Note: Unfilled fields will automatically fall back to the Master Global Default.
            </span>
          )}
        </div>
      </div>

      {/* Main 2-Column Content: Form on Left, Live Storefront Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Official Guarantee Highlight Box */}
          <div className="bg-[#141414] border border-white/10 rounded-xs p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-serif font-semibold text-paper tracking-wide">
                  1. Official Guarantee Highlight Box (Green Card)
                </h2>
              </div>
              <label className="flex items-center gap-2 text-xs text-paper/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activePolicy.showGuarantee !== false}
                  onChange={(e) => updateActiveField('showGuarantee', e.target.checked)}
                  className="rounded border-white/20 bg-[#1C1C1C] text-gold focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px]">{activePolicy.showGuarantee !== false ? 'Enabled' : 'Hidden'}</span>
              </label>
            </div>

            {activePolicy.showGuarantee !== false ? (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1.5 font-semibold">
                    Guarantee Badge Title
                  </label>
                  <input
                    type="text"
                    value={activePolicy.guaranteeTitle || ''}
                    onChange={(e) => updateActiveField('guaranteeTitle', e.target.value)}
                    placeholder="e.g. ৬ মাসের গ্যারান্টি (6-Month Official Guarantee)"
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-paper/40 mt-1">
                    Displayed with a shield icon in the prominent green reassurance box.
                  </p>
                </div>

                <div>
                  <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1.5 font-semibold">
                    Guarantee Protection Scope / Details
                  </label>
                  <textarea
                    rows={3}
                    value={activePolicy.guaranteeText || ''}
                    onChange={(e) => updateActiveField('guaranteeText', e.target.value)}
                    placeholder="e.g. কালার ও প্লেটিং স্থায়িত্ব এবং পাথর সেটিংয়ের কারিগরী সুরক্ষা অন্তর্ভুক্ত। ফ্রি ডোরস্টেপ সার্ভিসিং বা এক্সচেঞ্জ।"
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none leading-relaxed transition-colors"
                  />
                  <p className="text-[11px] text-paper/40 mt-1">
                    Describe what is covered (e.g., plating, stitching, stone setting, doorstep service).
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-paper/40 py-2 italic">
                The green guarantee highlight banner will be hidden for this section.
              </p>
            )}
          </div>

          {/* Card 2: Exchange & Returns Policy */}
          <div className="bg-[#141414] border border-white/10 rounded-xs p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-gold" />
                <h2 className="text-sm font-serif font-semibold text-paper tracking-wide">
                  2. Exchange Policy
                </h2>
              </div>
              <label className="flex items-center gap-2 text-xs text-paper/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activePolicy.showExchange !== false}
                  onChange={(e) => updateActiveField('showExchange', e.target.checked)}
                  className="rounded border-white/20 bg-[#1C1C1C] text-gold focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px]">{activePolicy.showExchange !== false ? 'Enabled' : 'Hidden'}</span>
              </label>
            </div>

            {activePolicy.showExchange !== false ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1.5 font-semibold">
                    Exchange Prefix / Label
                  </label>
                  <input
                    type="text"
                    value={activePolicy.exchangeTitle || ''}
                    onChange={(e) => updateActiveField('exchangeTitle', e.target.value)}
                    placeholder="e.g. ৭ দিনের এক্সচেঞ্জ :"
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1.5 font-semibold">
                    Exchange Terms
                  </label>
                  <input
                    type="text"
                    value={activePolicy.exchangeText || ''}
                    onChange={(e) => updateActiveField('exchangeText', e.target.value)}
                    placeholder="e.g. সাইজ ও ফিনিশ পরিবর্তনযোগ্য"
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-paper/40 py-2 italic">
                The exchange policy line will be omitted from the trust card.
              </p>
            )}
          </div>

          {/* Card 3: Delivery Promise */}
          <div className="bg-[#141414] border border-white/10 rounded-xs p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gold" />
                <h2 className="text-sm font-serif font-semibold text-paper tracking-wide">
                  3. Delivery Timeline
                </h2>
              </div>
              <label className="flex items-center gap-2 text-xs text-paper/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activePolicy.showDelivery !== false}
                  onChange={(e) => updateActiveField('showDelivery', e.target.checked)}
                  className="rounded border-white/20 bg-[#1C1C1C] text-gold focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px]">{activePolicy.showDelivery !== false ? 'Enabled' : 'Hidden'}</span>
              </label>
            </div>

            {activePolicy.showDelivery !== false ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1.5 font-semibold">
                    Delivery Prefix / Label
                  </label>
                  <input
                    type="text"
                    value={activePolicy.deliveryTitle || ''}
                    onChange={(e) => updateActiveField('deliveryTitle', e.target.value)}
                    placeholder="e.g. ডেলিভারি :"
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1.5 font-semibold">
                    Delivery Estimate
                  </label>
                  <input
                    type="text"
                    value={activePolicy.deliveryText || ''}
                    onChange={(e) => updateActiveField('deliveryText', e.target.value)}
                    placeholder="e.g. 1–3 days"
                    className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-paper/40 py-2 italic">
                The delivery timeline line will be omitted from the trust card.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Live Storefront Preview (5 cols, sticky) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="flex items-center justify-between text-xs text-paper/70 px-1">
            <span className="flex items-center gap-1.5 font-medium text-paper">
              <Eye className="w-4 h-4 text-gold" />
              <span>Live Storefront PDP Preview</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-paper/40">
              Pixel-Identical Replica
            </span>
          </div>

          {/* White / Warm Sand PDP Card Replica (Screenshot 4 Mirror) */}
          <div className="bg-[#FAF8F5] border border-gold/30 rounded-lg p-5 shadow-sm space-y-3 font-sans">
            <div className="text-[11px] text-ink/40 uppercase tracking-wider font-semibold border-b border-line/40 pb-2 flex items-center justify-between">
              <span>Preview: {activeTabMeta.label}</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                Active Settings
              </span>
            </div>

            {/* Trust & Delivery Card Container */}
            <div className="space-y-3">
              {/* Guarantee Highlight Box */}
              {activePolicy.showGuarantee !== false && (
                <div className="flex items-start gap-2.5 text-emerald-900 bg-emerald-50/80 p-2.5 rounded-md border border-emerald-200/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-semibold block text-emerald-950">
                      {activePolicy.guaranteeTitle || '৬ মাসের গ্যারান্টি (6-Month Official Guarantee)'}
                    </span>
                    <span className="text-[11px] text-emerald-800/90 block mt-0.5">
                      {activePolicy.guaranteeText || 'কালার ও প্লেটিং স্থায়িত্ব এবং পাথর সেটিংয়ের কারিগরী সুরক্ষা অন্তর্ভুক্ত।'}
                    </span>
                  </div>
                </div>
              )}

              {/* Policy Grid */}
              {(activePolicy.showExchange !== false || activePolicy.showDelivery !== false) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink/90 pt-1">
                  {activePolicy.showExchange !== false && (
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5 text-gold-deep shrink-0" />
                      <span>
                        <strong>{activePolicy.exchangeTitle || '৭ দিনের এক্সচেঞ্জ :'}</strong>{' '}
                        {activePolicy.exchangeText || 'সাইজ ও ফিনিশ পরিবর্তনযোগ্য'}
                      </span>
                    </div>
                  )}
                  {activePolicy.showDelivery !== false && (
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-gold-deep shrink-0" />
                      <span>
                        <strong>{activePolicy.deliveryTitle || 'ডেলিভারি :'}</strong>{' '}
                        {activePolicy.deliveryText || '1–3 days'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Preview Help Footnote */}
          <div className="p-3 bg-[#141414] border border-white/10 rounded-xs text-[11px] text-paper/60 space-y-1">
            <p className="font-medium text-paper/80">How this works for customers:</p>
            <p>
              When a visitor navigates to any item in{' '}
              <strong className="text-gold">{activeTabMeta.categoryName}</strong>, this exact reassurance card renders under the WhatsApp & Buy buttons.
            </p>
            <p className="text-paper/40 pt-1">
              Individual products can override this card at any time from their product editor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
