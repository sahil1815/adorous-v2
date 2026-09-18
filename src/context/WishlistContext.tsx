'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { PRODUCTS } from '@/data/catalogue';

interface WishlistContextType {
  wishlist: Product[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  totalWishlistItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adorous_wishlist');
      if (saved) {
        const savedIds: string[] = JSON.parse(saved);
        // Hydrate full Product objects from catalog to keep data fresh
        const hydrated = savedIds
          .map((id) => PRODUCTS.find((p) => p.id === id))
          .filter((p): p is Product => Boolean(p));
        setWishlist(hydrated);
      }
    } catch (e) {
      console.error('Failed to load wishlist', e);
    }
    setIsLoaded(true);
  }, []);

  // Save IDs to localStorage whenever wishlist changes
  useEffect(() => {
    if (isLoaded) {
      try {
        const ids = wishlist.map((p) => p.id);
        localStorage.setItem('adorous_wishlist', JSON.stringify(ids));
      } catch (e) {
        console.error('Failed to save wishlist', e);
      }
    }
  }, [wishlist, isLoaded]);

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
        totalWishlistItems: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
