'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Colorway, CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, selectedColor: Colorway, selectedSize?: string, quantity?: number) => void;
  addToCart: (product: Product, selectedColor?: Colorway, selectedSize?: string, quantity?: number) => void;
  removeItem: (productId: string, colorId: string, size?: string) => void;
  updateQuantity: (productId: string, colorId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 2000;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('adorous_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('adorous_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart', e);
      }
    }
  }, [items, isLoaded]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (product: Product, selectedColor: Colorway, selectedSize?: string, quantity: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor.id === selectedColor.id &&
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, selectedColor, selectedSize, quantity }];
      }
    });
    setIsOpen(true);
  };

  const addToCart = (product: Product, selectedColor?: Colorway, selectedSize?: string, quantity: number = 1) => {
    const color = selectedColor || product.colorways[0];
    addItem(product, color, selectedSize, quantity);
  };

  const removeItem = (productId: string, colorId: string, size?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.selectedColor.id === colorId && item.selectedSize === size)
      )
    );
  };

  const updateQuantity = (productId: string, colorId: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeItem(productId, colorId, size);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.selectedColor.id === colorId && item.selectedSize === size) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        remainingForFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
