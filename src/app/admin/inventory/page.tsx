'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES } from '@/data/catalogue';
import { Product, ProductCategory } from '@/types';
import { useInventory } from '@/context/InventoryContext';
import {
  getAllProducts,
  deleteProductAction,
  updateStockAction,
  updateProductBadgesAction,
  updateProductPriceAction,
} from '@/app/actions/productActions';
import {
  Search,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Save,
  Plus,
  Trash2,
  Package,
  Infinity,
  Loader2,
  AlertCircle,
  X,
  ShieldAlert,
} from 'lucide-react';

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
    isNewDrop: Boolean(p.isNewDrop),
    isGiftPick: Boolean(p.isGiftPick),
    isBestseller: Boolean(p.isBestseller),
    featuredRank: p.featuredRank ?? 999,
    seoKeywords:
      typeof p.seoKeywords === 'string'
        ? p.seoKeywords.split(',')
        : Array.isArray(p.seoKeywords)
        ? p.seoKeywords
        : [],
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
    getEffectiveProduct,
  } = useInventory();

  // Local state for products loaded directly from Neon PostgreSQL
  const [dbProducts, setDbProducts] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Inline Price Editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState<number>(0);
  const [origPriceInput, setOrigPriceInput] = useState<number>(0);
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Stock qty per-product state (productId -> { qty: number, mode: 'unlimited' | 'tracked', saving: boolean, saved: boolean, error: string | null })
  const [stockInputs, setStockInputs] = useState<
    Record<string, { qty: number; mode: 'unlimited' | 'tracked'; saving: boolean; saved: boolean; error: string | null }>
  >({});

  // Deletion Modal state
  const [deleteModalProduct, setDeleteModalProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Global notification toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch real products from PostgreSQL on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchInventory() {
      try {
        setIsLoading(true);
        const serverProducts = await getAllProducts();
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

  // Derive active product list (merging DB products with any local additions, avoiding duplicates)
  const activeProducts: Product[] = React.useMemo(() => {
    if (dbProducts === null) {
      return contextProducts;
    }

    // Start with dbProducts
    const map = new Map<string, Product>();
    dbProducts.forEach((p) => {
      map.set(p.id, p);
      map.set(p.slug, p);
    });

    // Check if any custom product from context is not yet in DB
    const merged = [...dbProducts];
    contextProducts.forEach((cp) => {
      if (!map.has(cp.id) && !map.has(cp.slug)) {
        merged.unshift(cp);
      }
    });

    return merged;
  }, [dbProducts, contextProducts]);

  // Stock state helper
  const getStockState = (prod: Product) => {
    if (stockInputs[prod.id]) return stockInputs[prod.id];
    // Check if product has existing tracked stockQty in DB
    if (prod.stockQty !== null && prod.stockQty !== undefined) {
      return {
        qty: prod.stockQty,
        mode: 'tracked' as const,
        saving: false,
        saved: false,
        error: null,
      };
    }
    // Default: unlimited
    return {
      qty: 10,
      mode: (prod.inStock === false ? 'tracked' : 'unlimited') as 'unlimited' | 'tracked',
      saving: false,
      saved: false,
      error: null,
    };
  };

  const handleStockModeChange = (productId: string, mode: 'unlimited' | 'tracked', defaultQty?: number) => {
    const current = stockInputs[productId] || getStockState({ id: productId } as Product);
    setStockInputs((prev) => ({
      ...prev,
      [productId]: {
        ...current,
        mode,
        qty: defaultQty !== undefined ? defaultQty : (current.qty || 10),
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

  // Save stock directly to Neon PostgreSQL database
  const handleSaveStock = async (prod: Product) => {
    const s = stockInputs[prod.id] || getStockState(prod);
    setStockInputs((prev) => ({
      ...prev,
      [prod.id]: { ...s, saving: true, error: null },
    }));

    const qty = s.mode === 'unlimited' ? null : Math.max(0, s.qty);
    const res = await updateStockAction(prod.id, qty);

    if (res.success) {
      // Update local state in dbProducts
      setDbProducts((prev) =>
        prev
          ? prev.map((p) =>
              p.id === prod.id || p.slug === prod.slug
                ? { ...p, stockQty: qty, inStock: qty === null || qty > 0 }
                : p
            )
          : null
      );

      // Also sync context overrides
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
  const handleQuickPreset = async (prod: Product, target: 'in_stock' | 'low_stock' | 'sold_out') => {
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
      setDbProducts((prev) =>
        prev
          ? prev.map((p) =>
              p.id === prod.id || p.slug === prod.slug
                ? { ...p, stockQty: newQty, inStock: newQty === null || newQty > 0 }
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

  // Badge updates (New Drop / Bestseller)
  const handleToggleBadge = async (
    prod: Product,
    badgeKey: 'isNewDrop' | 'isBestseller'
  ) => {
    const effective = getEffectiveProduct(prod);
    const newValue = !effective[badgeKey];
    const updates = { [badgeKey]: newValue };

    // Update context
    updateProductBadges(prod.id, updates);

    // Update local DB state
    setDbProducts((prev) =>
      prev
        ? prev.map((p) =>
            p.id === prod.id || p.slug === prod.slug ? { ...p, ...updates } : p
          )
        : null
    );

    // Persist to Neon PostgreSQL
    const res = await updateProductBadgesAction(prod.id, updates);
    if (!res.success) {
      showToast('Could not persist badge to database', 'error');
    }
  };

  // Inline Price Editing
  const handleStartEditPrice = (prod: Product) => {
    const effective = getEffectiveProduct(prod);
    setEditingPriceId(prod.id);
    setPriceInput(effective.price);
    setOrigPriceInput(effective.originalPrice || 0);
  };

  const handleSavePrice = async (prod: Product) => {
    setSavingPriceId(prod.id);
    const numPrice = Number(priceInput);
    const numOrig = origPriceInput ? Number(origPriceInput) : undefined;

    updateProductPrice(prod.id, numPrice, numOrig);

    setDbProducts((prev) =>
      prev
        ? prev.map((p) =>
            p.id === prod.id || p.slug === prod.slug
              ? { ...p, price: numPrice, originalPrice: numOrig }
              : p
          )
        : null
    );

    const res = await updateProductPriceAction(prod.id, numPrice, numOrig);
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
      // 1. Delete from database via Server Action
      const res = await deleteProductAction(targetId);

      // 2. Remove from client inventory context & mark as deleted
      deleteProduct(targetId);
      if (targetSlug) deleteProduct(targetSlug);

      // 3. Remove from local dbProducts state
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

    return matchesSearch && matchesCategory;
  });

  // Metrics
  const totalItems = activeProducts.length;
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
          <h1 className="font-serif text-2xl sm:text-3xl text-paper font-normal">
            Inventory & Catalogue Controls
          </h1>
          <p className="text-xs text-paper/60 mt-1">
            Manage real-time inventory quantities, stock status, seasonal prices, badge ribbons, and catalogue deletions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/inventory/new"
            className="px-4 py-2 bg-gold hover:bg-gold-light text-ink font-semibold rounded-xs transition-colors flex items-center space-x-2 text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#171717] border border-white/10 p-4 rounded-xs">
          <span className="text-[10px] uppercase text-paper/50 block font-medium">Total Designs</span>
          <span className="text-2xl font-serif text-paper font-semibold mt-0.5 block">{totalItems}</span>
          <span className="text-[10px] text-paper/40">Active catalog</span>
        </div>

        <div className="bg-[#171717] border border-emerald-600/30 p-4 rounded-xs">
          <span className="text-[10px] uppercase text-emerald-400 block font-medium">In Stock</span>
          <span className="text-2xl font-serif text-emerald-300 font-semibold mt-0.5 block">{inStockCount}</span>
          <span className="text-[10px] text-emerald-200/50">Ready for dispatch</span>
        </div>

        <div className="bg-[#171717] border border-amber-600/30 p-4 rounded-xs">
          <span className="text-[10px] uppercase text-amber-400 block font-medium">Low Stock Warning</span>
          <span className="text-2xl font-serif text-amber-300 font-semibold mt-0.5 block">{lowStockCount}</span>
          <span className="text-[10px] text-amber-200/50">Under 3 pieces left</span>
        </div>

        <div className="bg-[#171717] border border-red-600/30 p-4 rounded-xs">
          <span className="text-[10px] uppercase text-red-400 block font-medium">Sold Out</span>
          <span className="text-2xl font-serif text-red-300 font-semibold mt-0.5 block">{soldOutCount}</span>
          <span className="text-[10px] text-red-200/50">Purchases paused</span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-[#171717] border border-white/10 p-5 rounded-xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-paper/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search designs by title, category, or slug..."
            className="w-full h-11 pl-10 pr-4 bg-[#222222] border border-white/10 rounded-xs text-xs text-paper placeholder:text-paper/40 focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xs text-[11px] transition-colors ${
              selectedCategory === 'all'
                ? 'bg-gold text-ink font-semibold'
                : 'bg-[#222222] text-paper/70 hover:text-paper'
            }`}
          >
            All Categories ({activeProducts.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = activeProducts.filter((p) => p.category === cat.slug).length;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-xs text-[11px] transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-gold text-ink font-semibold'
                    : 'bg-[#222222] text-paper/70 hover:text-paper'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-paper/60 px-1">
          <span>
            {isLoading ? 'Synchronizing catalogue...' : `Showing ${filteredProducts.length} items`}
          </span>
          <span className="text-[11px]">100% Still-Life photography on warm stone plinths</span>
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
              const isEditingPrice = editingPriceId === prod.id;
              const isSavingPrice = savingPriceId === prod.id;
              const isSavedPrice = savedSuccessId === prod.id;
              const stockState = stockInputs[prod.id] || getStockState(prod);

              const isCustomPiece =
                customProducts.some((cp) => cp.id === prod.id || cp.slug === prod.slug) ||
                (dbProducts && !CATEGORIES.some((c) => c.slug === prod.category && prod.id.length < 15));

              // Compute stock status badge
              let stockBadge = (
                <span className="text-[10px] px-2 py-0.5 rounded-xs bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                  In Stock (Unlimited)
                </span>
              );
              if (stockState.mode === 'tracked') {
                if (stockState.qty === 0) {
                  stockBadge = (
                    <span className="text-[10px] px-2 py-0.5 rounded-xs bg-red-950/60 text-red-300 border border-red-800/40">
                      Sold Out (0 pcs)
                    </span>
                  );
                } else if (stockState.qty <= 2) {
                  stockBadge = (
                    <span className="text-[10px] px-2 py-0.5 rounded-xs bg-amber-950/60 text-amber-300 border border-amber-800/40">
                      Low Stock ({stockState.qty} left)
                    </span>
                  );
                } else {
                  stockBadge = (
                    <span className="text-[10px] px-2 py-0.5 rounded-xs bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                      In Stock ({stockState.qty} pcs)
                    </span>
                  );
                }
              }

              return (
                <div
                  key={prod.id}
                  className="bg-[#171717] border border-white/10 hover:border-gold/30 transition-colors p-4 sm:p-5 rounded-xs flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5"
                >
                  {/* Left: Thumbnail & Name */}
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className="relative w-16 h-20 bg-stone rounded-xs overflow-hidden shrink-0 border border-white/10">
                      {prod.featuredImage?.startsWith('data:') ? (
                        /* Safe render for uploaded preview data URIs */
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={prod.featuredImage}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={prod.featuredImage || '/hero-jewel.png'}
                          alt={prod.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[10px] uppercase font-semibold text-gold tracking-wider block">
                          {prod.categoryLabel}
                        </span>
                        {isCustomPiece && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-gold/15 text-gold-light border border-gold/30 rounded-xs uppercase font-semibold">
                            Custom Piece
                          </span>
                        )}
                        {stockBadge}
                      </div>

                      <h3 className="font-serif text-base text-paper font-medium truncate block max-w-md">
                        {prod.name}
                      </h3>

                      {/* Pricing with inline editor */}
                      <div className="flex items-center space-x-3 text-xs flex-wrap gap-y-1">
                        {isEditingPrice ? (
                          <div className="flex items-center space-x-2 bg-[#222222] p-1 rounded-xs border border-gold/40">
                            <span className="text-paper/60 text-[11px]">৳</span>
                            <input
                              type="number"
                              value={priceInput}
                              onChange={(e) => setPriceInput(Number(e.target.value))}
                              className="w-20 bg-[#171717] border border-white/20 text-paper text-xs px-1.5 py-0.5 rounded-xs focus:outline-none focus:border-gold"
                            />
                            <span className="text-paper/40 text-[10px]">Orig:</span>
                            <input
                              type="number"
                              value={origPriceInput}
                              onChange={(e) => setOrigPriceInput(Number(e.target.value))}
                              placeholder="Optional"
                              className="w-20 bg-[#171717] border border-white/20 text-paper/70 text-xs px-1.5 py-0.5 rounded-xs focus:outline-none focus:border-gold"
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePrice(prod)}
                              disabled={isSavingPrice}
                              className="px-2 py-0.5 bg-gold text-ink text-[11px] font-semibold rounded-xs hover:bg-gold-light transition-colors"
                            >
                              {isSavingPrice ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPriceId(null)}
                              className="text-paper/40 hover:text-paper text-[11px] px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-paper tabular-nums">
                              ৳{effective.price.toLocaleString('en-US')}
                            </span>
                            {effective.originalPrice && (
                              <span className="text-[11px] text-paper/40 line-through tabular-nums">
                                ৳{effective.originalPrice.toLocaleString('en-US')}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleStartEditPrice(prod)}
                              className="text-[10px] text-paper/40 hover:text-gold transition-colors underline underline-offset-2 ml-1"
                            >
                              {isSavedPrice ? '✓ Saved' : 'Edit Price'}
                            </button>
                          </div>
                        )}

                        <span className="text-white/20">•</span>

                        <Link
                          href={`/${prod.category}/${prod.slug}`}
                          target="_blank"
                          className="text-[11px] text-gold-light/60 hover:text-gold hover:underline flex items-center gap-1"
                        >
                          <span>View PDP</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Edit & Ribbon Badges */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs w-full xl:w-auto">
                    <Link
                      href={`/admin/inventory/edit/${prod.id}`}
                      className="px-2.5 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 text-paper/70 hover:text-gold rounded-xs text-[11px] transition-colors flex items-center space-x-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </Link>

                    {/* Ribbon Badges Toggles */}
                    <div className="flex items-center space-x-1 bg-[#222222] p-1 rounded-xs border border-white/10">
                      <button
                        type="button"
                        onClick={() => handleToggleBadge(prod, 'isNewDrop')}
                        className={`px-2 py-1 rounded-xs text-[10px] uppercase font-semibold transition-colors ${
                          effective.isNewDrop
                            ? 'bg-gold text-ink border border-gold/40'
                            : 'text-paper/40 hover:text-paper'
                        }`}
                      >
                        {effective.isNewDrop ? '✓ New Drop' : '+ New Drop'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleBadge(prod, 'isBestseller')}
                        className={`px-2 py-1 rounded-xs text-[10px] uppercase font-semibold transition-colors ${
                          effective.isBestseller
                            ? 'bg-gold text-ink font-bold'
                            : 'text-paper/40 hover:text-paper'
                        }`}
                      >
                        {effective.isBestseller ? '✓ Bestseller' : '+ Bestseller'}
                      </button>
                    </div>
                  </div>

                  {/* Right: Unified Stock Controls Suite (for EVERY product) */}
                  <div className="flex flex-col sm:flex-row xl:flex-col gap-2 shrink-0 w-full xl:w-64 bg-[#1C1C1C] border border-white/10 rounded-xs p-3 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center space-x-1.5">
                        <Package className="w-3.5 h-3.5 text-gold" />
                        <span className="text-paper/70 uppercase tracking-wider font-semibold">
                          Inventory Stock
                        </span>
                      </div>
                      {stockState.saved && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Saved!
                        </span>
                      )}
                    </div>

                    {/* Mode Switcher */}
                    <div className="grid grid-cols-2 gap-1 bg-[#141414] p-0.5 rounded-xs border border-white/10 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleStockModeChange(prod.id, 'unlimited')}
                        className={`py-1 rounded-xs flex items-center justify-center space-x-1 transition-colors ${
                          stockState.mode === 'unlimited'
                            ? 'bg-gold text-ink font-semibold'
                            : 'text-paper/60 hover:text-paper'
                        }`}
                      >
                        <Infinity className="w-3 h-3" />
                        <span>Unlimited</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStockModeChange(prod.id, 'tracked')}
                        className={`py-1 rounded-xs font-medium transition-colors ${
                          stockState.mode === 'tracked'
                            ? 'bg-gold text-ink font-semibold'
                            : 'text-paper/60 hover:text-paper'
                        }`}
                      >
                        Track Count
                      </button>
                    </div>

                    {/* Tracked numeric input */}
                    {stockState.mode === 'tracked' && (
                      <div className="flex items-center justify-between bg-[#141414] border border-white/10 p-1 rounded-xs">
                        <span className="text-[10px] text-paper/50 pl-1 font-mono">Qty:</span>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleStockQtyChange(prod.id, Math.max(0, stockState.qty - 1))
                            }
                            className="w-6 h-6 bg-[#222222] border border-white/10 rounded-xs text-paper/70 hover:text-paper flex items-center justify-center text-sm leading-none transition-colors"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={stockState.qty}
                            onChange={(e) =>
                              handleStockQtyChange(prod.id, Math.max(0, Number(e.target.value)))
                            }
                            className="w-14 bg-[#1C1C1C] border border-white/15 focus:border-gold px-1 py-0.5 text-paper rounded-xs text-xs font-mono text-center focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleStockQtyChange(prod.id, stockState.qty + 1)}
                            className="w-6 h-6 bg-[#222222] border border-white/10 rounded-xs text-paper/70 hover:text-paper flex items-center justify-center text-sm leading-none transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick 1-Click Status Presets */}
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleQuickPreset(prod, 'in_stock')}
                        className="py-1 px-1 bg-[#141414] hover:bg-emerald-950/40 hover:border-emerald-600/40 border border-white/5 rounded-xs text-[9px] text-paper/60 hover:text-emerald-300 transition-colors text-center font-medium"
                        title="Set as Unlimited In Stock"
                      >
                        In Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPreset(prod, 'low_stock')}
                        className="py-1 px-1 bg-[#141414] hover:bg-amber-950/40 hover:border-amber-600/40 border border-white/5 rounded-xs text-[9px] text-paper/60 hover:text-amber-300 transition-colors text-center font-medium"
                        title="Set count to 2 pieces"
                      >
                        Low (2)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPreset(prod, 'sold_out')}
                        className="py-1 px-1 bg-[#141414] hover:bg-red-950/40 hover:border-red-600/40 border border-white/5 rounded-xs text-[9px] text-paper/60 hover:text-red-300 transition-colors text-center font-medium"
                        title="Set count to 0 (Pause purchases)"
                      >
                        Sold Out
                      </button>
                    </div>

                    {/* Save Stock button */}
                    <button
                      type="button"
                      onClick={() => handleSaveStock(prod)}
                      disabled={stockState.saving}
                      className="w-full py-1.5 px-3 bg-[#262626] hover:bg-gold hover:text-ink border border-white/10 hover:border-gold text-paper/80 font-medium rounded-xs text-[11px] transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      {stockState.saving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : stockState.saved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Stock Saved</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Stock</span>
                        </>
                      )}
                    </button>

                    {/* Delete button (Unified for ALL products) */}
                    <button
                      type="button"
                      onClick={() => setDeleteModalProduct(prod)}
                      className="w-full flex items-center justify-center space-x-1.5 py-1 px-2 bg-transparent hover:bg-red-950/30 border border-transparent hover:border-red-600/30 text-paper/40 hover:text-red-400 rounded-xs transition-colors text-[10px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Product</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Luxury In-App Confirmation Modal for Product Deletion */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#171717] border border-white/15 max-w-md w-full p-6 rounded-xs shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2.5 text-red-400">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <h3 className="font-serif text-lg text-paper font-medium">Delete Product</h3>
              </div>
              <button
                type="button"
                onClick={() => !isDeleting && setDeleteModalProduct(null)}
                className="text-paper/40 hover:text-paper transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Summary Preview */}
            <div className="flex items-center space-x-3.5 bg-[#1F1F1F] p-3 rounded-xs border border-white/10">
              <div className="relative w-12 h-14 bg-stone rounded-xs overflow-hidden shrink-0">
                {deleteModalProduct.featuredImage?.startsWith('data:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={deleteModalProduct.featuredImage}
                    alt={deleteModalProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={deleteModalProduct.featuredImage || '/hero-jewel.png'}
                    alt={deleteModalProduct.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <span className="text-[10px] uppercase font-semibold text-gold tracking-wider block">
                  {deleteModalProduct.categoryLabel}
                </span>
                <p className="text-xs text-paper font-serif font-medium truncate">
                  {deleteModalProduct.name}
                </p>
                <p className="text-[11px] text-paper/60 font-mono">
                  ৳{deleteModalProduct.price.toLocaleString('en-US')}
                </p>
              </div>
            </div>

            <p className="text-xs text-paper/70 leading-relaxed">
              Are you sure you want to permanently remove this piece from the Adorous catalogue and live storefront?
            </p>

            <div className="bg-red-950/20 border border-red-800/30 p-2.5 rounded-xs text-[11px] text-red-300/80 leading-normal">
              Warning: This action will permanently purge this design from the PostgreSQL database, including all associated gallery photos and finish colorways.
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalProduct(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 text-paper/70 hover:text-paper text-xs rounded-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-medium text-xs rounded-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting piece...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
