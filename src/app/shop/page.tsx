'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CATEGORIES, COLOR_FILTER_SWATCHES } from '@/data/catalogue';
import { useInventory } from '@/context/InventoryContext';
import ProductCard from '@/components/ui/ProductCard';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Truck,
  Sparkles,
  MessageCircle,
  PackageCheck
} from 'lucide-react';

export default function ShopPage() {
  const { allProducts, getEffectiveProduct } = useInventory();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterInStock, setFilterInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return allProducts.map(getEffectiveProduct).filter((product) => {
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
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') return (b.isNewDrop ? 1 : 0) - (a.isNewDrop ? 1 : 0);
      return a.featuredRank - b.featuredRank;
    });
  }, [selectedCategory, selectedColor, searchQuery, filterInStock, sortBy]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedColor ? 1 : 0) +
    (filterInStock ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory('all');
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
                The Complete Edit
              </h1>
              <p className="text-xs sm:text-sm text-text-muted max-w-xl">
                Boutique South Asian jewelry, plush velvet bangles, architectural handbags, and curated lifestyle accessories on warm stone plinths.
              </p>
            </div>

            {/* Quick Reassurance */}
            <div className="flex items-center gap-4 text-xs font-medium text-ink/80 bg-paper/80 border border-line p-3 rounded-xs self-start md:self-auto">
              <PackageCheck className="w-4 h-4 text-gold-ink shrink-0" />
              <span>Cash on Delivery across all 64 districts of Bangladesh</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full min-w-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all rounded-xs ${
                selectedCategory === 'all'
                  ? 'bg-sand text-gold-deep shadow-sm'
                  : 'bg-paper border border-line text-ink hover:border-gold'
              }`}
            >
              All Items ({allProducts.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = allProducts.filter((p) => p.category === cat.slug).length;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all rounded-xs ${
                    selectedCategory === cat.slug
                      ? 'bg-sand text-gold-deep shadow-sm'
                      : 'bg-paper border border-line text-ink hover:border-gold'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="sticky top-[73px] z-30 bg-paper/95 backdrop-blur-md border-b border-line py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
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
                Clear All ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Right: Sort & Count */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <span className="text-text-muted text-[11px]">
              Showing <strong className="text-ink font-semibold">{filteredProducts.length}</strong> of {allProducts.length}
            </span>

            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
