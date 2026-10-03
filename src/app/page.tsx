import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS, CATEGORIES } from '@/data/catalogue';
import { getAllProducts } from '@/app/actions/productActions';
import { getLookbookSettings } from '@/app/actions/lookbookActions';
import { getAllCategoryHeroSettings } from '@/app/actions/categoryHeroActions';
import { Product, ProductCategory } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import {
  ArrowRight,
  Star,
  ChevronRight,
  ShieldCheck,
  Truck,
  MessageCircle,
  RotateCcw,
  Layers,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function toFrontendProduct(p: any): Product {
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
    complimentaryItem: p.complimentaryItem ?? null,
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

export default async function HomePage() {
  const [dbProductsRaw, lookbookSettings, categoryHeroMap] = await Promise.all([
    getAllProducts(),
    getLookbookSettings(),
    getAllCategoryHeroSettings(),
  ]);
  const allAvailable: Product[] = (dbProductsRaw && dbProductsRaw.length > 0)
    ? dbProductsRaw.map(toFrontendProduct)
    : PRODUCTS;

  // Best Sellers: products marked as bestseller, or fallback to top catalogue pieces
  let bestsellerProducts = allAvailable.filter((p) => p.isBestseller).slice(0, 4);
  if (bestsellerProducts.length === 0 && allAvailable.length > 0) {
    bestsellerProducts = allAvailable.slice(0, 4);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative bg-paper text-ink overflow-hidden border-b border-line">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[580px] lg:min-h-[640px]">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 px-6 py-12 sm:px-12 sm:py-16 lg:py-24 flex flex-col justify-center z-10">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.08] font-medium text-ink tracking-tight">
              Premium jewelry, bags & churi — <span className="gold-gradient-text italic font-normal">made to be worn together.</span>
            </h1>

            <p className="mt-5 text-sm sm:text-base text-ink/80 max-w-lg leading-relaxed font-normal">
              Curated boutique accessories crafted for timeless South Asian celebrations. Cash on Delivery across all 64 districts in Bangladesh with personal WhatsApp confirmation.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-[0.16em] uppercase rounded-[2px] transition-all shadow-md group"
              >
                <span>Shop The New Arrival</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/churi"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-transparent hover:bg-sand text-gold-deep border border-gold hover:border-gold font-medium text-xs tracking-[0.16em] uppercase rounded-[2px] transition-colors"
              >
                <span>Explore Churi Stacks</span>
              </Link>
            </div>

            {/* Quick Micro Proof */}
            <div className="mt-10 pt-6 border-t border-line flex items-center space-x-6 text-xs text-ink/70">
              <div className="flex items-center space-x-1 text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold" />
                ))}
              </div>
              <span>4.9/5 Rating by 200+ Clients in Dhaka & Nationwide</span>
            </div>
          </div>

          {/* Right Hero Visual */}
          <div className="lg:col-span-6 relative min-h-[380px] lg:min-h-full">
            <Image
              src="/images/hero/hero-still-life.jpg"
              alt="Adorous Fashion Still Life Collection"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent lg:hidden" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent hidden lg:block" />

            {/* Floating Editorial Badge */}
            <div className="absolute bottom-6 right-6 bg-paper/90 backdrop-blur-md border border-gold p-4 max-w-xs text-ink hidden sm:block shadow-2xl">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium">
                The Festive Ensemble
              </div>
              <div className="font-serif text-sm font-medium mt-1">
                Zari Choker Set · Velvet Churi Stack · Gulshan Bag
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center text-xs text-gold-deep hover:text-gold mt-2 font-medium"
              >
                <span>View Full Styling</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="bg-sand/70 border-b border-line py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center">
            <div className="flex items-center justify-center space-x-2 min-w-0">
              <ShieldCheck className="w-4 h-4 text-gold-deep shrink-0" />
              <span className="text-[11px] sm:text-xs font-medium text-ink uppercase tracking-normal sm:tracking-wider">
                COD in all 64 districts
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2 min-w-0">
              <Truck className="w-4 h-4 text-gold-deep shrink-0" />
              <span className="text-[11px] sm:text-xs font-medium text-ink uppercase tracking-normal sm:tracking-wider">
                Free Delivery over ৳2,000
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2 min-w-0">
              <MessageCircle className="w-4 h-4 text-whatsapp shrink-0" />
              <span className="text-[11px] sm:text-xs font-medium text-ink uppercase tracking-normal sm:tracking-wider">
                WhatsApp Verification
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2 min-w-0">
              <RotateCcw className="w-4 h-4 text-gold-deep shrink-0" />
              <span className="text-[11px] sm:text-xs font-medium text-ink uppercase tracking-normal sm:tracking-wider">
                7-Day Exchange
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BEST SELLERS (4-UP SHOWCASE) */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-ink">
              Most Coveted
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink font-medium mt-1">
              Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-xl">
              Our most coveted boutique pieces, adored for timeless celebrations, exceptional detailing, and heirloom craftsmanship.
            </p>
          </div>
          <Link
            href="/shop"
            className="mt-4 md:mt-0 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-ink hover:text-gold-deep transition-colors group"
          >
            <span>View All Designs</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4-Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestsellerProducts.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-line bg-sand/30 rounded-xs col-span-2 lg:col-span-4">
              <p className="font-serif text-lg text-ink">Bestseller pieces being curated</p>
              <p className="text-xs text-text-muted mt-1">Check back shortly or browse our complete catalogue.</p>
            </div>
          ) : (
            bestsellerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* 4. CATEGORY ROUTING TILES */}
      <section className="py-16 bg-sand/40 border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-ink">
              The Collections
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink font-medium mt-1">
              Explore by Category
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-2">
              Every category is intentionally compact and considered — signature silhouettes created to complement each other.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((category) => {
              const displayImage = categoryHeroMap[category.slug]?.heroImage || category.image;
              return (
                <Link
                  key={category.slug}
                  href={`/${category.slug}`}
                  className="group relative bg-paper border border-line p-5 flex flex-col justify-between hover:border-gold/60 transition-all hover:shadow-md"
                >
                  <div>
                    <div className="relative aspect-square bg-stone overflow-hidden mb-4">
                      <Image
                        src={displayImage}
                        alt={category.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  <div className="text-[10px] tracking-[0.15em] uppercase text-text-muted font-medium">
                    {category.count}
                  </div>
                  <h3 className="font-serif text-lg font-medium text-ink group-hover:text-gold-deep transition-colors mt-0.5">
                    {category.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                    {category.blurb}
                  </p>
                </div>

                  <div className="pt-4 flex items-center text-xs text-ink font-medium group-hover:text-gold-deep transition-colors">
                    <span>Browse Category</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CHARCOAL EDITORIAL LOOKBOOK BAND */}
      <section className="bg-paper text-ink py-16 sm:py-24 border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center space-x-2 text-gold text-xs tracking-[0.2em] uppercase">
                <Layers className="w-4 h-4" />
                <span>{lookbookSettings.homepageBadge || 'Editorial Lookbook 2026'}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight">
                {lookbookSettings.homepageHeading || (
                  <>
                    Designed to dialogue, <span className="gold-gradient-text italic font-normal">not compete.</span>
                  </>
                )}
              </h2>
              <p className="text-sm text-ink/80 leading-relaxed font-normal">
                {lookbookSettings.homepageDescription ||
                  'Every piece in the Adorous catalog is calibrated to harmonize. The warm antique gold finish of the Zari Choker mirrors the brass clasps on the Gulshan Bag and the peacock karas on the Meher Bangle stack.'}
              </p>
              <div className="pt-2">
                <Link
                  href="/lookbook"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-[2px] transition-colors"
                >
                  <span>Explore The Lookbook</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              <div className="relative aspect-[4/5] bg-sand border border-line overflow-hidden">
                <Image
                  src={lookbookSettings.homepageImage1 || '/images/products/jewelry-zari-choker.jpg'}
                  alt={lookbookSettings.homepageImage1Label || 'Jewelry Artistry'}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-paper/90 px-3 py-1 text-[10px] tracking-wider uppercase text-gold">
                  {lookbookSettings.homepageImage1Label || 'Zari Bridal Choker'}
                </div>
              </div>

              <div className="relative aspect-[4/5] bg-sand border border-line overflow-hidden mt-6">
                <Image
                  src={lookbookSettings.homepageImage2 || '/images/products/churi-meher-emerald.jpg'}
                  alt={lookbookSettings.homepageImage2Label || 'Churi Stack'}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-paper/90 px-3 py-1 text-[10px] tracking-wider uppercase text-gold">
                  {lookbookSettings.homepageImage2Label || 'Meher Bangle Stack'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. REVIEWS & CLIENT CONFIDENCE */}
      <section className="py-16 bg-sand/50 border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-ink">
              Verified Client Stories
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink font-medium mt-1">
              Loved Across Bangladesh
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-paper p-6 border border-line">
              <div className="flex items-center space-x-1 text-gold mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold" />
                ))}
              </div>
              <p className="text-xs text-ink/80 leading-relaxed italic">
                "Ordered the Zari Choker Set for my sister's wedding in Gulshan. The finishing looks indistinguishable from real 22k gold jewellery. The WhatsApp team confirmed my delivery within 10 minutes!"
              </p>
              <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">Nafisa K.</span>
                <span className="text-text-muted">Dhaka (Gulshan-2)</span>
              </div>
            </div>

            <div className="bg-paper p-6 border border-line">
              <div className="flex items-center space-x-1 text-gold mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold" />
                ))}
              </div>
              <p className="text-xs text-ink/80 leading-relaxed italic">
                "The Meher emerald churi stack came in such beautiful packaging. The hand size 2-6 fits like a dream thanks to the sizing chart. Will definitely be ordering the maroon stack for Eid."
              </p>
              <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">Sumaiya A.</span>
                <span className="text-text-muted">Chattogram</span>
              </div>
            </div>

            <div className="bg-paper p-6 border border-line">
              <div className="flex items-center space-x-1 text-gold mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-gold" />
                ))}
              </div>
              <p className="text-xs text-ink/80 leading-relaxed italic">
                "The Gulshan bag structured leather quality is top tier. Hardware has that brushed brass luxury weight without feeling cheap. Delivery took only 3 days to Sylhet."
              </p>
              <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">Tasmiah H.</span>
                <span className="text-text-muted">Sylhet</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
