'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type DiscountType = 'percentage' | 'fixed' | 'free_shipping';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  discountAmount: number;
  freeShipping: boolean;
  message: string;
  coupon?: Coupon;
}

interface CouponsContextType {
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id' | 'createdAt' | 'timesUsed'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  toggleCouponStatus: (id: string) => void;
  deleteCoupon: (id: string) => void;
  validateCoupon: (code: string, subtotal: number, shippingFee: number) => CouponValidationResult;
  recordCouponUsage: (code: string) => void;
  resetToDefaultCoupons: () => void;
}

const CouponsContext = createContext<CouponsContextType | undefined>(undefined);

const COUPONS_STORAGE_KEY = 'adorous_coupons_db';

const SEED_COUPONS: Coupon[] = [
  {
    id: 'cpn-eid-2026',
    code: 'EID2026',
    description: 'Eid Ul Fitr 15% Atelier Seasonal Discount',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 2000,
    maxDiscountAmount: 800,
    usageLimit: 250,
    timesUsed: 42,
    isActive: true,
    createdAt: '2026-03-01T10:00:00.000Z',
    expiresAt: '2026-05-15T23:59:59.000Z',
  },
  {
    id: 'cpn-first-10',
    code: 'FIRST10',
    description: '10% Welcome Atelier Courtesy for New Patrons',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscountAmount: 500,
    usageLimit: 500,
    timesUsed: 89,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cpn-royal-500',
    code: 'ROYAL500',
    description: 'Flat ৳500 Luxury Allowance on Orders over ৳3,500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderAmount: 3500,
    usageLimit: 100,
    timesUsed: 27,
    isActive: true,
    createdAt: '2026-02-15T12:00:00.000Z',
  },
  {
    id: 'cpn-free-ship',
    code: 'FREESHIP',
    description: '100% Free Nationwide Delivery (Save up to ৳130)',
    discountType: 'free_shipping',
    discountValue: 0,
    minOrderAmount: 0,
    usageLimit: 150,
    timesUsed: 64,
    isActive: true,
    createdAt: '2026-02-01T08:00:00.000Z',
  },
];

export function CouponsProvider({ children }: { children: React.ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>(SEED_COUPONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COUPONS_STORAGE_KEY);
      if (stored) {
        setCoupons(JSON.parse(stored));
      } else {
        localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(SEED_COUPONS));
      }
    } catch (e) {
      console.error('Failed to load coupons from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes
  const saveCoupons = (newCoupons: Coupon[]) => {
    setCoupons(newCoupons);
    try {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(newCoupons));
    } catch (e) {
      console.error('Failed to save coupons to localStorage', e);
    }
  };

  const addCoupon = (newCouponData: Omit<Coupon, 'id' | 'createdAt' | 'timesUsed'>) => {
    const formattedCode = newCouponData.code.trim().toUpperCase();
    const id = `cpn-${formattedCode.toLowerCase()}-${Date.now()}`;
    const newCoupon: Coupon = {
      ...newCouponData,
      id,
      code: formattedCode,
      timesUsed: 0,
      createdAt: new Date().toISOString(),
    };
    saveCoupons([newCoupon, ...coupons]);
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    const updated = coupons.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          ...updates,
          code: updates.code ? updates.code.trim().toUpperCase() : c.code,
        };
      }
      return c;
    });
    saveCoupons(updated);
  };

  const toggleCouponStatus = (id: string) => {
    const updated = coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    saveCoupons(updated);
  };

  const deleteCoupon = (id: string) => {
    const updated = coupons.filter((c) => c.id !== id);
    saveCoupons(updated);
  };

  const recordCouponUsage = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const updated = coupons.map((c) => {
      if (c.code === cleanCode) {
        return { ...c, timesUsed: c.timesUsed + 1 };
      }
      return c;
    });
    saveCoupons(updated);
  };

  const resetToDefaultCoupons = () => {
    saveCoupons(SEED_COUPONS);
  };

  const validateCoupon = (
    code: string,
    subtotal: number,
    shippingFee: number
  ): CouponValidationResult => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return {
        isValid: false,
        discountAmount: 0,
        freeShipping: false,
        message: 'Please enter a coupon code.',
      };
    }

    const coupon = coupons.find((c) => c.code === cleanCode);
    if (!coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        freeShipping: false,
        message: `Coupon "${cleanCode}" is invalid.`,
      };
    }

    if (!coupon.isActive) {
      return {
        isValid: false,
        discountAmount: 0,
        freeShipping: false,
        message: `Coupon "${cleanCode}" is currently inactive.`,
        coupon,
      };
    }

    // Check expiry
    if (coupon.expiresAt) {
      const expiryDate = new Date(coupon.expiresAt);
      if (new Date() > expiryDate) {
        return {
          isValid: false,
          discountAmount: 0,
          freeShipping: false,
          message: `Coupon "${cleanCode}" has expired.`,
          coupon,
        };
      }
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return {
        isValid: false,
        discountAmount: 0,
        freeShipping: false,
        message: `Coupon "${cleanCode}" has reached its maximum redemptions limit.`,
        coupon,
      };
    }

    // Check minimum spend
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      const diff = coupon.minOrderAmount - subtotal;
      return {
        isValid: false,
        discountAmount: 0,
        freeShipping: false,
        message: `Requires a minimum cart subtotal of ৳${coupon.minOrderAmount.toLocaleString()} (Add ৳${diff.toLocaleString()} more).`,
        coupon,
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    let freeShipping = false;

    if (coupon.discountType === 'percentage') {
      const calculated = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && calculated > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      } else {
        discountAmount = calculated;
      }
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    } else if (coupon.discountType === 'free_shipping') {
      freeShipping = true;
      discountAmount = shippingFee;
    }

    return {
      isValid: true,
      discountAmount,
      freeShipping,
      message: `${coupon.code} applied: ${coupon.description}`,
      coupon,
    };
  };

  return (
    <CouponsContext.Provider
      value={{
        coupons,
        addCoupon,
        updateCoupon,
        toggleCouponStatus,
        deleteCoupon,
        validateCoupon,
        recordCouponUsage,
        resetToDefaultCoupons,
      }}
    >
      {children}
    </CouponsContext.Provider>
  );
}

export function useCoupons() {
  const context = useContext(CouponsContext);
  if (!context) {
    throw new Error('useCoupons must be used within a CouponsProvider');
  }
  return context;
}
