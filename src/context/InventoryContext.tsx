'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS } from '@/data/catalogue';
import { Product, ProductCategory } from '@/types';
import { getAllProducts } from '@/app/actions/productActions';

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
  refreshProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateProductStock: (productId: string, stockStatus: ProductOverride['stockStatus']) => void;
  updateProductBadges: (productId: string, badges: { isNewDrop?: boolean; isBestseller?: boolean }) => void;
  updateProductPrice: (productId: string, price: number, originalPrice?: number) => void;
  resetInventoryOverrides: () => void;
  getEffectiveProduct: (product: Product) => Product;
  getProductBySlug: (category: string, slug: string) => Product | undefined;
}

function fromDbProduct(p: any): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category as ProductCategory,
    categoryLabel: p.categoryLabel || 'Luxury Accessories',
    tagline: p.tagline || '',
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    stockQty: p.stockQty ?? null,
    inStock: p.inStock ?? true,
    isNewDrop: p.isNewDrop ?? false,
    isBestseller: p.isBestseller ?? false,
    isGiftPick: p.isGiftPick ?? false,
    featuredRank: p.featuredRank ?? 999,
    description: p.description || '',
    details: Array.isArray(p.details)
      ? p.details.map((d: any) => (typeof d === 'string' ? d : d.text))
      : [],
    piecesIncluded: Array.isArray(p.piecesIncluded)
      ? p.piecesIncluded.map((pi: any) => (typeof pi === 'string' ? pi : pi.text))
      : [],
    colorways: (p.colorways || []).map((cw: any) => ({
      id: cw.colorId || cw.id,
      name: cw.name,
      hex: cw.hex,
      inStock: cw.inStock ?? true,
      image: cw.image || null,
    })),
    sizes: p.sizes,
    featuredImage: p.featuredImage,
    galleryImages: Array.isArray(p.galleryImages)
      ? p.galleryImages.map((g: any) => (typeof g === 'string' ? g : g.url))
      : [p.featuredImage],
    seoKeywords: Array.isArray(p.seoKeywords)
      ? p.seoKeywords
      : (p.seoKeywords ? p.seoKeywords.split(',') : []),
  };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const INVENTORY_STORAGE_KEY = 'adorous_inventory_overrides';
const CUSTOM_PRODUCTS_STORAGE_KEY = 'adorous_custom_products';
const DELETED_PRODUCTS_STORAGE_KEY = 'adorous_deleted_products';

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, ProductOverride>>({});
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
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

      const storedDeleted = localStorage.getItem(DELETED_PRODUCTS_STORAGE_KEY);
      if (storedDeleted) {
        setDeletedIds(JSON.parse(storedDeleted));
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
    setTimeout(() => {
      refreshProducts();
    }, 500);
    return product;
  };

  const updateProduct = (updatedProd: Product) => {
    const updated = customProducts.map((p) => (p.id === updatedProd.id ? updatedProd : p));
    saveCustomProducts(updated);
    setTimeout(() => {
      refreshProducts();
    }, 500);
  };

  const deleteProduct = (productId: string) => {
    setDeletedIds((prev) => {
      const next = Array.from(new Set([...prev, productId]));
      try {
        localStorage.setItem(DELETED_PRODUCTS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    const updated = customProducts.filter((p) => p.id !== productId && p.slug !== productId);
    saveCustomProducts(updated);

    // Remove override if present
    if (overrides[productId]) {
      const { [productId]: _, ...rest } = overrides;
      saveOverrides(rest);
    }

    setTimeout(() => {
      refreshProducts();
    }, 500);
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
    setDeletedIds([]);
    try {
      localStorage.removeItem(INVENTORY_STORAGE_KEY);
      localStorage.removeItem(CUSTOM_PRODUCTS_STORAGE_KEY);
      localStorage.removeItem(DELETED_PRODUCTS_STORAGE_KEY);
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

  const [dbProducts, setDbProducts] = useState<Product[] | null>(null);

  const refreshProducts = async () => {
    try {
      const serverProducts = await getAllProducts();
      if (serverProducts) {
        setDbProducts(serverProducts.map(fromDbProduct));
      }
    } catch (e) {
      console.warn('[InventoryContext] Could not load products from DB:', e);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Combined list: if database has loaded, it is the primary source of truth!
  // When dbProducts is still loading, start with empty list to prevent ghost dummy items from resurrecting
  const baseProducts = dbProducts !== null ? dbProducts : [];

  // Combine DB products and custom products, deduplicating by id and slug
  const seen = new Set<string>();
  const combined: Product[] = [];

  for (const p of baseProducts) {
    if (!deletedIds.includes(p.id) && !deletedIds.includes(p.slug)) {
      seen.add(p.id);
      seen.add(p.slug);
      combined.push(p);
    }
  }

  for (const p of customProducts) {
    if (!seen.has(p.id) && !seen.has(p.slug) && !deletedIds.includes(p.id) && !deletedIds.includes(p.slug)) {
      seen.add(p.id);
      seen.add(p.slug);
      combined.push(p);
    }
  }

  const allProducts = combined;

  const getProductBySlug = (category: string, slug: string): Product | undefined => {
    const cleanSlug = slug ? slug.toLowerCase().trim() : '';
    const cleanCategory = category ? category.toLowerCase().trim() : '';

    const found = allProducts.find((p) => {
      const pSlug = p.slug.toLowerCase().trim();
      const pCat = p.category.toLowerCase().trim();
      return pSlug === cleanSlug && (!cleanCategory || pCat === cleanCategory);
    });

    if (!found) return undefined;
    return getEffectiveProduct(found);
  };

  return (
    <InventoryContext.Provider
      value={{
        overrides,
        customProducts,
        allProducts,
        refreshProducts,
        addProduct,
        updateProduct,
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
