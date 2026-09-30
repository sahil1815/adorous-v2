'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AdminSortOrder = 'manual' | 'most-purchased' | 'newest' | 'oldest' | 'best-rating';

export interface PageOrdering {
  sortOrder: AdminSortOrder;
  manualOrder: string[]; // Product IDs in display order (used when sortOrder === 'manual')
}

interface ProductOrderingContextType {
  orderings: Record<string, PageOrdering>;
  getOrdering: (pageKey: string) => PageOrdering;
  setOrdering: (pageKey: string, ordering: PageOrdering) => void;
}

const DEFAULT_ORDERING: PageOrdering = {
  sortOrder: 'manual',
  manualOrder: [],
};

const STORAGE_KEY = 'adorous_product_ordering';

const ProductOrderingContext = createContext<ProductOrderingContextType | undefined>(undefined);

export function ProductOrderingProvider({ children }: { children: React.ReactNode }) {
  const [orderings, setOrderings] = useState<Record<string, PageOrdering>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setOrderings(JSON.parse(stored));
      }
    } catch {
      console.warn('[ProductOrderingContext] Failed to read from localStorage');
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orderings));
    } catch {
      console.warn('[ProductOrderingContext] Failed to write to localStorage');
    }
  }, [orderings, isHydrated]);

  const getOrdering = useCallback(
    (pageKey: string): PageOrdering => {
      return orderings[pageKey] || DEFAULT_ORDERING;
    },
    [orderings]
  );

  const setOrdering = useCallback((pageKey: string, ordering: PageOrdering) => {
    setOrderings((prev) => ({
      ...prev,
      [pageKey]: ordering,
    }));
  }, []);

  return (
    <ProductOrderingContext.Provider value={{ orderings, getOrdering, setOrdering }}>
      {children}
    </ProductOrderingContext.Provider>
  );
}

export function useProductOrdering() {
  const context = useContext(ProductOrderingContext);
  if (context === undefined) {
    throw new Error('useProductOrdering must be used within a ProductOrderingProvider');
  }
  return context;
}
