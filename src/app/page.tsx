import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS, CATEGORIES, COLOR_FILTER_SWATCHES } from '@/data/catalogue';
import ProductCard from '@/components/ui/ProductCard';
import { 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  MessageCircle, 
  Sparkles, 
  CheckCircle2, 
  Star,
  ChevronRight,
  Layers
} from 'lucide-react';

export default function HomePage() {
  // New drop: 4 distinct products from different categories
  const newDropProducts = PRODUCTS.filter((p) => p.isNewDrop).slice(0, 4);

  // Most gifted: 4 products that are gift picks
  const giftedProducts = PRODUCTS.filter((p) => p.isGiftPick && !newDropProducts.some(nd => nd.id === p.id)).slice(0, 4);

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

      {/* 3. THE NEW DROP (4-UP SHOWCASE) */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-ink">
              Fresh From Studio
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink font-medium mt-1">
              The New Drop
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-xl">
              Limited pieces curated in small batches. Once sold out, archived until the next seasonal release.
            </p>
          </div>
          <Link
            href="/shop"
            className="mt-4 md:mt-0 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-ink hover:text-gold-deep transition-colors group"
          >
            <span>View All 15 Designs</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4-Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newDropProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
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
              Every category is intentionally compact and considered — 15 signature silhouettes created to complement each other.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/${category.slug}`}
                className="group relative bg-paper border border-line p-5 flex flex-col justify-between hover:border-gold/60 transition-all hover:shadow-md"
              >
                <div>
                  <div className="relative aspect-square bg-stone overflow-hidden mb-4">
                    <Image
                      src={category.image}
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
            ))}
          </div>
        </div>
      </section>

      {/* 5. SHOP BY COLOUR SWATCH RAIL */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-8">
          <div>
            <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-ink">
              Browsing Palette
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink font-medium mt-1">
              Shop by Colourway
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Filter across jewelry, bags, and bangles by your celebratory dress colour.
            </p>
          </div>

          {/* Color swatch buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {COLOR_FILTER_SWATCHES.map((swatch) => (
              <Link
                key={swatch.id}
                href={`/shop?colour=${swatch.id}`}
                className="group flex items-center space-x-2 px-3.5 py-1.5 bg-paper border border-line hover:border-ink rounded-[2px] transition-all"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                  style={{ backgroundColor: swatch.hex }}
                />
                <span className="text-xs font-medium text-ink">{swatch.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CHARCOAL EDITORIAL LOOKBOOK BAND */}
      <section className="bg-paper text-ink py-16 sm:py-24 border-y border-line my-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center space-x-2 text-gold text-xs tracking-[0.2em] uppercase">
                <Layers className="w-4 h-4" />
                <span>Editorial Lookbook 2026</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight">
                Designed to dialogue, <span className="gold-gradient-text italic font-normal">not compete.</span>
              </h2>
              <p className="text-sm text-ink/80 leading-relaxed font-normal">
                Every piece in the Adorous catalog is calibrated to harmonize. The warm antique gold finish of the Zari Choker mirrors the brass clasps on the Gulshan Bag and the peacock karas on the Meher Bangle stack.
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
                  src="/images/products/jewelry-zari-choker.jpg"
                  alt="Jewelry Artistry"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-paper/90 px-3 py-1 text-[10px] tracking-wider uppercase text-gold">
                  Zari Bridal Choker
                </div>
              </div>

              <div className="relative aspect-[4/5] bg-sand border border-line overflow-hidden mt-6">
                <Image
                  src="/images/products/churi-meher-emerald.jpg"
                  alt="Churi Stack"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-paper/90 px-3 py-1 text-[10px] tracking-wider uppercase text-gold">
                  Meher Bangle Stack
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MOST GIFTED SETS */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-ink">
              Celebratory Gifting
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink font-medium mt-1">
              Most Gifted Suites
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-xl">
              Complete sets packaged in our signature charcoal keepsake boxes. Ideal for brides, anniversaries, and Eid celebrations.
            </p>
          </div>
          <Link
            href="/gifting"
            className="mt-4 md:mt-0 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-ink hover:text-gold-deep transition-colors group"
          >
            <span>View Gifting Edit</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {giftedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. WHAT'S IN A SET (TRANSPARENCY SECTION) */}
      <section className="py-16 bg-sand/30 border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-ink">
                No Hidden Surprises
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink font-medium">
                Every piece in the photograph is included in the price.
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Many online pages advertise sets using photos that include items sold separately. At Adorous Fashion, our product cards and sets explicitly detail every component. When you purchase the 4-piece Zari Choker or the 24-piece Meher Bangle stack, every single piece listed is in your parcel.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center space-x-3 text-xs text-ink">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span>Exact piece counts verified prior to packaging</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-ink">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span>Protective velvet jewellery pouches included complimentary</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-ink">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span>Video proof of package packing shared upon request on WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Visual Box */}
            <div className="bg-paper p-6 border border-line shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <span className="font-serif text-base text-ink font-semibold">
                  Sample Set Contents Breakdown
                </span>
                <span className="text-[11px] uppercase tracking-wider text-gold-ink font-medium">
                  Zari Bridal Suite
                </span>
              </div>
              <ul className="space-y-3 text-xs text-ink">
                <li className="flex justify-between items-center py-1 border-b border-line/50">
                  <span>1x Regal Filigree Choker (Adjustable Zari Dori)</span>
                  <span className="text-text-muted">Included</span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-line/50">
                  <span>1x Pair Matching Chandbali Jhumkas (6.5cm drop)</span>
                  <span className="text-text-muted">Included</span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-line/50">
                  <span>1x Floral Statement Maang Tikka</span>
                  <span className="text-text-muted">Included</span>
                </li>
                <li className="flex justify-between items-center py-1 border-b border-line/50">
                  <span>1x Adjustable Polki Cocktail Ring</span>
                  <span className="text-text-muted">Included</span>
                </li>
                <li className="flex justify-between items-center py-1 text-gold-ink font-medium">
                  <span>Adorous Signature Charcoal Gift Box & Velvet Pouch</span>
                  <span>Complimentary</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 9. HOW ORDERING WORKS (COD CONFIDENCE) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-ink">
          Seamless & Safe
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink font-medium mt-1">
          How Ordering Works
        </h2>
        <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-lg mx-auto">
          We designed our ordering process around local trust and personal concierge service.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
          <div className="bg-sand/40 border border-line p-6 relative">
            <div className="w-8 h-8 rounded-full bg-paper text-gold font-serif text-sm font-semibold flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-serif text-lg font-medium text-ink">
              Select Your Pieces & Choose COD
            </h3>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              Add your favourites to the bag. Choose Cash on Delivery at checkout — zero advance payment required for regular orders.
            </p>
          </div>

          <div className="bg-sand/40 border border-line p-6 relative">
            <div className="w-8 h-8 rounded-full bg-paper text-gold font-serif text-sm font-semibold flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-serif text-lg font-medium text-ink">
              WhatsApp Verification
            </h3>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              Our concierge team contacts you directly on WhatsApp to confirm sizing, address, and delivery slot before dispatching.
            </p>
          </div>

          <div className="bg-sand/40 border border-line p-6 relative">
            <div className="w-8 h-8 rounded-full bg-paper text-gold font-serif text-sm font-semibold flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-serif text-lg font-medium text-ink">
              Doorstep Delivery & Payment
            </h3>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              Receive your sealed parcel via Pathao or Steadfast courier. Inspect the parcel and pay cash or bKash directly to the delivery rider.
            </p>
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
