'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CATEGORIES, COLOR_FILTER_SWATCHES } from '@/data/catalogue';
import { useInventory } from '@/context/InventoryContext';
import { useOrders } from '@/context/OrdersContext';
import { useReviews } from '@/context/ReviewsContext';
import { useProductOrdering } from '@/context/ProductOrderingContext';
import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import {
  Search,
  ChevronDown,
  X,
  PackageCheck,
  MessageCircle,
} from 'lucide-react';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

interface ShopClientProps {
  initialProducts: Product[];
}

export default function ShopClient({ initialProducts }: ShopClientProps) {
  const { allProducts, getEffectiveProduct } = useInventory();
  const { getOrdering } = useProductOrdering();
  const { orders } = useOrders();
  const { reviews } = useReviews();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [curatedFilter, setCuratedFilter] = useState<'all' | 'new-arrivals' | 'bestsellers'>('all');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterInStock, setFilterInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  useEffect(() => {
    if (filterParam === 'new-arrivals') {
      setCuratedFilter('new-arrivals');
    } else if (filterParam === 'bestsellers') {
      setCuratedFilter('bestsellers');
    } else {
      setCuratedFilter('all');
    }
  }, [filterParam]);

  // Base products: prioritize live InventoryContext if loaded, fallback to server-rendered initialProducts
  const activeProducts = allProducts.length > 0 ? allProducts : initialProducts;

  // Get admin-configured ordering for Shop All
  const adminOrdering = getOrdering('shop-all');

  // Build purchase count map from orders (for admin sort)
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

  // Build average rating map from reviews (for admin sort)
  const avgRatingMap = useMemo(() => {
    const ratings = new Map<string, number>();
    activeProducts.forEach((p) => {
      const productReviews = reviews.filter(
        (r) => r.productId === p.id && r.status === 'approved'
      );
      if (productReviews.length > 0) {
        const avg =
          productReviews.reduce((sum, r) => sum + r.rating, 0) /
          productReviews.length;
        ratings.set(p.id, avg);
      } else {
        ratings.set(p.id, 0);
      }
    });
    return ratings;
  }, [activeProducts, reviews]);

  // Apply admin ordering to get the "featured" base order
  const adminSortedProducts = useMemo(() => {
    const list = [...activeProducts];
    switch (adminOrdering.sortOrder) {
      case 'manual': {
        if (adminOrdering.manualOrder.length > 0) {
          const orderMap = new Map(adminOrdering.manualOrder.map((id, idx) => [id, idx]));
          list.sort((a, b) => {
            const aIdx = orderMap.get(a.id) ?? orderMap.get(a.slug) ?? 9999;
            const bIdx = orderMap.get(b.id) ?? orderMap.get(b.slug) ?? 9999;
            return aIdx - bIdx;
          });
        } else {
          list.sort((a, b) => a.featuredRank - b.featuredRank);
        }
        break;
      }
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
        list.sort((a, b) => (avgRatingMap.get(b.id) || 0) - (avgRatingMap.get(a.id) || 0));
        break;
      default:
        list.sort((a, b) => a.featuredRank - b.featuredRank);
    }
    return list;
  }, [activeProducts, adminOrdering, purchaseCountMap, avgRatingMap]);

  // Filter and sort products (customer sort overrides admin order for price/newest)
  const filteredProducts = useMemo(() => {
    let list = adminSortedProducts.map(getEffectiveProduct).filter((product) => {
      // Curated collection filter (New Arrivals / Best Sellers)
      if (curatedFilter === 'new-arrivals' && !product.isNewDrop) {
        return false;
      }
      if (curatedFilter === 'bestsellers' && !product.isBestseller) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // In stock filter
      if (filterInStock && !product.colorways.some((c) => c.inStock)) {
        return false;
      }

      // Color filter
      if (selectedColor && !product.colorways.some((c) => c.hex.toLowerCase() === selectedColor.toLowerCase())) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesTagline = product.tagline.toLowerCase().includes(q);
        const matchesKeywords = product.seoKeywords.some((k) => k.toLowerCase().includes(q));
        if (!matchesName && !matchesTagline && !matchesKeywords) {
          return false;
        }
      }

      return true;
    });

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.isNewDrop ? 1 : 0) - (a.isNewDrop ? 1 : 0));
    }
    // 'featured' keeps adminSortedProducts order

    return list;
  }, [adminSortedProducts, getEffectiveProduct, curatedFilter, selectedCategory, selectedColor, searchQuery, filterInStock, sortBy]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (curatedFilter !== 'all' ? 1 : 0) +
    (selectedColor ? 1 : 0) +
    (filterInStock ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory('all');
    setCuratedFilter('all');
    setSelectedColor(null);
    setSearchQuery('');
    setFilterInStock(false);
    setSortBy('featured');
  };

  return (
    <div className="bg-paper min-h-screen">
      {/* Editorial Header Banner */}
      <section className="border-b border-line bg-[#F7F5EE] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <nav className="flex items-center space-x-2 text-xs text-text-muted mb-2 tracking-wider uppercase">
                <Link href="/" className="hover:text-ink transition-colors">Home</Link>
                <span>/</span>
                <span className="text-ink font-medium">Explore All</span>
              </nav>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ink tracking-tight font-normal">
                The Full Collection
              </h1>
              <p className="text-xs sm:text-sm text-text-muted max-w-xl">
                Boutique South Asian jewelry, plush velvet bangles, architectural handbags, and curated lifestyle accessories on warm stone plinths.
              </p>
            </div>

            {/* Quick Reassurance */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium text-ink/80 bg-paper/80 border border-line p-2.5 sm:p-3 rounded-xs self-start md:self-auto max-w-full min-w-0">
              <PackageCheck className="w-4 h-4 text-gold-ink shrink-0" />
              <span className="text-[11px] sm:text-xs">Cash on Delivery across all 64 districts of Bangladesh</span>
            </div>
          </div>

          {/* Category & Curated Tabs */}
          <div className="mt-6 sm:mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full min-w-0">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setCuratedFilter('all');
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all rounded-xs shrink-0 ${
                selectedCategory === 'all' && curatedFilter === 'all'
                  ? 'bg-sand text-gold-deep shadow-sm font-semibold'
                  : 'bg-paper border border-line text-ink hover:border-gold'
              }`}
            >
              All Items
            </button>
            <button
              type="button"
              onClick={() => {
                setCuratedFilter(curatedFilter === 'new-arrivals' ? 'all' : 'new-arrivals');
                setSelectedCategory('all');
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all rounded-xs shrink-0 ${
                curatedFilter === 'new-arrivals'
                  ? 'bg-sand text-gold-deep shadow-sm font-semibold'
                  : 'bg-paper border border-line text-ink hover:border-gold'
              }`}
            >
              ✨ New Arrivals
            </button>
            <button
              type="button"
              onClick={() => {
                setCuratedFilter(curatedFilter === 'bestsellers' ? 'all' : 'bestsellers');
                setSelectedCategory('all');
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all rounded-xs shrink-0 ${
                curatedFilter === 'bestsellers'
                  ? 'bg-sand text-gold-deep shadow-sm font-semibold'
                  : 'bg-paper border border-line text-ink hover:border-gold'
              }`}
            >
              🔥 Best Sellers
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setCuratedFilter('all');
                }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all rounded-xs shrink-0 ${
                  selectedCategory === cat.slug && curatedFilter === 'all'
                    ? 'bg-sand text-gold-deep shadow-sm font-semibold'
                    : 'bg-paper border border-line text-ink hover:border-gold'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="bg-paper border-b border-line py-2.5 sm:py-3 w-full max-w-full min-w-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs min-w-0">
          {/* Left: Search and Tones */}
          <div className="flex items-center flex-1 gap-3 flex-wrap sm:flex-nowrap">
            {/* Search Box */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search choker, churi, bag..."
                className="w-full pl-8 pr-7 py-1.5 bg-sand/50 border border-line text-xs text-ink placeholder:text-text-muted focus:outline-none focus:border-gold rounded-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-ink"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Color Swatch Filters (Desktop) */}
            <div className="hidden lg:flex items-center space-x-1.5 pl-2">
              <span className="text-[11px] text-text-muted uppercase tracking-wider mr-1">Tone:</span>
              <button
                type="button"
                onClick={() => setSelectedColor(null)}
                className={`px-2 py-0.5 text-[10px] rounded-full border transition-all ${
                  selectedColor === null
                    ? 'border-ink bg-sand text-ink'
                    : 'border-line text-text-muted hover:border-ink/50'
                }`}
              >
                All
              </button>
              {COLOR_FILTER_SWATCHES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(selectedColor === c.hex ? null : c.hex)}
                  className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${
                    selectedColor === c.hex
                      ? 'border-ink scale-125 shadow-sm'
                      : 'border-black/20 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                >
                  {selectedColor === c.hex && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                  )}
                </button>
              ))}
            </div>

            {/* In-Stock Toggle */}
            <label className="hidden sm:inline-flex items-center gap-1.5 cursor-pointer select-none text-ink pl-2">
              <input
                type="checkbox"
                checked={filterInStock}
                onChange={(e) => setFilterInStock(e.target.checked)}
                className="w-3.5 h-3.5 accent-gold cursor-pointer rounded-xs"
              />
              <span className="text-[11px] font-medium">In Stock</span>
            </label>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] text-gold-deep hover:underline font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Right: Sort */}
          <div className="flex items-center justify-end shrink-0">

            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-paper border border-line pl-3 pr-8 py-1.5 text-xs text-ink font-medium focus:outline-none focus:border-gold cursor-pointer rounded-xs"
                aria-label="Sort products"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">New Drops First</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 w-full min-w-0">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-line bg-sand/30 rounded-xs">
            <h3 className="font-serif text-2xl text-ink">No accessories found</h3>
            <p className="text-xs text-text-muted mt-2">Try clearing search terms or selecting a different tone.</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-sand text-gold-deep text-xs font-semibold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 w-full min-w-0">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Bottom Editorial Assistance */}
        <section className="mt-16 sm:mt-24 p-6 sm:p-10 border border-line bg-[#FAF7F0] rounded-[2px] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-semibold text-gold-ink tracking-wider uppercase">
              Styling & Order Concierge
            </span>
            <h3 className="text-xl sm:text-2xl font-serif text-ink">
              Looking for a matching set or custom sizing?
            </h3>
            <p className="text-xs text-text-muted max-w-xl">
              Our Gulshan studio stylists are available daily on WhatsApp to help select matching pieces for weddings, Eid celebrations, or gift hampers.
            </p>
          </div>

          <a
            href="https://wa.me/8801577731381?text=Hi%20Adorous%20Fashion,%20I%20am%20browsing%20The%20Edit%20and%20would%20like%20assistance."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-sand hover:bg-black text-gold-deep font-semibold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center space-x-2 shrink-0 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Chat on WhatsApp</span>
          </a>
        </section>
      </main>
    </div>
  );
}
