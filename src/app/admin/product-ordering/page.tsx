'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInventory } from '@/context/InventoryContext';
import { useProductOrdering, AdminSortOrder } from '@/context/ProductOrderingContext';
import { useLandingPages } from '@/context/LandingPagesContext';
import { useOrders } from '@/context/OrdersContext';
import { useReviews, isReviewForProduct } from '@/context/ReviewsContext';
import { Product } from '@/types';
import { CATEGORIES } from '@/data/catalogue';
import { formatPrice } from '@/lib/formatPrice';
import CategoryHeroSelector from '@/components/admin/CategoryHeroSelector';
import {
  GripVertical,
  ArrowUpDown,
  Check,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Layers,
  FileText,
  Star,
  ShoppingCart,
  CheckCircle2,
  Info,
  Loader2,
} from 'lucide-react';

interface StandardPageTab {
  id: string;
  name: string;
  pageKey: string;
  viewUrl: string;
  categoryFilter?: string;
}

const STANDARD_PAGES: StandardPageTab[] = [
  { id: 'shop-all', name: 'Explore All (Shop)', pageKey: 'shop-all', viewUrl: '/shop' },
  { id: 'jewelry', name: 'Jewelry Sets', pageKey: 'category-jewelry', viewUrl: '/jewelry', categoryFilter: 'jewelry' },
  { id: 'bags', name: "Ladies' Bags", pageKey: 'category-bags', viewUrl: '/bags', categoryFilter: 'bags' },
  { id: 'churi', name: 'Churi (Bangles)', pageKey: 'category-churi', viewUrl: '/churi', categoryFilter: 'churi' },
  { id: 'earrings', name: 'Earrings', pageKey: 'category-earrings', viewUrl: '/earrings', categoryFilter: 'earrings' },
  { id: 'more', name: 'More / Lifestyle', pageKey: 'category-more', viewUrl: '/more', categoryFilter: 'more' },
];

export default function AdminProductOrderingPage() {
  const { allProducts, getEffectiveProduct } = useInventory();
  const { getOrdering, setOrdering } = useProductOrdering();
  const { pages: landingPages, updatePage } = useLandingPages();
  const { orders } = useOrders();
  const { reviews } = useReviews();

  // Active tab: standard page ID or 'landing-pages'
  const [activeTab, setActiveTab] = useState<string>('shop-all');
  // If in landing pages tab, which landing page is selected
  const [selectedLandingPageId, setSelectedLandingPageId] = useState<string>('');

  // Working state for the active page
  const [currentSortMethod, setCurrentSortMethod] = useState<AdminSortOrder>('manual');
  const [orderedProductIds, setOrderedProductIds] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Set default selected landing page when landing pages are loaded
  useEffect(() => {
    if (landingPages.length > 0 && !selectedLandingPageId) {
      setSelectedLandingPageId(landingPages[0].id);
    }
  }, [landingPages, selectedLandingPageId]);

  // Order stats: purchase counts
  const purchaseCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((order) => {
      if (order.status === 'cancelled') return;
      order.items.forEach((item) => {
        const pid = item.product.id;
        counts.set(pid, (counts.get(pid) || 0) + item.quantity);
      });
    });
    return counts;
  }, [orders]);

  // Reviews stats: average ratings
  const avgRatingMap = useMemo(() => {
    const ratings = new Map<string, { avg: number; count: number }>();
    allProducts.forEach((p) => {
      const productReviews = reviews.filter((r) => isReviewForProduct(r, p) && r.status === 'approved');
      if (productReviews.length > 0) {
        const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
        ratings.set(p.id, { avg: sum / productReviews.length, count: productReviews.length });
      } else {
        ratings.set(p.id, { avg: 0, count: 0 });
      }
    });
    return ratings;
  }, [allProducts, reviews]);

  // Identify current selected landing page if applicable
  const activeLandingPage = useMemo(() => {
    return landingPages.find((p) => p.id === selectedLandingPageId) || null;
  }, [landingPages, selectedLandingPageId]);

  // Identify the pool of base products for the currently active tab
  const baseProductsForTab: Product[] = useMemo(() => {
    if (activeTab === 'landing-pages') {
      if (!activeLandingPage) return [];
      return activeLandingPage.productIds
        .map((id) => allProducts.find((p) => p.id === id || p.slug === id))
        .filter((p): p is Product => p !== undefined)
        .map(getEffectiveProduct);
    }

    const standardPage = STANDARD_PAGES.find((s) => s.id === activeTab);
    if (!standardPage) return [];

    if (standardPage.id === 'shop-all') {
      return allProducts.map(getEffectiveProduct);
    }

    return allProducts
      .filter((p) => {
        if (standardPage.categoryFilter === 'more') {
          return p.category === 'more' || p.category === 'umbrellas';
        }
        return p.category === standardPage.categoryFilter;
      })
      .map(getEffectiveProduct);
  }, [activeTab, activeLandingPage, allProducts, getEffectiveProduct]);

  // Helper to compute automated sorting
  const computeAutomatedSort = useCallback(
    (products: Product[], method: AdminSortOrder): string[] => {
      const list = [...products];
      switch (method) {
        case 'most-purchased':
          list.sort((a, b) => (purchaseCountMap.get(b.id) || 0) - (purchaseCountMap.get(a.id) || 0));
          break;
        case 'newest':
          list.sort((a, b) => {
            if (a.isNewDrop && !b.isNewDrop) return -1;
            if (!a.isNewDrop && b.isNewDrop) return 1;
            return a.featuredRank - b.featuredRank;
          });
          break;
        case 'oldest':
          list.sort((a, b) => {
            if (a.isNewDrop && !b.isNewDrop) return 1;
            if (!a.isNewDrop && b.isNewDrop) return -1;
            return b.featuredRank - a.featuredRank;
          });
          break;
        case 'best-rating':
          list.sort((a, b) => {
            const rA = avgRatingMap.get(a.id)?.avg || 0;
            const rB = avgRatingMap.get(b.id)?.avg || 0;
            return rB - rA;
          });
          break;
        case 'manual':
        default:
          list.sort((a, b) => a.featuredRank - b.featuredRank);
          break;
      }
      return list.map((p) => p.id);
    },
    [purchaseCountMap, avgRatingMap]
  );

  // Load state when active tab or selected landing page changes
  useEffect(() => {
    if (activeTab === 'landing-pages') {
      if (activeLandingPage) {
        const method = (activeLandingPage.sortOrder as AdminSortOrder) || 'manual';
        setCurrentSortMethod(method);
        if (method === 'manual') {
          setOrderedProductIds(activeLandingPage.productIds);
        } else {
          setOrderedProductIds(computeAutomatedSort(baseProductsForTab, method));
        }
      }
    } else {
      const standardPage = STANDARD_PAGES.find((s) => s.id === activeTab);
      if (standardPage) {
        const saved = getOrdering(standardPage.pageKey);
        setCurrentSortMethod(saved.sortOrder);
        if (saved.sortOrder === 'manual' && saved.manualOrder && saved.manualOrder.length > 0) {
          // Reconcile saved manual order with current base products
          const existingIds = new Set(baseProductsForTab.map((p) => p.id));
          const ordered = saved.manualOrder.filter((id) => existingIds.has(id));
          const missing = baseProductsForTab.filter((p) => !saved.manualOrder.includes(p.id)).map((p) => p.id);
          setOrderedProductIds([...ordered, ...missing]);
        } else if (saved.sortOrder === 'manual') {
          // Default manual to natural rank
          const defaultList = [...baseProductsForTab].sort((a, b) => a.featuredRank - b.featuredRank);
          setOrderedProductIds(defaultList.map((p) => p.id));
        } else {
          setOrderedProductIds(computeAutomatedSort(baseProductsForTab, saved.sortOrder));
        }
      }
    }
    setHasUnsavedChanges(false);
  }, [activeTab, selectedLandingPageId, activeLandingPage, baseProductsForTab, getOrdering, computeAutomatedSort]);

  // Handle Sort Method Change
  const handleSortMethodChange = (newMethod: AdminSortOrder) => {
    setCurrentSortMethod(newMethod);
    setHasUnsavedChanges(true);

    if (newMethod !== 'manual') {
      const sortedIds = computeAutomatedSort(baseProductsForTab, newMethod);
      setOrderedProductIds(sortedIds);
    }
  };

  // Reorder items via drag or manual shift
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= orderedProductIds.length || toIndex >= orderedProductIds.length) {
      return;
    }
    const updated = [...orderedProductIds];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setOrderedProductIds(updated);
    setCurrentSortMethod('manual');
    setHasUnsavedChanges(true);
  };

  // Drag and drop event handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      moveItem(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'landing-pages') {
        if (activeLandingPage) {
          updatePage(activeLandingPage.id, {
            sortOrder: currentSortMethod,
            productIds: orderedProductIds,
          });
          setSaveSuccessMessage(`Order saved for collection: ${activeLandingPage.title}`);
        }
      } else {
        const standardPage = STANDARD_PAGES.find((s) => s.id === activeTab);
        if (standardPage) {
          await setOrdering(standardPage.pageKey, {
            sortOrder: currentSortMethod,
            manualOrder: orderedProductIds,
          });
          setSaveSuccessMessage(`Order saved to database for ${standardPage.name}! Live across all devices.`);
        }
      }
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to save ordering:', err);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 4000);
    }
  };

  // Reset to default rank
  const handleResetToDefault = () => {
    const defaultIds = [...baseProductsForTab]
      .sort((a, b) => a.featuredRank - b.featuredRank)
      .map((p) => p.id);
    setOrderedProductIds(defaultIds);
    setCurrentSortMethod('manual');
    setHasUnsavedChanges(true);
  };

  // Resolve products in current ordered list
  const displayProducts = useMemo(() => {
    const productMap = new Map(baseProductsForTab.map((p) => [p.id, p]));
    return orderedProductIds
      .map((id) => productMap.get(id))
      .filter((p): p is Product => p !== undefined);
  }, [baseProductsForTab, orderedProductIds]);

  const activeStandardPage = STANDARD_PAGES.find((s) => s.id === activeTab);
  const liveUrl = activeTab === 'landing-pages'
    ? activeLandingPage ? `/collections/${activeLandingPage.slug}` : '#'
    : activeStandardPage?.viewUrl || '/shop';

  return (
    <div className="space-y-6">
      {/* Top Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gold/20 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif text-2xl sm:text-3xl text-gold font-semibold tracking-wide">
              Product Display Ordering
            </h1>
            <span className="bg-gold/20 text-gold-light text-[10px] uppercase font-semibold px-2 py-0.5 rounded-xs border border-gold/30">
              Shopify Feature
            </span>
          </div>
          <p className="text-xs sm:text-sm text-paper/60 mt-1">
            Control the exact order products appear under <strong className="text-paper">"Featured"</strong> on each storefront category & landing collection.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={liveUrl}
            target="_blank"
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 rounded-xs text-xs text-paper/80 hover:text-paper transition-colors"
          >
            <span>Preview Live Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-gold" />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
              hasUnsavedChanges && !isSaving
                ? 'bg-gold hover:bg-gold-light text-ink cursor-pointer animate-pulse'
                : 'bg-[#222] text-paper/30 cursor-not-allowed border border-white/5'
            }`}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-gold" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
          </button>
        </div>
      </div>

      {/* Success alert message */}
      {saveSuccessMessage && (
        <div className="flex items-center space-x-2 px-4 py-3 bg-emerald-950/40 border border-emerald-600/30 rounded-xs text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{saveSuccessMessage}</span>
        </div>
      )}

      {/* Navigation Page Tabs */}
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none text-xs">
        {STANDARD_PAGES.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xs font-medium transition-all shrink-0 flex items-center space-x-2 ${
                isActive
                  ? 'bg-gold text-ink font-semibold shadow-sm'
                  : 'text-paper/70 hover:text-paper hover:bg-[#1A1A1A] border border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setActiveTab('landing-pages')}
          className={`px-3.5 py-2 rounded-xs font-medium transition-all shrink-0 flex items-center space-x-2 ${
            activeTab === 'landing-pages'
              ? 'bg-gold text-ink font-semibold shadow-sm'
              : 'text-paper/70 hover:text-paper hover:bg-[#1A1A1A] border border-transparent'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Landing Collections ({landingPages.length})</span>
        </button>
      </div>

      {/* Landing Page Sub-selector if landing-pages tab is active */}
      {activeTab === 'landing-pages' && (
        <div className="p-4 bg-[#141414] border border-gold/20 rounded-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-gold">
                Select Landing Page Collection
              </span>
              <p className="text-[11px] text-paper/40">
                Choose which campaign landing page you want to arrange
              </p>
            </div>

            {landingPages.length > 0 ? (
              <select
                value={selectedLandingPageId}
                onChange={(e) => setSelectedLandingPageId(e.target.value)}
                className="px-3 py-2 bg-[#0E0E0E] border border-white/15 rounded-xs text-xs text-paper focus:outline-none focus:border-gold/50 cursor-pointer min-w-[240px]"
              >
                {landingPages.map((lp) => (
                  <option key={lp.id} value={lp.id}>
                    {lp.title} (/collections/{lp.slug}) — {lp.productIds.length} items
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-paper/50">No landing pages found. Create one first in the Landing Pages section.</p>
            )}
          </div>
        </div>
      )}

      {/* Category Hero Cover Photo Selector (Available for Category Pages) */}
      {activeStandardPage?.categoryFilter && (
        <CategoryHeroSelector
          key={activeStandardPage.categoryFilter}
          categorySlug={activeStandardPage.categoryFilter}
          categoryName={activeStandardPage.name}
          categoryProducts={baseProductsForTab}
          viewUrl={activeStandardPage.viewUrl}
        />
      )}

      {/* Control Box: Sort Method Selector & Quick Actions */}
      <div className="p-4 bg-[#141414] border border-white/10 rounded-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-paper/80 uppercase tracking-wider flex items-center space-x-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-gold" />
              <span>Ordering Method for {activeTab === 'landing-pages' ? (activeLandingPage?.title || 'Collection') : activeStandardPage?.name}</span>
            </label>
            <p className="text-[11px] text-paper/40">
              Select whether products sort automatically by sales/rating, or manually in your exact custom sequence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={currentSortMethod}
              onChange={(e) => handleSortMethodChange(e.target.value as AdminSortOrder)}
              className="px-3.5 py-2 bg-[#0E0E0E] border border-gold/40 rounded-xs text-xs text-gold font-medium focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="manual">1. Manually (Drag & Drop Reordering)</option>
              <option value="most-purchased">2. Automatically: Most Purchased First</option>
              <option value="newest">3. Automatically: New to Old (New Drops First)</option>
              <option value="oldest">4. Automatically: Old to New</option>
              <option value="best-rating">5. Automatically: Best Seller by Rating</option>
            </select>

            {currentSortMethod === 'manual' && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#1E1E1E] hover:bg-[#282828] border border-white/10 rounded-xs text-xs text-paper/60 hover:text-paper transition-colors"
                title="Reset to catalogue default featured rank"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            )}
          </div>
        </div>

        {/* Informative Hint Banner */}
        <div className="flex items-start space-x-2 px-3 py-2.5 bg-[#0C0C0C] border border-white/5 rounded-xs text-[11px] text-paper/60">
          <Info className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
          <div>
            {currentSortMethod === 'manual' ? (
              <span>
                <strong className="text-paper">Manual Mode:</strong> Grab the handle (<span className="text-gold font-bold">⠿</span>) on any item to drag and drop it into place, or click the <strong className="text-paper">↑ / ↓</strong> buttons. Whatever sequence you save here is how visitors will see products on the storefront.
              </span>
            ) : currentSortMethod === 'most-purchased' ? (
              <span>
                <strong className="text-paper">Most Purchased:</strong> Items are automatically prioritized by completed order count from highest to lowest. Dragging any row switches back to Manual.
              </span>
            ) : currentSortMethod === 'newest' ? (
              <span>
                <strong className="text-paper">New to Old:</strong> Products flagged as "New Drop" appear at the top, followed by newest catalogue additions.
              </span>
            ) : currentSortMethod === 'oldest' ? (
              <span>
                <strong className="text-paper">Oldest to New:</strong> Heritage pieces and earlier catalogue releases are presented first.
              </span>
            ) : (
              <span>
                <strong className="text-paper">Best Seller by Rating:</strong> Products with the highest verified customer review score (5-star ratings) appear first.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Product Ordering List */}
      <div className="bg-[#141414] border border-white/10 rounded-xs overflow-hidden">
        <div className="px-4 py-3 bg-[#1C1C1C] border-b border-white/10 flex items-center justify-between text-xs text-paper/60">
          <span className="font-medium text-paper">
            Display Sequence ({displayProducts.length} items)
          </span>
          <span className="text-[11px]">
            {currentSortMethod === 'manual' ? 'Drag handle to reorder' : 'Automated display order'}
          </span>
        </div>

        {displayProducts.length === 0 ? (
          <div className="py-16 text-center text-paper/40 text-xs">
            No products found for this section.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {displayProducts.map((product, index) => {
              const purchases = purchaseCountMap.get(product.id) || 0;
              const ratingData = avgRatingMap.get(product.id) || { avg: 0, count: 0 };
              const isDragging = draggedIndex === index;
              const isOver = dragOverIndex === index;

              return (
                <div
                  key={product.id}
                  draggable={true}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-3 sm:p-4 transition-colors select-none ${
                    isDragging
                      ? 'opacity-30 bg-gold/10'
                      : isOver
                      ? 'bg-gold/15 border-t-2 border-gold'
                      : 'hover:bg-[#1A1A1A] bg-[#141414]'
                  }`}
                >
                  {/* Left: Drag Handle, Serial, Thumbnail, Info */}
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    {/* Drag Handle */}
                    <div
                      className="p-1.5 text-paper/30 hover:text-gold cursor-grab active:cursor-grabbing rounded-xs transition-colors shrink-0"
                      title="Drag to change position"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Serial Position Badge */}
                    <div className="w-7 h-7 rounded-xs bg-[#0E0E0E] border border-white/10 flex items-center justify-center text-xs font-mono font-semibold text-gold shrink-0">
                      #{index + 1}
                    </div>

                    {/* Product Image Thumbnail */}
                    <div className="w-12 h-12 rounded-xs overflow-hidden border border-white/10 bg-black shrink-0 relative">
                      <Image
                        src={product.featuredImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>

                    {/* Product Metadata */}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-xs sm:text-sm font-medium text-paper truncate">
                          {product.name}
                        </span>
                        {product.isNewDrop && (
                          <span className="px-1.5 py-0.2 bg-emerald-950/60 text-emerald-300 border border-emerald-600/30 text-[9px] font-semibold uppercase rounded-xs">
                            New Drop
                          </span>
                        )}
                        {product.isHidden && (
                          <span className="px-1.5 py-0.2 bg-amber-950/60 text-amber-300 border border-amber-600/30 text-[9px] font-semibold uppercase rounded-xs">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-paper/40 mt-0.5">
                        <span className="capitalize">{product.categoryLabel || product.category}</span>
                        <span>•</span>
                        <span className="text-paper/70 font-semibold font-mono">৳{formatPrice(product.price)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics & Manual Move Buttons */}
                  <div className="flex items-center space-x-3 sm:space-x-5 shrink-0 pl-2">
                    {/* Metrics Pills (Orders & Rating) */}
                    <div className="hidden md:flex items-center space-x-3 text-[11px]">
                      <div className="flex items-center space-x-1 px-2 py-1 bg-[#0E0E0E] border border-white/5 rounded-xs text-paper/60">
                        <ShoppingCart className="w-3 h-3 text-gold/70" />
                        <span>{purchases} sold</span>
                      </div>

                      <div className="flex items-center space-x-1 px-2 py-1 bg-[#0E0E0E] border border-white/5 rounded-xs text-paper/60">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400/40" />
                        <span>{ratingData.avg > 0 ? ratingData.avg.toFixed(1) : 'No reviews'}</span>
                      </div>
                    </div>

                    {/* Reorder Buttons (Move to Top, Move Up, Move Down, Move to Bottom) */}
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => moveItem(index, 0)}
                        disabled={index === 0}
                        title="Move to Top"
                        className="p-1.5 bg-[#0E0E0E] hover:bg-[#202020] text-paper/50 hover:text-gold disabled:opacity-20 disabled:hover:text-paper/50 disabled:hover:bg-[#0E0E0E] border border-white/5 rounded-xs transition-colors"
                      >
                        <ChevronsUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveItem(index, index - 1)}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1.5 bg-[#0E0E0E] hover:bg-[#202020] text-paper/50 hover:text-gold disabled:opacity-20 disabled:hover:text-paper/50 disabled:hover:bg-[#0E0E0E] border border-white/5 rounded-xs transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveItem(index, index + 1)}
                        disabled={index === displayProducts.length - 1}
                        title="Move Down"
                        className="p-1.5 bg-[#0E0E0E] hover:bg-[#202020] text-paper/50 hover:text-gold disabled:opacity-20 disabled:hover:text-paper/50 disabled:hover:bg-[#0E0E0E] border border-white/5 rounded-xs transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveItem(index, displayProducts.length - 1)}
                        disabled={index === displayProducts.length - 1}
                        title="Move to Bottom"
                        className="p-1.5 bg-[#0E0E0E] hover:bg-[#202020] text-paper/50 hover:text-gold disabled:opacity-20 disabled:hover:text-paper/50 disabled:hover:bg-[#0E0E0E] border border-white/5 rounded-xs transition-colors"
                      >
                        <ChevronsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Save Bar if changes are unsaved */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 bg-[#181818] border border-gold/40 shadow-2xl rounded-xs text-xs">
          <span className="text-paper font-medium">You have unsaved ordering changes.</span>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-gold hover:bg-gold-light text-ink font-semibold uppercase tracking-wider rounded-xs transition-all shadow-sm cursor-pointer"
          >
            Save Now
          </button>
        </div>
      )}
    </div>
  );
}
