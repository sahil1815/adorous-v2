import { Product, TrustPolicyData } from '@/types';

export const DEFAULT_GLOBAL_TRUST_POLICY: TrustPolicyData = {
  id: 'global',
  guaranteeTitle: '৬ মাসের গ্যারান্টি (6-Month Official Guarantee)',
  guaranteeText: 'কালার ও প্লেটিং স্থায়িত্ব এবং পাথর সেটিংয়ের কারিগরী সুরক্ষা অন্তর্ভুক্ত। ফ্রি ডোরস্টেপ সার্ভিসিং বা এক্সচেঞ্জ।',
  exchangeTitle: '৭ দিনের এক্সচেঞ্জ :',
  exchangeText: 'সাইজ ও ফিনিশ পরিবর্তনযোগ্য',
  deliveryTitle: 'ডেলিভারি :',
  deliveryText: '1–3 days',
  showGuarantee: true,
  showExchange: true,
  showDelivery: true,
};

export const DEFAULT_CATEGORY_TRUST_POLICIES: Record<string, TrustPolicyData> = {
  jewelry: {
    id: 'jewelry',
    guaranteeTitle: '৬ মাসের গ্যারান্টি (6-Month Official Guarantee)',
    guaranteeText: 'কালার ও প্লেটিং স্থায়িত্ব এবং পাথর সেটিংয়ের কারিগরী সুরক্ষা অন্তর্ভুক্ত। ফ্রি ডোরস্টেপ সার্ভিসিং বা এক্সচেঞ্জ।',
    exchangeTitle: '৭ দিনের এক্সচেঞ্জ :',
    exchangeText: 'সাইজ ও ফিনিশ পরিবর্তনযোগ্য',
    deliveryTitle: 'ডেলিভারি :',
    deliveryText: '1–3 days',
    showGuarantee: true,
    showExchange: true,
    showDelivery: true,
  },
  bags: {
    id: 'bags',
    guaranteeTitle: '১ বছরের কোয়ালিটি নিশ্চয়তা (1-Year Quality Guarantee)',
    guaranteeText: 'প্রিমিয়াম ফেব্রিক, মেটাল হার্ডওয়্যার, জিপার ও স্টিচিং স্থায়িত্ব অন্তর্ভুক্ত। কোনো ম্যানুফ্যাকচারিং ত্রুটিতে ফ্রি রিপ্লেসমেন্ট।',
    exchangeTitle: '৭ দিনের এক্সচেঞ্জ :',
    exchangeText: 'কালার ও মডেল পরিবর্তনযোগ্য',
    deliveryTitle: 'ডেলিভারি :',
    deliveryText: '1–3 days',
    showGuarantee: true,
    showExchange: true,
    showDelivery: true,
  },
  churi: {
    id: 'churi',
    guaranteeTitle: '৬ মাসের গ্যারান্টি (6-Month Official Guarantee)',
    guaranteeText: 'মেটাল পলিশ, কাচের স্থায়িত্ব এবং কুন্দন/পাথর সেটিং সুরক্ষা অন্তর্ভুক্ত। ত্রুটিতে সহজ এক্সচেঞ্জ সুবিধা।',
    exchangeTitle: '৭ দিনের এক্সচেঞ্জ :',
    exchangeText: 'সাইজ নিখুঁত না হলে পরিবর্তনযোগ্য',
    deliveryTitle: 'ডেলিভারি :',
    deliveryText: '1–3 days',
    showGuarantee: true,
    showExchange: true,
    showDelivery: true,
  },
  earrings: {
    id: 'earrings',
    guaranteeTitle: '৬ মাসের গ্যারান্টি (6-Month Official Guarantee)',
    guaranteeText: 'হ্যান্ডক্রাফটেড প্লেটিং এবং লক/হুক ফিটিং সুরক্ষা অন্তর্ভুক্ত। হাইপোঅ্যালার্জেনিক ও স্কিন-ফ্রেন্ডলি ফিনিশ।',
    exchangeTitle: '৭ দিনের এক্সচেঞ্জ :',
    exchangeText: 'অক্ষত অবস্থায় পরিবর্তনযোগ্য',
    deliveryTitle: 'ডেলিভারি :',
    deliveryText: '1–3 days',
    showGuarantee: true,
    showExchange: true,
    showDelivery: true,
  },
  more: {
    id: 'more',
    guaranteeTitle: 'প্রিমিয়াম কারিগরী সুরক্ষা (Atelier Quality Assurance)',
    guaranteeText: 'প্রতিটি পিস কোয়ালিটি টেস্টেড। ডেলিভারির সময় চেক করে রিসিভ করার পূর্ণ সুবিধা।',
    exchangeTitle: '৭ দিনের এক্সচেঞ্জ :',
    exchangeText: 'অক্ষত অবস্থায় পরিবর্তনযোগ্য',
    deliveryTitle: 'ডেলিভারি :',
    deliveryText: '1–3 days',
    showGuarantee: true,
    showExchange: true,
    showDelivery: true,
  },
};

export interface ResolvedTrustPolicy {
  guaranteeTitle: string;
  guaranteeText: string;
  exchangeTitle: string;
  exchangeText: string;
  deliveryTitle: string;
  deliveryText: string;
  showGuarantee: boolean;
  showExchange: boolean;
  showDelivery: boolean;
  source: 'product' | 'category' | 'global' | 'default';
}

/**
 * Resolves trust, guarantee, exchange and delivery copy via 3-tier precedence:
 * 1. Product custom override (if hasCustomTrustPolicy is true)
 * 2. Category policy (from DB or default category template)
 * 3. Global policy (from DB or default global template)
 */
export function resolveTrustPolicy(
  product?: Partial<Product> | null,
  categoryPolicy?: TrustPolicyData | null,
  globalPolicy?: TrustPolicyData | null
): ResolvedTrustPolicy {
  // 1. Tier 1: Product Custom Override
  if (product && product.hasCustomTrustPolicy) {
    return {
      guaranteeTitle: product.trustGuaranteeTitle?.trim() || DEFAULT_GLOBAL_TRUST_POLICY.guaranteeTitle,
      guaranteeText: product.trustGuaranteeText?.trim() || DEFAULT_GLOBAL_TRUST_POLICY.guaranteeText,
      exchangeTitle: product.trustExchangeTitle?.trim() || DEFAULT_GLOBAL_TRUST_POLICY.exchangeTitle,
      exchangeText: product.trustExchangeText?.trim() || DEFAULT_GLOBAL_TRUST_POLICY.exchangeText,
      deliveryTitle: product.trustDeliveryTitle?.trim() || DEFAULT_GLOBAL_TRUST_POLICY.deliveryTitle,
      deliveryText: product.trustDeliveryText?.trim() || DEFAULT_GLOBAL_TRUST_POLICY.deliveryText,
      showGuarantee: product.showTrustGuarantee !== undefined && product.showTrustGuarantee !== null ? Boolean(product.showTrustGuarantee) : true,
      showExchange: product.showTrustExchange !== undefined && product.showTrustExchange !== null ? Boolean(product.showTrustExchange) : true,
      showDelivery: product.showTrustDelivery !== undefined && product.showTrustDelivery !== null ? Boolean(product.showTrustDelivery) : true,
      source: 'product',
    };
  }

  // 2. Tier 2: Category Policy Override
  const catKey = product?.category?.toLowerCase() || '';
  const catDefault = DEFAULT_CATEGORY_TRUST_POLICIES[catKey];

  if (categoryPolicy) {
    return {
      guaranteeTitle: categoryPolicy.guaranteeTitle || catDefault?.guaranteeTitle || DEFAULT_GLOBAL_TRUST_POLICY.guaranteeTitle,
      guaranteeText: categoryPolicy.guaranteeText || catDefault?.guaranteeText || DEFAULT_GLOBAL_TRUST_POLICY.guaranteeText,
      exchangeTitle: categoryPolicy.exchangeTitle || catDefault?.exchangeTitle || DEFAULT_GLOBAL_TRUST_POLICY.exchangeTitle,
      exchangeText: categoryPolicy.exchangeText || catDefault?.exchangeText || DEFAULT_GLOBAL_TRUST_POLICY.exchangeText,
      deliveryTitle: categoryPolicy.deliveryTitle || catDefault?.deliveryTitle || DEFAULT_GLOBAL_TRUST_POLICY.deliveryTitle,
      deliveryText: categoryPolicy.deliveryText || catDefault?.deliveryText || DEFAULT_GLOBAL_TRUST_POLICY.deliveryText,
      showGuarantee: categoryPolicy.showGuarantee ?? true,
      showExchange: categoryPolicy.showExchange ?? true,
      showDelivery: categoryPolicy.showDelivery ?? true,
      source: 'category',
    };
  }

  // If no DB category policy, but we have a category default
  if (catDefault) {
    return {
      ...catDefault,
      source: 'category',
    };
  }

  // 3. Tier 3: Global Policy
  if (globalPolicy) {
    return {
      guaranteeTitle: globalPolicy.guaranteeTitle || DEFAULT_GLOBAL_TRUST_POLICY.guaranteeTitle,
      guaranteeText: globalPolicy.guaranteeText || DEFAULT_GLOBAL_TRUST_POLICY.guaranteeText,
      exchangeTitle: globalPolicy.exchangeTitle || DEFAULT_GLOBAL_TRUST_POLICY.exchangeTitle,
      exchangeText: globalPolicy.exchangeText || DEFAULT_GLOBAL_TRUST_POLICY.exchangeText,
      deliveryTitle: globalPolicy.deliveryTitle || DEFAULT_GLOBAL_TRUST_POLICY.deliveryTitle,
      deliveryText: globalPolicy.deliveryText || DEFAULT_GLOBAL_TRUST_POLICY.deliveryText,
      showGuarantee: globalPolicy.showGuarantee ?? true,
      showExchange: globalPolicy.showExchange ?? true,
      showDelivery: globalPolicy.showDelivery ?? true,
      source: 'global',
    };
  }

  // 4. Default System Template
  return {
    ...DEFAULT_GLOBAL_TRUST_POLICY,
    source: 'default',
  };
}
