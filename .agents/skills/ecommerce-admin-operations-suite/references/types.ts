/**
 * Universal TypeScript contracts for the E-Commerce Admin Operations Suite.
 * Compatible with Next.js App Router, Prisma ORM, Drizzle, or headless API backends.
 */

export type OrderStatus =
  | 'pending'
  | 'packaging'
  | 'handed_to_courier'
  | 'delivered'
  | 'cancelled';

export interface AdminOrderItem {
  id: string;
  orderId?: string;
  productId: string;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    slug: string;
    name: string;
    category: string;
    categoryLabel?: string;
    price: number;
    featuredImage: string;
    inStock?: boolean;
    stockQty?: number | null;
  };
}

export interface AdminOrder {
  id: string;
  orderNumber?: string;
  createdAt: string;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    email?: string | null;
    address: string;
    city: string;
    district: string;
    postalCode?: string | null;
    deliveryInstructions?: string | null;
  };
  items: AdminOrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  deliveryZone?: string | null;
  grandTotal: number;
  codAmount?: number | null;
  courierTrackingId?: string | null;
  courierName?: string | null;
  paymentMethod: 'cod' | 'bkash' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string | null;
  isVerified?: boolean;
  verifiedAt?: string | null;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel?: string;
  tagline?: string;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  discountType?: 'percent' | 'flat' | null;
  stockQty?: number | null; // null = unlimited, 0 = sold out, > 0 = tracked units
  inStock?: boolean;
  featuredImage: string;
  galleryImages?: string[];
  description?: string;
  details?: string[];
  piecesIncluded?: string[];
  complimentaryItem?: string | null;
  colorways?: {
    id: string;
    name: string;
    hex: string;
    inStock?: boolean;
    image?: string | null;
  }[];
  sizes?: string[];
  isNewDrop?: boolean;
  isBestseller?: boolean;
  isGiftPick?: boolean;
  isHidden?: boolean;
  featuredRank?: number;
  createdAt?: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface AdminReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  photoUrl?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AdminStaffUser {
  id?: string;
  username: string;
  role: 'superadmin' | 'operations' | 'support';
  displayName?: string;
}
