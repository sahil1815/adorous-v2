'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product, Colorway, CartItem } from '@/types';
import { event as trackFbEvent } from '@/lib/fpixel';
import { trackAddToCart } from '@/lib/gtag';
import { syncCartProductsAction, SyncedCartProduct } from '@/app/actions/productActions';
import { isColorwayOutOfStock } from '@/lib/productStock';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, selectedColor: Colorway, selectedSize?: string, quantity?: number, customNote?: string) => void;
  addMultipleItems: (
    itemsToAdd: { product: Product; selectedColor: Colorway; selectedSize?: string; quantity: number; customNote?: string }[],
    openDrawer?: boolean
  ) => void;
  addToCart: (product: Product, selectedColor?: Colorway, selectedSize?: string, quantity?: number, customNote?: string) => void;
  removeItem: (productId: string, colorId: string, size?: string, customNote?: string) => void;
  updateQuantity: (productId: string, colorId: string, quantity: number, size?: string, customNote?: string) => void;
  updateItemColor: (productId: string, oldColorId: string, newColor: Colorway, size?: string, customNote?: string) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  isSyncing: boolean;
  hasOutOfStockItems: boolean;
  totalItems: number;
  subtotal: number;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 2000;

/**
 * Robust canonical deduplication key for cart items.
 * Matches by product URL/slug (or ID) + colorway colorId (or name/ID) + size + custom note.
 * Prevents duplicate items when colorway internal UUIDs change between DB restores or catalogue updates.
 */
function getCartItemKey(
  product: { id: string; slug?: string },
  selectedColor: { id: string; colorId?: string; name: string },
  size?: string,
  customNote?: string
): string {
  const prodKey = (product.slug || product.id || '').trim().toLowerCase();
  const colorKey = (selectedColor.colorId || selectedColor.name || selectedColor.id || '').trim().toLowerCase();
  const sizeKey = (size || 'default').trim().toLowerCase();
  const noteKey = (customNote || '').trim();
  return `${prodKey}::${colorKey}::${sizeKey}::${noteKey}`;
}

/**
 * Flexible matcher for removing or updating items in cart.
 */
function matchesCartItem(
  item: CartItem,
  productIdOrSlug: string,
  colorIdOrName: string,
  size?: string,
  customNote?: string
): boolean {
  const targetProd = productIdOrSlug.trim().toLowerCase();
  const prodMatches =
    item.product.id.toLowerCase() === targetProd ||
    Boolean(item.product.slug && item.product.slug.toLowerCase() === targetProd);

  const targetColor = colorIdOrName.trim().toLowerCase();
  const itemColorId = ((item.selectedColor as any).colorId || '').trim().toLowerCase();
  const itemColorName = (item.selectedColor.name || '').trim().toLowerCase();
  const itemColorUuid = (item.selectedColor.id || '').trim().toLowerCase();
  const colorMatches =
    itemColorUuid === targetColor ||
    itemColorId === targetColor ||
    itemColorName === targetColor;

  const sizeMatches = (item.selectedSize || undefined) === (size || undefined);
  const noteMatches =
    customNote === undefined ||
    (item.customNote?.trim() || undefined) === (customNote?.trim() || undefined);

  return Boolean(prodMatches && colorMatches && sizeMatches && noteMatches);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);

  /**
   * Deduplicates and synchronizes cart items against authoritative product data.
   */
  const processAndSyncCart = useCallback(async (currentItems: CartItem[]): Promise<CartItem[]> => {
    if (!currentItems || currentItems.length === 0) return [];

    try {
      const identifiers = currentItems.map((item) => ({
        productId: item.product.id,
        slug: item.product.slug,
      }));

      const res = await syncCartProductsAction(identifiers);
      if (!res.success || !res.products) {
        return currentItems;
      }

      const freshProductMap = new Map<string, SyncedCartProduct>();
      for (const p of res.products) {
        if (p.id) freshProductMap.set(p.id.toLowerCase(), p);
        if (p.slug) freshProductMap.set(p.slug.toLowerCase(), p);
      }

      // Group and merge items by canonical key
      const mergedMap = new Map<string, CartItem>();

      for (const item of currentItems) {
        const prodLookup =
          (item.product.slug && freshProductMap.get(item.product.slug.toLowerCase())) ||
          (item.product.id && freshProductMap.get(item.product.id.toLowerCase())) ||
          null;

        let updatedProduct = { ...item.product };
        let updatedColor = { ...item.selectedColor };

        if (prodLookup) {
          // Authoritatively update product pricing, discount, and stock
          updatedProduct = {
            ...updatedProduct,
            id: prodLookup.id,
            slug: prodLookup.slug,
            name: prodLookup.name,
            price: prodLookup.price,
            originalPrice: prodLookup.originalPrice,
            discount: prodLookup.discount,
            discountType: (prodLookup.discountType as any) || 'percent',
            inStock: prodLookup.inStock,
            stockQty: prodLookup.stockQty,
            featuredImage: prodLookup.featuredImage || updatedProduct.featuredImage,
            colorways: prodLookup.colorways.length > 0 ? (prodLookup.colorways as any) : updatedProduct.colorways,
          };

          // Synchronize selected colorway
          const matchingCw = prodLookup.colorways.find(
            (c) =>
              (c.colorId && (item.selectedColor as any).colorId && c.colorId.toLowerCase() === (item.selectedColor as any).colorId.toLowerCase()) ||
              (c.name && item.selectedColor.name && c.name.toLowerCase() === item.selectedColor.name.toLowerCase()) ||
              (c.id && item.selectedColor.id && c.id.toLowerCase() === item.selectedColor.id.toLowerCase())
          );

          if (matchingCw) {
            updatedColor = {
              ...updatedColor,
              id: matchingCw.id,
              name: matchingCw.name || updatedColor.name,
              hex: matchingCw.hex || updatedColor.hex,
              inStock: matchingCw.inStock && prodLookup.inStock,
              image: matchingCw.image || updatedColor.image,
              ...((matchingCw.colorId || (updatedColor as any).colorId) ? { colorId: matchingCw.colorId || (updatedColor as any).colorId } : {}),
            };
          } else if (!prodLookup.inStock) {
            updatedColor = { ...updatedColor, inStock: false };
          }
        }

        const canonicalKey = getCartItemKey(
          updatedProduct,
          updatedColor,
          item.selectedSize,
          item.customNote
        );

        if (mergedMap.has(canonicalKey)) {
          const existing = mergedMap.get(canonicalKey)!;
          existing.quantity += item.quantity;
          // Ensure product details reflect the freshest data
          existing.product = updatedProduct;
          existing.selectedColor = updatedColor;
        } else {
          mergedMap.set(canonicalKey, {
            product: updatedProduct,
            selectedColor: updatedColor,
            selectedSize: item.selectedSize,
            quantity: item.quantity,
            customNote: item.customNote,
          });
        }
      }

      return Array.from(mergedMap.values());
    } catch (err) {
      console.warn('[CartContext] Failed to sync cart products:', err);
      return currentItems;
    }
  }, []);

  /**
   * Public refresh function to force re-sync with server
   */
  const refreshCart = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      setItems((prev) => {
        if (prev.length === 0) return prev;
        processAndSyncCart(prev).then((synced) => {
          setItems(synced);
          try {
            localStorage.setItem('adorous_cart', JSON.stringify(synced));
          } catch {}
        });
        return prev;
      });
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;
    }
  }, [processAndSyncCart]);

  // Initial load from localStorage & automatic background sync
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adorous_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          // Immediately perform authoritative background sync
          processAndSyncCart(parsed).then((synced) => {
            setItems(synced);
            try {
              localStorage.setItem('adorous_cart', JSON.stringify(synced));
            } catch {}
          });
        }
      }
    } catch (e) {
      console.error('Failed to load cart', e);
    }
    setIsLoaded(true);
  }, [processAndSyncCart]);

  // Save changes to localStorage whenever items state updates
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('adorous_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart', e);
      }
    }
  }, [items, isLoaded]);

  const openCart = () => {
    setIsOpen(true);
    refreshCart();
  };

  const closeCart = () => setIsOpen(false);

  const addItem = (
    product: Product,
    selectedColor: Colorway,
    selectedSize?: string,
    quantity: number = 1,
    customNote?: string
  ) => {
    // Guard: block add if product or variant is explicitly out of stock
    if (product.inStock === false || (product as any).stockQty === 0 || selectedColor.inStock === false) return;

    const trimmedNote = customNote?.trim() || undefined;
    const targetKey = getCartItemKey(product, selectedColor, selectedSize, trimmedNote);

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => getCartItemKey(item.product, item.selectedColor, item.selectedSize, item.customNote) === targetKey
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          product, // refresh product to latest snapshot
          selectedColor, // refresh colorway to latest snapshot
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [...prev, { product, selectedColor, selectedSize, quantity, customNote: trimmedNote }];
      }
    });

    trackFbEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price * quantity,
      currency: 'BDT',
    });

    trackAddToCart({
      id: product.id,
      name: product.name,
      category: product.categoryLabel || product.category,
      price: product.price,
      quantity,
    });

    setIsOpen(true);
  };

  const addMultipleItems = (
    itemsToAdd: { product: Product; selectedColor: Colorway; selectedSize?: string; quantity: number; customNote?: string }[],
    openDrawer: boolean = true
  ) => {
    const validItems = itemsToAdd.filter(
      (entry) =>
        entry.quantity > 0 &&
        entry.product.inStock !== false &&
        (entry.product as any).stockQty !== 0 &&
        entry.selectedColor?.inStock !== false
    );

    if (validItems.length === 0) return;

    setItems((prev) => {
      const updated = [...prev];
      for (const entry of validItems) {
        const trimmedNote = entry.customNote?.trim() || undefined;
        const targetKey = getCartItemKey(entry.product, entry.selectedColor, entry.selectedSize, trimmedNote);
        const existingIndex = updated.findIndex(
          (item) => getCartItemKey(item.product, item.selectedColor, item.selectedSize, item.customNote) === targetKey
        );

        if (existingIndex > -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            product: entry.product,
            selectedColor: entry.selectedColor,
            quantity: updated[existingIndex].quantity + entry.quantity,
          };
        } else {
          updated.push({
            product: entry.product,
            selectedColor: entry.selectedColor,
            selectedSize: entry.selectedSize,
            quantity: entry.quantity,
            customNote: trimmedNote,
          });
        }
      }
      return updated;
    });

    if (openDrawer) {
      setIsOpen(true);
    }
  };

  const addToCart = (product: Product, selectedColor?: Colorway, selectedSize?: string, quantity: number = 1, customNote?: string) => {
    const color = selectedColor || product.colorways[0];
    addItem(product, color, selectedSize, quantity, customNote);
  };

  const removeItem = (productId: string, colorId: string, size?: string, customNote?: string) => {
    setItems((prev) =>
      prev.filter((item) => !matchesCartItem(item, productId, colorId, size, customNote))
    );
  };

  const updateQuantity = (productId: string, colorId: string, quantity: number, size?: string, customNote?: string) => {
    if (quantity <= 0) {
      removeItem(productId, colorId, size, customNote);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (matchesCartItem(item, productId, colorId, size, customNote)) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const updateItemColor = (
    productId: string,
    oldColorId: string,
    newColor: Colorway,
    size?: string,
    customNote?: string
  ) => {
    setItems((prev) => {
      const targetIndex = prev.findIndex((item) =>
        matchesCartItem(item, productId, oldColorId, size, customNote)
      );
      if (targetIndex === -1) return prev;

      const itemToUpdate = prev[targetIndex];
      const targetNewKey = getCartItemKey(itemToUpdate.product, newColor, size, itemToUpdate.customNote);

      const existingNewColorIndex = prev.findIndex(
        (item, idx) =>
          idx !== targetIndex &&
          getCartItemKey(item.product, item.selectedColor, item.selectedSize, item.customNote) === targetNewKey
      );

      if (existingNewColorIndex > -1) {
        // Merge quantities and remove the old item
        const updated = [...prev];
        updated[existingNewColorIndex] = {
          ...updated[existingNewColorIndex],
          quantity: updated[existingNewColorIndex].quantity + itemToUpdate.quantity,
        };
        updated.splice(targetIndex, 1);
        return updated;
      } else {
        // Update selectedColor
        const updated = [...prev];
        updated[targetIndex] = {
          ...itemToUpdate,
          selectedColor: newColor,
        };
        return updated;
      }
    });
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (Number(item.product.price) || 0) * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasOutOfStockItems = items.some((item) => isColorwayOutOfStock(item.product, item.selectedColor));

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        addMultipleItems,
        addToCart,
        removeItem,
        updateQuantity,
        updateItemColor,
        clearCart,
        refreshCart,
        isSyncing,
        hasOutOfStockItems,
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
