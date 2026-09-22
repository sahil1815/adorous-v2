'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useInventory } from '@/context/InventoryContext';
import ProductCard from '@/components/ui/ProductCard';
import {
  SlidersHorizontal,
  ChevronDown,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageCircle,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface CategoryPageClientProps {
  categorySlug: string;
  categoryName: string;
  categoryBlurb: string;
  categoryImage: string;
  products: Product[];
}

export default function CategoryPageClient({
  categorySlug,
  categoryName,
  categoryBlurb,
  categoryImage,
  products: initialProducts,
}: CategoryPageClientProps) {
  const { allProducts, getEffectiveProduct } = useInventory();
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [filterInStock, setFilterInStock] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const dynamicCategoryProducts = allProducts
    .filter((p) => p.category === categorySlug)
    .map(getEffectiveProduct);
  const products = dynamicCategoryProducts.length > 0 ? dynamicCategoryProducts : initialProducts;

  // Extract unique colors available in this category
  const availableColors = useMemo(() => {
    const colorMap = new Map<string, { id: string; name: string; hex: string }>();
    products.forEach((p) => {
      p.colorways.forEach((c) => {
        if (!colorMap.has(c.hex)) {
          colorMap.set(c.hex, c);
        }
      });
    });
    return Array.from(colorMap.values());
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (filterInStock) {
      list = list.filter((p) => p.colorways.some((c) => c.inStock));
    }

    if (selectedColor) {
      list = list.filter((p) => p.colorways.some((c) => c.hex === selectedColor));
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.isNewDrop ? 1 : 0) - (a.isNewDrop ? 1 : 0));
    } else {
      list.sort((a, b) => a.featuredRank - b.featuredRank);
    }

    return list;
  }, [products, sortBy, filterInStock, selectedColor]);

  // Category specific trust note
  const categoryHighlights = useMemo(() => {
    switch (categorySlug) {
      case 'churi':
        return [
          { title: 'Hand Sizing Guaranteed', desc: 'Need size 2-4, 2-6, or 2-8? We offer 7-day doorstep size exchange across Bangladesh.' },
          { title: 'Plush Velvet Texture', desc: 'Padded velvet cores prevent wrist chafing and maintain lush color richness.' },
          { title: 'Pre-Packaged Stacks', desc: 'Curated 8-to-24 bangle stacks ready to slip on without styling guesswork.' },
        ];
      case 'bags':
        return [
          { title: 'Custom Brushed Brass', desc: 'Tarnish-resistant hardware engineered for Dhaka humidity and daily wear.' },
          { title: 'Structured Bases', desc: 'Reinforced architectural silhouettes that never sag when set down.' },
          { title: 'Signature Velvet Lining', desc: 'Every bag is lined in our signature champagne or black microsuede.' },
        ];
      case 'more':
      case 'umbrellas':
        return [
          { title: 'Curated Lifestyle', desc: 'Curated essentials and premium accessories for everyday elegance.' },
          { title: 'Monsoon Windproof', desc: 'Reinforced aerodynamic frame and UV50+ canopy tested against intense weather.' },
          { title: 'Signature Hardware', desc: 'Solid hand-turned chestnut wood handles with custom brass gold ferrule.' },
        ];
      default:
        return [
          { title: '22k Antique Finish', desc: 'Hand-finished micro-lacquer electroplating that resists tropical oxidation.' },
          { title: 'Cash on Delivery (COD)', desc: 'Inspect your luxury pieces at your doorstep before handing cash to the courier.' },
          { title: 'Signature Keepsake Box', desc: 'Arrives in our rigid warm stone box with champagne ribbon and velvet pouch.' },
        ];
    }
  }, [categorySlug]);

  return (
    <div className="bg-paper min-h-screen">
      {/* Editorial Category Hero Header */}
      <section className="relative border-b border-line bg-[#F5F2EA] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-16">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-xs text-text-muted mb-4 tracking-wider uppercase">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <span className="text-ink font-medium">{categoryName}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <span className="inline-block text-[11px] font-semibold tracking-[0.2em] text-gold-ink uppercase">
                Adorous · {categoryName}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ink font-normal tracking-tight">
                {categoryName}
              </h1>
              <p className="text-sm sm:text-base text-text-muted max-w-2xl leading-relaxed">
                {categoryBlurb}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-ink/80">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  {products.length} Curated Designs
                </span>
                <span className="hidden sm:inline text-line">|</span>
                <span className="inline-flex items-center gap-1 text-gold-ink font-medium">
                  <Truck className="w-3.5 h-3.5" />
                  Free Delivery on ৳2,000+ across all 64 districts
                </span>
              </div>
            </div>

            {/* Editorial Still-Life Thumbnail Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[4/3] rounded-[2px] overflow-hidden border border-line shadow-sm bg-stone">
                <Image
                  src={categoryImage}
                  alt={`${categoryName} Still Life`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white text-[11px] font-medium tracking-wider flex items-center justify-between">
                  <span>Adorous Still Life Studio</span>
                  <span className="text-gold-light">Rajshahi, Bangladesh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Sort Sticky Toolbar */}
      <div className="sticky top-[73px] z-30 bg-paper/95 backdrop-blur-md border-b border-line py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Left: Swatches & In-Stock filter */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-4">
            <span className="text-text-muted font-medium uppercase tracking-wider text-[11px] hidden sm:inline">
              Filter by Tone:
            </span>

            {/* Color Swatch Filters */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1 max-w-full min-w-0">
              <button
                type="button"
                onClick={() => setSelectedColor(null)}
                className={`px-2.5 py-1 text-[11px] rounded-full border transition-all ${
                  selectedColor === null
                    ? 'border-ink bg-sand text-ink font-medium'
                    : 'border-line text-text-muted hover:border-ink/50'
                }`}
              >
                All
              </button>
              {availableColors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(selectedColor === c.hex ? null : c.hex)}
                  className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
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

            <div className="h-4 w-[1px] bg-line hidden sm:block" />

            {/* In-Stock Toggle */}
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-ink">
              <input
                type="checkbox"
                checked={filterInStock}
                onChange={(e) => setFilterInStock(e.target.checked)}
                className="w-3.5 h-3.5 accent-gold cursor-pointer rounded-xs"
              />
              <span className="text-[11px] font-medium">In Stock Only</span>
            </label>
          </div>

          {/* Right: Sort Dropdown & Product Count */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-text-muted text-[11px]">
              Showing <strong className="text-ink font-semibold">{filteredProducts.length}</strong> of {products.length}
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-line bg-sand/30 rounded-xs">
            <h3 className="font-serif text-2xl text-ink">No designs match your filter</h3>
            <p className="text-xs text-text-muted mt-2">Try clearing your color tone selection or in-stock toggle.</p>
            <button
              onClick={() => {
                setSelectedColor(null);
                setFilterInStock(false);
              }}
              className="mt-4 px-4 py-2 bg-gold text-ink text-xs font-semibold uppercase tracking-wider"
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

        {/* Category Trust Highlights */}
        <section className="mt-16 sm:mt-24 pt-12 border-t border-line">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-semibold tracking-[0.2em] text-gold-ink uppercase">
              The Adorous Guarantee
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-ink mt-1">
              Quality & Convenience
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryHighlights.map((highlight, idx) => (
              <div
                key={idx}
                className="p-6 bg-[#F8F6F0] border border-line/80 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold-deep">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-medium text-sm text-ink">{highlight.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{highlight.desc}</p>
                </div>
                <div className="pt-2 text-[10px] uppercase font-semibold text-gold-ink tracking-wider">
                  Inspected by Adorous
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WhatsApp Styling Assistance Banner */}
        <section className="mt-12 bg-sand text-ink p-6 sm:p-10 rounded-[2px] relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[11px] text-gold-light font-semibold tracking-wider uppercase">
                Personal Style Consultation
              </span>
              <h3 className="text-xl sm:text-2xl font-serif text-paper">
                Need help pairing {categoryName.toLowerCase()} with your saree or lehenga?
              </h3>
              <p className="text-xs text-paper/70 max-w-xl">
                Send your fabric photos directly to our Adorous Fashion on WhatsApp. Our stylist will send live video swatches and custom matching recommendations.
              </p>
            </div>

            <a
              href="https://wa.me/8801577731381?text=Hi%20Adorous%20Fashion,%20I%20would%20like%20styling%20advice%20for%20a%20bridal/festive%20outfit."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center space-x-2 shrink-0 shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-emerald-800" />
              <span>Chat with Our Stylist</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
