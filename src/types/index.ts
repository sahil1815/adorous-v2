export type ProductCategory = 'jewelry' | 'bags' | 'earrings' | 'churi' | 'more' | 'umbrellas';

export interface Colorway {
  id: string;
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
  stockQty?: number | null;
  description: string;
  details: string[];
  piecesIncluded?: string[];
  colorways: Colorway[];
  sizes?: string[]; // Sizing for churi (e.g. 2-4, 2-6, 2-8)
  featuredImage: string;
  galleryImages: string[];
  isNewDrop?: boolean;
  isGiftPick?: boolean;
  isBestseller?: boolean;
  inStock?: boolean;
  featuredRank: number;
  seoKeywords: string[];
}

export interface CartItem {
  product: Product;
  selectedColor: Colorway;
  selectedSize?: string;
  quantity: number;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
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
