'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Product, ProductCategory } from '@/types';
import { useInventory } from '@/context/InventoryContext';
import {
  getAllProducts,
  deleteProductAction,
  updateStockAction,
  updateProductBadgesAction,
  updateProductPriceAction,
  toggleProductVisibilityAction,
} from '@/app/actions/productActions';
import {
  CheckCircle2,
  Plus,
  Package,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { calculateSellingPrice } from '@/lib/pricing';
import { CATEGORIES } from '@/data/catalogue';
import InventoryMetricsHeader from '@/components/admin/inventory/InventoryMetricsHeader';
import InventoryFiltersBar from '@/components/admin/inventory/InventoryFiltersBar';
import InventoryProductCard from '@/components/admin/inventory/InventoryProductCard';
import ProductDeleteModal from '@/components/admin/inventory/ProductDeleteModal';

function fromDbProduct(p: any): Product {
  const isProdInStock = (p.inStock ?? true) && (p.stockQty === null || p.stockQty === undefined || p.stockQty > 0);
  const rawColorways = p.colorways || [];
  const singleOrAllFalse = rawColorways.length <= 1 || rawColorways.every((c: any) => !c.inStock);

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category as ProductCategory,
    categoryLabel: p.categoryLabel || 'Luxury Accessories',
    tagline: p.tagline || '',
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    discount: p.discount !== null && p.discount !== undefined ? Number(p.discount) : null,
    discountType: p.discountType ?? null,
    stockQty: p.stockQty ?? null,
    inStock: p.inStock ?? true,
    description: p.description || '',
    details: Array.isArray(p.details)
      ? p.details.map((d: any) => (typeof d === 'string' ? d : d.text))
      : [],
    piecesIncluded: Array.isArray(p.piecesIncluded)
      ? p.piecesIncluded.map((pi: any) => (typeof pi === 'string' ? pi : pi.text))
      : [],
    colorways: rawColorways.map((cw: any) => ({
      id: cw.colorId || cw.id,
      name: cw.name,
      hex: cw.hex,
      inStock: isProdInStock && singleOrAllFalse ? true : (cw.inStock ?? true),
      image: cw.image || null,
    })),
    sizes: p.sizes,
    featuredImage: p.featuredImage,
    galleryImages: Array.isArray(p.galleryImages)
      ? p.galleryImages.map((g: any) => (typeof g === 'string' ? g : g.url))
      : [p.featuredImage],
    isNewDrop: Boolean(p.isNewDrop),
    isGiftPick: Boolean(p.isGiftPick),
    isBestseller: Boolean(p.isBestseller),
    featuredRank: p.featuredRank ?? 999,
    isHidden: Boolean(p.isHidden),
    seoKeywords:
      typeof p.seoKeywords === 'string'
        ? p.seoKeywords.split(',')
        : Array.isArray(p.seoKeywords)
        ? p.seoKeywords
        : [],
    createdAt: p.createdAt
      ? (p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt))
      : undefined,
    updatedAt: p.updatedAt
      ? (p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt))
      : undefined,
  };
}

export default function AdminInventoryPage() {
  const {
    customProducts,
    allProducts: contextProducts,
    deleteProduct,
    updateProductStock,
    updateProductBadges,
    updateProductPrice,
    updateProductVisibility,
    getEffectiveProduct,
  } = useInventory();

  // Database loaded products
  const [dbProducts, setDbProducts] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [togglingVisibilityId, setTogglingVisibilityId] = useState<string | null>(null);

  // Inline Price Editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [basePriceInput, setBasePriceInput] = useState<number | string>(0);
  const [discountInput, setDiscountInput] = useState<number | string>('');
  const [discountTypeInput, setDiscountTypeInput] = useState<'percent' | 'flat'>('percent');
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Stock per product state
  const [stockInputs, setStockInputs] = useState<
    Record<
      string,
      { qty: number; mode: 'unlimited' | 'tracked'; saving: boolean; saved: boolean; error: string | null }
    >
  >({});

  // Deletion Modal
  const [deleteModalProduct, setDeleteModalProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Global toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch real products from PostgreSQL
  useEffect(() => {
    let isMounted = true;
    async function fetchInventory() {
      try {
        setIsLoading(true);
        const serverProducts = await getAllProducts(true, 'newest');
        if (isMounted && serverProducts) {
          setDbProducts(serverProducts.map(fromDbProduct));
        }
      } catch (err) {
        console.warn('[AdminInventory] Falling back to client context:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchInventory();
    return () => {
      isMounted = false;
    };
  }, []);

  // Quick 1-click Visibility Toggle Handler
  const handleToggleVisibility = async (prod: Product, targetHidden: boolean) => {
    setTogglingVisibilityId(prod.id);
    setDbProducts((prev) =>
      prev
        ? prev.map((p) =>
            p.id === prod.id || p.slug === prod.slug ? { ...p, isHidden: targetHidden } : p
          )
        : null
    );
    updateProductVisibility(prod.id, targetHidden);

    const res = await toggleProductVisibilityAction(prod.id, targetHidden);
    setTogglingVisibilityId(null);

    if (res.success) {
      showToast(
        `"${prod.name}" is now ${targetHidden ? 'hidden from storefront' : 'live on storefront'}`
      );
    } else {
      setDbProducts((prev) =>
        prev
          ? prev.map((p) =>
              p.id === prod.id || p.slug === prod.slug ? { ...p, isHidden: !targetHidden } : p
            )
          : null
      );
      updateProductVisibility(prod.id, !targetHidden);
      showToast(res.error || 'Failed to update visibility', 'error');
    }
  };

  // Derive active product list strictly sorted by added date descending
  const activeProducts: Product[] = useMemo(() => {
    let list: Product[] = [];
    if (dbProducts === null) {
      list = [...contextProducts];
    } else {
      const map = new Map<string, Product>();
      dbProducts.forEach((p) => {
        map.set(p.id, p);
        map.set(p.slug, p);
      });

      const merged = [...dbProducts];
      contextProducts.forEach((cp) => {
        if (!map.has(cp.id) && !map.has(cp.slug)) {
          merged.unshift(cp);
        }
      });
      list = merged;
    }

    return [...list].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [dbProducts, contextProducts]);

  // Stock state helper
  const getStockState = (prod: Product) => {
    if (stockInputs[prod.id]) return stockInputs[prod.id];
    if (prod.stockQty !== null && prod.stockQty !== undefined) {
      return {
        qty: prod.stockQty,
        mode: 'tracked' as const,
        saving: false,
        saved: false,
        error: null,
      };
    }
    return {
      qty: 10,
      mode: (prod.inStock === false ? 'tracked' : 'unlimited') as 'unlimited' | 'tracked',
      saving: false,
      saved: false,
      error: null,
    };
  };

  const handleStockModeChange = (productId: string, mode: 'unlimited' | 'tracked') => {
    const current = stockInputs[productId] || getStockState({ id: productId } as Product);
    setStockInputs((prev) => ({
      ...prev,
      [productId]: {
        ...current,
        mode,
        qty: current.qty || 10,
        saved: false,
        error: null,
      },
    }));
  };

  const handleStockQtyChange = (productId: string, qty: number) => {
    const current = stockInputs[productId] || getStockState({ id: productId } as Product);
    setStockInputs((prev) => ({
      ...prev,
      [productId]: { ...current, qty, saved: false, error: null },
    }));
  };

  // Save stock directly to PostgreSQL
  const handleSaveStock = async (prod: Product) => {
    const s = stockInputs[prod.id] || getStockState(prod);
    setStockInputs((prev) => ({
      ...prev,
      [prod.id]: { ...s, saving: true, error: null },
    }));

    const qty = s.mode === 'unlimited' ? null : Math.max(0, s.qty);
    const res = await updateStockAction(prod.id, qty);

    if (res.success) {
      const isNowInStock = qty === null || qty > 0;
      setDbProducts((prev) =>
        prev
          ? prev.map((p) =>
              p.id === prod.id || p.slug === prod.slug
                ? {
                    ...p,
                    stockQty: qty,
                    inStock: isNowInStock,
                    colorways: (p.colorways || []).map((cw) => ({
                      ...cw,
                      inStock: isNowInStock
                        ? p.colorways.length <= 1 || p.colorways.every((c) => !c.inStock)
                          ? true
                          : cw.inStock
                        : false,
                    })),
                  }
                : p
            )
          : null
      );

      const newStatus = qty === null || qty > 2 ? 'in_stock' : qty > 0 ? 'low_stock' : 'sold_out';
      updateProductStock(prod.id, newStatus);

      setStockInputs((prev) => ({
        ...prev,
        [prod.id]: { ...s, saving: false, saved: true, error: null },
      }));
      setTimeout(
        () =>
          setStockInputs((prev) => ({
            ...prev,
            [prod.id]: { ...prev[prod.id], saved: false },
          })),
        2000
      );
      showToast(`Stock updated for "${prod.name}"`);
    } else {
      setStockInputs((prev) => ({
        ...prev,
        [prod.id]: {
          ...s,
          saving: false,
          saved: false,
          error: res.error || 'Failed to update stock',
        },
      }));
      showToast(res.error || 'Failed to update stock in database', 'error');
    }
  };

  // Quick 1-click status presets
  const handleQuickPreset = async (
    prod: Product,
    target: 'in_stock' | 'low_stock' | 'sold_out'
  ) => {
    let newQty: number | null = null;
    let mode: 'unlimited' | 'tracked' = 'unlimited';

    if (target === 'in_stock') {
      newQty = null;
      mode = 'unlimited';
    } else if (target === 'low_stock') {
      newQty = 2;
      mode = 'tracked';
    } else if (target === 'sold_out') {
      newQty = 0;
      mode = 'tracked';
    }

    setStockInputs((prev) => ({
      ...prev,
      [prod.id]: {
        qty: newQty === null ? 10 : newQty,
        mode,
        saving: true,
        saved: false,
        error: null,
      },
    }));

    const res = await updateStockAction(prod.id, newQty);
    if (res.success) {
      const isNowInStock = newQty === null || newQty > 0;
      setDbProducts((prev) =>
        prev
          ? prev.map((p) =>
              p.id === prod.id || p.slug === prod.slug
                ? {
                    ...p,
                    stockQty: newQty,
                    inStock: isNowInStock,
                    colorways: (p.colorways || []).map((cw) => ({
                      ...cw,
                      inStock: isNowInStock
                        ? p.colorways.length <= 1 || p.colorways.every((c) => !c.inStock)
                          ? true
                          : cw.inStock
                        : false,
                    })),
                  }
                : p
            )
          : null
      );
      updateProductStock(prod.id, target);
      setStockInputs((prev) => ({
        ...prev,
        [prod.id]: {
          qty: newQty === null ? 10 : newQty,
          mode,
          saving: false,
          saved: true,
          error: null,
        },
      }));
      setTimeout(
        () =>
          setStockInputs((prev) => ({
            ...prev,
            [prod.id]: { ...prev[prod.id], saved: false },
          })),
        2000
      );
      showToast(`Status set to ${target.replace('_', ' ').toUpperCase()} for "${prod.name}"`);
    } else {
      setStockInputs((prev) => ({
        ...prev,
        [prod.id]: {
          qty: newQty === null ? 10 : newQty,
          mode,
          saving: false,
          saved: false,
          error: res.error || 'Failed to update status',
        },
      }));
      showToast(res.error || 'Database update failed', 'error');
    }
  };

  // Badge updates
  const handleToggleBadge = async (
    prod: Product,
    badgeKey: 'isNewDrop' | 'isBestseller'
  ) => {
    const effective = getEffectiveProduct(prod);
    const newValue = !effective[badgeKey];
    const updates = { [badgeKey]: newValue };

    updateProductBadges(prod.id, updates);

    setDbProducts((prev) =>
      prev
        ? prev.map((p) =>
            p.id === prod.id || p.slug === prod.slug ? { ...p, ...updates } : p
          )
        : null
    );

    const res = await updateProductBadgesAction(prod.id, updates);
    if (!res.success) {
      showToast('Could not persist badge to database', 'error');
    }
  };

  // Inline Price Editing
  const handleStartEditPrice = (prod: Product) => {
    const effective = getEffectiveProduct(prod);
    setEditingPriceId(prod.id);
    const effBase =
      effective.originalPrice && effective.originalPrice > effective.price
        ? effective.originalPrice
        : effective.price;
    setBasePriceInput(effBase);
    if (effective.discount !== null && effective.discount !== undefined) {
      setDiscountInput(effective.discount);
      setDiscountTypeInput((effective.discountType as any) === 'flat' ? 'flat' : 'percent');
    } else if (effective.originalPrice && effective.originalPrice > effective.price) {
      const existingPct = Math.round(
        ((effective.originalPrice - effective.price) / effective.originalPrice) * 100
      );
      setDiscountInput(existingPct);
      setDiscountTypeInput('percent');
    } else {
      setDiscountInput('');
      setDiscountTypeInput('percent');
    }
  };

  const handleSavePrice = async (prod: Product) => {
    setSavingPriceId(prod.id);
    const numBase = Number(basePriceInput);
    const numDiscount =
      discountInput !== '' && !isNaN(Number(discountInput)) ? Number(discountInput) : 0;
    const finalPricing = calculateSellingPrice(numBase, numDiscount, discountTypeInput);

    const newSellingPrice = finalPricing.sellingPrice;
    const newComparePrice =
      finalPricing.comparePrice > finalPricing.sellingPrice
        ? finalPricing.comparePrice
        : undefined;
    const newDiscount = numDiscount > 0 ? numDiscount : null;
    const newDiscountType = numDiscount > 0 ? discountTypeInput : null;

    updateProductPrice(prod.id, newSellingPrice, newComparePrice, newDiscount, newDiscountType);

    setDbProducts((prev) =>
      prev
        ? prev.map((p) =>
            p.id === prod.id || p.slug === prod.slug
              ? {
                  ...p,
                  price: newSellingPrice,
                  originalPrice: newComparePrice,
                  discount: newDiscount,
                  discountType: newDiscountType,
                }
              : p
          )
        : null
    );

    const res = await updateProductPriceAction(
      prod.id,
      newSellingPrice,
      newComparePrice,
      newDiscount,
      newDiscountType
    );
    setSavingPriceId(null);
    setEditingPriceId(null);

    if (res.success) {
      setSavedSuccessId(prod.id);
      setTimeout(() => setSavedSuccessId(null), 1500);
      showToast(`Price updated for "${prod.name}"`);
    } else {
      showToast('Could not persist price change to database', 'error');
    }
  };

  // Permanent Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteModalProduct) return;
    setIsDeleting(true);

    const targetId = deleteModalProduct.id;
    const targetSlug = deleteModalProduct.slug;
    const targetName = deleteModalProduct.name;

    try {
      const res = await deleteProductAction(targetId);

      deleteProduct(targetId);
      if (targetSlug) deleteProduct(targetSlug);

      setDbProducts((prev) =>
        prev ? prev.filter((p) => p.id !== targetId && p.slug !== targetSlug) : null
      );

      setIsDeleting(false);
      setDeleteModalProduct(null);

      if (res.success) {
        showToast(`"${targetName}" permanently removed from catalogue and database.`);
      } else {
        showToast(res.error || 'Failed to delete piece from database.', 'error');
      }
    } catch (err: any) {
      console.error('[handleConfirmDelete] Error deleting piece:', err);
      setIsDeleting(false);
      showToast(err?.message || 'Error occurred during deletion.', 'error');
    }
  };

  // Filter products across active collection
  const filteredProducts = activeProducts.filter((prod) => {
    const cleanSearch = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !cleanSearch ||
      prod.name.toLowerCase().includes(cleanSearch) ||
      prod.slug.toLowerCase().includes(cleanSearch) ||
      prod.categoryLabel.toLowerCase().includes(cleanSearch);

    const matchesCategory =
      selectedCategory === 'all' || prod.category === selectedCategory;

    const effective = getEffectiveProduct(prod);
    const isHidden =
      effective.isHidden !== undefined ? effective.isHidden : Boolean(prod.isHidden);

    const matchesVisibility =
      visibilityFilter === 'all'
        ? true
        : visibilityFilter === 'visible'
        ? !isHidden
        : isHidden;

    return matchesSearch && matchesCategory && matchesVisibility;
  });

  // Metrics
  const totalItems = activeProducts.length;
  const visibleCount = activeProducts.filter((p) => {
    const eff = getEffectiveProduct(p);
    return eff.isHidden !== undefined ? !eff.isHidden : !p.isHidden;
  }).length;
  const hiddenCount = activeProducts.filter((p) => {
    const eff = getEffectiveProduct(p);
    return eff.isHidden !== undefined ? eff.isHidden : Boolean(p.isHidden);
  }).length;
  const inStockCount = activeProducts.filter((p) => {
    const s = stockInputs[p.id] || getStockState(p);
    return s.mode === 'unlimited' || s.qty > 2;
  }).length;
  const lowStockCount = activeProducts.filter((p) => {
    const s = stockInputs[p.id] || getStockState(p);
    return s.mode === 'tracked' && s.qty > 0 && s.qty <= 2;
  }).length;
  const soldOutCount = activeProducts.filter((p) => {
    const s = stockInputs[p.id] || getStockState(p);
    return s.mode === 'tracked' && s.qty === 0;
  }).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xs border shadow-2xl flex items-center space-x-3 text-xs font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-red-950/95 border-red-500/50 text-red-200'
              : 'bg-[#1C1C1C] border-gold/40 text-paper'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header & Stock Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Inventory & Catalogue Controls
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage real-time inventory quantities, stock status, seasonal prices, badge ribbons, and catalogue deletions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/inventory/new"
            className="px-4 py-2 bg-gold hover:bg-gold-light text-ink font-bold rounded-xs transition-colors flex items-center space-x-2 text-xs shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Stock & Visibility Summary Cards */}
      <InventoryMetricsHeader
        totalItems={totalItems}
        visibleCount={visibleCount}
        hiddenCount={hiddenCount}
        inStockCount={inStockCount}
        lowStockCount={lowStockCount}
        soldOutCount={soldOutCount}
        visibilityFilter={visibilityFilter}
        onSelectVisibilityFilter={setVisibilityFilter}
      />

      {/* Search & Category Filter */}
      <InventoryFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        visibilityFilter={visibilityFilter}
        onVisibilityChange={setVisibilityFilter}
        activeProducts={activeProducts}
        visibleCount={visibleCount}
        hiddenCount={hiddenCount}
      />

      {/* Products List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-paper/60 px-1">
          <div className="flex items-center space-x-2">
            <span>
              {isLoading ? 'Synchronizing catalogue...' : `Showing ${filteredProducts.length} items`}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-xs bg-gold/10 text-gold-light border border-gold/20 font-medium">
              Sorted by added date (newest first)
            </span>
          </div>
          <span className="text-[11px] hidden sm:inline">
            100% Still-Life photography on warm stone plinths
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-[#171717] border border-white/10 rounded-xs">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
            <p className="text-xs text-paper/50">Fetching inventory from database...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-[#171717] border border-white/10 rounded-xs space-y-2">
            <Package className="w-8 h-8 text-paper/30 mx-auto" />
            <p className="text-sm text-paper/70 font-medium">No products match your search or filter</p>
            <p className="text-xs text-paper/40">Try clearing the search query or switching categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((prod) => {
              const effective = getEffectiveProduct(prod);
              const isProductHidden =
                effective.isHidden !== undefined ? effective.isHidden : Boolean(prod.isHidden);
              const isEditingPrice = editingPriceId === prod.id;
              const isSavingPrice = savingPriceId === prod.id;
              const isSavedPrice = savedSuccessId === prod.id;
              const stockState = stockInputs[prod.id] || getStockState(prod);

              const isCustomPiece =
                customProducts.some((cp) => cp.id === prod.id || cp.slug === prod.slug) ||
                (dbProducts &&
                  !CATEGORIES.some((c) => c.slug === prod.category && prod.id.length < 15));

              return (
                <InventoryProductCard
                  key={prod.id}
                  product={prod}
                  effectiveProduct={effective}
                  isCustomPiece={Boolean(isCustomPiece)}
                  isProductHidden={isProductHidden}
                  onToggleVisibility={handleToggleVisibility}
                  isTogglingVisibility={togglingVisibilityId === prod.id}
                  onToggleBadge={handleToggleBadge}
                  isEditingPrice={isEditingPrice}
                  onStartEditPrice={handleStartEditPrice}
                  onCancelEditPrice={() => setEditingPriceId(null)}
                  basePriceInput={basePriceInput}
                  onBasePriceChange={setBasePriceInput}
                  discountInput={discountInput}
                  onDiscountChange={setDiscountInput}
                  discountTypeInput={discountTypeInput}
                  onDiscountTypeToggle={() =>
                    setDiscountTypeInput((prev) => (prev === 'percent' ? 'flat' : 'percent'))
                  }
                  onSavePrice={handleSavePrice}
                  isSavingPrice={isSavingPrice}
                  isSavedPrice={isSavedPrice}
                  stockState={stockState}
                  onStockModeChange={handleStockModeChange}
                  onStockQtyChange={handleStockQtyChange}
                  onQuickPreset={handleQuickPreset}
                  onSaveStock={handleSaveStock}
                  onOpenDeleteModal={setDeleteModalProduct}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Luxury Deletion Confirmation Modal */}
      <ProductDeleteModal
        product={deleteModalProduct}
        isOpen={Boolean(deleteModalProduct)}
        onClose={() => setDeleteModalProduct(null)}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
