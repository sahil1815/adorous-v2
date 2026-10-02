'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AdminSortOrder,
  PageOrdering,
  getAllPageOrderings,
  savePageOrdering,
} from '@/app/actions/productOrderingActions';

export type { AdminSortOrder, PageOrdering };

interface ProductOrderingContextType {
  orderings: Record<string, PageOrdering>;
  getOrdering: (pageKey: string) => PageOrdering;
  setOrdering: (pageKey: string, ordering: PageOrdering) => Promise<void>;
  refreshOrderings: () => Promise<void>;
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

  // 1. Initial hydration: fast load from localStorage, followed by authoritative fetch from DB
  const refreshOrderings = useCallback(async () => {
    try {
      const dbOrderings = await getAllPageOrderings();
      if (dbOrderings && Object.keys(dbOrderings).length > 0) {
        setOrderings((prev) => {
          const merged = { ...prev, ...dbOrderings };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore localStorage errors
          }
          return merged;
        });
      }
    } catch (err) {
      console.warn('[ProductOrderingContext] Error refreshing from DB:', err);
    }
  }, []);

  useEffect(() => {
    // Optimistic fast read from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setOrderings(JSON.parse(stored));
      }
    } catch {
      console.warn('[ProductOrderingContext] Failed to read from localStorage');
    }
    setIsHydrated(true);

    // Authoritative sync from database
    refreshOrderings();
  }, [refreshOrderings]);

  // Persist to localStorage whenever state updates
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

  const setOrdering = useCallback(async (pageKey: string, ordering: PageOrdering) => {
    // 1. Optimistic local state update
    setOrderings((prev) => ({
      ...prev,
      [pageKey]: ordering,
    }));

    // 2. Persist to PostgreSQL database in background
    try {
      await savePageOrdering(pageKey, ordering);
    } catch (err) {
      console.error('[ProductOrderingContext] Failed to save ordering to database:', err);
    }
  }, []);

  return (
    <ProductOrderingContext.Provider value={{ orderings, getOrdering, setOrdering, refreshOrderings }}>
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
