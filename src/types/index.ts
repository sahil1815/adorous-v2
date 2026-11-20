export type ProductCategory = 'jewelry' | 'bags' | 'earrings' | 'churi' | 'more' | 'umbrellas';

export interface Colorway {
  id: string;
  colorId?: string;
  name: string;
  hex: string;
  inStock: boolean;
  image?: string | null;
}

export interface BangleSetTier {
  id: string; // e.g. 'tier-6', 'tier-12', 'tier-24'
  name: string; // e.g. '6-Set', '12-Set', '24-Set' or '১ ডজন'
  price: number; // Total price in BDT, e.g. 1920
  originalPrice?: number | null; // Optional compare-at price in BDT, e.g. 2400
  perSetPriceText?: string | null; // e.g. 'প্রতি সেটের প্রাইস ৮০ টাকা' or '৳80 / set'
  badge?: string | null; // e.g. 'Best Value', 'Most Popular'
  isDefault?: boolean; // True if this tier is pre-selected
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  tagline: string;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  discountType?: 'percent' | 'flat' | string | null;
  stockQty?: number | null;
  description: string;
  details: string[];
  piecesIncluded?: string[];
  complimentaryItem?: string | null;
  colorways: Colorway[];
  sizes?: string[]; // Sizing for churi (e.g. 2-4, 2-6, 2-8)
  allowMultipleColors?: boolean; // For churi: allow selecting multiple colors in one order
  allowMultipleSizes?: boolean; // For churi: allow selecting multiple sizes in one order
  hasCustomNote?: boolean; // For churi: allow extra field for customer custom notes / wrist sizing
  customNotePrompt?: string | null; // For churi: custom placeholder or label for extra note field
  hasSetPricing?: boolean; // For churi: allow set / bundle tier pricing
  setPricingBanner?: string | null; // For churi: promo highlight banner text, e.g. '২৪ সেটের ক্ষেত্রে প্রতি সেটের প্রাইস ৮০ টাকা'
  setTiers?: BangleSetTier[] | any; // For churi: list of configured set tiers
  hasCustomTrustPolicy?: boolean;
  trustGuaranteeTitle?: string | null;
  trustGuaranteeText?: string | null;
  trustExchangeTitle?: string | null;
  trustExchangeText?: string | null;
  trustDeliveryTitle?: string | null;
  trustDeliveryText?: string | null;
  showTrustGuarantee?: boolean | null;
  showTrustExchange?: boolean | null;
  showTrustDelivery?: boolean | null;
  featuredImage: string;
  galleryImages: string[];
  isNewDrop?: boolean;
  isGiftPick?: boolean;
  isBestseller?: boolean;
  inStock?: boolean;
  featuredRank: number;
  seoKeywords: string[];
  isHidden?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CartItem {
  product: Product;
  selectedColor: Colorway;
  selectedSize?: string;
  selectedSizes?: string[]; // Multiple sizes when enabled
  selectedSet?: string; // For churi: e.g. '24-Set'
  customNote?: string; // Extra information / customer note (e.g. wrist circumference, customization)
  quantity: number;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  colorwayName?: string;
  photoUrl?: string; // Must adhere to NO HUMAN IMAGERY mandate (e.g., flat lays only)
  status: ReviewStatus;
  createdAt: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  district: string;
  address: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  district?: string | null;
  address?: string | null;
  whatsappUpdates: boolean;
  createdAt: string;
  savedAddresses?: SavedAddress[];
}

export interface TrustPolicyData {
  id: string; // 'global' | 'jewelry' | 'bags' | 'churi' | 'earrings' | 'more'
  guaranteeTitle: string;
  guaranteeText: string;
  exchangeTitle: string;
  exchangeText: string;
  deliveryTitle: string;
  deliveryText: string;
  showGuarantee: boolean;
  showExchange: boolean;
  showDelivery: boolean;
  updatedAt?: string | Date;
  createdAt?: string | Date;
}


