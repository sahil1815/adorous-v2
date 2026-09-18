'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS } from '@/data/catalogue';
import { Product } from '@/types';

export interface ProductOverride {
  stockStatus: 'in_stock' | 'low_stock' | 'sold_out';
  isNewDrop?: boolean;
  isBestseller?: boolean;
  price?: number;
  originalPrice?: number;
}

interface InventoryContextType {
  overrides: Record<string, ProductOverride>;
  customProducts: Product[];
  allProducts: Product[];
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => Product;
  deleteProduct: (productId: string) => void;
  updateProductStock: (productId: string, stockStatus: ProductOverride['stockStatus']) => void;
  updateProductBadges: (productId: string, badges: { isNewDrop?: boolean; isBestseller?: boolean }) => void;
  updateProductPrice: (productId: string, price: number, originalPrice?: number) => void;
  resetInventoryOverrides: () => void;
  getEffectiveProduct: (product: Product) => Product;
  getProductBySlug: (category: string, slug: string) => Product | undefined;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const INVENTORY_STORAGE_KEY = 'adorous_inventory_overrides';
const CUSTOM_PRODUCTS_STORAGE_KEY = 'adorous_custom_products';

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, ProductOverride>>({});
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedOverrides = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (storedOverrides) {
        setOverrides(JSON.parse(storedOverrides));
      }

      const storedCustom = localStorage.getItem(CUSTOM_PRODUCTS_STORAGE_KEY);
      if (storedCustom) {
        setCustomProducts(JSON.parse(storedCustom));
      }
    } catch (e) {
      console.error('Failed to load inventory data from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveOverrides = (newOverrides: Record<string, ProductOverride>) => {
    setOverrides(newOverrides);
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(newOverrides));
    } catch (e) {
      console.error(e);
    }
  };

  const saveCustomProducts = (products: Product[]) => {
    setCustomProducts(products);
    try {
      localStorage.setItem(CUSTOM_PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  };

  const addProduct = (newProdData: Omit<Product, 'id'> & { id?: string }): Product => {
    const id = newProdData.id || `custom-prod-${Date.now()}`;
    const product: Product = {
      ...newProdData,
      id,
    };

    const updated = [product, ...customProducts];
    saveCustomProducts(updated);
    return product;
  };

  const deleteProduct = (productId: string) => {
    const updated = customProducts.filter((p) => p.id !== productId);
    saveCustomProducts(updated);
    // Remove override if present
    if (overrides[productId]) {
      const { [productId]: _, ...rest } = overrides;
      saveOverrides(rest);
    }
  };

  const updateProductStock = (productId: string, stockStatus: ProductOverride['stockStatus']) => {
    const current = overrides[productId] || { stockStatus: 'in_stock' };
    saveOverrides({
      ...overrides,
      [productId]: {
        ...current,
        stockStatus,
      },
    });
  };

  const updateProductBadges = (
    productId: string,
    badges: { isNewDrop?: boolean; isBestseller?: boolean }
  ) => {
    const current = overrides[productId] || { stockStatus: 'in_stock' };
    saveOverrides({
      ...overrides,
      [productId]: {
        ...current,
        ...badges,
      },
    });
  };

  const updateProductPrice = (productId: string, price: number, originalPrice?: number) => {
    const current = overrides[productId] || { stockStatus: 'in_stock' };
    saveOverrides({
      ...overrides,
      [productId]: {
        ...current,
        price,
        originalPrice,
      },
    });
  };

  const resetInventoryOverrides = () => {
    setOverrides({});
    setCustomProducts([]);
    try {
      localStorage.removeItem(INVENTORY_STORAGE_KEY);
      localStorage.removeItem(CUSTOM_PRODUCTS_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  const getEffectiveProduct = (product: Product): Product => {
    const override = overrides[product.id];
    if (!override) return product;

    return {
      ...product,
      price: override.price !== undefined ? override.price : product.price,
      originalPrice: override.originalPrice !== undefined ? override.originalPrice : product.originalPrice,
      isNewDrop: override.isNewDrop !== undefined ? override.isNewDrop : product.isNewDrop,
      isBestseller: override.isBestseller !== undefined ? override.isBestseller : product.isBestseller,
      inStock: override.stockStatus !== 'sold_out',
    };
  };

  // Combined list: custom products first, followed by catalogue products
  const allProducts: Product[] = [...customProducts, ...PRODUCTS];

  const getProductBySlug = (category: string, slug: string): Product | undefined => {
    const found = allProducts.find((p) => p.category === category && p.slug === slug);
    if (!found) return undefined;
    return getEffectiveProduct(found);
  };

  return (
    <InventoryContext.Provider
      value={{
        overrides,
        customProducts,
        allProducts,
        addProduct,
        deleteProduct,
        updateProductStock,
        updateProductBadges,
        updateProductPrice,
        resetInventoryOverrides,
        getEffectiveProduct,
        getProductBySlug,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
