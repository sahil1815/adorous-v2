export type ProductCategory = 'jewelry' | 'bags' | 'earrings' | 'churi' | 'more' | 'umbrellas';

export interface Colorway {
  id: string;
  colorId?: string;
  name: string;
  hex: string;
  inStock: boolean;
  image?: string | null;
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


